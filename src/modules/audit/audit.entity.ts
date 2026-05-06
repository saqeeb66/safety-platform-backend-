import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity()
export class Audit {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column()
  userId!: number;

  @Index()
  @Column()
  action!: string;

  @Index()
  @Column()
  email!: string;

  @CreateDateColumn({ name: 'timestamp' })
  createdAt!: Date;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;
}