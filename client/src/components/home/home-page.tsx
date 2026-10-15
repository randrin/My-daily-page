"use client";

import { useTranslator } from "@/i18n/provider";
import { Localized } from "@/i18n/provider";
import { LanguageSelect } from "@/components/language-select";
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
    title: "messages.whatMattersEachMorning",
    body: "messages.upToThreeTasksForTodayUrgentOnesFirst",
    detail: "navigation.today",
    tone: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  },
  {
    icon: CalendarDays,
    title: "messages.aPlaceForEveryDueDate",
    body: "messages.switchBetweenTableCardsAndCalendarCreateATask",
    detail: "messages.tableCardsCalendar",
    tone: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
  },
  {
    icon: NotebookPen,
    title: "messages.allTheContextInOnePlace",
    body: "messages.keepDescriptionsDatedNotesImagePreviewsAmountsAndReferences",
    detail: "messages.notesAttachmentsDependencies",
    tone: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200",
  },
  {
    icon: FileStack,
    title: "messages.turnRoutinesIntoTemplates",
    body: "messages.prepareYourStepsOnceChooseAStartDateAdjust",
    detail: "messages.personalTemplatesAndDatedLists",
    tone: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  },
  {
    icon: Repeat2,
    title: "messages.recurringAppointments",
    body: "messages.forMonthlyTasksCompletingOneCreatesTheNextOccurrence",
    detail: "messages.monthlyRecurrence",
    tone: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
  },
  {
    icon: Sparkles,
    title: "messages.aHelpingHandToGetStarted",
    body: "messages.buildATemplateWithGuidedSuggestionsOrAiWhen",
    detail: "messages.taskSuggestionsForTemplates",
    tone: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200",
  },
];

