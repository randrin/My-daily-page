"use client";
import { useTranslator } from "@/i18n/provider";
import { Localized } from "@/i18n/provider";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Users } from "lucide-react";
import AuthLayout from "@/components/layout/auth.layout";
import { Button } from "@/components/ui/button";
import { companionInviteKey } from "@/components/companion-screen";
export default function CompanionInvitePage() {
  const t = useTranslator();
  const { status } = useSession(),
    router = useRouter();
  const [error, setError] = useState("");
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const token =
          window.location.hash.slice(1) ||
          sessionStorage.getItem(companionInviteKey);
        if (!token || !/^[a-f0-9]{64}$/.test(token)) {
          setError(
            t(
              "messages.invalidInvitationAskTheSenderForANewLink",
            ),
          );
          return;
        }
        sessionStorage.setItem(companionInviteKey, token);
        window.history.replaceState(null, "", "/companion-invite");
        if (status === "authenticated")
          void router.replace("/dashboard/companion");
      } catch {
        setError(
          t(
            "messages.sessionStorageIsUnavailableEnableItAndReopenThe",
          ),
        );
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [status, router]);
  return (
    <AuthLayout>
      <section className="space-y-4 rounded-xl border bg-card p-6">
        <Users className="size-8" aria-hidden />
        <h1 className="text-2xl font-semibold">
          <Localized>{t("messages.anInvitationFromYourPartner")}</Localized>
        </h1>
        <p className="text-sm text-muted-foreground">
          <Localized>
            {t(
              "messages.signInUsingTheEmailChosenByThePerson",
            )}
          </Localized>
        </p>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            <Localized>{error}</Localized>
          </p>
        ) : (
          <Button asChild>
            <Link href="/auth/signin?callbackUrl=%2Fdashboard%2Fcompanion">
              <Localized>{t("messages.signInToViewInvitation")}</Localized>
            </Link>
          </Button>
        )}
      </section>
    </AuthLayout>
  );
}
