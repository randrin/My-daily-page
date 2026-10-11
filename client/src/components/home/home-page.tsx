"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  FileStack,
  ListChecks,
  Mail,
  MessageCircle,
  MessageSquare,
  Moon,
  NotebookPen,
  Paperclip,
  Repeat2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Target,
    title: "L’essentiel, chaque matin",
    body: "Jusqu’à trois tâches du jour, les urgentes en tête. Une priorité principale et une progression claire pour savoir où commencer.",
    detail: "Page du jour",
    tone: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  },
  {
    icon: CalendarDays,
    title: "Une place pour chaque échéance",
    body: "Passe de la liste aux cartes ou au calendrier. Crée une tâche depuis une date et retrouve-la avec les filtres, le tri et les catégories.",
    detail: "Liste · Cartes · Calendrier",
    tone: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
  },
  {
    icon: NotebookPen,
    title: "Tout le contexte, au même endroit",
    body: "Description, notes datées, image en aperçu, montant et référence : garde ce qui aide à avancer. Relie aussi les tâches qui se bloquent entre elles.",
    detail: "Notes · Pièces jointes · Dépendances",
    tone: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200",
  },
  {
    icon: FileStack,
    title: "Tes routines deviennent des modèles",
    body: "Prépare tes étapes une fois. Choisis une date de départ, ajuste les heures et retire les étapes inutiles avant de créer ta liste de tâches.",
    detail: "Modèles personnels et listes datées",
    tone: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  },
  {
    icon: Repeat2,
    title: "Les rendez-vous qui reviennent",
    body: "Pour une tâche mensuelle, la prochaine occurrence se crée quand tu termines la précédente. Les conflits d’horaire sont signalés à la saisie.",
    detail: "Récurrence mensuelle",
    tone: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
  },
  {
    icon: Sparkles,
    title: "Un coup de pouce pour démarrer",
    body: "Construis un modèle avec les suggestions guidées, ou les suggestions IA lorsque le service est activé. Tu relis et ajustes les étapes avant de les ajouter.",
    detail: "Suggestions de tâches pour les modèles",
    tone: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200",
  },
];

const upcoming = [
  {
    step: "01",
    icon: MessageSquare,
    title: "D’une idée à une tâche",
    body: "Décrire ce que tu as en tête en une phrase et recevoir une proposition de tâche, d’échéance et de rappel à confirmer.",
    label: "Prévu · Capture assistée",
  },
  {
    step: "02",
    icon: ListChecks,
    title: "Des projets plus faciles à commencer",
    body: "Découper un objectif en sous-tâches datées et suggérer leur priorité, avec un choix humain avant chaque création.",
    label: "Prévu · Planification assistée",
  },
  {
    step: "03",
    icon: Sparkles,
    title: "Un peu de recul sur ta semaine",
    body: "Enrichir le brief du matin et préparer une revue du dimanche pour retrouver les tâches reportées et les points bloquants.",
    label: "Prévu · Brief et revue",
  },
];

