import { describe, expect, it } from "vitest";
import { useCategoriesUiStore } from "@/stores/categories.store";

describe("useCategoriesUiStore", () => {
  it("enregistre la recherche et la vue", () => {
    useCategoriesUiStore.getState().resetSearch();
    useCategoriesUiStore.getState().setSearch("work");
    useCategoriesUiStore.getState().setViewMode("grid");

    const state = useCategoriesUiStore.getState();
    expect(state.search).toBe("work");
    expect(state.viewMode).toBe("grid");
  });

  it("ouvre le formulaire en création sans catégorie sélectionnée", () => {
    useCategoriesUiStore.getState().openEdit("cat-1");
    useCategoriesUiStore.getState().openCreate();

    const state = useCategoriesUiStore.getState();
    expect(state.isFormOpen).toBe(true);
    expect(state.selectedCategoryId).toBeNull();
  });
});
