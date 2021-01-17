import { Response } from 'express';
import { User } from 'src/user/user.entity';

export interface RequestWithUser extends Response {
  user: User;
}
