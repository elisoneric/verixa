import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';
import { Environment } from '../../organizations/entities/environment-config.entity';

export enum VerificationStatus {
  SUCCESS = 'Success',
  FAILED = 'Failed',
}

@Entity('verification_logs')
export class VerificationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  org_id: string;

  @Column({
    type: 'enum',
    enum: Environment,
  })
  environment: Environment;

  @Column()
  api_key_id: string;

  @Column()
  serviceType: string; // e.g., 'bvn', 'nin', 'nuban'

  @Column({
    type: 'enum',
    enum: VerificationStatus,
  })
  status: VerificationStatus;

  @Column()
  upstreamProvider: string; // e.g., 'mock', 'dojah'

  @Column({ nullable: true })
  @Index({ unique: true })
  idempotencyKey: string;

  @Column({ type: 'jsonb', nullable: true })
  requestPayload: any; // Minimal payload

  @Column({ type: 'jsonb', nullable: true })
  responsePayload: any; // Minimal payload, encrypted or obfuscated if it contains PII

  @Column({ default: false })
  isCached: boolean;

  @Column({ default: 'LIVE' })
  source: string; // 'LIVE' | 'CACHE'

  @Column({ type: 'numeric', default: 0 })
  costDeducted: number;

  @Column({ type: 'int', default: 0 })
  latencyMs: number;

  @Column({ nullable: true })
  cacheKey: string;

  @CreateDateColumn()
  createdAt: Date;
}
