import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class Location {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  // 🔥 ADD THIS (VERY IMPORTANT)
  @Column({ nullable: true })
  type!: string;

  @ManyToOne(() => Location, (location) => location.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  parent?: Location;

  @OneToMany(() => Location, (location) => location.parent)
  children!: Location[];
}