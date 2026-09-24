"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { Category } from "@/schemas/category.schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { firstLetterUppercase } from "@/utils";

interface CategoryCardProps {
  category: Category;
  onEdit?: (category: Category) => void;
  onDelete?: (categoryId: string) => void;
}

export function CategoryCard({
  category,
  onEdit,
  onDelete,
}: CategoryCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="size-4 shrink-0 rounded-full border"
              style={{ backgroundColor: category.color }}
              aria-hidden
            />
            <CardTitle className="truncate text-base font-semibold">
              {firstLetterUppercase(category.name)}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <p className="font-mono text-sm text-muted-foreground">
            {category.color}
          </p>
          <div className="flex items-center gap-2 border-t pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={() => onEdit?.(category)}
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Modifier
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-destructive hover:text-destructive"
              onClick={() => onDelete?.(category.id)}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Supprimer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
