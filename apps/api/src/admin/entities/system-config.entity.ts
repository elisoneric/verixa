import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('system_config')
export class SystemConfig {
  @PrimaryColumn()
  key: string;

  @Column({ type: 'text' })
  value: string;

  @Column({ default: false })
  isSecret: boolean;

  @Column({ default: 'General configuration value' })
  description: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
