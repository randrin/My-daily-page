import fr from "@/locales/fr.json";
import en from "@/locales/en.json";
export type TranslationKey = keyof typeof fr;
export type TranslationValues = Record<string, string | number>;
const catalogs: Record<"fr" | "en", Record<string, string>> = { fr, en };
export function translate(
  key: string,
  locale: "fr" | "en",
  values?: TranslationValues,
): string {
  const message = catalogs[locale][key] ?? catalogs.fr[key] ?? key;
  return message.replace(/\{([A-Za-z0-9_]+)\}/g, (token, name: string) =>
    values?.[name] === undefined ? token : String(values[name]),
  );
}
