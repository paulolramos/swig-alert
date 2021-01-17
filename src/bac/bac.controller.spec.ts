import { Test, TestingModule } from '@nestjs/testing';
import { BacController } from './bac.controller';

describe('BacController', () => {
  let controller: BacController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BacController],
    }).compile();

    controller = module.get<BacController>(BacController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
