import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { session } from 'passport';
import { ISessionService } from 'src/session/session.service.interface';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { Session } from './session.entity';

@Injectable()
export class SessionService implements ISessionService {
  private readonly logger = new Logger(SessionService.name);
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Session) private sessionRepository: Repository<Session>,
  ) {}

  async getAllSessionsByUserId(userId: string): Promise<Session[]> {
    const sessions = await this.sessionRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      order: { id: 'DESC' },
      relations: ['beverages'],
    });
    if (session.length > 0) {
      return sessions;
    } else {
      return [];
    }
  }

  async getAllInactiveSessionsByUserId(userId: string): Promise<Session[]> {
    const sessions = await this.sessionRepository.find({
      where: {
        user: {
          id: userId,
        },
        isActive: false,
      },
      order: { id: 'DESC' },
      relations: ['beverages'],
    });
    if (session.length > 0) {
      return sessions;
    } else {
      return [];
    }
  }

  async getSessionById(userId: string, id: string): Promise<Session> {
    const session = await this.sessionRepository.findOne({
      where: {
        id,
        user: {
          id: userId,
        },
      },
      relations: ['beverages'],
    });

    if (session) {
      this.logger.debug(`Getting session: ${id}`);
      return session;
    } else {
      this.logger.warn(`session [${id}] not found`);
      return session;
    }
  }

  async getCurrentSession(userId: string): Promise<Session> {
    const currentSession = await this.sessionRepository.findOne({
      where: {
        user: { id: userId },
        isActive: true,
      },
      relations: ['beverages'],
    });
    return currentSession;
  }

  async hasCurrentSession(
    userId: string,
  ): Promise<{ hasActiveSession: boolean; sessionId: number }> {
    const activeSession = await this.sessionRepository.findOne({
      where: {
        user: { id: userId },
        isActive: true,
      },
    });
    const hasActiveSession = activeSession ? true : false;
    return {
      hasActiveSession,
      sessionId: activeSession ? activeSession.id : null,
    };
  }

  async createSession(userId: string, session: Session): Promise<Session> {
    const user = await this.userRepository.findOne(userId);
    if (user) {
      this.logger.debug(`Creating new session for: ${user.username}`);
      session.weightSnapshot = user.weightInPounds;
      session.baseBloodAlcoholContentSnapshot = user.baseBloodAlcoholContent;
      session.isActive = true;
      session.user = user;
      return await this.sessionRepository.save(session);
    } else {
      return null;
    }
  }

  async endSession(userId: string, id: string): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: {
        id,
        user: {
          id: userId,
        },
      },
    });

    if (session) {
      if (session.isActive) {
        this.logger.debug(`Ending session [${session.id}]`);
        session.isActive = false;
        session.sessionEnd = new Date();
        await this.sessionRepository.save(session);
      } else {
        this.logger.warn(`Session [${session.id}] is already inactive`);
        return null;
      }
    } else {
      this.logger.warn(`Session [${session.id}] not found`);
      return null;
    }
  }

  async deleteSession(userId: string, id: string): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: {
        id,
        user: {
          id: userId,
        },
      },
    });

    if (session) {
      this.logger.debug(`Deleting session [${session.id}]`);
      await this.sessionRepository.delete(session.id);
    } else {
      this.logger.warn(`Session [${id}] not found`);
      return null;
    }
  }
}
