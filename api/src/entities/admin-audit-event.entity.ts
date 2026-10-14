import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity('admin_audit_events')
export class AdminAuditEvent {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'actor_id', type: 'uuid' }) actorId: string;
  @Column({ name: 'target_id', type: 'uuid', nullable: true }) targetId:
    | string
    | null;
  @Column({ name: 'role_before', type: 'varchar', length: 10, nullable: true })
  roleBefore: string | null;
  @Column({ name: 'role_after', type: 'varchar', length: 10, nullable: true })
  roleAfter: string | null;
  @Column({ name: 'resource_id', type: 'uuid', nullable: true }) resourceId:
    | string
    | null;
  @Column({ type: 'varchar', length: 80 }) action: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
