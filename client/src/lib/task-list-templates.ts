import { addDays } from "date-fns";
import { reminderDeadline } from "@/lib/reminder-deadline";

export const TASK_LIST_TEMPLATES = [
  {
    id: "pay",
    label: "Paie",
    items: [
      "Vérifier le bulletin de paie",
      "Régler les factures",
      "Mettre à jour le budget",
    ],
  },
  {
    id: "travel",
    label: "Voyage",
    items: [
      "Vérifier les documents de voyage",
      "Confirmer les réservations",
      "Préparer les bagages",
    ],
  },
  {
    id: "school",
    label: "Rentrée",
    items: [
      "Vérifier les inscriptions",
      "Acheter les fournitures",
      "Préparer le planning",
    ],
  },
] as const;

/** Each step is scheduled on a successive calendar day, preserving local time across DST. */
export function buildTaskList(
  templateId: string,
  start: Date,
  time: string,
  timezone: string,
) {
  const template = TASK_LIST_TEMPLATES.find((item) => item.id === templateId);
  if (!template) return undefined;
  const tasks = template.items.map((title, index) => ({
    title,
    deadline: reminderDeadline(
      addDays(start, index),
      time,
      timezone,
    )?.toISOString(),
  }));
  if (tasks.some((task) => !task.deadline)) return undefined;
  return tasks.map((task) => ({ title: task.title, deadline: task.deadline! }));
}

/** Build an editable snapshot; disabled items never become tasks. */
export function buildCustomTaskList(
  items: { title: string; dayOffset: number; time: string; enabled: boolean }[],
  start: Date,
  timezone: string,
) {
  const selected = items.filter((item) => item.enabled);
  if (
    selected.some(
      (item) =>
        !item.title.trim() ||
        item.title.trim().length > 255 ||
        !Number.isInteger(item.dayOffset) ||
        item.dayOffset < 0 ||
        item.dayOffset > 3650 ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(item.time),
    )
  )
    return undefined;
  const tasks = selected.map((item) => ({
    title: item.title.trim(),
    deadline: reminderDeadline(
      addDays(start, item.dayOffset),
      item.time,
      timezone,
    )?.toISOString(),
  }));
  if (tasks.some((item) => !item.deadline)) return undefined;
  return tasks.map((item) => ({ title: item.title, deadline: item.deadline! }));
}
