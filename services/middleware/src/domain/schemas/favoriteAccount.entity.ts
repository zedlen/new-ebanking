import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class FavoriteAccount {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ primary: true })
  customer_id!: string;

  @Column()
  account_id!: string;

  @Column()
  account_type!: number;

  @Column()
  account_alias!: string;

  @Column()
  beneficiary_name!: string;

  @Column()
  beneficiary_email!: string;
}
