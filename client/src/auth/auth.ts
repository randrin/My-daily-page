import { normalizeMfaCode } from "@/lib/login-credentials";
import NextAuth, { CredentialsSignin } from "next-auth";
import axios from "axios";
class MfaRequiredError extends CredentialsSignin {
  code = "mfa_required";
}
class MfaLockedError extends CredentialsSignin {
  code = "mfa_locked";
  constructor(retryAt?: string) {
    super();
    const timestamp = retryAt ? Date.parse(retryAt) : NaN;
    if (Number.isFinite(timestamp)) this.code = `mfa_locked_${timestamp}`;
  }
}
class MfaReusedError extends CredentialsSignin {
  code = "mfa_reused";
}
class MfaInvalidError extends CredentialsSignin {
  code = "mfa_invalid";
}
class SuspendedAccountError extends CredentialsSignin {
  code = "account_suspended";
}
class SignInUnavailableError extends CredentialsSignin {
  code = "service_unavailable";
}
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
        code: { label: "Second facteur", type: "text" },
      },
      async authorize(credentials) {
        const parsed = signInSchema.safeParse({
          email: credentials?.email,
          password: credentials?.password,
        });
        if (!parsed.success) return null;

        try {
          const tokens = await loginRequest({
            ...parsed.data,
            code: normalizeMfaCode(credentials?.code),
          });
          return {
            id: tokens.user.id,
            email: tokens.user.email,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresIn: tokens.expires_in,
          };
        } catch (error) {
          if (
            axios.isAxiosError<{
              code?: string;
              message?: string;
              retryAt?: string;
            }>(error)
          ) {
            if (
              error.response?.status === 401 &&
              error.response.data.code === "ACCOUNT_SUSPENDED"
            )
              throw new SuspendedAccountError();
            if (
              error.response?.status === 401 &&
              error.response.data.code === "MFA_REQUIRED"
            )
              throw new MfaRequiredError();
            if (
              error.response?.status === 401 &&
              error.response.data.code === "MFA_LOCKED"
            )
              throw new MfaLockedError(error.response.data.retryAt);
            if (
              error.response?.status === 401 &&
              error.response.data.code === "MFA_REUSED"
            )
              throw new MfaReusedError();
            if (
              error.response?.status === 401 &&
              error.response.data.code === "MFA_INVALID"
            )
              throw new MfaInvalidError();
            if (error.response?.status === 401) return null;
          }
          throw new SignInUnavailableError();
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpires = Date.now() + user.expiresIn * 1000;
        token.sub = user.id;
        token.email = user.email;
        return token;
      }

      if (trigger === "update" && session) {
        const next = session as { email?: string };
        if (typeof next.email === "string" && next.email) {
          token.email = next.email;
        }
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
