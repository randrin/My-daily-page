/** NextAuth serializes credentials using URLSearchParams: never include undefined values. */
export function normalizeMfaCode(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const code = value.replace(/\s/g, "");
  return !code || code === "undefined" || code === "null" ? undefined : code;
}
export function loginCredentials(
  input: { email: string; password: string },
  code?: string,
): Record<string, string> {
  const normalized = normalizeMfaCode(code);
  return {
    email: input.email,
    password: input.password,
    ...(normalized ? { code: normalized } : {}),
  };
}
