import { describe, expect, it } from "vitest";
import { formatTravelPause, parseTravelPause } from "./travel-pause";

describe("Travel pause", () => {
  it("converts profile time to UTC independently of the browser timezone", () => {
    expect(parseTravelPause("2030-10-08T12:00", "Asia/Tokyo")).toBe(
      "2030-10-08T03:00:00.000Z",
    );
    expect(formatTravelPause("2030-10-08T03:00:00Z", "Asia/Tokyo")).toBe(
      "2030-10-08T12:00",
    );
  });
  it("rejects invalid dates and nonexistent local hours", () => {
    expect(parseTravelPause("2026-02-31T12:00", "UTC")).toBeUndefined();
    expect(
      parseTravelPause("2026-03-29T02:30", "Europe/Paris"),
    ).toBeUndefined();
    expect(parseTravelPause("", "Europe/Paris")).toBeNull();
  });
});
