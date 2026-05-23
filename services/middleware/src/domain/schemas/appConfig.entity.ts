import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AppConfig {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ primary: true, nullable: false })
  appName!: string;

  @Column({ nullable: false, type: 'jsonb' })
  config!: any;

  @Column()
  active!: boolean;

  @Column()
  version!: number;
}
