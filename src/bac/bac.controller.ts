import { Controller, Get, Param } from '@nestjs/common';
import { HabitOptions } from 'src/types/habit.enum';
import { BacService } from './bac.service';

@Controller('bac')
export class BacController {
  constructor(private bacService: BacService) {}

  @Get(':bac/effects')
  async getEffects(@Param('bac') bac: string) {
    const _bac = parseFloat(bac);
    return this.bacService.getEffectsOfAlcohol(_bac);
  }

  @Get(':bac/:habitType')
  async getTimeUntilSober(
    @Param('bac') bac: string,
    @Param('habitType') habitType: HabitOptions,
  ) {
    const _bac = parseFloat(bac);
    return this.bacService.getHoursUntilSober(_bac, habitType);
  }
}
