import type { GetServerSideProps } from "next";
import DashboardScreen from "@/components/dashboard/dashboard-screen";
import { requireSession } from "@/auth/guards";

export const getServerSideProps: GetServerSideProps = requireSession;

export default DashboardScreen;
