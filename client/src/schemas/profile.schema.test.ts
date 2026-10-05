import { describe, expect, it } from "vitest";
import {
  changePasswordSchema,
  profileFormSchema,
} from "@/schemas/profile.schema";

describe("profileFormSchema", () => {
  it("exige le téléphone mais permet un WhatsApp vide", () => {
    const base = { firstName: "Marie", lastName: "Dupont", email: "demo@example.com", timezone: "Europe/Paris" };
    for (const phoneNumber of [undefined, "", " ", "abc"]) {
      expect(profileFormSchema.safeParse({ ...base, phoneNumber }).success).toBe(false);
    }
    expect(profileFormSchema.safeParse({ ...base, phoneNumber: "+33612345678", whatsappNumber: "" }).success).toBe(true);
  });
  it("permet de modifier les noms et refuse les noms vides", () => {
    const base = { phoneNumber: "+33612345678", firstName: "Marie", lastName: "Dupont", email: "demo@mydailypage.dev", timezone: "Europe/Paris" };
    expect(profileFormSchema.parse({ ...base, firstName: " Jean ", lastName: " Martin " })).toMatchObject({ firstName: "Jean", lastName: "Martin" });
    expect(profileFormSchema.safeParse({ ...base, lastName: "a".repeat(101) }).success).toBe(false);
    expect(profileFormSchema.safeParse({ ...base, firstName: " " }).success).toBe(false);
  });
  it("accepte un profil valide", () => {
    expect(
      profileFormSchema.safeParse({
        firstName: "Marie", lastName: "Dupont", email: "demo@mydailypage.dev",
        phoneNumber: "+33600000000",
        whatsappNumber: "",
        timezone: "Europe/Paris",
      }).success,
    ).toBe(true);
  });

  it("refuse un email et un téléphone invalides", () => {
    const parsed = profileFormSchema.safeParse({
      email: "pas-un-email",
      phoneNumber: "abc",
      timezone: "Europe/Paris",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(
        parsed.error.issues.some((issue) => issue.message === "Email invalide"),
      ).toBe(true);
      expect(
        parsed.error.issues.some((issue) => issue.message === "Numéro invalide"),
      ).toBe(true);
    }
  });
});

describe("changePasswordSchema", () => {
  it("refuse une confirmation différente", () => {
    expect(
      changePasswordSchema.safeParse({
        currentPassword: "password123",
        newPassword: "newPassword123",
        confirmPassword: "newPassword124",
      }).success,
    ).toBe(false);
  });

  it("refuse un nouveau mot de passe identique à l’actuel", () => {
    const parsed = changePasswordSchema.safeParse({
      currentPassword: "password123",
      newPassword: "password123",
      confirmPassword: "password123",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(
        parsed.error.issues.some(
          (issue) =>
            issue.message === "Le nouveau mot de passe doit être différent",
        ),
      ).toBe(true);
    }
  });

  it("accepte un changement valide", () => {
    expect(
      changePasswordSchema.safeParse({
        currentPassword: "password123",
        newPassword: "newPassword123",
        confirmPassword: "newPassword123",
      }).success,
    ).toBe(true);
  });
});
