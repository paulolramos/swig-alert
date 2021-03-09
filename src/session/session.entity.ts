import { Beverage } from 'src/beverage/beverage.entity';
import { HabitOptions } from 'src/types/habit.enum';
import { User } from 'src/user/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
  user: User;

  @Column({ width: 136 })
  weightSnapshot: number;

  @Column({ nullable: true, length: 12 })
  habitTypeSnapshot: HabitOptions;

  @Column({ type: 'float', width: 100 })
  baseBloodAlcoholContentSnapshot: number;

  @Column({ width: 20 })
  estimatedBeverages: number;

  @Column({ width: 12 })
  estimatedDurationInHours: number;

  @Column({ nullable: true, default: 0 })
  bloodAlcoholContent: number;

  @Column({ nullable: true })
  sessionEnd: Date;

  @Column()
  isActive: boolean;

  @Column({ nullable: true })
  setDrinkReminder: boolean;

  @OneToMany(() => Beverage, (beverage) => beverage.session)
  beverages: Beverage[];

  @CreateDateColumn()
  sessionStart: Date;

  @UpdateDateColumn()
  updatedOn: Date;
}
