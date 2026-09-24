export type SortDirection = "asc" | "desc";

export type SortState<K extends string> = {
  key: K;
  direction: SortDirection;
};

export function toggleSort<K extends string>(
  current: SortState<K> | null,
  key: K,
): SortState<K> {
  if (current?.key === key) {
    return {
      key,
      direction: current.direction === "asc" ? "desc" : "asc",
    };
  }
  return { key, direction: "asc" };
}

export function compareText(left: string, right: string): number {
  return left.localeCompare(right, "fr", { sensitivity: "base" });
}

export function sortBy<T, K extends string>(
  items: T[],
  sort: SortState<K> | null,
  getValue: (item: T, key: K) => string | number | null,
): T[] {
  if (!sort) return items;

  return [...items].sort((left, right) => {
    const a = getValue(left, sort.key);
    const b = getValue(right, sort.key);
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;

    const result =
      typeof a === "number" && typeof b === "number"
        ? a - b
        : compareText(String(a), String(b));

    return sort.direction === "asc" ? result : -result;
  });
}
