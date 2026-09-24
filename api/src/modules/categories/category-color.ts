import { randomInt } from 'node:crypto';

export const CATEGORY_PALETTE = [
  '#3b82f6',
  '#8b5cf6',
  '#f59e0b',
  '#10b981',
  '#ef4444',
  '#06b6d4',
  '#ec4899',
  '#84cc16',
  '#f97316',
  '#6366f1',
] as const;

export function pickCategoryColor(): string {
  return CATEGORY_PALETTE[randomInt(0, CATEGORY_PALETTE.length)];
}
