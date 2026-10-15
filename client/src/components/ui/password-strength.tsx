"use client";
import { Check, Circle } from "lucide-react";
import { getPasswordStrength } from "@/lib/password-strength";
import { cn } from "@/lib/utils";
const levels = [
  { label: "messages.notProvided", bar: "bg-muted", text: "text-muted-foreground" },
  {
    label: "messages.weak",
    bar: "bg-red-500",
    text: "text-red-700 dark:text-red-400"
  },
  {
    label: "messages.fair",
    bar: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-400"
  },
  { label: "messages.strong", bar: "bg-sky-500", text: "text-sky-700 dark:text-sky-400" },
  {
    label: "messages.excellent",
    bar: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400"
  }
];
export function PasswordStrength({
  password,
  id
}: {
  password: string;
  id: string;
}) {
  const strength = getPasswordStrength(password);
  const style = levels[strength.level];
  return (
    <div id={id} className="space-y-2.5 text-xs">
      <p className="flex justify-between gap-2 text-muted-foreground">
        Robustesse estimée
        <span
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={cn("font-medium", style.text)}
        >
          {style.label}
        </span>
      </p>
      <div className="flex gap-1.5" aria-hidden="true">
        {[1, 2, 3, 4].map((segment) => (
          <span
            key={segment}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors motion-reduce:transition-none",
              segment <= strength.level ? style.bar : "bg-muted"
            )}
          />
        ))}
      </div>
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {strength.criteria.map((criterion) => {
          const Icon = criterion.met ? Check : Circle;
          return (
            <li
              key={criterion.label}
              className={cn(
                "flex items-start gap-1.5",
                criterion.met
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="mt-0.5 size-3 shrink-0" aria-hidden />
              <span>
                <span className="sr-only">
                  {criterion.met ? "Critère rempli : " : "À compléter : "}
                </span>
                {criterion.label}
              </span>
            </li>
          );
        })}
      </ul>
      {password && strength.common && (
        <p className="text-red-700 dark:text-red-400">
          Évite les suites répétitives et les mots de passe courants.
        </p>
      )}
    </div>
  );
}
