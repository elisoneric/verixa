import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from './organization.entity';

export enum Environment {
  LIVE = 'Live',
  SANDBOX = 'Sandbox',
}

@Entity('environment_configs')
export class EnvironmentConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: Environment,
    default: Environment.SANDBOX,
  })
  environment: Environment;

  @Column({ nullable: true })
  webhookUrl: string;

  @Column({ nullable: true })
  webhookSecret: string;

  @ManyToOne(() => Organization, org => org.environmentConfigs)
  @JoinColumn({ name: 'org_id' })
  organization: Organization;

  @Column()
  org_id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
