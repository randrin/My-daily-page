import { z } from "zod";
import axios from "axios";
import {
  authTokensSchema,
  type AuthTokens,
} from "@/schemas/auth-tokens.schema";
import type { SignInInput, SignUpInput } from "@/schemas/auth.schema";

function apiBaseUrl(): string {
  return (
    process.env.AUTH_API_URL ??
    process.env.NEXT_PUBLIC_HOST_SERVER ??
    "http://localhost:3001"
  );
}

function authHttp() {
  return axios.create({
    baseURL: apiBaseUrl(),
    headers: { "Content-Type": "application/json" },
  });
}

export async function loginRequest(
  input: SignInInput & { code?: string },
): Promise<AuthTokens> {
  const { data } = await authHttp().post("/auth/login", input);
  return authTokensSchema.parse(data);
}

export async function registerRequest(input: SignUpInput): Promise<AuthTokens> {
  const { data } = await authHttp().post("/auth/register", {
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    password: input.password,
    phoneNumber: input.phoneNumber || undefined,
  });
  return authTokensSchema.parse(data);
}

export async function refreshRequest(
  refreshToken: string,
): Promise<AuthTokens> {
  const { data } = await authHttp().post("/auth/refresh", {
    refresh_token: refreshToken,
  });
  return authTokensSchema.parse(data);
}

export async function logoutRequest(
  accessToken: string,
  refreshToken?: string,
): Promise<void> {
  await authHttp().post(
    "/auth/logout",
    { refresh_token: refreshToken },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
}

export async function forgotPasswordRequest(email: string): Promise<void> {
  const { data } = await authHttp().post("/auth/forgot-password", { email });
  z.object({ accepted: z.literal(true) }).parse(data);
}

export async function resetPasswordRequest(input: {
  token: string;
  password: string;
}): Promise<void> {
  const { data } = await authHttp().post("/auth/reset-password", input);
  z.object({ updated: z.literal(true) }).parse(data);
}
