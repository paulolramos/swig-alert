import { Module } from '@nestjs/common';
import { SessionModule } from 'src/session/session.module';
import { UserModule } from 'src/user/user.module';
import { ProfileController } from './profile.controller';

@Module({
  imports: [UserModule, SessionModule],
  controllers: [ProfileController],
})
export class ProfileModule {}
