import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApiKey } from '../../auth/entities/api-key.entity';
import { Wallet } from '../../billing/entities/wallet.entity';
import { EnvironmentConfig } from './environment-config.entity';

export enum OrganizationTier {
  STARTER = 'STARTER',
  GROWTH = 'GROWTH',
  ENTERPRISE = 'ENTERPRISE',
  CUSTOM = 'CUSTOM',
}

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: OrganizationTier,
    default: OrganizationTier.STARTER,
  })
  tier: OrganizationTier;

  @Column({ type: 'int', nullable: true })
  customBvnRate: number;

  @Column({ type: 'int', nullable: true })
  customNinRate: number;

  @Column({ type: 'int', nullable: true })
  customNubanRate: number;

  @Column({ type: 'jsonb', nullable: true })
  complianceData: {
    accountType?: string;
    fullName?: string;
    nin?: string;
    rcNumber?: string;
    businessType?: string;
    directorName?: string;
    directorNin?: string;
    directorDob?: string;
    phone?: string;
    useCase?: string;
    lawfulBasisAgreed?: boolean;
    termsAgreed?: boolean;
    registeredIp?: string;
    verifiedAt?: string;
    upgradedAt?: string;
  };

  @OneToMany(() => User, user => user.organization)
  users: User[];

  @OneToMany(() => ApiKey, apiKey => apiKey.organization)
  apiKeys: ApiKey[];

  @OneToMany(() => Wallet, wallet => wallet.organization)
  wallets: Wallet[];

  @OneToMany(() => EnvironmentConfig, config => config.organization)
  environmentConfigs: EnvironmentConfig[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
