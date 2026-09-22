"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  Lock,
  Mail,
  MessageCircle,
  NotebookPen,
  Shield,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const previewTasks = [
  { title: "Relire le brief client", status: "En cours", tone: "amber" },
  { title: "Bloquer 45 min de focus", status: "À faire", tone: "sky" },
  { title: "Envoyer le récap d’équipe", status: "Rappel 18:00", tone: "violet" },
] as const;

export default function HomePage() {
  const { data: session, status } = useSession();
  const [todayLabel, setTodayLabel] = React.useState<string>("Aujourd’hui");
  const isAuthed = status === "authenticated" && Boolean(session?.user);

  React.useEffect(() => {
    setTodayLabel(
      new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(new Date()),
    );
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,oklch(0.92_0.04_85),transparent_42%),radial-gradient(circle_at_80%_0,oklch(0.9_0.05_220),transparent_36%)] dark:bg-[radial-gradient(circle_at_top_left,oklch(0.28_0.04_85),transparent_42%),radial-gradient(circle_at_80%_0,oklch(0.24_0.05_220),transparent_36%)]"
      />
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Brand />
        <nav className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthed ? (
            <Button asChild>
              <Link href="/dashboard">
                Dashboard
                <ArrowRight />
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/signin">Connexion</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Commencer</Link>
              </Button>
            </>
          )}
        </nav>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-6xl gap-16 px-6 pb-24 pt-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-10">
        <div className="space-y-8">
          <p className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
            <CalendarDays className="size-3.5" />
            Une page. Une journée.
          </p>
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-6xl sm:leading-[1.05]">
            Ta journée tient sur une page — pas dans dix onglets.
          </h1>
          <p className="max-w-lg text-lg text-muted-foreground">
            My Daily Page range tes tâches, catégories et rappels (email, SMS,
            WhatsApp) derrière un compte JWT. Le dashboard n’existe que pour
            toi.
          </p>
          <div className="flex flex-wrap gap-3">
            {isAuthed ? (
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Ouvrir ma page
                  <ArrowRight />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link href="/auth/signup">Créer ma page</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/auth/signin">J’ai déjà un compte</Link>
                </Button>
              </>
            )}
          </div>
          <dl className="grid max-w-lg grid-cols-3 gap-4 border-t pt-6 text-sm">
            <div>
              <dt className="text-muted-foreground">Cycle</dt>
              <dd className="font-medium">todo → done</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Rappels</dt>
              <dd className="font-medium">async, pas spam</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Isolation</dt>
              <dd className="font-medium">JWT `sub`</dd>
            </div>
          </dl>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative"
        >
          <div className="absolute -inset-8 -z-10 rounded-[2.2rem] bg-primary/5 blur-2xl" />
          <article className="rounded-[1.8rem] border bg-card/90 p-6 shadow-2xl shadow-primary/5 backdrop-blur">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Page du jour
                </p>
                <h2 className="mt-1 capitalize">{todayLabel}</h2>
              </div>
              <div className="rounded-2xl bg-secondary px-3 py-2 text-right text-xs">
                <p className="text-muted-foreground">Focus</p>
                <p className="text-lg font-semibold">2 / 5</p>
              </div>
            </div>
            <ul className="space-y-3">
              {previewTasks.map((task) => (
                <li
                  key={task.title}
                  className="flex items-center justify-between rounded-2xl border bg-background/80 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="size-2.5 rounded-full bg-primary/70" />
                    <span className="font-medium">{task.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {task.status}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
              <div className="rounded-xl bg-secondary/70 px-2 py-3">
                <Mail className="mx-auto mb-1 size-4" />
                Email
              </div>
              <div className="rounded-xl bg-secondary/70 px-2 py-3">
                <MessageCircle className="mx-auto mb-1 size-4" />
                SMS
              </div>
              <div className="rounded-xl bg-secondary/70 px-2 py-3">
                <Bell className="mx-auto mb-1 size-4" />
                WhatsApp
              </div>
            </div>
          </article>
        </motion.div>
      </main>

      <section className="relative z-10 mx-auto grid w-full max-w-6xl gap-4 px-6 pb-24 md:grid-cols-3">
        {[
          {
            icon: NotebookPen,
            title: "Une page, pas un chaos",
            body: "Statuts clairs : à faire, en cours, terminé, archivé. Priorités jusqu’à urgent.",
          },
          {
            icon: Bell,
            title: "Rappels qui partent vraiment",
            body: "Tu crées le rappel. L’API l’envoie plus tard via la file — jamais depuis le navigateur.",
          },
          {
            icon: Shield,
            title: "Dashboard verrouillé",
            body: "Access token court + refresh rotatif. Sans session, le dashboard redirige vers la connexion.",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="rounded-3xl border bg-card/80 p-6"
          >
            <feature.icon className="mb-4 size-5 text-primary" />
            <h3 className="text-lg font-semibold">{feature.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{feature.body}</p>
          </div>
        ))}
      </section>

      <section className="relative z-10 mx-auto mb-20 w-full max-w-6xl overflow-hidden rounded-[2rem] border bg-primary px-8 py-12 text-primary-foreground">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">
              Ferme les listes. Ouvre ta page.
            </h2>
            <p className="mt-2 max-w-xl text-primary-foreground/80">
              Compte démo : demo@mydailypage.dev / password123
            </p>
          </div>
          <Button size="lg" variant="secondary" asChild>
            <Link href={isAuthed ? "/dashboard" : "/auth/signin"}>
              {isAuthed ? "Continuer" : "Se connecter"}
              <Lock className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="relative z-10 border-t">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 text-sm text-muted-foreground">
          <p>My Daily Page</p>
          <p className="flex items-center gap-2">
            <CheckCircle2 className="size-4" />
            Tes données, ton JWT, ta page.
          </p>
        </div>
      </footer>
    </div>
  );
}
