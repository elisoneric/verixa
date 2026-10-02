import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { Environment } from '../../organizations/entities/environment-config.entity';

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: Environment,
  })
  environment: Environment;

  @Column()
  keyPrefix: string; // e.g., vrx_live_ or vrx_test_

  @Column()
  @Index()
  keyHash: string; // Argon2 or bcrypt hash of the secret key

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Organization, org => org.apiKeys)
  @JoinColumn({ name: 'org_id' })
  organization: Organization;

  @Column()
  org_id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
