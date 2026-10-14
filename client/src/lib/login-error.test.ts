import { describe, it, expect } from "vitest";
import { loginErrorMessage } from "./login-error";
describe("Login errors", () => {
  it("distinguishes reused, invalid and locked MFA codes", () => {
    expect(loginErrorMessage("mfa_reused")).toContain("prochain code");
    expect(loginErrorMessage("mfa_invalid")).toContain("heure du téléphone");
    expect(loginErrorMessage("mfa_locked")).toContain("15 minutes");
    expect(
      loginErrorMessage(`mfa_locked_${Date.UTC(2026, 9, 13, 12, 42)}`),
    ).toContain("Réessaie à");
  });
  it("explains suspension for valid credentials", () =>
    expect(loginErrorMessage("account_suspended")).toBe(
      "Ton compte est suspendu. Contacte l’administrateur pour demander sa réactivation.",
    ));
  it("uses the generic message for incorrect credentials", () =>
    expect(loginErrorMessage("credentials")).toBe(
      "Email ou mot de passe incorrect.",
    ));
  it("explains service unavailability", () =>
    expect(loginErrorMessage("service_unavailable")).toContain(
      "temporairement indisponible",
    ));
});