const upcoming = [
  {
    step: "01",
    icon: MessageSquare,
    title: "messages.fromAnIdeaToATask",
    body: "messages.describeYourIdeaInASentenceAndReceiveA",
    label: "messages.plannedAssistedCapture",
  },
  {
    step: "02",
    icon: ListChecks,
    title: "messages.projectsThatAreEasierToStart",
    body: "messages.breakAGoalIntoDatedTasksAndSuggestPriorities",
    label: "messages.plannedAssistedPlanning",
  },
  {
    step: "03",
    icon: Sparkles,
    title: "messages.aFreshLookAtYourWeek",
    body: "messages.enhanceTheMorningBriefAndPrepareASundayReview",
    label: "messages.plannedBriefAndReview",
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
  const t = useTranslator();
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
        <Localized>{t("messages.skipToContent")}</Localized>
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
            <Localized>{t("messages.features")}</Localized>
          </Link>
          <Link
            href="#avenir"
            className="hidden px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground md:block"
          >
            <Localized>{t("messages.comingNext")}</Localized>
          </Link>
          <LanguageSelect />
          <ThemeToggle />
          {!isAuthed && (
            <Button variant="ghost" asChild>
              <Link href="/auth/signin">
                <Localized>{t("auth.signIn")}</Localized>
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link href={startUrl} className="group">
              {isAuthed ? t("messages.myDay") : t("messages.getStarted")}
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
              <Localized>{t("messages.onePageOneDay")}</Localized>
            </p>
            <h1
              id="hero-title"
              className="max-w-xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl"
            >
              <Localized>{t("messages.lessToKeepInMind")}</Localized>
              <br />
              <span className="bg-gradient-to-r from-sky-700 via-teal-700 to-amber-700 bg-clip-text text-transparent dark:from-sky-300 dark:via-teal-300 dark:to-amber-300">
                <Localized>{t("messages.moreRoomToMoveForward")}</Localized>
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
              <Localized>
                {t(
                  "messages.yourTasksDueDatesAndRemindersInOnePlace",
                )}
              </Localized>
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href={startUrl} className="group">
                  {isAuthed ? t("messages.openMyDay") : t("messages.createMySpace")}
                  <ArrowRight
                    aria-hidden
                    className="transition-transform motion-safe:group-hover:translate-x-1 motion-safe:group-focus-visible:translate-x-1"
                  />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#fonctionnement">
                  <Localized>{t("messages.seeHowItWorks")}</Localized>
                </Link>
              </Button>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Check className="size-3.5" aria-hidden />
                <Localized>{t("messages.yourDailyPriorities")}</Localized>
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="size-3.5" aria-hidden />
                <Localized>{t("messages.yourReminderChannels")}</Localized>
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="size-3.5" aria-hidden />
                <Localized>{t("messages.yourRhythm")}</Localized>
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
                    <Localized>{t("messages.yourDailyPage")}</Localized>
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    <Localized>{t("messages.oneStepAtATime")}</Localized>
                  </h2>
                </div>
                <span className="rounded-full border px-2.5 py-1 text-[11px] text-muted-foreground">
                  <Localized>{t("messages.example")}</Localized>
                </span>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/40 p-5 dark:border-amber-900 dark:from-amber-950/50 dark:to-orange-950/20">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-amber-800 dark:text-amber-200">
                  <span className="flex items-center gap-2">
                    <Target className="size-4" aria-hidden />
                    <Localized>{t("messages.yourPriorityToday")}</Localized>
                  </span>
                  <span className="rounded-full bg-amber-100 px-2 py-1 dark:bg-amber-900/60">
                    <Localized>{t("messages.high")}</Localized>
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">
                  <Localized>{t("messages.finalizeTravelDocuments")}</Localized>
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  <Localized>
                    {t("messages.aDeadlineIsApproachingAGoodTimeToMove")}
                  </Localized>
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock3 className="size-3.5" aria-hidden />
                    10:00
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-violet-500" />
                    <Localized>{t("messages.personal")}</Localized>
                  </span>
                  <Paperclip
                    className="size-3.5"
                    aria-label={t("messages.attachment")}
                  />
                </div>
              </div>
              <ul className="mt-3 space-y-3">
                <li className="flex items-center gap-3 rounded-2xl border p-4">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
                    2
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium">
                      <Localized>
                        {t("messages.prepareTheClientMeeting")}
                      </Localized>
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="size-2 rounded-full bg-sky-500" />
                      <Localized>{t("messages.work1400")}</Localized>
                    </p>
                  </div>
                  <NotebookPen
                    className="ml-auto size-4 shrink-0 text-muted-foreground"
                    aria-label={t("messages.notes2")}
                  />
                </li>
                <li className="flex items-center gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-50/40 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
                  <CheckCircle2
                    className="size-7 shrink-0 text-emerald-600 dark:text-emerald-400"
                    aria-hidden
                  />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground line-through">
                      <Localized>{t("messages.confirmTheReservation")}</Localized>
                    </h3>
                    <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                      <Localized>
                        {t("messages.doneOneLessThingOnYourMind")}
                      </Localized>
                    </p>
                  </div>
                </li>
              </ul>
              <div className="mt-5 border-t pt-4">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    <Localized>{t("messages.dailyProgress")}</Localized>
                  </span>
                  <span>
                    <Localized>{t("messages.1TaskOutOf3")}</Localized>
                  </span>
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
              <Localized>
                {t("messages.fromWhatNeedsDoingToWhatIsDone")}
              </Localized>
            </h2>
            <div className="mt-8 grid gap-7 md:grid-cols-3">
              {[
                [
                  "01",
                  t("messages.addYourTasks"),
                  t(
                    "messages.addADueDatePriorityAndUsefulContextOr",
                  ),
                ],
                [
                  "02",
                  t("messages.findYourFocus"),
                  t(
                    "messages.openYourDailyPageToSeeWhatNeedsYour",
                  ),
                ],
                [
                  "03",
                  t("messages.progressThenConfirm"),
                  t(
                    "messages.receiveYourChosenRemindersFinishTasksAndKeepYour",
                  ),
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
              <Localized>{t("messages.alreadyInYourWorkspace")}</Localized>
            </p>
            <h2
              id="features-title"
              className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              <Localized>{t("messages.aBetterOrganizedDay")}</Localized>
              <br />
              <Localized>{t("messages.withoutReinventingEverything")}</Localized>
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              <Localized>
                {t(
                  "messages.fromYourFirstReminderToMonthlyRoutinesEverythingYou",
                )}
              </Localized>
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
                    <Localized>{feature.title}</Localized>
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    <Localized>{feature.body}</Localized>
                  </p>
                  <p className="mt-6 border-t pt-4 text-xs font-medium text-muted-foreground">
                    <Localized>{feature.detail}</Localized>
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
                <Localized>{t("messages.remindersThatFollow")}</Localized>
                <br />
                <Localized>{t("messages.yourPreferences")}</Localized>
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                <Localized>
                  {t(
                    "messages.chooseYourChannelsProtectYourRestTimeAndPause",
                  )}
                </Localized>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                <Localized>
                  {t(
                    "messages.aMorningSummaryAt730RemindersBasedOn",
                  )}
                </Localized>
              </p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Mail, label: "auth.email" },
                  { icon: MessageSquare, label: "SMS" },
                  { icon: MessageCircle, label: "messages.whatsapp" },
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
                    <span className="text-sm font-medium">
                      <Localized>{channel.label}</Localized>
                    </span>
                  </Reveal>
                ))}
              </div>
              <div className="rounded-xl border bg-background/80 p-4">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <Moon className="size-4 text-muted-foreground" aria-hidden />
                  <Localized>{t("messages.youStayInControl")}</Localized>
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  <Localized>
                    {t(
                      "messages.quietHoursTimeZoneTemporaryPausesAndChannelActivation",
                    )}
                  </Localized>
                </p>
              </div>
              <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
                <Localized>
                  {t(
                    "messages.youCanDisableRemindersAtAnyTimePushNotifications",
                  )}
                </Localized>
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
                <Localized>{t("messages.whatComesNext")}</Localized>
              </p>
              <h2
                id="roadmap-title"
                className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
              >
                <Localized>{t("messages.lessTyping")}</Localized>
                <br />
                <Localized>{t("messages.moreHelpDeciding")}</Localized>
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              <Localized>
                {t(
                  "messages.theseChangesArePlannedInTheRoadmapTheyAre",
                )}
              </Localized>
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
                  <Localized>{item.label}</Localized>
                </p>
                <h3 className="mt-2 text-lg font-semibold">
                  <Localized>{item.title}</Localized>
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  <Localized>{item.body}</Localized>
                </p>
              </Reveal>
            ))}
          </div>
          <p className="mt-5 flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
            <Localized>
              {t(
                "messages.thePrincipleStaysTheSameReviewSuggestionsBeforeCreating",
              )}
            </Localized>
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
                <Localized>
                  {t("messages.yourNextStepCanBeSimple")}
                </Localized>
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-primary-foreground/80">
                <Localized>
                  {t(
                    "messages.createYourSpaceAddAFirstTaskAndLet",
                  )}
                </Localized>
              </p>
            </div>
            <Button size="lg" variant="secondary" asChild>
              <Link href={startUrl} className="group">
                {isAuthed ? t("messages.backToMyDay") : t("messages.createMySpace")}
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
            <Localized>{"messages.myDailyPage"}</Localized>{" "}
            <span className="ml-2 text-xs">
              <Localized>{t("messages.onePageOneDay")}</Localized>
            </span>
          </p>
          <nav
            aria-label="Navigation de pied de page"
            className="flex flex-wrap gap-5"
          >
            <Link href="#fonctionnalites" className="hover:text-foreground">
              <Localized>{t("messages.features")}</Localized>
            </Link>
            <Link href="#avenir" className="hover:text-foreground">
              <Localized>{t("messages.comingNext")}</Localized>
            </Link>
            <Link
              href={isAuthed ? "/dashboard/today" : "/auth/signin"}
              className="hover:text-foreground"
            >
              {isAuthed ? t("messages.myDay") : t("auth.signIn")}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
