import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ primary: true, nullable: false })
  username!: string;

  @Column({ default: 'https://cdn.ebanking-service.net/user.png' })
  image!: string;

  @Column({ default: '' })
  name!: string;
}
