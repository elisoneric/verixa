import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { Environment } from '../../organizations/entities/environment-config.entity';
import { Transaction } from './transaction.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: Environment,
  })
  environment: Environment;

  // Storing balance in smallest currency unit (e.g., kobo/cents) to avoid floating point issues
  @Column({ type: 'bigint', default: 0 })
  balance: number;

  @ManyToOne(() => Organization, org => org.wallets)
  @JoinColumn({ name: 'org_id' })
  organization: Organization;

  @Column()
  org_id: string;

  @OneToMany(() => Transaction, transaction => transaction.wallet)
  transactions: Transaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
