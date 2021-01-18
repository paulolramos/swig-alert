import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Render,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request as ExpressReq } from 'express';
import { RequestWithUserPayload } from 'src/types/requestWithUserPayload';
import { RequestWithUser } from 'src/types/requestWithUser';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { User } from 'src/user/user.entity';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private authService: AuthService) {}

  @Get('register')
  async registerView(@Request() req: ExpressReq, @Res() res: Response) {
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
      return res.render('pages/auth/register', { layout: 'auth' });
    }
  }

  @Post('register')
  @Render('pages/auth/login')
  async register(@Body() user: User) {
    const newUser = await this.authService.register(user);

    return { layout: 'auth', newUser };
  }

  @Get('login')
  async loginView(@Request() req: ExpressReq, @Res() res: Response) {
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
      return res.render('pages/auth/login', {
        layout: 'auth',
        newUser: { username: '' },
      });
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: RequestWithUser, @Res() res: Response) {
    const access_token = await this.authService.login(req.user);
    res.cookie('jwt.sa', access_token.token, {
      httpOnly: true,
      signed: true,
      sameSite: true,
      secure: process.env.NODE_ENV === 'production' ? true : false,
    });

    this.logger.debug(`Setting access token for user: ${req.user.username}`);
    return res.redirect('/profile');
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  async logout(@Request() req: RequestWithUserPayload, @Res() res: Response) {
    this.logger.debug(`Removing access token for user: ${req.user.username}`);
    res.clearCookie('jwt.sa');
    res.redirect('/');
  }
}
