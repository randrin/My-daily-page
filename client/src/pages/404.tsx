"use client";

import Head from "next/head";
import Link from "next/link";
import { ArrowLeft, House, Map } from "lucide-react";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { FeedbackState } from "@/components/ui/feedback-state";

export default function NotFoundPage({
  standalone = true,
}: {
  standalone?: boolean;
}) {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-background text-foreground">
      {standalone && (
        <Head>
          <title>Page introuvable — My Daily Page</title>
          <meta name="robots" content="noindex" />
        </Head>
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,oklch(0.92_0.04_85),transparent_55%),radial-gradient(ellipse_at_top_right,oklch(0.9_0.05_220),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top_left,oklch(0.28_0.04_85),transparent_55%),radial-gradient(ellipse_at_top_right,oklch(0.24_0.05_220),transparent_50%)]"
      />
      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 py-5 sm:px-6">
        <Brand />
        <ThemeToggle />
      </header>
      <main className="relative flex flex-1 items-center justify-center px-5 py-12">
        <section
          aria-labelledby="not-found-title"
          className="w-full max-w-lg rounded-3xl border bg-card/90 p-6 text-center shadow-xl shadow-foreground/5 backdrop-blur-sm sm:p-10"
        >
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Erreur 404
          </p>
          <FeedbackState
            icon={Map}
            title="Cette page a perdu son chemin"
            className="px-0 py-0 [&>svg]:size-12 [&>svg]:text-teal-700 dark:[&>svg]:text-teal-300"
            description="Cette page n’existe pas ou n’est pas accessible. Retrouvons le bon chemin pour poursuivre ta journée."
          >
            <Button asChild>
              <Link href="/">
                <House aria-hidden />
                Retour à l’accueil
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (window.history.length > 1) window.history.back();
                else window.location.assign("/");
              }}
            >
              <ArrowLeft aria-hidden />
              Page précédente
            </Button>
          </FeedbackState>
          <h1 id="not-found-title" className="sr-only">
            Page introuvable
          </h1>
        </section>
      </main>
      <footer className="relative px-5 pb-6 text-center text-xs text-muted-foreground">
        My Daily Page · Une page. Une journée.
      </footer>
    </div>
  );
}
