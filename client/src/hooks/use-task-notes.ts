import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "@/api/tasks";
import { taskKeys } from "@/hooks/use-tasks";

const notesKey = (id: string) => [...taskKeys.detail(id), "notes"] as const;

export function useTaskNotes(id: string) {
  return useQuery({ queryKey: notesKey(id), queryFn: () => tasksApi.listNotes(id) });
}

export function useAddTaskNote(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => tasksApi.addNote(id, content),
    onSuccess: (note) => {
      client.setQueryData<Awaited<ReturnType<typeof tasksApi.listNotes>>>(notesKey(id), (current) =>
        [note, ...(current ?? []).filter((item) => item.id !== note.id)]
      );
      void client.invalidateQueries({ queryKey: notesKey(id) });
    },
  });
}
