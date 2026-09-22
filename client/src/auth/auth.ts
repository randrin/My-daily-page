import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginRequest, refreshRequest } from "@/api/auth";
import { authConfig } from "@/auth/auth.config";
import { signInSchema } from "@/schemas/auth.schema";
import type { JWT } from "next-auth/jwt";

async function rotateTokens(token: JWT): Promise<JWT> {
  if (!token.refreshToken) {
    return { ...token, error: "RefreshAccessTokenError" };
  }

  try {
    const tokens = await refreshRequest(token.refreshToken);
    return {
      ...token,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      accessTokenExpires: Date.now() + tokens.expires_in * 1000,
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = signInSchema.safeParse({
          email: credentials?.email,
          password: credentials?.password,
        });
        if (!parsed.success) return null;

        try {
          const tokens = await loginRequest(parsed.data);
          return {
            id: tokens.user.id,
            email: tokens.user.email,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresIn: tokens.expires_in,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpires = Date.now() + user.expiresIn * 1000;
        token.sub = user.id;
        token.email = user.email;
        return token;
      }

      if (
        token.accessTokenExpires &&
        Date.now() < token.accessTokenExpires - 15_000
      ) {
        return token;
      }

      return rotateTokens(token);
    },
    async session({ session, token }) {
      session.user.id = token.sub ?? "";
      session.user.email = token.email ?? "";
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
});
