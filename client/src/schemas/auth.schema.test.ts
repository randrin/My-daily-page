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
