"use client";

import { useTranslator } from "@/i18n/provider";
import { Localized } from "@/i18n/provider";
import { useId } from "react";
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
  errors = {},
  onFieldBlur,
}: {
  items: TemplateItem[];
  onChange: (items: TemplateItem[]) => void;
  disabled?: boolean;
  snapshot?: boolean;
  errors?: Record<string, string>;
  onFieldBlur?: (path: string) => void;
}) {
  const t = useTranslator();
  const id = useId();
  const fieldProps = (index: number, field: string) => {
    const path = `items.${index}.${field}`;
    return {
      "aria-invalid": !!errors[path],
      "aria-describedby": errors[path]
        ? `${id}-${index}-${field}-error`
        : undefined,
      onBlur: () => onFieldBlur?.(path),
    };
  };
  const fieldError = (index: number, field: string) => {
    const message = errors[`items.${index}.${field}`];
    return message ? (
      <p
        id={`${id}-${index}-${field}-error`}
        role="alert"
        className="text-sm text-destructive"
      >
        <Localized>{message}</Localized>
      </p>
    ) : null;
  };
  const patch = (index: number, value: Partial<TemplateItem>) =>
    onChange(
      items.map((item, i) => (i === index ? { ...item, ...value } : item)),
    );
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        <Localized>{t("messages.day0StartDate")}</Localized>{" "}
        {snapshot
          ? t(
              "messages.changesApplyOnlyToThisListDisabledOrRemoved",
            )
          : t(
              "messages.disabledTasksStayInTheTemplateButAreNot",
            )}
      </p>
      {items.map((item, index) => (
        <fieldset
          key={index}
          disabled={disabled}
          className="space-y-3 rounded-lg border p-4"
        >
          <legend className="px-1 text-sm font-medium">
            <Localized>{t("messages.task")}</Localized>
            {index + 1}
          </legend>
          <label className="block space-y-1 text-sm">
            <span
              className={
                errors[`items.${index}.title`] ? "text-destructive" : undefined
              }
            >
              <Localized>{t("tasks.title")}</Localized>
            </span>
            <Input
              {...fieldProps(index, "title")}
              placeholder={t("messages.eGCheckTravelDocuments")}
              value={item.title}
              maxLength={255}
              onChange={(e) => patch(index, { title: e.target.value })}
            />
            {fieldError(index, "title")}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1 text-sm">
              <span
                className={
                  errors[`items.${index}.dayOffset`]
                    ? "text-destructive"
                    : undefined
                }
              >
                <Localized>{t("messages.daysAfterStart")}</Localized>
              </span>
              <Input
                {...fieldProps(index, "dayOffset")}
                placeholder="Ex. 0"
                type="number"
                min={0}
                max={3650}
                step={1}
                value={item.dayOffset}
                onChange={(e) =>
                  patch(index, { dayOffset: Number(e.target.value) })
                }
              />
              {fieldError(index, "dayOffset")}
            </label>
            <label className="space-y-1 text-sm">
              <span
                className={
                  errors[`items.${index}.time`] ? "text-destructive" : undefined
                }
              >
                <Localized>{t("messages.time")}</Localized>
              </span>
              <Input
                {...fieldProps(index, "time")}
                type="time"
                value={item.time}
                onChange={(e) => patch(index, { time: e.target.value })}
              />
              {fieldError(index, "time")}
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
                enabledLabel={t("messages.enabled")}
                disabledLabel={t("messages.disabled")}
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
      {errors.items && (
        <p role="alert" className="text-sm text-destructive">
          {errors.items}
        </p>
      )}
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
        <Localized>{t("messages.addATask")}</Localized>
      </Button>
    </div>
  );
}
