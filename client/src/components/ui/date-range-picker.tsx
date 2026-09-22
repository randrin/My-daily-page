"use client";

import * as React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, RotateCw } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DateRangePickerProps = {
  id?: string;
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  invalid?: boolean;
  placeholder?: string;
  disabled?: boolean;
};

const RANGE_START_MONTH = new Date(2020, 0);
const RANGE_END_MONTH = new Date(2035, 11);

function formatRange(range?: DateRange) {
  if (!range?.from) return undefined;
  const from = format(range.from, "d MMM yyyy", { locale: fr });
  if (!range.to || range.to.getTime() === range.from.getTime()) return from;
  return `${from} - ${format(range.to, "d MMM yyyy", { locale: fr })}`;
}

export function DateRangePicker({
  id,
  value,
  onChange,
  invalid,
  placeholder = "Date de début - date de fin",
  disabled,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const label = formatRange(value);

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-invalid={invalid || undefined}
          className={cn(
            "border-input dark:bg-input/30 flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-full border bg-transparent px-4 py-1 text-left text-sm shadow-xs outline-none",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            !label && "text-muted-foreground",
          )}
        >
          <span className="truncate">{label ?? placeholder}</span>
          <CalendarIcon className="text-muted-foreground size-4 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto max-w-[calc(100vw-2rem)] overflow-x-auto p-4"
        align="start"
        side="bottom"
      >
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
          <div className="bg-muted flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium">
            <span>{label ?? placeholder}</span>
            <CalendarIcon className="size-4" />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="rounded-full"
            onClick={() => onChange(undefined)}
          >
            <RotateCw />
            Rafraîchir
          </Button>
        </div>
        <Calendar
          mode="range"
          selected={value}
          onSelect={onChange}
          numberOfMonths={2}
          captionLayout="dropdown"
          locale={fr}
          weekStartsOn={1}
          showOutsideDays={false}
          defaultMonth={value?.from}
          startMonth={RANGE_START_MONTH}
          endMonth={RANGE_END_MONTH}
          formatters={{
            formatMonthDropdown: (date) =>
              format(date, "MMMM", { locale: fr }),
          }}
          className="bg-transparent p-0"
          classNames={{
            months: "flex flex-col gap-6 md:flex-row md:gap-8",
            month_caption: "text-sm font-medium",
          }}
          components={{
            DayButton: ({ className, ...props }) => (
              <CalendarDayButton
                className={cn(
                  "rounded-full bg-muted/40 hover:bg-muted",
                  "data-[selected-single=true]:rounded-full data-[selected-single=true]:bg-white data-[selected-single=true]:text-black",
                  "data-[range-middle=true]:rounded-full data-[range-middle=true]:bg-muted",
                  "data-[range-start=true]:rounded-full data-[range-start=true]:bg-white data-[range-start=true]:text-black",
                  "data-[range-end=true]:rounded-full data-[range-end=true]:bg-white data-[range-end=true]:text-black",
                  className,
                )}
                {...props}
              />
            ),
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
