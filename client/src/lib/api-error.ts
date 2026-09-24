import axios from "axios";

const CATEGORY_NAME_TAKEN = "A category with this name already exists";
const PREFERENCE_CHANNEL_TAKEN = "A preference for this channel already exists";

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback;

  const payload = error.response?.data as { message?: unknown } | undefined;
  const message = payload?.message;

  if (message === CATEGORY_NAME_TAKEN) {
    return "Une catégorie avec ce nom existe déjà";
  }

  if (message === PREFERENCE_CHANNEL_TAKEN) {
    return "Une préférence existe déjà pour ce canal";
  }

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  if (
    Array.isArray(message) &&
    message.every((item) => typeof item === "string")
  ) {
    return message.join(" ");
  }

  return fallback;
}
