import { Session } from 'src/session/session.entity';

export interface ISessionService {
  getAllSessionsByUserId: (userId: string) => Promise<Session[]>;
  getSessionById: (userId: string, id: string) => Promise<Session>;
  createSession: (userId: string, session: Session) => Promise<Session>;
  deleteSession: (userId: string, id: string) => Promise<void>;
  endSession: (userId: string, id: string) => Promise<void>;
}
