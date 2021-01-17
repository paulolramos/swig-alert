import { Beverage } from './beverage.entity';

export interface IBeverageService {
  getAllBeveragesBySessionId: (
    userId: string,
    sessionId: string,
  ) => Promise<Beverage[]>;
  getBeverageById: (
    userId: string,
    sessionId: string,
    id: string,
  ) => Promise<Beverage>;
  addBeverage: (
    userId: string,
    sessionId: string,
    beverage: Beverage,
  ) => Promise<Beverage>;
  consumeBeverage: (
    userId: string,
    sessionId: string,
    id: string,
  ) => Promise<Beverage>;
}
