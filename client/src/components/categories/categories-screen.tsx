"use client";

import { useTranslator } from "@/i18n/provider";
import { Localized } from "@/i18n/provider";
import { PageTitle } from "@/components/ui/page-title";
import { FeedbackState } from "@/components/ui/feedback-state";
import { CategoryCard } from "@/components/categories/category-card";
import { CategoryForm } from "@/components/categories/category-form";
import { CategoryTable } from "@/components/categories/category-table";
import DashboardLayout from "@/components/layout/dashboard.layout";
import { Button } from "@/components/ui/button";
import {
  CardGridSkeleton,
  TableListSkeleton,
} from "@/components/ui/data-skeleton";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/hooks/use-categories";
import { getApiErrorMessage } from "@/lib/api-error";
import { showQuerySkeleton } from "@/lib/query-skeleton";
import type { CategoryFormInput } from "@/schemas/category.schema";
import { useCategoriesUiStore } from "@/stores/categories.store";
import { filterCategories } from "@/utils/category-utils";
import {
  LayoutGrid,
  List,
  Plus,
  Search,
  Tags,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { toast } from "sonner";

export function CategoriesScreen() {
  const t = useTranslator();
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
        toast.success(t("messages.categoryUpdated"));
      } else {
        await createCategory.mutateAsync(input);
        toast.success(t("messages.categoryCreated"));
      }
      closeForm();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, t("messages.unableToSaveCategory")),
      );
    }
  };

  const handleDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      await deleteCategory.mutateAsync(pendingDeleteId);
      toast.success(t("messages.categoryDeleted"));
      closeDelete();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, t("messages.unableToDeleteCategory")),
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <PageTitle icon={Tags}>
              <Localized>{t("navigation.categories")}</Localized>
            </PageTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              <Localized>
                {t(
                  "messages.searchAndTableOrCardViewsColorIsGenerated",
                )}
              </Localized>
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            <Localized>{t("messages.newCategory")}</Localized>
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
                aria-label={t("messages.searchCategories")}
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
                  <Localized>{t("common.reset")}</Localized>
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
          <FeedbackState
            variant="error"
            description={t("messages.unableToLoadYourCategories")}
          >
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <Localized>{t("common.retry")}</Localized>
            </Button>
          </FeedbackState>
        ) : null}

        {!showSkeleton && !isError && visibleCategories.length === 0 ? (
          <FeedbackState
            icon={Tags}
            description={
              hasSearch
                ? t("messages.noCategoriesMatchYourSearch")
                : t("messages.noCategoriesYet")
            }
          >
            {hasSearch ? (
              <Button variant="outline" onClick={resetSearch}>
                <Localized>{t("messages.clearSearch")}</Localized>
              </Button>
            ) : (
              <Button variant="outline" onClick={openCreate}>
                <Localized>{t("messages.createYourFirst")}</Localized>
              </Button>
            )}
          </FeedbackState>
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

      <Dialog
        open={Boolean(pendingDeleteId)}
        onOpenChange={(open) => {
          if (!open) closeDelete();
        }}
      >
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
          <DialogHeader className="border-b px-6 py-5 pr-12">
            <DialogTitle>
              <Localized>{t("messages.deleteCategory")}</Localized>
            </DialogTitle>
            <DialogDescription>
              {pendingDelete
                ? `« ${pendingDelete.name} » sera retirée. Les tâches liées ne seront plus catégorisées.`
                : t("messages.thisActionIsPermanent")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-t bg-background mt-0 flex-row justify-end gap-2 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={closeDelete}
              disabled={deleteCategory.isPending}
            >
              <Undo2 className="size-4" />
              <Localized>{t("common.cancel")}</Localized>
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteCategory.isPending}
            >
              <Trash2 className="size-4" />
              {deleteCategory.isPending ? "Suppression…" : t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
