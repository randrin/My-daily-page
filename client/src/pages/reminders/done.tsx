"use client";

import { useLocale } from "@/i18n/provider";
import { useTranslator } from "@/i18n/provider";
import { Localized } from "@/i18n/provider";
import { FeedbackState } from "@/components/ui/feedback-state";
import { useState, type CSSProperties } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import {
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_HOST_SERVER ?? "http://localhost:3001",
});
const previewSchema = z.object({
  title: z.string(),
  deadline: z.string().nullable(),
  timezone: z.string(),
  completed: z.boolean(),
  archived: z.boolean(),
  blocked: z.boolean(),
});
const colors = ["#2563eb", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

export default function ReminderDonePage() {
  const { locale } = useLocale();
  const t = useTranslator();
  const router = useRouter();
  const token =
    typeof router.query.token === "string" ? router.query.token : "";
  const [celebrate, setCelebrate] = useState(false);
  const queryClient = useQueryClient();
  const preview = useQuery({
    queryKey: ["reminder-action", token],
    enabled: router.isReady && Boolean(token),
    retry: false,
    queryFn: async () => {
      const { data } = await http.get("/reminder-actions/preview", {
        params: { token },
      });
      return previewSchema.parse(data);
    },
  });
  const complete = useMutation({
    mutationFn: async () => {
      const { data } = await http.post("/reminder-actions/done", { token });
      return z.object({ completed: z.literal(true) }).parse(data);
    },
    onSuccess: () => {
      setCelebrate(true);
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      void queryClient.invalidateQueries({ queryKey: ["reminder-history"] });
    },
  });
  const done = complete.isSuccess || preview.data?.completed;
  const unavailable = preview.data?.archived || preview.data?.blocked;
  return (
    <>
      <Head>
        <title>
          <Localized>{t("messages.confirmMyTaskMyDailyPage")}</Localized>
        </title>
        <meta name="referrer" content="no-referrer" />
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      {celebrate ? (
        <div
          aria-hidden="true"
          data-testid="completion-confetti"
          className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
        >
          {Array.from({ length: 48 }, (_, index) => (
            <span
              key={index}
              className="confetti-piece absolute top-[-20px] h-3 w-2 rounded-sm"
              style={
                {
                  left: `${(index * 37) % 100}%`,
                  background: colors[index % colors.length],
                  animationDelay: `${(index % 8) * 0.08}s`,
                  "--drift": `${(index % 2 ? 1 : -1) * (50 + index * 3)}px`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      ) : null}
      <main className="flex min-h-svh items-center justify-center bg-muted/40 px-4 py-12">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader className="items-center text-center">
            <span
              className={`mb-3 flex size-16 items-center justify-center rounded-full ${done ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-primary/10 text-primary"}`}
            >
              {done ? (
                <CheckCircle2 className="size-8" />
              ) : (
                <ClipboardCheck className="size-8" />
              )}
            </span>
            <CardTitle className="text-2xl">
              {done
                ? t("messages.oneLessTask")
                : t("messages.haveYouCompletedThisTask")}
            </CardTitle>
            <CardDescription>
              {done
                ? t(
                    "messages.yourTaskIsCompleteItsUpcomingRemindersAreCancelled",
                  )
                : t(
                    "messages.confirmOnlyWhenFinishedYouCanAlsoReturnTo",
                  )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!router.isReady || (token && preview.isPending) ? (
              <Skeleton className="h-24 w-full" />
            ) : preview.isError || !token ? (
              <FeedbackState
                variant="error"
                description={t(
                  "messages.thisLinkIsInvalidExpiredOrTheTaskIs",
                )}
              />
            ) : preview.data ? (
              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="break-words font-semibold">
                  {preview.data.title}
                </p>
                {preview.data.deadline ? (
                  <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                    <CalendarClock className="mt-0.5 size-4 shrink-0" />
                    {new Date(preview.data.deadline).toLocaleString(
                      locale === "en" ? "en-US" : "fr-FR",
                      {
                        timeZone: preview.data.timezone,
                        dateStyle: "long",
                        timeStyle: "short",
                      },
                    )}{" "}
                    ({preview.data.timezone})
                  </p>
                ) : null}
              </div>
            ) : null}
            {!done && unavailable ? (
              <FeedbackState
                variant="error"
                description={
                  preview.data?.archived
                    ? t("messages.thisTaskIsArchived")
                    : t("messages.completeItsBlockingTasksFirst")
                }
              />
            ) : null}
            {complete.isError ? (
              <FeedbackState
                variant="error"
                description={t(
                  "messages.unableToCompleteTaskCheckItsBlockersOrTry",
                )}
              />
            ) : null}
            <div className="flex flex-col gap-3">
              {!done && preview.data && !unavailable ? (
                <Button
                  size="lg"
                  disabled={complete.isPending}
                  onClick={() => complete.mutate()}
                >
                  {complete.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <Localized>{t("messages.confirming")}</Localized>
                    </>
                  ) : (
                    "Oui, j’ai fait"
                  )}
                </Button>
              ) : null}
              <Button variant={done ? "default" : "outline"} asChild>
                <Link href="/dashboard/tasks">
                  {done ? t("messages.viewMyTasks") : t("messages.backToMyTasks")}
                </Link>
              </Button>
            </div>
            {done ? (
              <p
                role="status"
                className="text-center text-sm text-emerald-700 dark:text-emerald-300"
              >
                <Localized>
                  {t("messages.savedYouCanCloseThisPage")}
                </Localized>
              </p>
            ) : null}
          </CardContent>
        </Card>
      </main>
      <style jsx>{`
        .confetti-piece {
          animation: confetti-fall 2.8s ease-out both;
        }
        @keyframes confetti-fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(var(--drift), 100vh) rotate(720deg);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .confetti-piece {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
