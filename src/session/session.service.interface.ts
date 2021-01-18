import { Session } from 'src/session/session.entity';

export interface ISessionService {
  getAllSessionsByUserId: (userId: string) => Promise<Session[]>;
  getAllInactiveSessionsByUserId: (userId: string) => Promise<Session[]>;
  getSessionById: (userId: string, id: string) => Promise<Session>;
  getCurrentSession: (userId: string) => Promise<Session>;
  hasCurrentSession: (
    userId: string,
  ) => Promise<{ hasActiveSession: boolean; sessionId: number }>;
  createSession: (userId: string, session: Session) => Promise<Session>;
  deleteSession: (userId: string, id: string) => Promise<void>;
  endSession: (userId: string, id: string) => Promise<void>;
}
