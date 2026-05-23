import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AppConfigField {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ primary: true, nullable: false })
  name!: string;

  @Column()
  active!: boolean;

  @Column()
  description!: string;

  @Column()
  type!: string;

  @Column()
  slug!: string;

  @Column()
  required!: boolean;
}
