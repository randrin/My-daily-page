import { ExecutionContext } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { lastValueFrom, of, throwError } from 'rxjs';
import {
  UserActivityInterceptor,
  activityKind,
} from './user-activity.interceptor';
import { comparison } from './admin-analytics.service';
const context = {
  getType: () => 'http',
  getClass: () => class TasksController {},
  getHandler: () => function create() {},
  switchToHttp: () => ({
    getRequest: () => ({ method: 'POST', user: { id: 'user' } }),
  }),
} as unknown as ExecutionContext;
describe('Usage measurement', () => {
  it('excludes sign-ins, read-only visits, administration and unconfirmed AI previews', () => {
    for (const [controller, method, handler] of [
      ['AuthController', 'POST', 'login'],
      ['TasksController', 'GET', 'findAll'],
      ['AdminController', 'POST', 'retry'],
      ['TaskTemplatesController', 'POST', 'suggest'],
      ['AssistantController', 'POST', 'suggest'],
    ])
      expect(activityKind(controller, method, handler)).toBeNull();
    expect(activityKind('TasksController', 'PATCH', 'update')).toBe('tasks');
    expect(activityKind('AssistantController', 'POST', 'confirm')).toBe(
      'assistant.confirm',
    );
  });
  it('records only successful actions with no request content', async () => {
    const db = { query: jest.fn().mockResolvedValue([]) };
    const interceptor = new UserActivityInterceptor(
      db as unknown as DataSource,
    );
    await expect(
      lastValueFrom(
        interceptor.intercept(context, {
          handle: () => of({ id: 'task', title: 'private' }),
        }),
      ),
    ).resolves.toMatchObject({ id: 'task' });
    expect(db.query).toHaveBeenCalledWith(expect.any(String), [
      'user',
      'tasks',
    ]);
    db.query.mockClear();
    await expect(
      lastValueFrom(
        interceptor.intercept(context, {
          handle: () => throwError(() => new Error('invalid action')),
        }),
      ),
    ).rejects.toThrow();
    expect(db.query).not.toHaveBeenCalled();
  });
  it('does not fail a successful mutation if analytics storage fails', async () => {
    const interceptor = new UserActivityInterceptor({
      query: () => Promise.reject(new Error('offline')),
    } as unknown as DataSource);
    await expect(
      lastValueFrom(
        interceptor.intercept(context, { handle: () => of('success') }),
      ),
    ).resolves.toBe('success');
  });
  it('keeps missing history and zero baselines distinct from percentage changes', () => {
    expect(comparison(3, null)).toMatchObject({
      previous: null,
      change: null,
      percent: null,
    });
    expect(comparison(3, 0)).toMatchObject({ change: 3, percent: null });
    expect(comparison(3, 2)).toMatchObject({ change: 1, percent: 50 });
  });
});
