"use client";

import { TaskNotesDrawer } from "@/components/tasks/task-notes-drawer";
import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { Button } from "@/components/ui/button";
import type { SortState } from "@/lib/table-sort";
import { toggleSort } from "@/lib/table-sort";
import { stripRichText } from "@/lib/rich-text/html";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";
import { TaskBlockersList } from "@/components/tasks/task-blockers-list";
import { TaskStatusCycleBadge } from "@/components/tasks/task-status-badge";
import {
  categoryLabel,
  sortTasks,
  taskPriorityColors,
  taskPriorityLabels,
  type TaskSortKey,
} from "@/utils/task-utils";

interface TaskTableProps {
  tasks: Task[];
  sort?: SortState<TaskSortKey> | null;
  onSortChange?: (sort: SortState<TaskSortKey>) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: Task["status"]) => void;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function TaskTable({
  tasks,
  sort,
  onSortChange,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskTableProps) {
  const [localSort, setLocalSort] =
    React.useState<SortState<TaskSortKey> | null>(null);
  const activeSort = sort ?? localSort;

  const handleSort = (key: TaskSortKey) => {
    const next = toggleSort(activeSort, key);
    if (sort === undefined) setLocalSort(next);
    onSortChange?.(next);
  };

  const rows = React.useMemo(
    () => sortTasks(tasks, activeSort),
    [tasks, activeSort],
  );

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>Aucune tâche à afficher</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <SortableTableHead
                label="Statut"
                sortKey="status"
                activeKey={activeSort?.key}
                direction={activeSort?.direction}
                onSort={handleSort}
              />
              <SortableTableHead
                label="Titre"
                sortKey="title"
                activeKey={activeSort?.key}
                direction={activeSort?.direction}
                onSort={handleSort}
              />
              <SortableTableHead
                label="Description"
                sortKey="description"
                activeKey={activeSort?.key}
                direction={activeSort?.direction}
                onSort={handleSort}
                className="hidden md:table-cell"
              />
              <SortableTableHead
                label="Priorité"
                sortKey="priority"
                activeKey={activeSort?.key}
                direction={activeSort?.direction}
                onSort={handleSort}
              />
              <SortableTableHead
                label="Catégorie"
                sortKey="category"
                activeKey={activeSort?.key}
                direction={activeSort?.direction}
                onSort={handleSort}
                className="hidden lg:table-cell"
              />
              <SortableTableHead
                label="Échéance"
                sortKey="deadline"
                activeKey={activeSort?.key}
                direction={activeSort?.direction}
                onSort={handleSort}
                className="hidden lg:table-cell"
              />
              <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((task) => (
              <tr
                key={task.id}
                className="border-b transition-colors hover:bg-muted/50"
              >
                <td className="p-4 align-middle">
                  <TaskStatusCycleBadge
                    status={task.status}
                    onCycle={(status) => onStatusChange?.(task.id, status)}
                  />
                </td>
                <td className="p-4 align-middle">
                  <div className="flex items-start gap-3">
                    {task.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={task.imageUrl}
                        alt=""
                        className="size-10 shrink-0 rounded-md object-cover"
                      />
                    ) : null}
                    <div className="min-w-0">
                      <div className="font-medium">{task.title}</div>
                      <TaskBlockersList
                        onEdit={onEdit}
                        blockers={task.blockers}
                        taskTitle={task.title}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </td>
                <td className="p-4 align-middle hidden md:table-cell">
                  <div className="text-sm text-muted-foreground max-w-md truncate">
                    {stripRichText(task.description ?? "") || "—"}
                  </div>
                </td>
                <td className="p-4 align-middle">
                  <span
                    className={cn(
                      "rounded px-2 py-1 text-xs font-medium text-white",
                      taskPriorityColors[task.priority],
                    )}
                  >
                    {taskPriorityLabels[task.priority]}
                  </span>
                </td>
                <td className="p-4 align-middle hidden lg:table-cell">
                  <div className="flex items-center gap-2 text-sm">
                    {task.category ? (
                      <span
                        className="size-2.5 shrink-0 rounded-full border"
                        style={{ backgroundColor: task.category.color }}
                        aria-hidden
                      />
                    ) : null}
                    {categoryLabel(task)}
                  </div>
                </td>
                <td className="p-4 align-middle hidden lg:table-cell">
                  <div className="text-sm">
                    {task.deadline ? formatDate(task.deadline) : "—"}
                  </div>
                </td>
                <td className="p-4 align-middle">
                  <div className="flex items-center justify-end gap-1">
                    <TaskNotesDrawer task={task} />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Modifier ${task.title}`}
                      onClick={() => onEdit?.(task)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      aria-label={`Supprimer ${task.title}`}
                      onClick={() => onDelete?.(task.id)}
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
