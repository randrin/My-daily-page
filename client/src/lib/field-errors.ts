import type { ZodError } from "zod";

export function zodFieldErrors<K extends string>(
  error: ZodError,
  keys: readonly K[],
): Partial<Record<K, string>> {
  const next: Partial<Record<K, string>> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key !== "string") continue;
    if (!(keys as readonly string[]).includes(key)) continue;
    if (next[key as K]) continue;
    next[key as K] = issue.message;
  }

  return next;
}

export function omitFieldError<K extends string>(
  errors: Partial<Record<K, string>>,
  key: K,
): Partial<Record<K, string>> {
  if (!errors[key]) return errors;
  const next = { ...errors };
  delete next[key];
  return next;
}

export const REQUIRED_FIELD_MESSAGE = "Ce champ est requis";

export function requiredFieldError<K extends string>(
  errors: Partial<Record<K, string>>,
  key: K,
  value: string,
): Partial<Record<K, string>> {
  if (value.trim() === "") {
    if (errors[key] === REQUIRED_FIELD_MESSAGE) return errors;
    return { ...errors, [key]: REQUIRED_FIELD_MESSAGE };
  }

  return omitFieldError(errors, key);
}
