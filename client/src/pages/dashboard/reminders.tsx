import type { GetServerSideProps } from "next";
import { RemindersScreen } from "@/components/notifications/reminders-screen";
import { requireSession } from "@/auth/guards";

export const getServerSideProps: GetServerSideProps = requireSession;

export default RemindersScreen;
