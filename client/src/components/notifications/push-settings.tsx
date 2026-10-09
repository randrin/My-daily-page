"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BellRing, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { apiClient } from "@/api/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedbackState } from "@/components/ui/feedback-state";
import { getApiErrorMessage } from "@/lib/api-error";

async function deviceSubscription() {
  if (
    typeof window === "undefined" ||
    !window.isSecureContext ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  )
    return { supported: false, subscribed: false };
  const registration = await navigator.serviceWorker.getRegistration("/");
  return {
    supported: true,
    subscribed: Boolean(await registration?.pushManager.getSubscription()),
  };
}
export function PushSettings() {
  const client = useQueryClient();
  const config = useQuery({
    queryKey: ["push-config"],
    queryFn: async () =>
      z
        .object({ publicKey: z.string().nullable() })
        .parse((await apiClient.get("/notifications/push/config")).data),
  });
  const device = useQuery({
    queryKey: ["push-device"],
    queryFn: deviceSubscription,
  });
  const mutation = useMutation({
    mutationFn: async (enable: boolean) => {
      if (!enable) {
        const registration = await navigator.serviceWorker.getRegistration("/");
        const subscription = await registration?.pushManager.getSubscription();
        if (subscription) {
          await apiClient.post("/notifications/push/unsubscribe", {
            endpoint: subscription.endpoint,
          });
          await subscription.unsubscribe();
        }
        return;
      }
      if (!config.data?.publicKey)
        throw new Error("Les notifications push ne sont pas configurées.");
      const permission = await Notification.requestPermission();
      if (permission !== "granted")
        throw new Error(
          "Autorise les notifications dans les réglages de ton navigateur.",
        );
      await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      const registration = await navigator.serviceWorker.ready;
      const encoded = config.data.publicKey
        .replace(/-/g, "+")
        .replace(/_/g, "/");
      const key = Uint8Array.from(
        atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, "=")),
        (char) => char.charCodeAt(0),
      );
      let subscription = await registration.pushManager.getSubscription();
      const created = !subscription;
      subscription ??= await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: key,
      });
      try {
        await apiClient.post(
          "/notifications/push/subscribe",
          subscription.toJSON(),
        );
      } catch (error) {
        if (created) await subscription.unsubscribe();
        throw error;
      }
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["push-device"] });
      void client.invalidateQueries({ queryKey: ["notification-preferences"] });
      toast.success("Réglage de cet appareil enregistré");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(
          error,
          "Impossible de modifier les notifications push",
        ),
      ),
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="size-5" aria-hidden />
          Notifications sur cet appareil
        </CardTitle>
        <CardDescription>
          Reçois les rappels même lorsque la page est fermée. Les rappels
          globaux et le canal Push doivent rester activés.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {config.isPending || device.isPending ? (
          <Skeleton className="h-10 w-full" />
        ) : config.isError || device.isError ? (
          <FeedbackState
            variant="error"
            description="Impossible de charger le canal push."
          >
            <Button
              variant="outline"
              onClick={() => {
                void config.refetch();
                void device.refetch();
              }}
            >
              Réessayer
            </Button>
          </FeedbackState>
        ) : !device.data?.supported ? (
          <FeedbackState
            icon={BellRing}
            description="Le push nécessite un navigateur compatible et HTTPS (ou localhost). Sur iPhone/iPad, ajoute d’abord l’application à l’écran d’accueil."
          />
        ) : (
          <>
            {!config.data?.publicKey && (
              <p className="text-sm text-muted-foreground">
                Le serveur doit être configuré avec ses clés VAPID avant
                l’activation.
              </p>
            )}
            <Button
              variant={device.data.subscribed ? "outline" : "default"}
              disabled={
                mutation.isPending ||
                (!config.data?.publicKey && !device.data.subscribed)
              }
              onClick={() => mutation.mutate(!device.data.subscribed)}
            >
              <BellRing aria-hidden />
              {mutation.isPending
                ? "Enregistrement…"
                : device.data.subscribed
                  ? "Désactiver sur cet appareil"
                  : "Activer sur cet appareil"}
            </Button>
          </>
        )}
        <p className="text-xs text-muted-foreground">
          La désactivation concerne uniquement cet appareil. Tu peux aussi
          couper le canal Push pour tous tes appareils. Installation : utilise «
          Installer l’application » ou « Ajouter à l’écran d’accueil » dans le
          menu du navigateur.
        </p>
      </CardContent>
    </Card>
  );
}
