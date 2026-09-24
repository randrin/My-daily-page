"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { requiredFieldError, zodFieldErrors } from "@/lib/field-errors";
import {
  categoryFormSchema,
  type Category,
  type CategoryFormInput,
} from "@/schemas/category.schema";

const categoryFields = ["name"] as const;

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  isSubmitting?: boolean;
  onSubmit: (input: CategoryFormInput) => Promise<void> | void;
}

export function CategoryForm({
  open,
  onOpenChange,
  category,
  isSubmitting = false,
  onSubmit,
}: CategoryFormProps) {
  const [name, setName] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<(typeof categoryFields)[number], string>>
  >({});

  React.useEffect(() => {
    if (!open) return;
    setName(category?.name ?? "");
    setFieldErrors({});
  }, [open, category]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = categoryFormSchema.safeParse({ name });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error, categoryFields));
      return;
    }

    setFieldErrors({});
    await onSubmit(parsed.data);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-hidden p-0 sm:max-w-md">
        <SheetHeader className="border-b px-6 py-5 pr-12">
          <SheetTitle>
            {category ? "Modifier la catégorie" : "Nouvelle catégorie"}
          </SheetTitle>
          <SheetDescription>
            {category
              ? "Le nom est unique pour ton compte. La couleur reste celle attribuée à la création."
              : "Indique un nom. Une couleur est attribuée automatiquement."}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <FieldGroup className="gap-5">
              <Field data-invalid={Boolean(fieldErrors.name) || undefined}>
                <FieldLabel htmlFor="category-name">Nom</FieldLabel>
                <Input
                  id="category-name"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setFieldErrors((errors) =>
                      requiredFieldError(errors, "name", event.target.value),
                    );
                  }}
                  placeholder="Travail"
                  autoComplete="off"
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={
                    fieldErrors.name ? "category-name-error" : undefined
                  }
                  disabled={isSubmitting}
                />
                {fieldErrors.name ? (
                  <FieldError id="category-name-error">
                    {fieldErrors.name}
                  </FieldError>
                ) : null}
              </Field>

              {category ? (
                <Field>
                  <FieldLabel>Couleur</FieldLabel>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span
                      className="size-5 rounded-full border"
                      style={{ backgroundColor: category.color }}
                      aria-hidden
                    />
                    {category.color}
                  </div>
                </Field>
              ) : null}
            </FieldGroup>
          </div>

          <SheetFooter className="border-t bg-background mt-0 flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Enregistrement…"
                : category
                  ? "Enregistrer"
                  : "Créer la catégorie"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
