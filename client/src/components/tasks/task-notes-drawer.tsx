"use client";

import { useState } from "react";
import { MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TaskNotes } from "@/components/tasks/task-notes";
import type { Task } from "@/types/task";

export function TaskNotesDrawer({ task }: { task: Task }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <SheetTrigger asChild>
            <Button type="button" variant="ghost" size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
              aria-label={`Voir les notes de ${task.title}`}
              onClick={(event) => event.stopPropagation()}>
              <MessageSquareText className="size-3.5" />
            </Button>
          </SheetTrigger>
        </TooltipTrigger>
        <TooltipContent>Notes</TooltipContent>
      </Tooltip>
      <SheetContent className="w-full gap-0 overflow-hidden p-0 sm:max-w-lg">
        <SheetHeader className="border-b px-6 py-5 pr-12">
          <SheetTitle className="wrap-break-word">Notes — {task.title}</SheetTitle>
          <SheetDescription>
            {task.status === "archived" ? "Consulte les notes de cette tâche archivée." : "Ajoute une note et retrouve l’historique de la tâche."}
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {open ? <TaskNotes taskId={task.id} archived={task.status === "archived"} /> : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
