import { Priority } from '@entities/enums';
import {
  explainTask,
  limitUrgencies,
  suggestPriority,
} from './assistant-rules';
import { parseAssistantResponse } from './assistant.service';
const now = new Date('2026-10-11T12:00:00Z');
const response = (items: unknown) => ({
  status: 'completed',
  output: [
    {
      type: 'message',
      content: [{ type: 'output_text', text: JSON.stringify({ items }) }],
    },
  ],
});
describe('Assistant safety and proposal rules', () => {
  it('limits urgencies and deselects excess proposals without mutating input', () => {
    const input = Array.from({ length: 4 }, () => ({
      priority: Priority.URGENT,
      reason: 'urgent',
    }));
    const rows = limitUrgencies(input);
    expect(rows.filter((item) => item.selected)).toHaveLength(2);
    expect(rows[2]).toMatchObject({
      priority: Priority.HIGH,
      deferred: true,
      selected: false,
    });
    expect(input[2].priority).toBe(Priority.URGENT);
  });
  it('suggests priorities from explicit urgency, due time and content', () => {
    expect(suggestPriority('Urgent : appeler', null, now).priority).toBe(
      Priority.URGENT,
    );
    expect(
      suggestPriority('Appeler', new Date(now.getTime() + 60000), now).priority,
    ).toBe(Priority.HIGH);
    expect(suggestPriority('Payer la facture', null, now).priority).toBe(
      Priority.HIGH,
    );
    expect(suggestPriority('Lire', null, now).priority).toBe(Priority.MEDIUM);
  });
  it('explains blockers before encouraging work on the task', () =>
    expect(explainTask(Priority.URGENT, true, now, now)).toContain(
      'Dépendance',
    ));
  it('accepts structured proposals with no invented deadline', async () => {
    const items = [
      {
        title: 'Appeler',
        deadline: null,
        priority: 'MEDIUM',
        reason: 'À vérifier',
      },
    ];
    expect(await parseAssistantResponse(response(items))).toEqual(items);
  });
  it.each([
    response([
      {
        title: 'Appeler',
        deadline: null,
        priority: 'URGENT',
        reason: '',
        send: true,
      },
    ]),
    response([
      {
        title: 'Appeler',
        deadline: 'demain',
        priority: 'MEDIUM',
        reason: 'À vérifier',
      },
    ]),
    response([]),
    { status: 'incomplete', output: [] },
  ])('rejects invalid or incomplete provider output', async (body) => {
    await expect(parseAssistantResponse(body)).rejects.toThrow();
  });
});
