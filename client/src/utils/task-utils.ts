import { Task, TaskStatus, TaskPriority, TaskCategory } from '@/types/task';

export const taskStatusLabels: Record<TaskStatus, string> = {
  'todo': 'To Do',
  'in-process': 'In Process',
  'done': 'Done',
  'complete': 'Complete',
};

export const taskPriorityLabels: Record<TaskPriority, string> = {
  'low': 'Low',
  'medium': 'Medium',
  'high': 'High',
  'urgent': 'Urgent',
};

export const taskCategoryLabels: Record<TaskCategory, string> = {
  'work': 'Work',
  'personal': 'Personal',
  'shopping': 'Shopping',
  'health': 'Health',
  'finance': 'Finance',
  'education': 'Education',
  'other': 'Other',
};

export const taskPriorityColors: Record<TaskPriority, string> = {
  'low': 'bg-blue-500',
  'medium': 'bg-yellow-500',
  'high': 'bg-orange-500',
  'urgent': 'bg-red-500',
};

export const taskStatusColors: Record<TaskStatus, string> = {
  'todo': 'bg-gray-500',
  'in-process': 'bg-blue-500',
  'done': 'bg-green-500',
  'complete': 'bg-purple-500',
};

export const getAllCategories = (): TaskCategory[] => {
  return Object.keys(taskCategoryLabels) as TaskCategory[];
};

export const getAllPriorities = (): TaskPriority[] => {
  return Object.keys(taskPriorityLabels) as TaskPriority[];
};

export const getAllStatuses = (): TaskStatus[] => {
  return Object.keys(taskStatusLabels) as TaskStatus[];
};
