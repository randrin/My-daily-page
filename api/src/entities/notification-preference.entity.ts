import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { NotifChannel } from './enums';
import { User } from './user.entity';

@Entity('notification_preferences')
@Unique(['userId', 'channel'])
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'enum', enum: NotifChannel, enumName: 'NotifChannel' })
  channel: NotifChannel;

  @Column({ default: true })
  enabled: boolean;

  @ManyToOne(() => User, (user) => user.notifChannels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
