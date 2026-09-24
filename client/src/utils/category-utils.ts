import type { SortState } from "@/lib/table-sort";
import { sortBy } from "@/lib/table-sort";
import type { Category } from "@/schemas/category.schema";

export const CATEGORY_SORT_KEYS = ["name", "color"] as const;
export type CategorySortKey = (typeof CATEGORY_SORT_KEYS)[number];

const UNCATEGORIZED_KEY = "uncategorized";
const UNCATEGORIZED_LABEL = "Sans catégorie";
const UNCATEGORIZED_COLOR = "#94a3b8";

export type CategoryChartSlice = {
  label: string;
  value: number;
  color: string;
};

type CategoryRef = {
  id?: string | null;
  name?: string | null;
  color?: string | null;
};

type TaskLike = {
  categoryId?: string | null;
  category?: CategoryRef | null;
};

export function filterCategories(
  categories: Category[],
  search: string,
): Category[] {
  const query = search.trim().toLowerCase();
  if (!query) return categories;

  return categories.filter(
    (category) =>
      category.name.toLowerCase().includes(query) ||
      category.color.toLowerCase().includes(query),
  );
}

export function sortCategories(
  categories: Category[],
  sort: SortState<CategorySortKey> | null,
): Category[] {
  return sortBy(categories, sort, (category, key) =>
    key === "name" ? category.name : category.color,
  );
}

export function tasksByCategoryChartData(
  tasks: TaskLike[],
  categories: CategoryRef[] = [],
): CategoryChartSlice[] {
  const counts = new Map<string, CategoryChartSlice>();

  for (const task of tasks) {
    const fromTask = task.category;
    const fromList =
      categories.find(
        (category) =>
          category.id === task.categoryId || category.id === fromTask?.id,
      ) ??
      categories.find((category) => {
        const name = category.name?.toLowerCase();
        return (
          Boolean(name) &&
          (name === fromTask?.name?.toLowerCase() ||
            name === task.categoryId?.toLowerCase())
        );
      });

    const key =
      fromList?.id ?? fromTask?.id ?? task.categoryId ?? UNCATEGORIZED_KEY;
    const label =
      fromList?.name ?? fromTask?.name ?? UNCATEGORIZED_LABEL;
    const color = fromList?.color ?? fromTask?.color ?? UNCATEGORIZED_COLOR;

    const current = counts.get(key) ?? { label, value: 0, color };
    current.value += 1;
    current.label = label;
    current.color = color;
    counts.set(key, current);
  }

  return Array.from(counts.values()).filter((item) => item.value > 0);
}
