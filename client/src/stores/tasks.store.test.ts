import { describe, expect, it } from "vitest";
import { useTasksUiStore } from "@/stores/tasks.store";

describe("useTasksUiStore", () => {
  it("remet la page à 1 quand les filtres changent", () => {
    useTasksUiStore.setState({
      page: 3,
      filters: {
        search: "",
        status: "all",
        categoryId: "all",
        priority: "all",
      },
    });

    useTasksUiStore.getState().setFilters({ search: "courses" });

    const state = useTasksUiStore.getState();
    expect(state.page).toBe(1);
    expect(state.filters.search).toBe("courses");
  });

  it("applique un statut unique via le filtre select", () => {
    useTasksUiStore.getState().resetFilters();
    useTasksUiStore.setState({ page: 2 });
    useTasksUiStore.getState().setFilters({ status: "todo" });

    const state = useTasksUiStore.getState();
    expect(state.page).toBe(1);
    expect(state.filters.status).toBe("todo");
  });

  it("passe à la page 1 quand le tri change", () => {
    useTasksUiStore.setState({ page: 3, sort: null });
    useTasksUiStore.getState().setSort({ key: "title", direction: "asc" });

    const state = useTasksUiStore.getState();
    expect(state.page).toBe(1);
    expect(state.sort).toEqual({ key: "title", direction: "asc" });
  });

  it("ouvre le formulaire en création sans tâche sélectionnée", () => {
    useTasksUiStore.getState().openEdit("task-1");
    useTasksUiStore.getState().openCreate();

    const state = useTasksUiStore.getState();
    expect(state.isFormOpen).toBe(true);
    expect(state.selectedTaskId).toBeNull();
  });
});
