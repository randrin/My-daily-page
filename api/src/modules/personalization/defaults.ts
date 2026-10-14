export const taskDefaults = {
  priority: 'medium',
  categoryId: null as string | null,
  reminderLeadMinutes: 0,
  dashboardPeriod: '7d',
  taskView: 'table',
  taskSort: 'deadline',
  sortDirection: 'asc',
};
export type TaskDefaults = typeof taskDefaults;
