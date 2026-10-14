"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Users } from "lucide-react";
import AuthLayout from "@/components/layout/auth.layout";
import { Button } from "@/components/ui/button";
import { companionInviteKey } from "@/components/companion-screen";
export default function CompanionInvitePage() {
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
            "Invitation invalide. Demande un nouveau lien à la personne qui t’invite.",
          );
          return;
        }
        sessionStorage.setItem(companionInviteKey, token);
        window.history.replaceState(null, "", "/companion-invite");
        if (status === "authenticated")
          void router.replace("/dashboard/companion");
      } catch {
        setError(
          "Le stockage de session est indisponible. Autorise-le puis ouvre à nouveau le lien d’invitation.",
        );
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [status, router]);
  return (
    <AuthLayout>
      <section className="space-y-4 rounded-xl border bg-card p-6">
        <Users className="size-8" aria-hidden />
        <h1 className="text-2xl font-semibold">Une invitation de ton binôme</h1>
        <p className="text-sm text-muted-foreground">
          Connecte-toi avec le compte dont l’email a été choisi par la personne
          qui t’invite. Tu pourras examiner le partage proposé et accepter ou
          refuser. Aucun accord ni envoi n’est déclenché à l’ouverture du lien.
        </p>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : (
          <Button asChild>
            <Link href="/auth/signin?callbackUrl=%2Fdashboard%2Fcompanion">
              Me connecter pour voir l’invitation
            </Link>
          </Button>
        )}
      </section>
    </AuthLayout>
  );
}
