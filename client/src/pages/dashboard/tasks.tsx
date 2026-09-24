import type { GetServerSideProps } from "next";
import { requireSession } from "@/auth/guards";
import { TasksScreen } from "@/components/tasks/tasks-screen";

export const getServerSideProps: GetServerSideProps = requireSession;

export default TasksScreen;
