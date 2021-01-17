import { IsEmail, IsNotEmpty } from 'class-validator';
import { Exclude } from 'class-transformer';
import { Session } from 'src/session/session.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SexOptions } from 'src/types/sex.enum';
import { HabitOptions } from 'src/types/habit.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @IsNotEmpty()
  @Column({ unique: true })
  username: string;

  @Exclude()
  @IsNotEmpty()
  @Column()
  password: string;

  @IsEmail()
  @Column({ nullable: true, unique: true })
  email: string;

  @Column({ nullable: true, length: 12, unique: true })
  phoneNumber: string;

  @Column({ width: 136 })
  weightInPounds: number;

  // BAC which 1 oz. of alcohol would produce
  @Column({ nullable: true, type: 'float', width: 100 })
  baseBloodAlcoholContent: number;

  @Column({ width: 60, default: 20, nullable: true })
  drinkTimeMinutes: number;

  @Column({ nullable: true, length: 100 })
  safeWord: string;

  @Column({ nullable: true, length: 12 })
  sex: SexOptions;

  @Column({ nullable: true, length: 12, default: HabitOptions.AVERAGE })
  habitType: HabitOptions;

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  @CreateDateColumn()
  createdOn: Date;

  @UpdateDateColumn()
  updatedOn: Date;
}
