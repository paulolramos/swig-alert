import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Render,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { BacService } from 'src/bac/bac.service';
import { RequestWithUserPayload } from 'src/types/requestWithUserPayload';
import { UserService } from 'src/user/user.service';
import { Session } from './session.entity';
import { SessionService } from './session.service';

@Controller('session')
export class SessionController {
  constructor(
    private sessionService: SessionService,
    private userService: UserService,
    private bacService: BacService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('past/all')
  @Render('pages/session/past/all')
  async getAllPastSessionsByUserId(@Request() req: RequestWithUserPayload) {
    const sessions = await this.sessionService.getAllInactiveSessionsByUserId(
      req.user.userId,
    );
    return { sessions };
  }

  @UseGuards(JwtAuthGuard)
  @Get('past/:id')
  @Render('pages/session/past/index')
  async getPastSessionsById(
    @Request() req: RequestWithUserPayload,
    @Param('id') id: string,
  ) {
    const session = await this.sessionService.getSessionById(
      req.user.userId,
      id,
    );
    const effects = this.bacService.getEffectsOfAlcohol(
      session.bloodAlcoholContent,
    );

    return { session, effects };
  }

  @UseGuards(JwtAuthGuard)
  @Get('new')
  async newSession(
    @Res() res: Response,
    @Request() req: RequestWithUserPayload,
  ) {
    const user = await this.userService.findUserById(req.user.userId);
    return res.render('pages/session/new', { user });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @Render('pages/session/index')
  async getSession(
    @Request() req: RequestWithUserPayload,
    @Param('id') id: string,
  ) {
    const user = this.userService.findUserById(req.user.userId);
    const session = await this.sessionService.getSessionById(
      req.user.userId,
      id,
    );
    const effects = this.bacService.getEffectsOfAlcohol(
      session.bloodAlcoholContent,
    );
    const hourTillSober = this.bacService.getHoursUntilSober(
      session.bloodAlcoholContent,
      (await user).habitType,
    );
    const viewModel = { session, effects, hourTillSober };
    return viewModel;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createNewSession(
    @Res() res: Response,
    @Request() req: RequestWithUserPayload,
    @Body() session: Session,
  ) {
    session.setDrinkReminder = Boolean(session.setDrinkReminder);
    const newSession = await this.sessionService.createSession(
      req.user.userId,
      session,
    );
    return res.redirect(`/session/${newSession.id}`);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async endSession(
    @Res() res: Response,
    @Request() req: RequestWithUserPayload,
    @Param('id') sessionId: string,
  ) {
    await this.sessionService.endSession(req.user.userId, sessionId);
    return res.redirect('/profile');
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteSession(
    @Request() req: RequestWithUserPayload,
    @Param('id') sessionId: string,
  ) {
    return this.sessionService.deleteSession(req.user.userId, sessionId);
  }
}
