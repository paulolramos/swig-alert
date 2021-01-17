import { Test, TestingModule } from '@nestjs/testing';
import { BacService } from './bac.service';

describe('BacService', () => {
  let service: BacService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BacService],
    }).compile();

    service = module.get<BacService>(BacService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
