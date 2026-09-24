"use client";

import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { Button } from "@/components/ui/button";
import type { SortState } from "@/lib/table-sort";
import { toggleSort } from "@/lib/table-sort";
import type { Category } from "@/schemas/category.schema";
import {
  sortCategories,
  type CategorySortKey,
} from "@/utils/category-utils";
import { firstLetterUppercase } from "@/utils/helpers";

interface CategoryTableProps {
  categories: Category[];
  onEdit?: (category: Category) => void;
  onDelete?: (categoryId: string) => void;
}

export function CategoryTable({
  categories,
  onEdit,
  onDelete,
}: CategoryTableProps) {
  const [sort, setSort] = React.useState<SortState<CategorySortKey> | null>(
    null,
  );

  const handleSort = (key: CategorySortKey) => {
    setSort((current) => toggleSort(current, key));
  };

  const rows = React.useMemo(
    () => sortCategories(categories, sort),
    [categories, sort],
  );

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <SortableTableHead
                label="Couleur"
                sortKey="color"
                activeKey={sort?.key}
                direction={sort?.direction}
                onSort={handleSort}
              />
              <SortableTableHead
                label="Nom"
                sortKey="name"
                activeKey={sort?.key}
                direction={sort?.direction}
                onSort={handleSort}
              />
              <SortableTableHead
                label="Code"
                sortKey="color"
                activeKey={sort?.key}
                direction={sort?.direction}
                onSort={handleSort}
                className="hidden sm:table-cell"
              />
              <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((category) => (
              <tr
                key={category.id}
                className="border-b transition-colors hover:bg-muted/50"
              >
                <td className="p-4 align-middle">
                  <span
                    className="block size-4 rounded-full border"
                    style={{ backgroundColor: category.color }}
                    aria-hidden
                  />
                </td>
                <td className="p-4 align-middle">
                  <div className="font-medium">{firstLetterUppercase(category.name)}</div>
                </td>
                <td className="p-4 align-middle hidden sm:table-cell">
                  <div className="font-mono text-sm text-muted-foreground">
                    {category.color}
                  </div>
                </td>
                <td className="p-4 align-middle">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Modifier ${category.name}`}
                      onClick={() => onEdit?.(category)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      aria-label={`Supprimer ${category.name}`}
                      onClick={() => onDelete?.(category.id)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
