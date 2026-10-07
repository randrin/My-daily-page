import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Brand } from "@/components/brand";
import { ArrowLeft, BellRing, CalendarDays, CheckCheck } from "lucide-react";
import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-background text-foreground">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,oklch(0.92_0.04_85),transparent_42%),radial-gradient(circle_at_80%_0,oklch(0.9_0.05_220),transparent_36%)] dark:bg-[radial-gradient(circle_at_top_left,oklch(0.28_0.04_85),transparent_42%),radial-gradient(circle_at_80%_0,oklch(0.24_0.05_220),transparent_36%)]" />
      <header className="relative z-10 mx-auto flex w-full max-w-6xl shrink-0 items-center justify-between gap-4 px-4 py-5 md:px-6">
        <Brand />
        <div className="flex items-center gap-2">
          <ButtonLink />
          <ThemeToggle />
        </div>
      </header>
      <main className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-8 px-4 pb-10 pt-4 md:px-6 lg:grid-cols-[1fr_1fr] lg:gap-20 lg:py-12">
        <section className="mx-auto w-full max-w-md space-y-5 lg:max-w-lg lg:space-y-8">
          <p className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            Une page. Une journée.
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl lg:leading-[1.1]">Un peu d’ordre.<br />Plus de place pour toi.</h1>
          <p className="max-w-sm text-base leading-relaxed text-muted-foreground lg:text-lg">Tes tâches, tes idées et tes rappels, réunis pour avancer à ton rythme.</p>
          <ul className="hidden space-y-4 border-t border-foreground/10 pt-6 text-sm text-muted-foreground lg:block">
            <li className="flex items-center gap-3"><CheckCheck className="size-4 text-foreground" aria-hidden="true" />Une vue claire sur tes priorités.</li>
            <li className="flex items-center gap-3"><BellRing className="size-4 text-foreground" aria-hidden="true" />Des rappels selon tes préférences.</li>
          </ul>
        </section>
        <div className="mx-auto w-full max-w-md">{children}</div>
      </main>
    </div>
  );
};

function ButtonLink() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      Accueil
    </Link>
  );
}

export default AuthLayout;
