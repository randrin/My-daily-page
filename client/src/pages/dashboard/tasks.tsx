import type { GetServerSideProps } from "next";
import { requireSession } from "@/auth/guards";
import { TasksScreen } from "@/components/tasks/tasks-screen";

export const getServerSideProps: GetServerSideProps = requireSession;

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useTasksUiStore } from "@/stores/tasks.store";
export default function TasksPage() {
  const router = useRouter();
  const openEdit = useTasksUiStore((state) => state.openEdit);
  const task = router.query.task;
  useEffect(() => {
    if (typeof task === "string" && /^[0-9a-f-]{36}$/i.test(task))
      openEdit(task);
  }, [task, openEdit]);
  return <TasksScreen />;
}
