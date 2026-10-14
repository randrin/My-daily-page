import axios from "axios";
import { z } from "zod";

export const weatherCitySchema = z.object({
  id: z.number(),
  name: z.string(),
  country: z.string().optional(),
  admin1: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
export type WeatherCity = z.infer<typeof weatherCitySchema>;
const citiesSchema = z.object({
  results: z.array(weatherCitySchema).optional(),
});
export const forecastSchema = z.object({
  timezone: z.string(),
  daily: z
    .object({
      time: z.array(z.string()),
      weather_code: z.array(z.number().nullable()),
      temperature_2m_max: z.array(z.number().nullable()),
      temperature_2m_min: z.array(z.number().nullable()),
      precipitation_probability_max: z.array(z.number().nullable()),
    })
    .refine(
      (d) => Object.values(d).every((values) => values.length === 7),
      "Prévisions incomplètes",
    ),
});
export const weatherApi = {
  search: async (name: string, signal?: AbortSignal) =>
    citiesSchema.parse(
      (
        await axios.get("https://geocoding-api.open-meteo.com/v1/search", {
          params: { name, count: 6, language: "fr", format: "json" },
          timeout: 10000,
          signal,
        })
      ).data,
    ).results ?? [],
  forecast: async (city: WeatherCity, signal?: AbortSignal) =>
    forecastSchema.parse(
      (
        await axios.get("https://api.open-meteo.com/v1/forecast", {
          params: {
            latitude: city.latitude,
            longitude: city.longitude,
            timezone: "auto",
            forecast_days: 7,
            daily:
              "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
          },
          timeout: 10000,
          signal,
        })
      ).data,
    ),
};
