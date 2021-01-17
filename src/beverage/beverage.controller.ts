import {
  Controller,
  Get,
  UseGuards,
  Request,
  Param,
  Post,
  Body,
  Put,
  Render,
  Res,
} from '@nestjs/common';

import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RequestWithUserPayload } from 'src/types/requestWithUserPayload';
import { Beverage } from './beverage.entity';
import { BeverageService } from './beverage.service';

@Controller('session/:sid/beverage')
export class BeverageController {
  constructor(private beverageService: BeverageService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @Render('pages/beverages/all')
  async getAllBeveragesBySessionId(
    @Request() req: RequestWithUserPayload,
    @Param('sid') sessionId: string,
  ) {
    const beverages = await this.beverageService.getAllBeveragesBySessionId(
      req.user.userId,
      sessionId,
    );
    return { sessionId, beverages };
  }

  @UseGuards(JwtAuthGuard)
  @Get('new')
  @Render('pages/beverages/new')
  async createNewBeverage(@Param('sid') sessionId: string) {
    return { sessionId };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createBeverage(
    @Request() req: RequestWithUserPayload,
    @Res() res: Response,
    @Param('sid') sessionId: string,
    @Body() beverage: Beverage,
  ) {
    beverage.isConsumed = Boolean(beverage.isConsumed);
    const newBeverage = await this.beverageService.addBeverage(
      req.user.userId,
      sessionId,
      beverage,
    );
    if (beverage.isConsumed) {
      await this.beverageService.consumeBeverage(
        req.user.userId,
        sessionId,
        String(newBeverage.id),
      );
    }

    res.redirect(`/session/${sessionId}`);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':bid')
  @Render('pages/beverages/index')
  async getBeverageBySessionId(
    @Request() req: RequestWithUserPayload,
    @Param('sid') sessionId: string,
    @Param('bid') beverageId: string,
  ) {
    const beverage = await this.beverageService.getBeverageById(
      req.user.userId,
      sessionId,
      beverageId,
    );

    return { sid: sessionId, beverage };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':bid/consume')
  async consumeBeverage(
    @Request() req: RequestWithUserPayload,
    @Res() res: Response,
    @Param('sid') sessionId: string,
    @Param('bid') beverageId: string,
  ) {
    await this.beverageService.consumeBeverage(
      req.user.userId,
      sessionId,
      beverageId,
    );

    return res.redirect(`/session/${sessionId}/beverage/${beverageId}`);
  }
}
