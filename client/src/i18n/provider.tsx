"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { useMe } from "@/hooks/use-profile";
import { apiClient } from "@/api/client";
import { translate } from "./translate";
export { translate } from "./translate";

export type Locale = "fr" | "en";
const Context = createContext<{
  locale: Locale;
  pending: boolean;
  setLocale: (locale: Locale) => Promise<void>;
}>({
  locale: "fr" as Locale,
  pending: false,
  setLocale: async () => {},
});
export function LocaleProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const me = useMe(status === "authenticated");
  const cache = useQueryClient();
  const [locale, setCurrent] = useState<Locale>("fr");
  const [pending, setPending] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (status === "authenticated") {
        if (me.data?.locale) setCurrent(me.data.locale);
      } else if (status === "unauthenticated") {
        try {
          setCurrent(localStorage.getItem("mdp:locale") === "en" ? "en" : "fr");
        } catch {}
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [status, session?.user?.id, me.data?.locale]);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  async function setLocale(next: Locale) {
    setPending(true);
    try {
      if (status === "authenticated") {
        await cache.cancelQueries({ queryKey: ["me"] });
        const { data } = await apiClient.patch("/auth/me", { locale: next });
        cache.setQueryData(["me"], data);
      }
      setCurrent(next);
      try {
        localStorage.setItem("mdp:locale", next);
      } catch {}
    } finally {
      setPending(false);
    }
  }
  return (
    <Context.Provider
      value={{
        locale,
        pending:
          pending ||
          status === "loading" ||
          (status === "authenticated" && me.isPending),
        setLocale,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useLocale = () => useContext(Context);
export function Localized({ children }: { children: ReactNode }) {
  const { locale } = useLocale();
  return (
    <>{typeof children === "string" ? translate(children, locale) : children}</>
  );
}
export function useTranslator() {
  const { locale } = useLocale();
  return (key: string, values?: Record<string, string | number>) =>
    translate(key, locale, values);
}
