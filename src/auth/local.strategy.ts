import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { User } from 'src/user/user.entity';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string) {
    const validation = await this.authService.validateUser(username, password);

    if (validation.response === 'VALID_PASSWORD') {
      const user = validation.result as User;
      return user;
    } else if (validation.response === 'INVALID_PASSWORD') {
      const user = validation.result as User;
      throw new UnauthorizedException(
        `Invalid password provided: ${user.username}`,
      );
    } else if (validation.response === 'NO_USER') {
      throw new UnauthorizedException(
        `User does not exist: ${validation.result}`,
      );
    } else {
      throw new UnauthorizedException();
    }
  }
}
