"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CloudSun,
  Sun,
  Cloud,
  CloudFog,
  CloudRain,
  CloudLightning,
  Snowflake,
  Search,
  MapPin,
  RotateCcw,
  Droplets,
} from "lucide-react";
import { weatherApi, weatherCitySchema, type WeatherCity } from "@/api/weather";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedbackState } from "@/components/ui/feedback-state";

function condition(code: number | null) {
  if (code === 0) return { icon: Sun, label: "Ensoleillé" };
  if (code === 1 || code === 2) return { icon: CloudSun, label: "Éclaircies" };
  if (code === 3) return { icon: Cloud, label: "Couvert" };
  if (code === 45 || code === 48)
    return { icon: CloudFog, label: "Brouillard" };
  if (code !== null && [71, 73, 75, 77, 85, 86].includes(code))
    return { icon: Snowflake, label: "Neige" };
  if (code !== null && code >= 95)
    return { icon: CloudLightning, label: "Orages" };
  if (code !== null && code >= 51) return { icon: CloudRain, label: "Pluie" };
  return { icon: CloudSun, label: "Indisponible" };
}
const degrees = (value: number | null | undefined) =>
  value == null ? "—" : `${Math.round(value)}°`;

export function HeaderWeather({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [city, setCity] = useState<WeatherCity | null>(null);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const storageKey = `my-daily-page:weather-city:${userId}`;
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const parsed = weatherCitySchema.safeParse(
          JSON.parse(localStorage.getItem(storageKey) ?? "null"),
        );
        setCity(parsed.success ? parsed.data : null);
      } catch {
        setCity(null);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [storageKey]);
  const cities = useQuery({
    queryKey: ["weather", "cities", search],
    queryFn: ({ signal }) => weatherApi.search(search, signal),
    enabled: open && search.length >= 2,
    staleTime: 3600000,
    retry: 1,
  });
  const forecast = useQuery({
    queryKey: ["weather", "forecast", city?.latitude, city?.longitude],
    queryFn: ({ signal }) => weatherApi.forecast(city!, signal),
    enabled: Boolean(city),
    staleTime: 15 * 60000,
    refetchInterval: open ? 30 * 60000 : false,
    retry: 1,
  });
  const data = forecast.data?.daily;
  const TodayIcon = condition(data?.weather_code[0] ?? null).icon;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={
            city
              ? `Météo à ${city.name}, prévisions sur 7 jours`
              : "Choisir une ville pour la météo"
          }
        >
          <TodayIcon
            className="size-5 text-sky-600 dark:text-sky-400"
            aria-hidden
          />
          <span className="hidden lg:inline">{city?.name ?? "Météo"}</span>
          {data && (
            <span className="tabular-nums">
              {degrees(data.temperature_2m_max[0])}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[min(26rem,calc(100vw-2rem))] max-h-[75vh] overflow-y-auto space-y-4"
      >
        <div>
          <h2 className="flex items-center gap-2 font-semibold">
            <CloudSun className="size-5" aria-hidden />
            Météo sur 7 jours
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Aujourd’hui et les 6 jours suivants ·{" "}
            {city?.name ?? "Choisis une ville"}
          </p>
        </div>
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(input.trim());
          }}
        >
          <label htmlFor="weather-city" className="text-sm font-medium">
            Ville
          </label>
          <div className="flex gap-2">
            <Input
              id="weather-city"
              placeholder="Ex. Paris, Douala, Bruxelles"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              minLength={2}
              maxLength={100}
              required
            />
            <Button
              type="submit"
              variant="outline"
              size="icon"
              aria-label="Rechercher une ville"
            >
              <Search aria-hidden />
            </Button>
          </div>
        </form>
        {search.length >= 2 &&
          (cities.isPending ? (
            <Skeleton className="h-16" />
          ) : cities.isError ? (
            <FeedbackState
              variant="error"
              description="Recherche indisponible."
            >
              <Button variant="outline" onClick={() => void cities.refetch()}>
                <RotateCcw />
                Réessayer
              </Button>
            </FeedbackState>
          ) : !cities.data?.length ? (
            <FeedbackState icon={MapPin} description="Aucune ville trouvée." />
          ) : (
            <ul className="space-y-1">
              {cities.data.map((result) => (
                <li key={result.id}>
                  <Button
                    variant="ghost"
                    className="h-auto w-full justify-start whitespace-normal text-left"
                    onClick={() => {
                      setCity(result);
                      setSearch("");
                      setInput("");
                      try {
                        localStorage.setItem(
                          storageKey,
                          JSON.stringify(result),
                        );
                      } catch {
                        /* Session selection still works. */
                      }
                    }}
                  >
                    <MapPin className="size-4 shrink-0" aria-hidden />
                    {[result.name, result.admin1, result.country]
                      .filter(Boolean)
                      .join(", ")}
                  </Button>
                </li>
              ))}
            </ul>
          ))}
        {!city ? (
          <FeedbackState
            icon={MapPin}
            description="Sélectionne une ville pour consulter ses prévisions."
          />
        ) : forecast.isPending ? (
          <div className="space-y-2">
            {Array.from({ length: 7 }, (_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : forecast.isError ? (
          <FeedbackState
            variant="error"
            description="Prévisions indisponibles."
          >
            <Button variant="outline" onClick={() => void forecast.refetch()}>
              <RotateCcw />
              Réessayer
            </Button>
          </FeedbackState>
        ) : (
          data && (
            <div>
              <p className="mb-2 text-xs text-muted-foreground">
                {city.name} · {forecast.data.timezone} · min / max
              </p>
              <ul className="divide-y">
                {data.time.map((day, i) => {
                  const { icon: Icon, label } = condition(data.weather_code[i]);
                  return (
                    <li key={day} className="flex items-center gap-3 py-2.5">
                      <div className="min-w-20 text-sm font-medium">
                        {i === 0
                          ? "Aujourd’hui"
                          : new Intl.DateTimeFormat("fr-FR", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              timeZone: "UTC",
                            }).format(new Date(day + "T12:00:00Z"))}
                      </div>
                      <Icon
                        className="size-5 shrink-0 text-sky-600 dark:text-sky-400"
                        aria-hidden
                      />
                      <div className="flex-1 text-xs text-muted-foreground">
                        {label}
                        <span className="flex items-center gap-1">
                          <Droplets className="size-3" aria-hidden />
                          {data.precipitation_probability_max[i] == null
                            ? "—"
                            : data.precipitation_probability_max[i] + " %"}{" "}
                          pluie
                        </span>
                      </div>
                      <span className="text-sm tabular-nums">
                        <span className="text-muted-foreground">
                          {degrees(data.temperature_2m_min[i])}
                        </span>{" "}
                        / {degrees(data.temperature_2m_max[i])}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )
        )}
        <p className="text-xs text-muted-foreground">
          Ville mémorisée sur cet appareil. Prévisions :{" "}
          <a
            className="underline"
            href="https://open-meteo.com/"
            target="_blank"
            rel="noreferrer"
          >
            Open-Meteo
          </a>
          .
        </p>
      </PopoverContent>
    </Popover>
  );
}
