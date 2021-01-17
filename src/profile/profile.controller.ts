import { Controller, Get, Render, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SessionService } from 'src/session/session.service';
import { RequestWithUserPayload } from 'src/types/requestWithUserPayload';
import { UserService } from 'src/user/user.service';

@Controller('profile')
export class ProfileController {
  constructor(
    private userService: UserService,
    private sessionService: SessionService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @Render('pages/profile/index')
  async profile(@Request() req: RequestWithUserPayload) {
    const user = await this.userService.findUserById(req.user.userId);
    const hasCurrentSession = await this.sessionService.hasCurrentSession(
      req.user.userId,
    );
    return { user, currentSession: hasCurrentSession };
  }

  @UseGuards(JwtAuthGuard)
  @Get('update')
  @Render('pages/profile/update')
  async updateProfile(@Request() req: RequestWithUserPayload) {
    const user = await this.userService.findUserById(req.user.userId);
    return { user };
  }
}
