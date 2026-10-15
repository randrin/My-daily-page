"use client";
import { useTranslator } from "@/i18n/provider";
import { Localized } from "@/i18n/provider";
import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { apiClient } from "@/api/client";
import { useMe } from "@/hooks/use-profile";
import { getApiErrorMessage } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputPassword } from "@/components/ui/input-password";
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
const roleSchema = z.object({
  role: z.enum(["user", "support", "admin"]),
  password: z.string().min(8, "Au moins 8 caractères"),
  code: z.string().trim().min(6, "Le second facteur est requis").max(64),
});
export function AdminRoleAction({
  user,
}: {
  user: {
    id: string;
    email: string;
    role: "user" | "support" | "admin";
    mfaEnabled: boolean;
  };
}) {
  const t = useTranslator();
  const me = useMe(),
    cache = useQueryClient();
  const [open, setOpen] = useState(false),
    [role, setRole] = useState(user.role),
    [password, setPassword] = useState(""),
    [code, setCode] = useState(""),
    [errors, setErrors] = useState<Record<string, string>>({});
  const mutation = useMutation({
    mutationFn: async (input: z.infer<typeof roleSchema>) => {
      await apiClient.patch(`/admin/users/${user.id}/role`, input);
    },
    onSuccess: async () => {
      setOpen(false);
      setPassword("");
      setCode("");
      toast.success(
        t("messages.roleChangedTheAccountSSessionsHaveBeenRevoked"),
      );
      await cache.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, t("messages.unableToChangeRole")),
      );
      setCode("");
    },
  });
  function save() {
    const result = roleSchema.safeParse({ role, password, code });
    if (!result.success) {
      setErrors(
        Object.fromEntries(
          result.error.issues.map((issue) => [
            String(issue.path[0]),
            issue.message,
          ]),
        ),
      );
      return;
    }
    mutation.mutate(result.data);
  }
  if (me.data?.role !== "admin") return null;
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={me.data.id === user.id}
        onClick={() => {
          setRole(user.role);
          setPassword("");
          setCode("");
          setErrors({});
          setOpen(true);
        }}
      >
        <ShieldCheck />
        <Localized>{t("messages.role")}</Localized>
      </Button>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!mutation.isPending) {
            setOpen(value);
            if (!value) {
              setPassword("");
              setCode("");
            }
          }
        }}
      >
        <DialogContent onInteractOutside={(event) => event.preventDefault()}>
          <DialogHeader>
            <DialogTitle>
              <Localized>{t("messages.changePermissions")}</Localized>
            </DialogTitle>
            <DialogDescription>
              {user.email}{" "}
              <Localized>
                {t(
                  "messages.auditedActionChangesRevokeTheAffectedAccountSSessions",
                )}
              </Localized>
            </DialogDescription>
          </DialogHeader>
          {!me.data.mfaEnabled ? (
            <p className="text-sm">
              <Localized>{t("messages.firstEnableMfaIn")}</Localized>{" "}
              <Link href="/dashboard/settings" className="underline">
                <Localized>{t("messages.settingsSecurityAndMfa")}</Localized>
              </Link>
              .
            </p>
          ) : (
            <div className="space-y-4">
              <label className="block space-y-2 text-sm">
                <Localized>{t("messages.role")}</Localized>
                <Select
                  value={role}
                  disabled={mutation.isPending}
                  onValueChange={(value) =>
                    setRole(roleSchema.shape.role.parse(value))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      <Localized>{t("messages.user")}</Localized>
                    </SelectItem>
                    <SelectItem value="support">
                      <Localized>{t("messages.supportReadOnly")}</Localized>
                    </SelectItem>
                    <SelectItem value="admin" disabled={!user.mfaEnabled}>
                      <Localized>{t("messages.administrator")}</Localized>{" "}
                      {user.mfaEnabled ? "" : "— MFA cible requise"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </label>
              {!user.mfaEnabled && (
                <p className="text-xs text-muted-foreground">
                  <Localized>
                    {t(
                      "messages.theTargetAccountMustEnableMfaBeforePromotionTo",
                    )}
                  </Localized>
                </p>
              )}
              <label
                htmlFor={`role-password-${user.id}`}
                className={errors.password ? "text-destructive" : ""}
              >
                <Localized>{t("messages.yourPassword")}</Localized>
              </label>
              <InputPassword
                id={`role-password-${user.id}`}
                autoComplete="current-password"
                placeholder="Ton mot de passe actuel"
                disabled={mutation.isPending}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setErrors((current) => ({ ...current, password: "" }));
                }}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p role="alert" className="text-sm text-destructive">
                  {errors.password}
                </p>
              )}
              <label
                htmlFor={`role-code-${user.id}`}
                className={errors.code ? "text-destructive" : ""}
              >
                <Localized>{t("messages.yourSecondFactor")}</Localized>
              </label>
              <Input
                id={`role-code-${user.id}`}
                autoComplete="one-time-code"
                placeholder={t("messages.authenticationOrRecoveryCode")}
                value={code}
                disabled={mutation.isPending}
                onChange={(event) => {
                  setCode(event.target.value);
                  setErrors((current) => ({ ...current, code: "" }));
                }}
                aria-invalid={!!errors.code}
              />
              {errors.code && (
                <p role="alert" className="text-sm text-destructive">
                  {errors.code}
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              disabled={mutation.isPending}
              onClick={() => {
                setOpen(false);
                setPassword("");
                setCode("");
              }}
            >
              <Localized>{t("common.cancel")}</Localized>
            </Button>
            <Button
              disabled={
                mutation.isPending || !me.data.mfaEnabled || role === user.role
              }
              onClick={save}
            >
              {mutation.isPending
                ? t("messages.verifying")
                : "Confirmer le changement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
