export function loginErrorMessage(code?: string | null): string {
  if (code?.startsWith("mfa_locked")) {
    const timestamp = Number(code.replace("mfa_locked_", ""));
    if (Number.isFinite(timestamp) && timestamp > 0) {
      const time = new Intl.DateTimeFormat("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(new Date(timestamp));
      return `Vérification MFA temporairement bloquée après cinq échecs. Réessaie à ${time} avec un nouveau code de ton application.`;
    }
    return "Vérification MFA temporairement bloquée après cinq échecs. Attends la fin du délai de 15 minutes avant de réessayer.";
  }
  if (code === "mfa_reused")
    return "Ce code a déjà été utilisé, notamment pour activer la MFA. Attends le prochain code à 6 chiffres affiché dans Authenticator.";
  if (code === "mfa_invalid")
    return "Code incorrect ou expiré. Utilise le code actuel de My Daily Page dans Authenticator et vérifie que l’heure du téléphone est automatique.";
  if (code === "account_suspended")
    return "Ton compte est suspendu. Contacte l’administrateur pour demander sa réactivation.";
  if (code === "service_unavailable")
    return "La connexion est temporairement indisponible. Réessaie dans quelques instants.";
  return "Email ou mot de passe incorrect.";
}
