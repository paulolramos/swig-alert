import { Session } from 'src/session/session.entity';
import { DrinkTypeOptions } from 'src/types/drinktype.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Beverage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ type: 'float', width: 4 })
  alcoholPercentage: number;

  @Column({ width: 2000 })
  quantityInOz: number;

  @Column({ nullable: true, default: DrinkTypeOptions.UNKNOWN })
  beverageType: DrinkTypeOptions;

  @Column()
  isConsumed: boolean;

  @Column({ nullable: true })
  consumedAt: Date;

  @Column({ type: 'float', nullable: true })
  longitude: number;

  @Column({ type: 'float', nullable: true })
  latitude: number;

  @CreateDateColumn()
  createdOn: Date;

  @ManyToOne(() => Session, (session) => session.beverages)
  session: Session;
}
