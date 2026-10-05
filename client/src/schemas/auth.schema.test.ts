import { describe, expect, it } from "vitest";
import {
  forgotPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/schemas/auth.schema";

describe("signInSchema", () => {
  it("exige un email et 8 caractères", () => {
    const empty = signInSchema.safeParse({ email: "", password: "" });
    expect(empty.success).toBe(false);
    if (!empty.success) {
      expect(empty.error.issues.some((issue) => issue.message === "Ce champ est requis")).toBe(
        true,
      );
    }

    expect(
      signInSchema.safeParse({
        email: "demo@mydailypage.dev",
        password: "password123",
      }).success,
    ).toBe(true);
  });

  it("refuse un email mal formé et un mot de passe trop court", () => {
    const parsed = signInSchema.safeParse({
      email: "pas-un-email",
      password: "123",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(
        parsed.error.issues.some((issue) => issue.message === "Email invalide"),
      ).toBe(true);
      expect(
        parsed.error.issues.some(
          (issue) => issue.message === "Au moins 8 caractères",
        ),
      ).toBe(true);
    }
  });
});

describe("signUpSchema", () => {
  it("exige un téléphone valide", () => {
    const base = { email: "demo@mydailypage.dev", password: "password123", confirmPassword: "password123", firstName: "Marie", lastName: "Dupont" };
    for (const phoneNumber of [undefined, "", " ", "abc"]) {
      const result = signUpSchema.safeParse({ ...base, phoneNumber });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues.some((issue) => issue.path[0] === "phoneNumber")).toBe(true);
    }
    expect(signUpSchema.safeParse({ ...base, phoneNumber: "+33612345678" }).success).toBe(true);
  });
  it("exige le prénom et le nom", () => {
    const base = { email: "demo@mydailypage.dev", password: "password123", confirmPassword: "password123" };
    for (const names of [{}, { firstName: " ", lastName: "Dupont" }, { firstName: "Marie", lastName: "" }]) {
      expect(signUpSchema.safeParse({ ...base, ...names }).success).toBe(false);
    }
  });
  it("nettoie les noms et refuse les valeurs trop longues", () => {
    const base = { email: "demo@mydailypage.dev", password: "password123", confirmPassword: "password123" };
    expect(signUpSchema.parse({ ...base, firstName: " Marie ", lastName: " Dupont ", phoneNumber: "+33612345678" })).toMatchObject({ firstName: "Marie", lastName: "Dupont" });
    expect(signUpSchema.safeParse({ ...base, firstName: "a".repeat(101) }).success).toBe(false);
  });
  it("refuse une confirmation différente", () => {
    expect(
      signUpSchema.safeParse({
        email: "demo@mydailypage.dev",
        password: "password123",
        confirmPassword: "password124",
      }).success,
    ).toBe(false);
  });

  it("refuse un téléphone invalide", () => {
    const parsed = signUpSchema.safeParse({
      email: "demo@mydailypage.dev",
      password: "password123",
      confirmPassword: "password123",
      phoneNumber: "abc",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("exige un email valide", () => {
    expect(forgotPasswordSchema.safeParse({ email: "" }).success).toBe(false);
    expect(
      forgotPasswordSchema.safeParse({ email: "demo@mydailypage.dev" }).success,
    ).toBe(true);
  });
});
