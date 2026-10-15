"use client";
import { useTranslator } from "@/i18n/provider";
import { Localized } from "@/i18n/provider";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserRoundCheck, UserRoundX } from "lucide-react";
import { toast } from "sonner";
import { accountStatusSchema, changeAdminAccountStatus } from "@/api/admin";
import { useMe } from "@/hooks/use-profile";
import { getApiErrorMessage } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
export function AdminAccountAction({
  user,
}: {
  user: { id: string; email: string; suspendedAt: string | null };
}) {
  const t = useTranslator();
  const me = useMe(),
    cache = useQueryClient();
  const [open, setOpen] = useState(false),
    [reason, setReason] = useState(""),
    [error, setError] = useState("");
  const suspended = !!user.suspendedAt;
  const action = useMutation({
    mutationFn: (input: ReturnType<typeof accountStatusSchema.parse>) =>
      changeAdminAccountStatus(user.id, input),
    onSuccess: async () => {
      toast.success(suspended ? t("messages.accountReactivated") : t("messages.accountSuspended"));
      setOpen(false);
      await cache.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (failure) =>
      toast.error(
        getApiErrorMessage(failure, "Impossible de modifier ce compte"),
      ),
  });
  function submit() {
    const result = accountStatusSchema.safeParse({
      suspended: !suspended,
      reason: reason || undefined,
    });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    action.mutate(result.data);
  }
  if (me.data?.role !== "admin") return null;
  return (
    <>
      <Button
        size="sm"
        variant="outline"
        disabled={!me.data || me.data.id === user.id}
        onClick={() => {
          setReason("");
          setError("");
          setOpen(true);
        }}
      >
        {suspended ? (
          <UserRoundCheck aria-hidden />
        ) : (
          <UserRoundX aria-hidden />
        )}
        {suspended ? t("messages.reactivate") : t("messages.suspend")}
      </Button>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!action.isPending) setOpen(value);
        }}
      >
        <DialogContent onInteractOutside={(event) => event.preventDefault()}>
          <DialogHeader>
            <DialogTitle>
              {suspended ? t("messages.reactivateAccount") : t("messages.suspendAccount")}
            </DialogTitle>
            <DialogDescription>
              {user.email} ·{" "}
              {suspended
                ? t(
                    "messages.aNewSignInIsRequiredFutureRemindersResume",
                  )
                : t(
                    "messages.sessionsWillBeRevokedSignInsRefusedAndReminders",
                  )}
            </DialogDescription>
          </DialogHeader>
          {!suspended && (
            <div className="space-y-2">
              <label
                htmlFor={`suspend-reason-${user.id}`}
                className={error ? "text-destructive" : ""}
              >
                <Localized>{t("messages.reason")}</Localized>
              </label>
              <Select
                value={reason}
                disabled={action.isPending}
                onValueChange={(value) => {
                  setReason(value);
                  setError("");
                }}
              >
                <SelectTrigger
                  id={`suspend-reason-${user.id}`}
                  className="w-full"
                  aria-invalid={!!error}
                >
                  <SelectValue placeholder="Choisir un motif" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="security">
                    <Localized>{t("messages.accountSecurity")}</Localized>
                  </SelectItem>
                  <SelectItem value="abuse">
                    <Localized>{t("messages.abuse")}</Localized>
                  </SelectItem>
                  <SelectItem value="user_request">
                    <Localized>{t("messages.userRequest")}</Localized>
                  </SelectItem>
                  <SelectItem value="other">
                    <Localized>{t("messages.other")}</Localized>
                  </SelectItem>
                </SelectContent>
              </Select>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  <Localized>{error}</Localized>
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              disabled={action.isPending}
              onClick={() => setOpen(false)}
            >
              <Localized>{t("common.cancel")}</Localized>
            </Button>
            <Button
              variant={suspended ? "default" : "destructive"}
              disabled={action.isPending}
              onClick={submit}
            >
              {action.isPending
                ? "Enregistrement…"
                : suspended
                  ? t("messages.confirmReactivation")
                  : t("messages.confirmSuspension")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
