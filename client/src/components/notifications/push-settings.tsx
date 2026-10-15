"use client";

import { useTranslator } from "@/i18n/provider";
import { Localized } from "@/i18n/provider";
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
  const t = useTranslator();
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
        throw new Error(t("messages.pushNotificationsAreNotConfigured"));
      const permission = await Notification.requestPermission();
      if (permission !== "granted")
        throw new Error(
          t("messages.allowNotificationsInYourBrowserSettings"),
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
      toast.success(t("messages.deviceSettingSaved"));
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
          <Localized>{t("messages.notificationsOnThisDevice")}</Localized>
        </CardTitle>
        <CardDescription>
          <Localized>
            {t(
              "messages.receiveRemindersEvenWhenThePageIsClosedGeneral",
            )}
          </Localized>
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
              <Localized>{t("common.retry")}</Localized>
            </Button>
          </FeedbackState>
        ) : !device.data?.supported ? (
          <FeedbackState
            icon={BellRing}
            description={t(
              "messages.pushRequiresACompatibleBrowserAndHttpsOrLocalhost",
            )}
          />
        ) : (
          <>
            {!config.data?.publicKey && (
              <p className="text-sm text-muted-foreground">
                <Localized>
                  {t(
                    "messages.theServerMustHaveVapidKeysConfiguredBeforeActivation",
                  )}
                </Localized>
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
                  ? t("messages.disableOnThisDevice")
                  : t("messages.enableOnThisDevice")}
            </Button>
          </>
        )}
        <p className="text-xs text-muted-foreground">
          <Localized>
            {t(
              "messages.disablingAppliesOnlyToThisDeviceYouCanAlso",
            )}
          </Localized>
        </p>
      </CardContent>
    </Card>
  );
}
