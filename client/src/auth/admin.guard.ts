import type { GetServerSideProps } from "next";
import axios from "axios";
import { auth } from "@/auth/auth";
const adminGuard =
  (allowSupport: boolean): GetServerSideProps =>
  async (context) => {
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
      if (data.role !== "admin" && !(allowSupport && data.role === "support"))
        return { notFound: true };
    } catch {
      return { notFound: true };
    }
    return { props: {} };
  };

export const requireAdmin = adminGuard(true);
export const requireAdminOnly = adminGuard(false);
