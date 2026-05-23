import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserAgent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ primary: true, nullable: false })
  ua!: string;

  @Column({ nullable: false, type: 'jsonb' })
  info!: any;
}
