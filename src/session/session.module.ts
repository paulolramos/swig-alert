import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { Session } from './session.entity';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { BacModule } from 'src/bac/bac.module';

@Module({
  imports: [TypeOrmModule.forFeature([Session]), UserModule, BacModule],
  providers: [SessionService],
  controllers: [SessionController],
  exports: [TypeOrmModule, SessionService],
})
export class SessionModule {}
