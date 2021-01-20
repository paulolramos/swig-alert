import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BacService } from 'src/bac/bac.service';
import { NotificationService } from 'src/notification/notification.service';
import { Session } from 'src/session/session.entity';
import { Repository } from 'typeorm';
import { Beverage } from './beverage.entity';
import { IBeverageService } from './beverage.service.interface';

@Injectable()
export class BeverageService implements IBeverageService {
  private readonly logger = new Logger(BeverageService.name);
  constructor(
    @InjectRepository(Beverage)
    private beverageRepository: Repository<Beverage>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    private bacService: BacService,
    private notificationService: NotificationService,
  ) {}

  async getAllBeveragesBySessionId(
    userId: string,
    sessionId: string,
  ): Promise<Beverage[]> {
    const beverages = await this.beverageRepository.find({
      where: {
        session: {
          id: sessionId,
          user: {
            id: userId,
          },
        },
      },
    });

    if (beverages.length > 0) {
      this.logger.debug(`Getting beverages for u/${userId}/s/${sessionId}`);
      return beverages;
    } else {
      this.logger.warn(`No beverages found for u/${userId}/s/${sessionId}`);
      return [];
    }
  }

  async getBeverageById(
    userId: string,
    sessionId: string,
    id: string,
  ): Promise<Beverage> {
    const beverage = await this.beverageRepository.findOne({
      where: {
        id,
        session: {
          id: sessionId,
          user: { id: userId },
        },
      },
    });

    if (beverage) {
      this.logger.debug(
        `Getting beverage [${beverage.id}] for u/${userId}/s/${sessionId}`,
      );
      return beverage;
    } else {
      this.logger.warn(
        `Beverage [${id}] doesn't exist in: u/${userId}/s/${sessionId}`,
      );
      return null;
    }
  }

  async addBeverage(
    userId: string,
    sessionId: string,
    beverage: Beverage,
  ): Promise<Beverage> {
    const session = await this.sessionRepository.findOne({
      where: {
        id: sessionId,
        user: {
          id: userId,
        },
      },
    });

    if (session) {
      const increaseInBac = this.bacService.getIncreaseInBac(
        session.baseBloodAlcoholContentSnapshot,
        beverage,
      );

      const newBAC = parseFloat(
        (session.bloodAlcoholContent + increaseInBac).toFixed(4),
      );
      session.bloodAlcoholContent = newBAC;
      beverage.session = session;

      this.logger.debug(
        `adding b/${beverage.name} to u/${userId}/s/${session.id}`,
      );
      this.sessionRepository.save(session);
      const newBeverage = await this.beverageRepository.save(beverage);

      if (session.setDrinkReminder === true && !beverage.isConsumed) {
        this.notificationService.drinkSMS(
          `sms-u/${userId}/s/${sessionId}/b/${newBeverage.id}`,
          userId,
          sessionId,
        );
      }

      return newBeverage;
    } else {
      this.logger.warn(
        `Unable to add b/${beverage.name} to u/${userId}/s/${sessionId}. Session doesn't exist.`,
      );
      return null;
    }
  }

  async consumeBeverage(
    userId: string,
    sessionId: string,
    id: string,
  ): Promise<Beverage> {
    const beverage = await this.getBeverageById(userId, sessionId, id);
    beverage.isConsumed = true;
    beverage.consumedAt = new Date();
    this.notificationService.deleteSMSJob(userId, sessionId, id);
    this.logger.debug(`u/${userId}/s/${sessionId} consumed b/${beverage.id}`);
    return await this.beverageRepository.save(beverage);
  }
}
