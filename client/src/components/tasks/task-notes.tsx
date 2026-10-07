"use client";

import { FeedbackState } from "@/components/ui/feedback-state";
import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddTaskNote, useTaskNotes } from "@/hooks/use-task-notes";
import { showQuerySkeleton } from "@/lib/query-skeleton";
import { getApiErrorMessage } from "@/lib/api-error";
import { taskNoteInputSchema } from "@/schemas/task-note.schema";

export function TaskNotes({
  taskId,
  archived = false
}: {
  taskId: string;
  archived?: boolean;
}) {
  const notes = useTaskNotes(taskId);
  const addNote = useAddTaskNote(taskId);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string>();

  const saveNote = async () => {
    const parsed = taskNoteInputSchema.safeParse({ content });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      return;
    }
    setError(undefined);
    try {
      await addNote.mutateAsync(parsed.data.content);
      setContent("");
      toast.success("Note ajoutée");
    } catch (cause) {
      toast.error(getApiErrorMessage(cause, "Impossible d’ajouter la note"));
    }
  };

  return (
    <section
      className="space-y-4 pt-5"
      aria-labelledby="task-notes-title"
    >
      <div>
        <h3 id="task-notes-title" className="text-sm font-medium">
          Notes
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {archived
            ? "Notes de la tâche archivée."
            : "Les notes sont enregistrées dès leur ajout."}
        </p>
      </div>
      {!archived ? (
        <div className="space-y-2">
          <label htmlFor="task-note-content" className="sr-only">
            Nouvelle note
          </label>
          <textarea
            className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"
            id="task-note-content"
            placeholder="Ajouter une note…"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={10000}
            disabled={addNote.isPending}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "task-note-error" : undefined}
          />
          {error ? (
            <p
              id="task-note-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {error}
            </p>
          ) : null}
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={saveNote}
              disabled={addNote.isPending || !content.trim()}
            >
              <MessageSquarePlus className="size-4" />
              {addNote.isPending ? "Ajout…" : "Ajouter la note"}
            </Button>
          </div>
        </div>
      ) : null}
      {showQuerySkeleton(notes) ? (
        <div className="space-y-4" aria-label="Chargement des notes">
          {[0, 1].map((item) => (
            <div key={item} className="space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      ) : notes.isError ? (
        <FeedbackState variant="error" description="Impossible de charger les notes.">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void notes.refetch()}
          >
            Réessayer
          </Button>
        </FeedbackState>
      ) : notes.data?.length ? (
        <ol className="ml-1 space-y-5 border-l border-border pl-5">
          {notes.data.map((note) => (
            <li key={note.id} className="relative">
              <span
                className="absolute -left-[25px] top-1 size-2 rounded-full bg-primary ring-4 ring-background"
                aria-hidden
              />
              <time
                dateTime={note.createdAt.toISOString()}
                className="text-xs text-muted-foreground"
              >
                {new Intl.DateTimeFormat("fr-FR", {
                  dateStyle: "medium",
                  timeStyle: "short"
                }).format(note.createdAt)}
              </time>
              <p className="mt-2 whitespace-pre-wrap break-words rounded-lg border bg-muted/30 p-3 text-sm">
                {note.content}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <FeedbackState description="Aucune note pour cette tâche." />
      )}
    </section>
  );
}
