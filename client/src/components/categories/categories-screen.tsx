"use client";

import { CategoryCard } from "@/components/categories/category-card";
import { CategoryForm } from "@/components/categories/category-form";
import { CategoryTable } from "@/components/categories/category-table";
import DashboardLayout from "@/components/layout/dashboard.layout";
import { Button } from "@/components/ui/button";
import {
  CardGridSkeleton,
  TableListSkeleton
} from "@/components/ui/data-skeleton";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory
} from "@/hooks/use-categories";
import { getApiErrorMessage } from "@/lib/api-error";
import { showQuerySkeleton } from "@/lib/query-skeleton";
import type { CategoryFormInput } from "@/schemas/category.schema";
import { useCategoriesUiStore } from "@/stores/categories.store";
import { filterCategories } from "@/utils/category-utils";
import { LayoutGrid, List, Plus, Search, Tags, X } from "lucide-react";
import { toast } from "sonner";

export function CategoriesScreen() {
  const categoriesQuery = useCategories();
  const { data: categories = [], isError, refetch } = categoriesQuery;
  const showSkeleton = showQuerySkeleton(categoriesQuery);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const viewMode = useCategoriesUiStore((s) => s.viewMode);
  const search = useCategoriesUiStore((s) => s.search);
  const isFormOpen = useCategoriesUiStore((s) => s.isFormOpen);
  const selectedCategoryId = useCategoriesUiStore((s) => s.selectedCategoryId);
  const pendingDeleteId = useCategoriesUiStore((s) => s.pendingDeleteId);
  const setViewMode = useCategoriesUiStore((s) => s.setViewMode);
  const setSearch = useCategoriesUiStore((s) => s.setSearch);
  const resetSearch = useCategoriesUiStore((s) => s.resetSearch);
  const openCreate = useCategoriesUiStore((s) => s.openCreate);
  const openEdit = useCategoriesUiStore((s) => s.openEdit);
  const closeForm = useCategoriesUiStore((s) => s.closeForm);
  const askDelete = useCategoriesUiStore((s) => s.askDelete);
  const closeDelete = useCategoriesUiStore((s) => s.closeDelete);

  const visibleCategories = filterCategories(categories, search);
  const editing =
    categories.find((category) => category.id === selectedCategoryId) ?? null;
  const pendingDelete =
    categories.find((category) => category.id === pendingDeleteId) ?? null;
  const isSaving = createCategory.isPending || updateCategory.isPending;
  const hasSearch = Boolean(search.trim());

  const handleSubmit = async (input: CategoryFormInput) => {
    try {
      if (selectedCategoryId) {
        await updateCategory.mutateAsync({ id: selectedCategoryId, input });
        toast.success("Catégorie mise à jour");
      } else {
        await createCategory.mutateAsync(input);
        toast.success("Catégorie créée");
      }
      closeForm();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Impossible d’enregistrer la catégorie")
      );
    }
  };

  const handleDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      await deleteCategory.mutateAsync(pendingDeleteId);
      toast.success("Catégorie supprimée");
      closeDelete();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Impossible de supprimer la catégorie")
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Catégories</h1>
            <p className="text-muted-foreground">
              Recherche et vues liste ou cartes. La couleur est générée à la
              création.
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nouvelle catégorie
          </Button>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un nom ou une couleur…"
                className="pl-9"
                aria-label="Rechercher une catégorie"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-md border p-1">
                <Button
                  type="button"
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  className="h-7"
                  onClick={() => setViewMode("table")}
                  aria-label="Vue liste"
                  aria-pressed={viewMode === "table"}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  className="h-7"
                  onClick={() => setViewMode("grid")}
                  aria-label="Vue cartes"
                  aria-pressed={viewMode === "grid"}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
              {hasSearch ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetSearch}
                >
                  <X className="h-4 w-4" />
                  Réinitialiser
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        {showSkeleton ? (
          <div
            aria-busy="true"
            aria-live="polite"
            data-slot="categories-loading"
          >
            {viewMode === "table" ? (
              <TableListSkeleton rows={6} columns={4} />
            ) : (
              <CardGridSkeleton cards={6} />
            )}
          </div>
        ) : null}

        {isError ? (
          <div className="flex flex-col items-start gap-3 rounded-xl border px-4 py-6 text-sm">
            <p className="text-destructive">
              Impossible de charger tes catégories.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Réessayer
            </Button>
          </div>
        ) : null}

        {!showSkeleton && !isError && visibleCategories.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border py-12 text-center">
            <Tags className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {hasSearch
                ? "Aucune catégorie ne correspond à ta recherche."
                : "Aucune catégorie pour l’instant."}
            </p>
            {hasSearch ? (
              <Button variant="outline" onClick={resetSearch}>
                Effacer la recherche
              </Button>
            ) : (
              <Button variant="outline" onClick={openCreate}>
                Créer la première
              </Button>
            )}
          </div>
        ) : null}

        {!showSkeleton && !isError && visibleCategories.length > 0 ? (
          viewMode === "table" ? (
            <CategoryTable
              categories={visibleCategories}
              onEdit={(category) => openEdit(category.id)}
              onDelete={askDelete}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onEdit={(item) => openEdit(item.id)}
                  onDelete={askDelete}
                />
              ))}
            </div>
          )
        ) : null}
      </div>

      <CategoryForm
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open) closeForm();
        }}
        category={editing}
        isSubmitting={isSaving}
        onSubmit={handleSubmit}
      />

      <Sheet
        open={Boolean(pendingDeleteId)}
        onOpenChange={(open) => {
          if (!open) closeDelete();
        }}
      >
        <SheetContent className="w-full gap-0 overflow-hidden p-0 sm:max-w-md">
          <SheetHeader className="border-b px-6 py-5 pr-12">
            <SheetTitle>Supprimer la catégorie</SheetTitle>
            <SheetDescription>
              {pendingDelete
                ? `« ${pendingDelete.name} » sera retirée. Les tâches liées ne seront plus catégorisées.`
                : "Cette action est définitive."}
            </SheetDescription>
          </SheetHeader>
          <SheetFooter className="border-t bg-background mt-0 flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeDelete}
              disabled={deleteCategory.isPending}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteCategory.isPending}
            >
              {deleteCategory.isPending ? "Suppression…" : "Supprimer"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
}
