import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AppCredential {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ primary: true, nullable: false })
  appName!: string;

  @Column({ primary: true, nullable: false })
  enviroment!: string;

  @Column()
  apiKey!: string;

  @Column()
  status!: string;

  @Column()
  url!: string;

  @Column()
  active!: boolean;
}
