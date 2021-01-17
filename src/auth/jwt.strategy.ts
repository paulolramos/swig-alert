import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { JWTPayload } from './payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: function (req: Request) {
        if (req && req.signedCookies) {
          return req.signedCookies['jwt.sa'];
        } else {
          return null;
        }
      },
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JWTPayload) {
    const user = {
      userId: payload.sub,
      username: payload.username,
    };

    return user;
  }
}
