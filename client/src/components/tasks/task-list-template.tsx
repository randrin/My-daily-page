"use client";

import { useState } from "react";
import Link from "next/link";
import { TemplateItemsEditor } from "@/components/templates/template-items-editor";
import {
  useTaskTemplates,
  type TemplateItem,
} from "@/hooks/use-task-templates";
import { FeedbackState } from "@/components/ui/feedback-state";
import { Skeleton } from "@/components/ui/skeleton";
import { showQuerySkeleton } from "@/lib/query-skeleton";
import { buildCustomTaskList } from "@/lib/task-list-templates";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, ListPlus, ListTodo, Undo2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { apiClient } from "@/api/client";
import { taskKeys } from "@/hooks/use-tasks";
import { formatTravelPause } from "@/lib/travel-pause";
import { getApiErrorMessage } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const listSchema = z.object({
  tasks: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(255),
        deadline: z.iso.datetime(),
      }),
    )
    .min(1)
    .max(20),
});

export function TaskListTemplate({ timezone }: { timezone: string }) {
  const [open, setOpen] = useState(false);
  const [today, setToday] = useState<Date>();
  const [template, setTemplate] = useState<string>("");
  const [date, setDate] = useState<Date>();
  const [items, setItems] = useState<TemplateItem[]>([]);
  const templatesQuery = useTaskTemplates();
  const availableTemplates = (templatesQuery.data ?? []).filter(
    (item) => item.enabled && item.items.some((task) => task.enabled),
  );
  const selectedTemplate = availableTemplates.find(
    (item) => item.id === template,
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  const queryClient = useQueryClient();
  const tasks = date ? buildCustomTaskList(items, date, timezone) : undefined;
  const mutation = useMutation({
    mutationFn: async () => {
      if (!selectedTemplate) throw new Error("Sélectionne un modèle actif.");
      const payload = listSchema.parse({ tasks });
      if (payload.tasks.some((task) => new Date(task.deadline) <= new Date()))
        throw new Error("Choisis une date et une heure futures.");
      await apiClient.post("/tasks/lists", payload);
      return payload.tasks.length;
    },
    onSuccess: (count) => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success(
        `Liste créée : ${count} nouvelle${count > 1 ? "s" : ""} tâche${count > 1 ? "s" : ""}`,
      );
      setOpen(false);
      setDate(undefined);
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Impossible de créer la liste")),
  });
  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          setToday(
            new Date(
              `${formatTravelPause(new Date().toISOString(), timezone).slice(0, 10)}T00:00:00`,
            ),
          );
          setTemplate("");
          setItems([]);
          setDate(undefined);
          setOpen(true);
        }}
      >
        <ListPlus aria-hidden />
        Utiliser un modèle
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!mutation.isPending) setOpen(next);
        }}
      >
        <DialogContent
          className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl"
          onInteractOutside={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Créer une liste datée</DialogTitle>
            <DialogDescription>
              Les tâches activées du modèle sont proposées à partir de la date
              choisie, dans le fuseau {timezone}. Ajuste cette liste avant de
              créer ; le modèle restera inchangé.
            </DialogDescription>
          </DialogHeader>
          {showQuerySkeleton(templatesQuery) ? (
            <Skeleton className="h-20 w-full" />
          ) : templatesQuery.isError ? (
            <FeedbackState
              variant="error"
              description="Impossible de charger tes modèles."
            >
              <Button
                variant="outline"
                onClick={() => void templatesQuery.refetch()}
              >
                Réessayer
              </Button>
            </FeedbackState>
          ) : !availableTemplates.length ? (
            <FeedbackState description="Aucun modèle actif contenant des tâches activées.">
              <Button asChild variant="outline">
                <Link href="/dashboard/templates">Gérer mes modèles</Link>
              </Button>
            </FeedbackState>
          ) : (
            <div className="space-y-2">
              <label htmlFor="list-template">Modèle</label>
              <Select
                value={template}
                onValueChange={(id) => {
                  setTemplate(id);
                  setItems(
                    availableTemplates
                      .find((item) => item.id === id)
                      ?.items.filter((task) => task.enabled)
                      .map((task) => ({ ...task })) ?? [],
                  );
                }}
                disabled={mutation.isPending}
              >
                <SelectTrigger id="list-template" className="w-full">
                  <SelectValue placeholder="Choisir un modèle" />
                </SelectTrigger>
                <SelectContent>
                  {availableTemplates.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="list-date">Date de départ</label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen} modal>
              <PopoverTrigger asChild>
                <Button
                  id="list-date"
                  variant="outline"
                  className="w-full justify-between"
                  disabled={mutation.isPending}
                >
                  {date
                    ? format(date, "d MMMM yyyy", { locale: fr })
                    : "Choisir une date"}
                  <CalendarIcon aria-hidden />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  locale={fr}
                  captionLayout="dropdown"
                  startMonth={today}
                  endMonth={
                    today
                      ? new Date(today.getFullYear() + 20, 11, 1)
                      : undefined
                  }
                  disabled={today ? { before: today } : undefined}
                  selected={date}
                  onSelect={(day) => {
                    setDate(day);
                    setCalendarOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          {selectedTemplate && (
            <TemplateItemsEditor
              snapshot
              items={items}
              onChange={setItems}
              disabled={mutation.isPending}
            />
          )}
          {date && selectedTemplate && (!tasks || !tasks.length) && (
            <p role="alert" className="text-sm text-destructive">
              Active au moins une tâche et vérifie les titres et heures. Une
              heure inexistante lors du changement d’heure doit être corrigée.
            </p>
          )}
          {tasks && tasks.length > 0 && (
            <ol className="space-y-2 rounded-lg border p-4">
              {tasks.map((task, index) => (
                <li key={index}>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Intl.DateTimeFormat("fr-FR", {
                      timeZone: timezone,
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(task.deadline))}
                  </p>
                </li>
              ))}
            </ol>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              disabled={mutation.isPending}
              onClick={() => setOpen(false)}
            >
              <Undo2 className="mr-2 h-4 w-4" />
              Annuler
            </Button>
            <Button
              disabled={
                !selectedTemplate || !tasks?.length || mutation.isPending
              }
              onClick={() => mutation.mutate()}
            >
              <ListTodo className="mr-2 h-4 w-4" />
              {mutation.isPending
                ? "Création…"
                : `Créer les ${tasks?.length ?? 0} tâches`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
