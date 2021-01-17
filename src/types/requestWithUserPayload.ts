import { Request } from 'express';

export interface RequestWithUserPayload extends Request {
  user: {
    userId: string;
    username: string;
  };
}
