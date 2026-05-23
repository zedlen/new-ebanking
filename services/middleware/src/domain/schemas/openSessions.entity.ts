import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class OpenSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: false })
  tki!: string;

  @Column({ unique: true, nullable: false, primary: true })
  u!: string;

  @Column({ nullable: false })
  agent!: string;

  @Column({ nullable: false })
  ip!: string;

  @Column({ default: true })
  active!: boolean;
}
