"use client";

import Link from "next/link";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { Brand } from "@/components/brand";
import {
  ArrowLeft,
  BellRing,
  CalendarDays,
  Check,
  CheckCheck,
  Sparkles,
} from "lucide-react";
import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  variant?: "signin" | "signup" | "recovery";
}

function Entrance({
  delay = 0,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={false}
      animate={reducedMotion ? undefined : { opacity: [0.4, 1], y: [18, 0] }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      {...props}
    />
  );
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  variant = "signin",
}) => {
  const signup = variant === "signup";
  const recovery = variant === "recovery";
  const reducedMotion = useReducedMotion();
  return (
    <div className="relative flex min-h-svh flex-col overflow-x-clip bg-background text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,oklch(0.92_0.04_85),transparent_55%),radial-gradient(ellipse_at_85%_15%,oklch(0.9_0.05_220),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top_left,oklch(0.28_0.04_85),transparent_55%),radial-gradient(ellipse_at_85%_15%,oklch(0.24_0.05_220),transparent_50%)]"
      />
      <header className="relative z-10 mx-auto flex w-full max-w-6xl shrink-0 items-center justify-between gap-4 px-4 py-5 md:px-6">
        <Brand />
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft
              className="size-4 transition-transform motion-safe:group-hover:-translate-x-1"
              aria-hidden
            />
            Accueil
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-8 px-4 pb-10 pt-4 md:px-6 lg:grid-cols-2 lg:gap-20 lg:py-12">
        <section
          className="mx-auto w-full max-w-md lg:max-w-lg"
          aria-labelledby="auth-welcome"
        >
          <Entrance>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1.5 text-xs font-medium tracking-wide backdrop-blur">
              <CalendarDays className="size-3.5" aria-hidden />
              Une page. Une journée.
            </p>
            <h1
              id="auth-welcome"
              className="text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl"
            >
              {recovery
                ? "Un nouveau départ."
                : signup
                  ? "Tout commence par une première tâche."
                  : "Ta journée reprend ici."}
              <br />
              <span className="bg-gradient-to-r from-sky-700 via-teal-700 to-amber-700 bg-clip-text text-transparent dark:from-sky-300 dark:via-teal-300 dark:to-amber-300">
                {recovery
                  ? "Retrouve ton espace."
                  : signup
                    ? "Fais de la place à l’essentiel."
                    : "Avance à ton rythme."}
              </span>
            </h1>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-muted-foreground lg:text-lg">
              {recovery
                ? "Réinitialise ton mot de passe pour retrouver tes tâches, tes notes et tes priorités."
                : signup
                  ? "Crée ton espace pour organiser tes priorités, préparer tes routines et choisir les rappels qui te conviennent."
                  : "Retrouve tes priorités, tes notes et tes rappels. Un point de départ clair pour la suite de ta journée."}
            </p>
          </Entrance>
          <div className="mt-8 hidden lg:block">
            <Entrance delay={0.15}>
              <div className="rounded-2xl border bg-card/80 p-5 shadow-lg shadow-sky-950/5 backdrop-blur">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Sparkles
                      className="size-4 text-teal-700 dark:text-teal-300"
                      aria-hidden
                    />
                    Un pas après l’autre
                  </p>
                  <span className="text-xs text-muted-foreground">Exemple</span>
                </div>
                <div className="space-y-2">
                  {[
                    { title: "Choisir ma priorité du jour", done: true },
                    { title: "Avancer sur ce qui compte", done: false },
                    { title: "Garder du temps pour moi", done: false },
                  ].map((task, index) => (
                    <Entrance key={task.title} delay={0.25 + index * 0.1}>
                      <div
                        className={`flex items-center gap-3 rounded-xl border p-3 text-sm ${task.done ? "border-teal-200 bg-teal-50/70 dark:border-teal-900 dark:bg-teal-950/30" : "bg-background/60"}`}
                      >
                        <motion.span
                          aria-hidden
                          className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${task.done ? "border-teal-600 bg-teal-600 text-white" : "border-muted-foreground/30"}`}
                          initial={false}
                          animate={
                            task.done && !reducedMotion
                              ? { scale: [0.7, 1.15, 1] }
                              : undefined
                          }
                          transition={{ delay: 0.6, duration: 0.4 }}
                        >
                          {task.done && <Check className="size-3" />}
                        </motion.span>
                        <span
                          className={
                            task.done
                              ? "text-muted-foreground line-through"
                              : ""
                          }
                        >
                          {task.title}
                        </span>
                      </div>
                    </Entrance>
                  ))}
                </div>
              </div>
            </Entrance>
            <Entrance
              delay={0.4}
              className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-xs text-muted-foreground"
            >
              <span className="flex items-center gap-2">
                <CheckCheck className="size-4" aria-hidden />
                Tes priorités, au même endroit
              </span>
              <span className="flex items-center gap-2">
                <BellRing className="size-4" aria-hidden />
                Tes rappels, ton choix
              </span>
            </Entrance>
          </div>
        </section>
        <Entrance delay={0.12} className="mx-auto w-full max-w-md">
          {children}
        </Entrance>
      </main>
      <footer className="relative px-4 pb-5 text-center text-xs text-muted-foreground">
        My Daily Page · Une page. Une journée.
      </footer>
    </div>
  );
};

export default AuthLayout;
