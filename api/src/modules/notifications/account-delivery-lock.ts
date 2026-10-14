import { QueryRunner } from 'typeorm';
/** Keep this shared lock until the worker finishes. Suspension takes the exclusive lock. */
export async function lockDeliveryAccount(
  runner: QueryRunner,
  userId: string,
  triggerAt?: Date,
): Promise<boolean> {
  await runner.query('SELECT pg_advisory_lock_shared(82612,hashtext($1))', [
    userId,
  ]);
  const rows = (await runner.query(
    'SELECT NOT EXISTS(SELECT 1 FROM users WHERE id=$1 AND suspended_at IS NULL AND ($2::timestamptz IS NULL OR reminders_resumed_at IS NULL OR $2>=reminders_resumed_at)) AS blocked',
    [userId, triggerAt ?? null],
  )) as { blocked: boolean }[];
  return rows[0].blocked;
}
export async function unlockDeliveryAccount(
  runner: QueryRunner,
  userId: string,
): Promise<void> {
  await runner.query('SELECT pg_advisory_unlock_shared(82612,hashtext($1))', [
    userId,
  ]);
}
