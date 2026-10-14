import {
  TaskDefaults,
  taskDefaults,
} from '../modules/personalization/defaults';
import { Exclude, instanceToPlain } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { NotificationPreference } from './notification-preference.entity';
import { Task } from './task.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 10, default: 'user' })
  role: 'user' | 'support' | 'admin';

  @Column({ name: 'reminders_resumed_at', type: 'timestamptz', nullable: true })
  @Exclude()
  remindersResumedAt: Date | null;
  @Column({ name: 'suspended_at', type: 'timestamptz', nullable: true })
  suspendedAt: Date | null;
  @Column({
    name: 'suspension_reason',
    type: 'varchar',
    length: 40,
    nullable: true,
  })
  suspensionReason: string | null;
  @Column({ name: 'session_version', default: 0 })
  @Exclude()
  sessionVersion: number;

  @Column({ name: 'task_defaults', type: 'jsonb', default: taskDefaults })
  taskDefaults: TaskDefaults;
  @Column({ name: 'energy_enabled', default: false }) energyEnabled: boolean;

  @Column({ name: 'mfa_enabled', default: false }) mfaEnabled: boolean;
  @Column({ unique: true })
  email: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: true })
  firstName: string | null;

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastName: string | null;

  @Column()
  @Exclude()
  password: string;

  @Column({ name: 'phone_number', type: 'varchar', nullable: true })
  phoneNumber: string | null;

  @Column({ name: 'whatsapp_number', type: 'varchar', nullable: true })
  whatsappNumber: string | null;

  @Column({ default: 'Europe/Paris' })
  timezone: string;

  @Column({ name: 'default_deadline_days', type: 'integer', nullable: true })
  defaultDeadlineDays: number | null;

  @Column({ name: 'notifications_enabled', default: false })
  notificationsEnabled: boolean;

  @Column({ name: 'daily_digest_enabled', default: false })
  dailyDigestEnabled: boolean;

  @Column({ name: 'quiet_hours_enabled', default: false })
  quietHoursEnabled: boolean;

  @Column({ name: 'quiet_hours_start', default: '22:00', length: 5 })
  quietHoursStart: string;

  @Column({ name: 'quiet_hours_end', default: '07:00', length: 5 })
  quietHoursEnd: string;

  @Column({ name: 'quiet_hours_allow_urgent', default: false })
  quietHoursAllowUrgent: boolean;

  @Column({ name: 'smart_quiet_hours_enabled', default: false })
  smartQuietHoursEnabled: boolean;

  @Column({ name: 'adaptive_escalation_enabled', default: false })
  adaptiveEscalationEnabled: boolean;

  @Column({
    name: 'notifications_paused_until',
    type: 'timestamptz',
    nullable: true,
  })
  notificationsPausedUntil: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Category, (category) => category.user)
  categories: Category[];

  @OneToMany(() => Task, (task) => task.user)
  tasks: Task[];

  @OneToMany(() => NotificationPreference, (pref) => pref.user)
  notifChannels: NotificationPreference[];

  toSafeJSON() {
    return instanceToPlain(this);
  }
}
