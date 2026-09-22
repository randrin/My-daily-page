import { describe, expect, it } from "vitest";
import {
  REQUIRED_FIELD_MESSAGE,
  omitFieldError,
  requiredFieldError,
} from "@/lib/field-errors";

describe("requiredFieldError", () => {
  it("conserve le message et l'état d'erreur si le champ requis est vidé", () => {
    const next = requiredFieldError({ email: "Email invalide" }, "email", "");
    expect(next.email).toBe(REQUIRED_FIELD_MESSAGE);
  });

  it("retire l'erreur dès qu'une valeur est saisie", () => {
    const next = requiredFieldError(
      { email: REQUIRED_FIELD_MESSAGE },
      "email",
      "a",
    );
    expect(next.email).toBeUndefined();
  });
});

describe("omitFieldError", () => {
  it("ne change rien si le champ n'a pas d'erreur", () => {
    const current = { password: REQUIRED_FIELD_MESSAGE };
    expect(omitFieldError(current, "email")).toBe(current);
  });
});
