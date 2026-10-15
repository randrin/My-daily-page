"use client";
import { toast } from "sonner";
import { useLocale } from "@/i18n/provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
export function LanguageSelect() {
  const { locale, setLocale, pending } = useLocale();
  return (
    <Select
      value={locale}
      disabled={pending}
      onValueChange={(value) => {
        if (value !== "fr" && value !== "en") return;
        void setLocale(value).catch(() =>
          toast.error(
            locale === "fr"
              ? "Impossible d’enregistrer la langue."
              : "Unable to save language."
          )
        );
      }}
    >
      <SelectTrigger
        className="w-auto gap-2"
        aria-label={
          locale === "fr" ? "Langue de l’interface" : "Interface language"
        }
      >
        <span className="text-base leading-none" aria-hidden>
          {locale === "fr" ? "🇫🇷" : "🇬🇧"}
        </span>
        <SelectValue>
          <span className="sm:hidden">{locale.toUpperCase()}</span>
          <span className="hidden sm:inline">
            {locale === "fr" ? "Français" : "English"}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="fr">
          <span aria-hidden>🇫🇷</span> Français
        </SelectItem>
        <SelectItem value="en">
          <span aria-hidden>🇬🇧</span> English
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
