import { Controller, Get, Res, Request, Logger } from '@nestjs/common';
import { Request as ExpressReq, Response } from 'express';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private authService: AuthService) {}

  @Get()
  async root(@Request() req: ExpressReq, @Res() res: Response) {
    const jwt =
      req && req.signedCookies['jwt.sa'] ? req.signedCookies['jwt.sa'] : null;
    if (jwt) {
      const isVerified = await this.authService.validateJwt(jwt);
      if (isVerified) {
        this.logger.debug('Redirecting to profile...');
        return res.redirect('/profile');
      } else {
        this.logger.debug('Redirecting to login...');
        return res.render('pages/auth/login', {
          layout: 'auth',
          message: 'Login credentials expired. Please login again.',
        });
      }
    } else {
      return res.render('index', { layout: 'home' });
    }
  }
}
