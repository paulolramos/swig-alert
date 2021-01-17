import { Injectable, Logger } from '@nestjs/common';
import { Beverage } from 'src/beverage/beverage.entity';
import { HabitOptions } from 'src/types/habit.enum';
import { SexOptions } from 'src/types/sex.enum';

@Injectable()
export class BacService {
  private logger = new Logger(BacService.name);

  private convertPoundsToKilograms(pounds: number): number {
    const value = pounds / 2.2046;
    return parseFloat(value.toFixed(2));
  }

  private convertLitersToMilliliters(liters: number): number {
    const value = liters * 1000;
    return value;
  }

  private convertMillilitersToOz(ml: number): number {
    const value = ml / 29.574;
    return value;
  }

  private getAlcoholInDrink(percent: number, oz: number): number {
    const amount = (percent / 100) * oz;
    return amount;
  }

  getBaseAlcoholConcentrationInBlood(
    weightInPounds: number,
    sex: SexOptions,
  ): number {
    const percentageOfBodyWeightAsWater = {
      MALE: 0.58,
      FEMALE: 0.49,
      UNDISCLOSED: 0.49,
    };

    const percentageOfWaterInBlood = 0.806;

    const userBodyWeightInKg = this.convertPoundsToKilograms(weightInPounds);

    const amountOfWaterInLiters = parseFloat(
      (percentageOfBodyWeightAsWater[sex] * userBodyWeightInKg).toFixed(3),
    );

    const amountOfWaterInMilliliters = this.convertLitersToMilliliters(
      amountOfWaterInLiters,
    );

    const baseDose = {
      oz: 1,
      milliliter: 29.57,
      gram: 23.36,
    };

    const alcoholConcentrationInWater = parseFloat(
      (baseDose.gram / amountOfWaterInMilliliters).toFixed(7),
    );

    const alcoholConcentrationInBlood = parseFloat(
      (alcoholConcentrationInWater * percentageOfWaterInBlood).toFixed(6),
    );

    const concentrationPer100milliltersBlood = parseFloat(
      (alcoholConcentrationInBlood * 100).toFixed(4),
    );

    console.log(weightInPounds, sex);
    console.log('bwKG', userBodyWeightInKg);
    console.log('amountH20KG', amountOfWaterInLiters);
    console.log('amountInML', amountOfWaterInMilliliters);
    console.log('alInH20', alcoholConcentrationInWater);
    console.log('alInBlood', alcoholConcentrationInBlood);
    console.log('alIn100Blood', concentrationPer100milliltersBlood);

    return concentrationPer100milliltersBlood;
  }

  getIncreaseInBac(userBaseBac: number, beverage: Beverage): number {
    const quantityInOz = beverage.quantityInOz;
    const amountOfAlcoholInDrink = this.getAlcoholInDrink(
      beverage.alcoholPercentage,
      quantityInOz,
    );
    const newBac = (amountOfAlcoholInDrink * userBaseBac).toFixed(4);

    this.logger.debug(`bac increased by ${newBac}`);
    return parseFloat(newBac);
  }

  getBacAfterOneHour(userBac: number, habitType: HabitOptions): number {
    const metabolism = {
      light: 0.012,
      average: 0.017,
      heavy: 0.02,
    };

    let newBac = userBac;

    switch (habitType) {
      case HabitOptions.OCCASSIONAL:
        newBac = userBac - metabolism.light;
        break;
      case HabitOptions.AVERAGE:
        newBac = userBac - metabolism.average;
        break;
      case HabitOptions.HEAVY:
        newBac = userBac - metabolism.heavy;
        break;
      default:
        newBac = userBac - metabolism.average;
        break;
    }

    return parseFloat(newBac.toFixed(4));
  }

  getHoursUntilSober(
    userBac: number,
    habitType: HabitOptions,
  ): { hours: number; time: Date } {
    let hours = 0;
    let _userBac = userBac;

    // start to calculate 1 hour burnoff when user starting to feel effects
    while (_userBac >= 0.029) {
      hours += 1;
      const newBAC = this.getBacAfterOneHour(_userBac, habitType);
      _userBac = newBAC;
    }

    const time = new Date();
    time.setHours(time.getHours() + hours);

    return {
      hours,
      time,
    };
  }

  getEffectsOfAlcohol(
    userBac: number,
  ): { behaviors: string[]; impairments: string[] } {
    this.logger.debug(`Getting alcohol effects for bac of: ${userBac}`);
    let behaviors = [];
    let impairments = [];

    if (userBac === 0.0) {
      behaviors = [];
      impairments = [];
    } else if (userBac < 0.029) {
      behaviors = ['May appear normal'];
      impairments = ['Subtle effects detected with special tests'];
    } else if (userBac < 0.059) {
      behaviors = [
        'Decreased social inhibition',
        'Joyousness',
        'Mild euphoria',
        'Relaxation',
        'Increased verbosity',
      ];
      impairments = ['Decreased attentional control'];
    } else if (userBac < 0.099) {
      behaviors = [
        'Alcohol flush reaction',
        'Reduced affect display',
        'Disinhibition',
        'Euphoria',
        'Extraversion',
        'Increased pain tolerance',
      ];
      impairments = [
        'Depth perception',
        'Glare recovery',
        'Peripheral vision',
        'Euphoria',
        'Extraversion',
        'Reasoning',
      ];
    } else if (userBac < 0.199) {
      behaviors = [
        'Analgesia',
        'Ataxia',
        'Boisterousness',
        'Over expressed emotions',
        'Possibility of nausea and vomiting',
        'Spins',
      ];
      impairments = [
        'Gross motor skill',
        'Motor planning',
        'Reflexes',
        'Relaxed pronunciation',
        'Staggering',
        'Temporary erectile dysfunction',
      ];
    } else if (userBac < 0.299) {
      behaviors = [
        'Anger or sadness',
        'Anterograde amnesia',
        'Impaired sensations',
        'Inhibited sexual desire (ISD)',
        'Mood swings',
        'Nausea',
        'Partial loss of understanding',
        'Possibility of stupor',
        'Vomiting',
      ];
      impairments = [
        'Amnesia (memory blackout)',
        'Unconsciousness',
        'Severe physical disability',
      ];
    } else if (userBac < 0.399) {
      behaviors = [
        'Central nervous system depression',
        'Lapses in and out of consciousness',
        'Loss of understanding',
        'Low possibility of death',
        'Pulmonary aspiration',
        'Stupor',
      ];
      impairments = [
        'Dysequilibrium',
        'Breathing',
        'Resting heart rate',
        'Relaxed pronunciation',
      ];
    } else if (userBac < 0.5) {
      behaviors = [
        'Coma',
        'Possibility of death',
        'Severe central nervous system depression',
      ];
      impairments = [
        'Respiratory failure',
        'Heart rate',
        'Positional alcohol nystagmus',
      ];
    } else if (userBac > 0.5) {
      behaviors = ['High possibility of death'];
      impairments = [];
    } else {
      behaviors = [];
      impairments = [];
    }

    return {
      behaviors,
      impairments,
    };
  }
}
