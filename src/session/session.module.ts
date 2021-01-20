import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { Session } from './session.entity';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { BeverageModule } from 'src/beverage/beverage.module';
import { BacModule } from 'src/bac/bac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session]),
    forwardRef(() => UserModule),
    forwardRef(() => BeverageModule),
    BacModule,
  ],
  providers: [SessionService],
  controllers: [SessionController],
  exports: [TypeOrmModule, SessionService],
})
export class SessionModule {}
