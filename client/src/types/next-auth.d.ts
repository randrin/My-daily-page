import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: string;
    user: {
      id: string;
      email: string;
    } & DefaultSession["user"];
  }

  interface User {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}

export {};
