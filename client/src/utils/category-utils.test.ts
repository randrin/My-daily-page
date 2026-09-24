import { describe, expect, it } from "vitest";
import type { Category } from "@/schemas/category.schema";
import {
  filterCategories,
  sortCategories,
  tasksByCategoryChartData,
} from "@/utils/category-utils";

const categories: Category[] = [
  { id: "1", name: "work", color: "#3B82F6", userId: "u1" },
  { id: "2", name: "health", color: "#22C55E", userId: "u1" },
];

describe("filterCategories", () => {
  it("retourne tout sans recherche", () => {
    expect(filterCategories(categories, "  ")).toHaveLength(2);
  });

  it("filtre par nom", () => {
    expect(filterCategories(categories, "HEA")).toEqual([categories[1]]);
  });

  it("filtre par couleur", () => {
    expect(filterCategories(categories, "#3b82")).toEqual([categories[0]]);
  });
});

describe("sortCategories", () => {
  it("trie par nom", () => {
    expect(
      sortCategories(categories, { key: "name", direction: "asc" }).map(
        (category) => category.name,
      ),
    ).toEqual(["health", "work"]);
  });
});

describe("tasksByCategoryChartData", () => {
  it("regroupe les tâches et reprend la couleur de la catégorie", () => {
    const slices = tasksByCategoryChartData(
      [
        { categoryId: "work", category: { id: "work", name: "work", color: "#64748b" } },
        { categoryId: "work", category: { id: "work", name: "work", color: "#64748b" } },
        { categoryId: null, category: null },
      ],
      categories,
    );

    expect(slices).toEqual([
      { label: "work", value: 2, color: "#3B82F6" },
      { label: "Sans catégorie", value: 1, color: "#94a3b8" },
    ]);
  });
});
