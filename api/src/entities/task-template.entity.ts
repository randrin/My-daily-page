import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export interface TemplateItem {
  title: string;
  dayOffset: number;
  time: string;
  enabled: boolean;
}

@Entity('task_templates')
@Index(['userId'])
export class TaskTemplate {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'user_id', type: 'uuid' }) userId: string;
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column({ length: 120 }) name: string;
  @Column({ type: 'text', default: '' }) description: string;
  @Column({ default: true }) enabled: boolean;
  @Column({ type: 'jsonb' }) items: TemplateItem[];
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
