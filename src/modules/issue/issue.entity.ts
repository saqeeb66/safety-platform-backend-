import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Location } from '../location/location.entity';

export enum IssueStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  APPROVED = 'APPROVED',
  CLOSED = 'CLOSED',
}

@Entity()
export class Issue {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  description!: string;

  @Column({ nullable: true })
  referenceStandard!: string;

  @Column({ nullable: true })
  actionPlan!: string;

  @Column({ nullable: true })
  assignedUser!: string;

  @Column()
  createdBy!: string;

  @Column({
    type: 'enum',
    enum: IssueStatus,
    default: IssueStatus.OPEN,
  })
  status!: IssueStatus;

  @CreateDateColumn()
  createdAt!: Date;

 

  

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Location, { nullable: true })
  location!: Location;

  @Column({ nullable: true })
  image?: string;
}