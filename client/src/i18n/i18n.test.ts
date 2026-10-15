import { describe, expect, it } from "vitest";
import { translate } from "./provider";
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";
describe("FR/EN catalogs", () => {
  it("translates navigation and settings", () => {
    expect(translate("navigation.settings", "en")).toBe("Settings");
    expect(translate("navigation.audit", "en")).toBe("Audit log");
    expect(translate("settings.language", "fr")).toBe("Langue de l’interface");
  });
  it("has identical key sets in both catalogs", () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(fr).sort());
  });
  it("interpolates values", () => {
    expect(translate("tasks.createCount", "en", { count: 3 })).toBe(
      "Create 3 tasks",
    );
    expect(translate("tasks.createCount", "fr", { count: 3 })).toBe(
      "Créer 3 tâches",
    );
  });
  it("preserves unknown text", () => {
    expect(translate("Mon rendez-vous personnel 123", "en")).toBe(
      "Mon rendez-vous personnel 123",
    );
  });
  it("contains nonempty translations and consent instructions", () => {
    expect(Object.values(en).every((value) => value.trim().length > 0)).toBe(
      true,
    );
    expect(en["messages.iAgreeToThisLimitedSharingAndThisPartner"]).toContain(
      "agree",
    );
  });
});
