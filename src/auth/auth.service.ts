/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { BacService } from 'src/bac/bac.service';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { JWTPayload } from './payload';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private bacService: BacService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<{
    response: 'VALID_PASSWORD' | 'INVALID_PASSWORD' | 'NO_USER';
    result: any;
  }> {
    const user = await this.userService.findUserByUsername(username);
    if (user) {
      const passwordsMatch = await bcrypt.compare(password, user.password);
      if (passwordsMatch) {
        const { password, ...result } = user;
        this.logger.debug(`Authenticated: ${username}`);
        return { response: 'VALID_PASSWORD', result };
      } else {
        const { password, ...result } = user;
        this.logger.error(`Invalid password for: ${username}`);
        return { response: 'INVALID_PASSWORD', result };
      }
    } else {
      this.logger.error(`User doesn't not exist: ${username}`);
      return { response: 'NO_USER', result: username };
    }
  }

  async validateJwt(token: string): Promise<boolean> {
    const user = this.jwtService.decode(token) as JWTPayload;
    try {
      this.logger.debug(`Valid jwt found for [${user.username}]`);
      await this.jwtService.verifyAsync(token);
      return true;
    } catch (error) {
      this.logger.error(`${error.message} for [${user.username}]`);
      return false;
    }
  }

  async register(user: User): Promise<User> {
    const _user = await this.userService.findUserByUsername(user.username);
    if (_user) {
      this.logger.error(`username: '${_user.username}' already exists`);
      return null;
    } else {
      this.logger.debug(`Creating user: ${user.username}`);
      const newUser = new User();
      newUser.username = user.username.toLowerCase();
      newUser.password = await bcrypt.hash(user.password, 10);
      newUser.weightInPounds = user.weightInPounds;
      newUser.sex = user.sex;
      newUser.baseBloodAlcoholContent = this.bacService.getBaseAlcoholConcentrationInBlood(
        newUser.weightInPounds,
        newUser.sex,
      );
      return await this.userService.createUser(newUser);
    }
  }

  // Returns an access token. This designates user as logged in and can access protected routes
  async login(user: User): Promise<{ token: string }> {
    const payload = {
      username: user.username.toLowerCase(),
      sub: String(user.id),
    } as JWTPayload;
    const access_token = this.jwtService.sign(payload);
    return { token: access_token };
  }
}
