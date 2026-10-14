import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { mergeMap, Observable } from 'rxjs';
export function activityKind(
  controller: string,
  method: string,
  handler: string,
): string | null {
  if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) return null;
  const kinds: Record<string, string> = {
    TasksController: 'tasks',
    CategoriesController: 'categories',
    TaskTemplatesController: 'templates',
  };
  if (controller === 'TaskTemplatesController' && handler === 'suggest')
    return null;
  if (controller === 'AssistantController' && handler === 'confirm')
    return 'assistant.confirm';
  return kinds[controller] ?? null;
}
@Injectable()
export class UserActivityInterceptor implements NestInterceptor {
  private readonly logger = new Logger(UserActivityInterceptor.name);
  constructor(private readonly db: DataSource) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();
    const request = context
      .switchToHttp()
      .getRequest<{ method: string; user?: { id: string } }>();
    const kind = activityKind(
      context.getClass().name,
      request.method,
      context.getHandler().name,
    );
    const userId = request.user?.id;
    if (!kind || !userId) return next.handle();
    return next.handle().pipe(
      mergeMap(async (value: unknown) => {
        try {
          await this.db.query(
            'INSERT INTO user_activity_events(user_id,kind) VALUES($1,$2)',
            [userId, kind],
          );
        } catch {
          this.logger.warn(
            'Activity measurement unavailable; successful action preserved',
          );
        }
        return value;
      }),
    );
  }
}
