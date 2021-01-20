import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CronJob } from 'cron';
import { addMinutes } from 'date-fns';
import { SessionService } from 'src/session/session.service';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { Twilio } from 'twilio';

@Injectable()
export class NotificationService {
  twilioClient = new Twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
  );
  twilioPhone = process.env.TWILIO_PHONE;
  logger = new Logger(NotificationService.name);

  constructor(
    private schedulerRegistry: SchedulerRegistry,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private sessionService: SessionService,
  ) {}

  async drinkSMS(
    name: string,
    userId: string,
    sessionId: string,
  ): Promise<void> {
    type UserSMSObject = Pick<
      User,
      'phoneNumber' | 'username' | 'drinkTimeMinutes'
    >;

    // get necessary user info
    const user: UserSMSObject = await this.userRepository.findOne({
      select: ['phoneNumber', 'username', 'drinkTimeMinutes'],
      where: {
        id: userId,
      },
    });

    // check for phone number, in case user deleted
    if (user.phoneNumber) {
      // create new datetime based on estimated drink consumption time
      const reminderDate = addMinutes(new Date(), user.drinkTimeMinutes);

      // create sms job
      const job = new CronJob(reminderDate, async () => {
        // get current session state (beverages are joined)
        const session = await this.sessionService.getSessionById(
          userId,
          sessionId,
        );

        // compose message
        const message = `after ${user.drinkTimeMinutes} min your Blood Alcohol Content is current around ${session.bloodAlcoholContent}.`;

        // send sms
        const smsResponse = await this.twilioClient.messages.create({
          body: message,
          from: this.twilioPhone,
          to: '+1' + user.phoneNumber,
        });

        // check for errors
        if (smsResponse.errorCode === null) {
          this.logger.debug(
            `successfully sent sms notification to ${user.username}`,
          );
        }
      });

      // initiate/schedule job
      this.schedulerRegistry.addCronJob(name, job);
      job.start();
      this.logger.debug(`[${name}] job created`);
    } else {
      this.logger.debug('no phone number available to send sms notification');
      return;
    }
  }

  deleteSMSJob(userId: string, sessionId: string, beverageId: string) {
    const jobName = `sms-u/${userId}/s/${sessionId}/b/${beverageId}`;
    try {
      this.schedulerRegistry.deleteCronJob(jobName);
    } catch (error) {
      return this.logger.debug(`job ${jobName} not found`);
    }
    this.logger.debug(`job ${jobName} deleted`);
  }
}
