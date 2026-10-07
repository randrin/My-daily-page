import axios from "axios";

const CATEGORY_NAME_TAKEN = "A category with this name already exists";
const PREFERENCE_CHANNEL_TAKEN = "A preference for this channel already exists";
const TASK_BLOCKED_REQUIRES_BLOCKERS =
  "A blocked task requires at least one blocker";
const TASK_CANNOT_COMPLETE_WHILE_BLOCKED =
  "Cannot mark this task as done or archived while blocker tasks are unfinished";
const TASK_CANNOT_BLOCK_ITSELF = "A task cannot block itself";
const TASK_BLOCKERS_CYCLE = "Blockers cannot form a cycle";
const EMAIL_ALREADY_IN_USE = "Email already in use";
const CURRENT_PASSWORD_INCORRECT = "Current password is incorrect";
const NEW_PASSWORD_MUST_DIFFER = "New password must be different";
const FILE_REQUIRED = "A file is required";
const FILE_TOO_LARGE = "File is too large";
const FILE_INVALID = "File type is not allowed";
const FILE_NOT_OWNED = "This file does not belong to the current user";
const STORAGE_UNAVAILABLE = "Object storage is unavailable";

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback;

  const payload = error.response?.data as { message?: unknown } | undefined;
  const message = payload?.message;

  if (message === "SMS requires a phone number") return "Renseigne ton téléphone dans le profil avant d’activer les SMS";
  if (message === "WhatsApp requires a number and explicit opt-in") return "Renseigne ton numéro WhatsApp et accepte les rappels WhatsApp";
  if (message === CATEGORY_NAME_TAKEN) {
    return "Une catégorie avec ce nom existe déjà";
  }

  if (message === PREFERENCE_CHANNEL_TAKEN) {
    return "Une préférence existe déjà pour ce canal";
  }

  if (message === TASK_BLOCKED_REQUIRES_BLOCKERS) {
    return "Une tâche bloquée doit lister au moins une tâche qui la bloque";
  }

  if (message === TASK_CANNOT_COMPLETE_WHILE_BLOCKED) {
    return "Cette tâche ne peut pas être terminée ou archivée tant que ses tâches bloqueuses ne sont pas terminées";
  }

  if (message === TASK_CANNOT_BLOCK_ITSELF) {
    return "Une tâche ne peut pas se bloquer elle-même";
  }

  if (message === TASK_BLOCKERS_CYCLE) {
    return "Les tâches bloqueuses ne peuvent pas former un cycle";
  }

  if (message === "Phone number already in use") return "Ce numéro de téléphone est déjà utilisé";
  if (message === "WhatsApp number already in use") return "Ce numéro WhatsApp est déjà utilisé";

  if (message === EMAIL_ALREADY_IN_USE) {
    return "Cet email est déjà utilisé";
  }

  if (message === CURRENT_PASSWORD_INCORRECT) {
    return "Le mot de passe actuel est incorrect";
  }

  if (message === NEW_PASSWORD_MUST_DIFFER) {
    return "Le nouveau mot de passe doit être différent";
  }

  if (message === FILE_REQUIRED) {
    return "Un fichier est requis";
  }

  if (message === FILE_TOO_LARGE) {
    return "Le fichier est trop volumineux (5 Mo max)";
  }

  if (message === FILE_INVALID) {
    return "Ce type de fichier n’est pas autorisé";
  }

  if (message === FILE_NOT_OWNED) {
    return "Cette image n’appartient pas à ton compte";
  }

  if (message === STORAGE_UNAVAILABLE) {
    return "Le stockage d’images est indisponible";
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
