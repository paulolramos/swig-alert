import { Injectable, Logger } from '@nestjs/common';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CronJob } from 'cron';
import { session } from 'passport';
import { BacService } from 'src/bac/bac.service';
import { ISessionService } from 'src/session/session.service.interface';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { Session } from './session.entity';

@Injectable()
export class SessionService implements ISessionService {
  private readonly logger = new Logger(SessionService.name);
  constructor(
    @InjectRepository(Session) private sessionRepository: Repository<Session>,
    private schedulerRegistry: SchedulerRegistry,
    private userService: UserService,
    private bacService: BacService,
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
    const user = await this.userService.findUserById(userId);
    if (user) {
      session.weightSnapshot = user.weightInPounds;
      session.baseBloodAlcoholContentSnapshot = user.baseBloodAlcoholContent;
      session.isActive = true;
      session.user = user;
      session.habitTypeSnapshot = user.habitType;

      const newSession = await this.sessionRepository.save(session);

      // Update BAC after every hour
      const burnOffUpdater = new CronJob(
        CronExpression.EVERY_HOUR,
        async () => {
          this.logger.debug(
            `checking session [${newSession.id}] for burnoff...`,
          );
          const _session = await this.sessionRepository.findOne(newSession.id);
          if (_session.isActive && _session.bloodAlcoholContent > 0) {
            const updatedBac = this.bacService.getBacAfterOneHour(
              _session.bloodAlcoholContent,
              _session.habitTypeSnapshot,
            );

            this.logger.debug(
              `Session [${_session.id}]: ${_session.bloodAlcoholContent} --> ${updatedBac}`,
            );

            _session.bloodAlcoholContent = updatedBac;
            this.sessionRepository.save(_session);
          } else {
            this.logger.debug(
              `Session [${_session.id}]: BAC doesn't need to be updated`,
            );
          }
        },
      );

      this.schedulerRegistry.addCronJob(
        `s/${newSession.id}/bac_updater`,
        burnOffUpdater,
      );

      this.logger.debug(`s/${newSession.id}/bac_updater added`);
      burnOffUpdater.start();
      return newSession;
    } else {
      return null;
    }
  }

  async saveSession(session: Session): Promise<Session> {
    return await this.sessionRepository.save(session);
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
        session.isActive = false;
        session.sessionEnd = new Date();
        this.schedulerRegistry.deleteCronJob(`s/${id}/bac_updater`);
        this.logger.warn(`job s/${id}/bac_updater deleted!`);
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
      await this.sessionRepository.delete(session.id);
    } else {
      this.logger.warn(`Session [${id}] not found`);
      return null;
    }
  }
}
