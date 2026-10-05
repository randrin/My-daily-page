import { getCountries, getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";

export function countryFlag(country: CountryCode): string {
  return String.fromCodePoint(...[...country].map((letter) => 127397 + letter.charCodeAt(0)));
}

export function combinePhoneNumber(country: CountryCode, national: string): string {
  const digits = national.replace(/\D/g, "");
  if (!digits) return "";
  const parsed = parsePhoneNumberFromString(digits, country);
  return parsed?.number ?? `+${getCountryCallingCode(country)}${digits}`;
}

export function splitPhoneNumber(value: string, preferred: CountryCode = "FR") {
  const international = value.trim().replace(/^00/, "+");
  if (!international.startsWith("+")) return { country: preferred, national: value, value };
  const parsed = parsePhoneNumberFromString(international);
  if (parsed?.country) {
    const country = getCountryCallingCode(preferred) === parsed.countryCallingCode ? preferred : parsed.country;
    return { country, national: String(parsed.nationalNumber), value };
  }
  const digits = international.replace(/\D/g, "");
  const countries = [preferred, ...getCountries()].sort((a, b) => getCountryCallingCode(b).length - getCountryCallingCode(a).length);
  const country = countries.find((candidate) => digits.startsWith(getCountryCallingCode(candidate))) ?? preferred;
  const code = getCountryCallingCode(country);
  return { country, national: digits.startsWith(code) ? digits.slice(code.length) : digits, value };
}
