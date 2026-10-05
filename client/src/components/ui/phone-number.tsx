"use client";

import { useState, type ComponentProps } from "react";
import { getCountries, getCountryCallingCode, type CountryCode } from "libphonenumber-js";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { combinePhoneNumber, countryFlag, splitPhoneNumber } from "@/lib/phone-number";

const names = new Intl.DisplayNames(["fr"], { type: "region" });
const countries = getCountries().map((country) => ({ country, name: names.of(country) ?? country, code: getCountryCallingCode(country) }))
  .sort((a, b) => a.name.localeCompare(b.name, "fr"));

type PhoneNumberProps = Omit<ComponentProps<typeof Input>, "value" | "onChange" | "type" | "defaultValue"> & {
  value: string;
  onChange: (value: string) => void;
  defaultCountry?: CountryCode;
};

export function PhoneNumber({ value, onChange, defaultCountry = "FR", disabled, className, ...props }: PhoneNumberProps) {
  const [draft, setDraft] = useState(() => splitPhoneNumber(value, defaultCountry));
  const current = draft.value === value ? draft : splitPhoneNumber(value, draft.country);
  const commit = (country: CountryCode, national: string) => {
    const next = combinePhoneNumber(country, national);
    setDraft({ country, national, value: next });
    onChange(next);
  };

  return (
    <div className={cn("flex min-w-0 gap-2", className)}>
      <Select value={current.country} disabled={disabled} onValueChange={(country) => commit(country as CountryCode, current.national)}>
        <SelectTrigger className="w-28 shrink-0" aria-label={`Pays et indicatif pour ${props.id?.includes("whatsapp") ? "WhatsApp" : "le téléphone"}`}>
          <SelectValue><span aria-hidden>{countryFlag(current.country)}</span> +{getCountryCallingCode(current.country)}</SelectValue>
        </SelectTrigger>
        <SelectContent position="popper" className="max-h-72">
          {countries.map(({ country, name, code }) => (
            <SelectItem key={country} value={country} textValue={`${name} +${code}`}>
              <span aria-hidden>{countryFlag(country)}</span> {name} <span className="text-muted-foreground">+{code}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input {...props} disabled={disabled} type="tel" inputMode="tel" autoComplete="tel-national" className="min-w-0 flex-1" placeholder="Numéro de téléphone" value={current.national}
        onChange={(event) => {
          const text = event.target.value;
          if (/^(\+|00)/.test(text.trim())) {
            const parsed = splitPhoneNumber(text, current.country);
            commit(parsed.country, parsed.national);
          } else commit(current.country, text.replace(/[^\d\s().-]/g, ""));
        }} />
    </div>
  );
}
