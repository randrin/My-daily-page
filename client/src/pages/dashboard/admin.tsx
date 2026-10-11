import type { GetServerSideProps } from "next";
import axios from "axios";
import { auth } from "@/auth/auth";
import { AdminScreen } from "@/components/admin-screen";
import DashboardLayout from "@/components/layout/dashboard.layout";
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await auth(context);
  if (!session?.accessToken || session.error === "RefreshAccessTokenError")
    return {
      redirect: {
        destination: `/auth/signin?callbackUrl=${encodeURIComponent(context.resolvedUrl)}`,
        permanent: false,
      },
    };
  try {
    // Check the current database role rather than trusting a cached session claim.
    const { data } = await axios.get<{ role?: unknown }>(
      `${process.env.AUTH_API_URL ?? process.env.NEXT_PUBLIC_HOST_SERVER}/auth/me`,
      {
        headers: { Authorization: `Bearer ${session.accessToken}` },
        timeout: 10000,
      },
    );
    if (data.role !== "admin") return { notFound: true };
  } catch {
    return { notFound: true };
  }
  return { props: {} };
};
export default function AdminPage() {
  return (
    <DashboardLayout>
      <AdminScreen />
    </DashboardLayout>
  );
}
