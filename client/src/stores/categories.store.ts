import { create } from "zustand";

export type CategoryViewMode = "table" | "grid";

type CategoriesUiState = {
  viewMode: CategoryViewMode;
  search: string;
  isFormOpen: boolean;
  selectedCategoryId: string | null;
  pendingDeleteId: string | null;
  setViewMode: (viewMode: CategoryViewMode) => void;
  setSearch: (search: string) => void;
  resetSearch: () => void;
  openCreate: () => void;
  openEdit: (id: string) => void;
  closeForm: () => void;
  askDelete: (id: string) => void;
  closeDelete: () => void;
};

export const useCategoriesUiStore = create<CategoriesUiState>((set) => ({
  viewMode: "table",
  search: "",
  isFormOpen: false,
  selectedCategoryId: null,
  pendingDeleteId: null,
  setViewMode: (viewMode) => set({ viewMode }),
  setSearch: (search) => set({ search }),
  resetSearch: () => set({ search: "" }),
  openCreate: () => set({ isFormOpen: true, selectedCategoryId: null }),
  openEdit: (id) => set({ isFormOpen: true, selectedCategoryId: id }),
  closeForm: () => set({ isFormOpen: false, selectedCategoryId: null }),
  askDelete: (id) => set({ pendingDeleteId: id }),
  closeDelete: () => set({ pendingDeleteId: null }),
}));
