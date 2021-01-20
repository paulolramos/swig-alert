import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { UserModule } from './user/user.module';
import { Session } from './session/session.entity';
import { Beverage } from './beverage/beverage.entity';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SessionModule } from './session/session.module';
import { BeverageModule } from './beverage/beverage.module';
import { BacModule } from './bac/bac.module';
import { ProfileModule } from './profile/profile.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'sqlite',
        database: './' + configService.get('DATABASE'),
        entities: [User, Session, Beverage],
        synchronize: true,
      }),
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    SessionModule,
    BeverageModule,
    BacModule,
    ProfileModule,
    NotificationModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
