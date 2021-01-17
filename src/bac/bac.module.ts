import { Module } from '@nestjs/common';
import { BacController } from './bac.controller';
import { BacService } from './bac.service';

@Module({
  providers: [BacService],
  controllers: [BacController],
  exports: [BacService],
})
export class BacModule {}
