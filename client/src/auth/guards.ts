import type { GetServerSideProps } from "next";
import { auth } from "@/auth/auth";

export const requireSession: GetServerSideProps = async (context) => {
  const session = await auth(context);

  if (!session?.user || session.error === "RefreshAccessTokenError") {
    return {
      redirect: {
        destination: `/auth/signin?callbackUrl=${encodeURIComponent("/dashboard")}`,
        permanent: false,
      },
    };
  }

  return { props: {} };
};
