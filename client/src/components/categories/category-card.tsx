"use client";

import { useTranslator } from "@/i18n/provider";
import { Localized } from "@/i18n/provider";
import { Pencil, Trash2 } from "lucide-react";
import type { Category } from "@/schemas/category.schema";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  const t = useTranslator();
  return (
    <Card className="group relative h-full gap-0 overflow-hidden py-0 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: category.color }}
        aria-hidden
      />
      <CardHeader className="px-5 pt-5 pb-4">
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
      <CardFooter className="mt-auto items-center justify-between gap-3 border-t bg-muted/40 px-4 py-2.5 [.border-t]:pt-2.5">
        <p className="min-w-0 truncate font-mono text-xs text-muted-foreground">
          {category.color}
        </p>
        <div className="inline-flex shrink-0 items-center rounded-lg border bg-background p-0.5 shadow-xs">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-foreground"
                aria-label={`Modifier ${category.name}`}
                onClick={() => onEdit?.(category)}
              >
                <Pencil className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <Localized>{t("common.edit")}</Localized>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-destructive/80 hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Supprimer ${category.name}`}
                onClick={() => onDelete?.(category.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <Localized>{t("common.delete")}</Localized>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardFooter>
    </Card>
  );
}
