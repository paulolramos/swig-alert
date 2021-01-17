import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Beverage } from './beverage.entity';
import { BeverageService } from './beverage.service';
import { BeverageController } from './beverage.controller';
import { BacModule } from 'src/bac/bac.module';
import { SessionModule } from 'src/session/session.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Beverage]),
    forwardRef(() => SessionModule),
    BacModule,
  ],
  providers: [BeverageService],
  controllers: [BeverageController],
  exports: [TypeOrmModule, BeverageService],
})
export class BeverageModule {}
