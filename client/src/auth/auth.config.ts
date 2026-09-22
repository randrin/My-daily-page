import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/signin" },
  providers: [],
  callbacks: {
    authorized({ auth: session, request }) {
      if (session?.error === "RefreshAccessTokenError") return false;
      const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
      if (isDashboard) return Boolean(session?.user);
      return true;
    },
  },
} satisfies NextAuthConfig;
