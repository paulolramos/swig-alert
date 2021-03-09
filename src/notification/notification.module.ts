import { Module } from '@nestjs/common';
import { SessionModule } from 'src/session/session.module';
import { UserModule } from 'src/user/user.module';
import { NotificationService } from './notification.service';

@Module({
  imports: [UserModule, SessionModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
