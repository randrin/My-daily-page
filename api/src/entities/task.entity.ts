import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { Priority, TaskStatus } from './enums';
import { Reminder } from './reminder.entity';
import { TaskNote } from './task-note.entity';
import { User } from './user.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ name: 'reminders_snoozed_until', type: 'timestamptz', nullable: true })
  remindersSnoozedUntil: Date | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  amount: string | null;

  @Column({ type: 'varchar', length: 3, default: 'EUR' })
  currency: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  reference: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    enumName: 'TaskStatus',
    default: TaskStatus.TODO,
  })
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: Priority,
    enumName: 'Priority',
    default: Priority.MEDIUM,
  })
  priority: Priority;

  @Column({ type: 'timestamptz', nullable: true })
  deadline: Date | null;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId: string | null;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', nullable: true })
  recurrence: string | null;

  @Column({
    name: 'previous_occurrence_id',
    type: 'uuid',
    nullable: true,
    unique: true,
  })
  previousOccurrenceId: string | null;

  @Column({ name: 'recurrence_day', type: 'integer', nullable: true })
  recurrenceDay: number | null;

  @Column({ name: 'image_url', type: 'varchar', length: 2048, nullable: true })
  imageUrl: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Category, (category) => category.tasks, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'category_id' })
  category: Category | null;

  @OneToMany(() => Reminder, (reminder) => reminder.task, { cascade: true })
  reminders: Reminder[];

  @OneToMany(() => TaskNote, (note) => note.task)
  notes: TaskNote[];

  @ManyToMany(() => Task, (task) => task.blocking)
  @JoinTable({
    name: 'task_blockers',
    joinColumn: { name: 'task_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'blocker_id', referencedColumnName: 'id' },
  })
  blockers: Task[];

  @ManyToMany(() => Task, (task) => task.blockers)
  blocking: Task[];
}
