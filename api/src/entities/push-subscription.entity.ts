import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
@Entity('push_subscriptions')
export class PushSubscription {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'user_id' }) userId: string;
  @Column({ type: 'text', unique: true }) endpoint: string;
  @Column({ type: 'varchar', length: 128 }) p256dh: string;
  @Column({ type: 'varchar', length: 32 }) auth: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