// Keep content visible without JavaScript and honor the device motion preference.
function Reveal({
  delay = 0,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={false}
      whileInView={
        reducedMotion ? undefined : { y: [24, 0], opacity: [0.35, 1] }
      }
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
      {...props}
    />
  );
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const reducedMotion = useReducedMotion();
  const isAuthed = status === "authenticated" && Boolean(session?.user);
  const startUrl = isAuthed ? "/dashboard/today" : "/auth/signup";

  return (
    <div className="relative min-h-screen overflow-x-clip bg-background text-foreground">
      <a
        href="#contenu"
        className="sr-only z-50 rounded-md bg-background p-3 focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
      >
        Aller au contenu
      </a>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[850px] bg-[radial-gradient(ellipse_at_top_left,oklch(0.92_0.04_85),transparent_55%),radial-gradient(ellipse_at_85%_15%,oklch(0.9_0.05_220),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top_left,oklch(0.28_0.04_85),transparent_55%),radial-gradient(ellipse_at_85%_15%,oklch(0.24_0.05_220),transparent_50%)]"
      />
      <header className="relative mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-6">
        <Brand />
        <nav
          aria-label="Navigation principale"
          className="flex items-center gap-2"
        >
          <Link
            href="#fonctionnalites"
            className="hidden px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground md:block"
          >
            Fonctionnalités
          </Link>
          <Link
            href="#avenir"
            className="hidden px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground md:block"
          >
            À venir
          </Link>
          <ThemeToggle />
          {!isAuthed && (
            <Button variant="ghost" asChild>
              <Link href="/auth/signin">Connexion</Link>
            </Button>
          )}
          <Button asChild>
            <Link href={startUrl} className="group">
              {isAuthed ? "Ma journée" : "Commencer"}
              <ArrowRight
                aria-hidden
                className="transition-transform motion-safe:group-hover:translate-x-1 motion-safe:group-focus-visible:translate-x-1"
              />
            </Link>
          </Button>
        </nav>
      </header>

      <main id="contenu" className="relative">
        <section
          aria-labelledby="hero-title"
          className="mx-auto grid w-full max-w-6xl gap-12 px-5 pb-20 pt-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:pb-28 lg:pt-20"
        >
          <Reveal>
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1.5 text-xs font-medium tracking-wide backdrop-blur">
              <CalendarDays className="size-3.5" aria-hidden />
              Une page. Une journée.
            </p>
            <h1
              id="hero-title"
              className="max-w-xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl"
            >
              Moins à garder en tête.
              <br />
              <span className="bg-gradient-to-r from-sky-700 via-teal-700 to-amber-700 bg-clip-text text-transparent dark:from-sky-300 dark:via-teal-300 dark:to-amber-300">
                Plus de place pour avancer.
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Tes tâches, tes échéances et tes rappels dans un seul espace.
              Chaque jour, retrouve l’essentiel et avance à ton rythme.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href={startUrl} className="group">
                  {isAuthed ? "Ouvrir ma journée" : "Créer mon espace"}
                  <ArrowRight
                    aria-hidden
                    className="transition-transform motion-safe:group-hover:translate-x-1 motion-safe:group-focus-visible:translate-x-1"
                  />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#fonctionnement">Découvrir le fonctionnement</Link>
              </Button>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Check className="size-3.5" aria-hidden />
                Tes priorités du jour
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="size-3.5" aria-hidden />
                Tes canaux de rappel
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="size-3.5" aria-hidden />
                Ton rythme
              </span>
            </div>
          </Reveal>
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.15, ease: "easeOut" }}
            whileHover={reducedMotion ? undefined : { y: -5 }}
          >
            <article
              aria-label="Exemple de page du jour"
              className="relative rounded-3xl border bg-card/95 p-5 shadow-xl shadow-sky-950/5 backdrop-blur sm:p-7"
            >
              <div className="mb-6 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Ta page du jour
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    Un pas après l’autre.
                  </h2>
                </div>
                <span className="rounded-full border px-2.5 py-1 text-[11px] text-muted-foreground">
                  Exemple
                </span>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/40 p-5 dark:border-amber-900 dark:from-amber-950/50 dark:to-orange-950/20">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-amber-800 dark:text-amber-200">
                  <span className="flex items-center gap-2">
                    <Target className="size-4" aria-hidden />
                    Ta priorité du jour
                  </span>
                  <span className="rounded-full bg-amber-100 px-2 py-1 dark:bg-amber-900/60">
                    Haute
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">
                  Finaliser le dossier de voyage
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Une échéance proche. Le bon moment pour avancer.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock3 className="size-3.5" aria-hidden />
                    10:00
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-violet-500" />
                    Personnel
                  </span>
                  <Paperclip className="size-3.5" aria-label="Pièce jointe" />
                </div>
              </div>
              <ul className="mt-3 space-y-3">
                <li className="flex items-center gap-3 rounded-2xl border p-4">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
                    2
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium">
                      Préparer le rendez-vous client
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="size-2 rounded-full bg-sky-500" />
                      Travail · 14:00
                    </p>
                  </div>
                  <NotebookPen
                    className="ml-auto size-4 shrink-0 text-muted-foreground"
                    aria-label="Notes"
                  />
                </li>
                <li className="flex items-center gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-50/40 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
                  <CheckCircle2
                    className="size-7 shrink-0 text-emerald-600 dark:text-emerald-400"
                    aria-hidden
                  />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground line-through">
                      Confirmer la réservation
                    </h3>
                    <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                      Terminée. Une chose de moins en tête.
                    </p>
                  </div>
                </li>
              </ul>
              <div className="mt-5 border-t pt-4">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progression de la journée</span>
                  <span>1 tâche sur 3</span>
                </div>
                <div
                  aria-hidden
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
                >
                  <motion.div
                    className="h-full w-1/3 origin-left rounded-full bg-emerald-500"
                    initial={false}
                    whileInView={reducedMotion ? undefined : { scaleX: [0, 1] }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>
            </article>
          </motion.div>
        </section>

        <section
          id="fonctionnement"
          aria-labelledby="how-title"
          className="border-y bg-muted/30"
        >
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6">
            <h2 id="how-title" className="text-xl font-semibold tracking-tight">
              De ce que tu dois faire à ce qui est fait.
            </h2>
            <div className="mt-8 grid gap-7 md:grid-cols-3">
              {[
                [
                  "01",
                  "Pose tes tâches",
                  "Ajoute une échéance, une priorité et le contexte utile. Ou pars d’un de tes modèles.",
                ],
                [
                  "02",
                  "Retrouve ton focus",
                  "Ouvre ta page du jour pour voir ce qui mérite ton attention en premier.",
                ],
                [
                  "03",
                  "Avance, puis confirme",
                  "Reçois les rappels choisis, termine tes tâches et garde une trace de tes notes.",
                ],
              ].map(([step, title, body], index) => (
                <Reveal delay={index * 0.1} key={step} className="flex gap-4">
                  <span className="pt-0.5 text-sm font-semibold text-muted-foreground">
                    {step}
                  </span>
                  <div>
                    <h3 className="font-medium">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section
          id="fonctionnalites"
          aria-labelledby="features-title"
          className="mx-auto max-w-6xl px-5 py-20 sm:px-6 lg:py-24"
        >
          <Reveal className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">
              Déjà dans ton espace
            </p>
            <h2
              id="features-title"
              className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              Un quotidien mieux organisé.
              <br />
              Sans tout réinventer.
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Du premier rappel aux routines mensuelles, les outils pour
              organiser tes journées sont déjà réunis.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Reveal delay={(index % 3) * 0.08} key={feature.title}>
                <motion.article
                  key={feature.title}
                  className="group flex h-full flex-col rounded-2xl border bg-card p-6 transition-shadow motion-safe:hover:shadow-lg"
                  whileHover={reducedMotion ? undefined : { y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className={`mb-5 flex size-10 items-center justify-center rounded-xl transition-transform motion-safe:group-hover:rotate-6 motion-safe:group-hover:scale-110 ${feature.tone}`}
                  >
                    <feature.icon className="size-5" aria-hidden />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {feature.body}
                  </p>
                  <p className="mt-6 border-t pt-4 text-xs font-medium text-muted-foreground">
                    {feature.detail}
                  </p>
                </motion.article>
              </Reveal>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="reminders-title"
          className="mx-auto max-w-6xl px-5 sm:px-6"
        >
          <Reveal className="grid gap-10 overflow-hidden rounded-3xl border bg-gradient-to-br from-sky-50 via-background to-teal-50 p-6 dark:from-sky-950/40 dark:to-teal-950/30 sm:p-10 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-5 flex size-10 items-center justify-center rounded-xl border bg-background">
                <Bell className="size-5" aria-hidden />
              </div>
              <h2
                id="reminders-title"
                className="text-3xl font-semibold tracking-tight"
              >
                Des rappels qui suivent
                <br />
                tes préférences.
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Choisis tes canaux, protège tes horaires de repos et suspends
                les rappels lorsque tu en as besoin.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Un résumé du matin à 7 h 30, des rappels selon l’échéance et un
                historique pour suivre les envois. Les canaux disponibles
                dépendent de leur activation et de tes autorisations.
              </p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Mail, label: "Email" },
                  { icon: MessageSquare, label: "SMS" },
                  { icon: MessageCircle, label: "WhatsApp" },
                  { icon: Smartphone, label: "Push" },
                ].map((channel, index) => (
                  <Reveal
                    delay={index * 0.08}
                    key={channel.label}
                    className="flex items-center gap-3 rounded-xl border bg-background/80 p-4"
                  >
                    <channel.icon
                      className="size-4 text-muted-foreground"
                      aria-hidden
                    />
                    <span className="text-sm font-medium">{channel.label}</span>
                  </Reveal>
                ))}
              </div>
              <div className="rounded-xl border bg-background/80 p-4">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <Moon className="size-4 text-muted-foreground" aria-hidden />
                  Tu gardes la main
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Horaires silencieux, fuseau horaire, pause temporaire et
                  activation par canal. Les excédents SMS sont regroupés en un
                  résumé email si ce canal est activé.
                </p>
              </div>
              <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
                Tu peux désactiver les rappels à tout moment. Les notifications
                Push nécessitent un navigateur compatible et ton autorisation.
              </p>
            </div>
          </Reveal>
        </section>

        <section
          id="avenir"
          aria-labelledby="roadmap-title"
          className="mx-auto max-w-6xl px-5 py-20 sm:px-6 lg:py-24"
        >
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700 dark:text-violet-300">
                La suite se prépare
              </p>
              <h2
                id="roadmap-title"
                className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
              >
                Moins de saisie.
                <br />
                Plus d’aide pour décider.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Ces évolutions sont prévues dans la roadmap. Elles ne sont pas
              encore disponibles et n’ont pas de date de lancement annoncée.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {upcoming.map((item, index) => (
              <Reveal
                delay={index * 0.1}
                key={item.step}
                className="rounded-2xl border border-dashed bg-muted/20 p-6"
              >
                <div className="flex items-center justify-between">
                  <item.icon
                    className="size-5 text-muted-foreground"
                    aria-hidden
                  />
                  <span className="text-xs text-muted-foreground">
                    {item.step}
                  </span>
                </div>
                <p className="mt-6 text-xs font-medium text-violet-700 dark:text-violet-300">
                  {item.label}
                </p>
                <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </Reveal>
            ))}
          </div>
          <p className="mt-5 flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
            Le principe restera le même : tu vérifies les propositions avant de
            créer tes tâches.
          </p>
        </section>

        <section
          aria-labelledby="start-title"
          className="mx-auto mb-16 max-w-6xl px-5 sm:px-6"
        >
          <Reveal className="flex flex-col items-start justify-between gap-7 rounded-3xl bg-primary px-7 py-10 text-primary-foreground sm:px-10 md:flex-row md:items-center">
            <div>
              <h2
                id="start-title"
                className="text-3xl font-semibold tracking-tight"
              >
                Ta prochaine étape peut être simple.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-primary-foreground/80">
                Crée ton espace, ajoute une première tâche et laisse ta page du
                jour te donner un point de départ.
              </p>
            </div>
            <Button size="lg" variant="secondary" asChild>
              <Link href={startUrl} className="group">
                {isAuthed ? "Retrouver ma journée" : "Créer mon espace"}
                <ArrowRight
                  aria-hidden
                  className="transition-transform motion-safe:group-hover:translate-x-1 motion-safe:group-focus-visible:translate-x-1"
                />
              </Link>
            </Button>
          </Reveal>
        </section>
      </main>
      <footer className="relative border-t">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 px-5 py-7 text-sm text-muted-foreground sm:flex-row sm:items-center sm:px-6">
          <p>
            My Daily Page{" "}
            <span className="ml-2 text-xs">Une page. Une journée.</span>
          </p>
          <nav
            aria-label="Navigation de pied de page"
            className="flex flex-wrap gap-5"
          >
            <Link href="#fonctionnalites" className="hover:text-foreground">
              Fonctionnalités
            </Link>
            <Link href="#avenir" className="hover:text-foreground">
              À venir
            </Link>
            <Link
              href={isAuthed ? "/dashboard/today" : "/auth/signin"}
              className="hover:text-foreground"
            >
              {isAuthed ? "Ma journée" : "Connexion"}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
