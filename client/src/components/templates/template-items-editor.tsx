"use client";

import { ActivationLabel } from "@/components/ui/activation-label";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TemplateItem } from "@/hooks/use-task-templates";

export function TemplateItemsEditor({
  items,
  onChange,
  disabled = false,
  snapshot = false,
}: {
  items: TemplateItem[];
  onChange: (items: TemplateItem[]) => void;
  disabled?: boolean;
  snapshot?: boolean;
}) {
  const patch = (index: number, value: Partial<TemplateItem>) =>
    onChange(
      items.map((item, i) => (i === index ? { ...item, ...value } : item)),
    );
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Jour 0 = date de départ.{" "}
        {snapshot
          ? "Les modifications concernent uniquement cette liste. Une tâche désactivée ou retirée ne sera pas créée."
          : "Une tâche désactivée reste dans le modèle mais ne sera pas proposée lors de la création."}
      </p>
      {items.map((item, index) => (
        <fieldset
          key={index}
          disabled={disabled}
          className="space-y-3 rounded-lg border p-4"
        >
          <legend className="px-1 text-sm font-medium">
            Tâche {index + 1}
          </legend>
          <label className="block space-y-1 text-sm">
            Titre
            <Input
              value={item.title}
              maxLength={255}
              onChange={(e) => patch(index, { title: e.target.value })}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1 text-sm">
              Jours après le départ
              <Input
                type="number"
                min={0}
                max={3650}
                step={1}
                value={item.dayOffset}
                onChange={(e) =>
                  patch(index, { dayOffset: Number(e.target.value) })
                }
              />
            </label>
            <label className="space-y-1 text-sm">
              Heure
              <Input
                type="time"
                value={item.time}
                onChange={(e) => patch(index, { time: e.target.value })}
              />
            </label>
          </div>
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant={item.enabled ? "default" : "outline"}
              role="switch"
              aria-checked={item.enabled}
              aria-label={`Inclure la tâche ${index + 1}`}
              onClick={() => patch(index, { enabled: !item.enabled })}
            >
              <ActivationLabel
                enabled={item.enabled}
                enabledLabel="Activée"
                disabledLabel="Désactivée"
              />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Supprimer la tâche ${index + 1}`}
              onClick={() => onChange(items.filter((_, i) => i !== index))}
            >
              <Trash2 className="text-destructive" />
            </Button>
          </div>
        </fieldset>
      ))}
      <Button
        type="button"
        variant="outline"
        disabled={disabled || items.length >= 20}
        onClick={() =>
          onChange([
            ...items,
            {
              title: "",
              dayOffset: items.length,
              time: "09:00",
              enabled: true,
            },
          ])
        }
      >
        <Plus />
        Ajouter une tâche
      </Button>
    </div>
  );
}
