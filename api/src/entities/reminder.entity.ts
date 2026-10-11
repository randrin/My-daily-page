import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NotifChannel, ReminderStatus } from './enums';
import { Task } from './task.entity';

@Entity('reminders')
export class Reminder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'task_id' })
  taskId: string;

  @Column({ name: 'trigger_at', type: 'timestamptz' })
  triggerAt: Date;

  @Column({ type: 'enum', enum: NotifChannel, enumName: 'NotifChannel' })
  channel: NotifChannel;

  @Column({
    type: 'enum',
    enum: ReminderStatus,
    enumName: 'ReminderStatus',
    default: ReminderStatus.PENDING,
  })
  status: ReminderStatus;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt: Date | null;

  @Column({
    name: 'automatic_key',
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  automaticKey: string | null;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError: string | null;

  @Column({ type: 'varchar', nullable: true }) provider: string | null;
  @Column({ name: 'provider_message_id', type: 'varchar', nullable: true })
  providerMessageId: string | null;
  @Column({ name: 'delivery_status', type: 'varchar', nullable: true })
  deliveryStatus: string | null;
  @Column({ name: 'delivery_error', type: 'varchar', nullable: true })
  deliveryError: string | null;

  @Column({ default: 0 })
  attempts: number;

  @ManyToOne(() => Task, (task) => task.reminders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task;
}
