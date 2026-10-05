import { describe, expect, it } from "vitest";
import { combinePhoneNumber, countryFlag, splitPhoneNumber } from "./phone-number";

describe("phone numbers", () => {
  it("removes the French national prefix when saving", () => {
    expect(combinePhoneNumber("FR", "06 12 34 56 78")).toBe("+33612345678");
  });

  it("combines Cameroon numbers with their calling code", () => {
    expect(combinePhoneNumber("CM", "699 12 34 56")).toBe("+237699123456");
  });

  it("keeps an optional empty field empty", () => {
    expect(combinePhoneNumber("FR", "")).toBe("");
  });

  it("restores the country and national number from saved international values", () => {
    expect(splitPhoneNumber("+237699123456")).toEqual({
      country: "CM", national: "699123456", value: "+237699123456",
    });
  });

  it("recognizes the international 00 prefix", () => {
    expect(splitPhoneNumber("0033 6 12 34 56 78").national).toBe("612345678");
  });

  it("preserves a selected country sharing the same calling code", () => {
    expect(splitPhoneNumber("+14155552671", "CA").country).toBe("CA");
  });

  it("renders the selected country's flag", () => {
    expect(countryFlag("CM")).toBe("🇨🇲");
  });
});
