import { describe, expect, it } from "vitest";
import { forecastSchema, weatherCitySchema } from "./weather";
describe("Weather provider validation", () => {
  const daily = {
    time: Array.from({ length: 7 }, (_, i) => `2026-10-${14 + i}`),
    weather_code: Array(7).fill(0),
    temperature_2m_max: Array(7).fill(18),
    temperature_2m_min: Array(7).fill(null),
    precipitation_probability_max: Array(7).fill(10),
  };
  it("accepts missing observations but requires seven aligned forecast days", () => {
    expect(
      forecastSchema.safeParse({ timezone: "Europe/Paris", daily }).success,
    ).toBe(true);
    expect(
      forecastSchema.safeParse({
        timezone: "Europe/Paris",
        daily: { ...daily, weather_code: [0] },
      }).success,
    ).toBe(false);
  });
  it("rejects invalid stored coordinates", () => {
    expect(
      weatherCitySchema.safeParse({
        id: 1,
        name: "Test",
        latitude: 91,
        longitude: 0,
      }).success,
    ).toBe(false);
  });
});
