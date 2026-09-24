import type { GetServerSideProps } from "next";
import DashboardScreen from "@/components/dashboard/dashboard-screen";
import { requireSession } from "@/auth/guards";
import { rollingPeriodCalendarBounds } from "@/lib/date-range";

type DashboardPageProps = {
  defaultFrom: string;
  defaultTo: string;
};

export const getServerSideProps: GetServerSideProps<
  DashboardPageProps
> = async (context) => {
  const session = await requireSession(context);
  if ("redirect" in session) return session;

  const bounds = rollingPeriodCalendarBounds(new Date(), "7d");
  return {
    props: {
      defaultFrom: bounds.from,
      defaultTo: bounds.to
    }
  };
};

export default function DashboardPage({
  defaultFrom,
  defaultTo
}: DashboardPageProps) {
  return <DashboardScreen defaultFrom={defaultFrom} defaultTo={defaultTo} />;
}
