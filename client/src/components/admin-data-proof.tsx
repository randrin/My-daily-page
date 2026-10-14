"use client";
import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { ShieldCheck, Undo2, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { dataProofSchema, type DataProof } from "@/api/admin-data";
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
export type DataAction = {
  title: string;
  description: string;
  destructive?: boolean;
  execute: (proof: DataProof) => Promise<void>;
};
export function AdminDataProof({
  action,
  onClose,
  onSuccess,
}: {
  action: DataAction;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}) {
  const me = useMe();
  const [password, setPassword] = useState(""),
    [code, setCode] = useState(""),
    [confirmation, setConfirmation] = useState(""),
    [errors, setErrors] = useState<Record<string, string>>({});
  const mutation = useMutation({
    mutationFn: action.execute,
    onSuccess: async () => {
      setPassword("");
      setCode("");
      toast.success("Opération enregistrée dans le journal d’audit");
      await onSuccess();
      onClose();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Opération impossible"));
      setCode("");
    },
  });
  function validate(field?: string) {
    const parsed = dataProofSchema.safeParse({ password, code });
    const next: Record<string, string> = parsed.success
      ? {}
      : Object.fromEntries(
          parsed.error.issues.map((issue) => [
            String(issue.path[0]),
            issue.message,
          ]),
        );
    if (action.destructive && confirmation !== "PURGER")
      next.confirmation = "Saisis PURGER pour confirmer";
    setErrors((current) =>
      field ? { ...current, [field]: next[field] ?? "" } : next,
    );
    return !Object.keys(next).length;
  }
  return (
    <Dialog
      open
      onOpenChange={(value) => {
        if (!value && !mutation.isPending) onClose();
      }}
    >
      <DialogContent
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => {
          if (mutation.isPending) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5" aria-hidden />
            {action.title}
          </DialogTitle>
          <DialogDescription>{action.description}</DialogDescription>
        </DialogHeader>
        {!me.data?.mfaEnabled ? (
          <p className="text-sm">
            Active d’abord ta MFA dans{" "}
            <Link href="/dashboard/settings" className="underline">
              Paramètres → Sécurité et MFA
            </Link>
            .
          </p>
        ) : (
          <form
            id="admin-data-proof"
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (validate()) mutation.mutate({ password, code: code.trim() });
            }}
          >
            <div className="space-y-2">
              <label
                htmlFor="data-password"
                className={errors.password ? "text-destructive" : ""}
              >
                Mot de passe actuel
              </label>
              <InputPassword
                id="data-password"
                autoComplete="current-password"
                placeholder="Ton mot de passe actuel"
                value={password}
                disabled={mutation.isPending}
                aria-invalid={!!errors.password}
                aria-describedby="data-password-error"
                onBlur={() => validate("password")}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setErrors((current) => ({ ...current, password: "" }));
                }}
              />
              {errors.password && (
                <p
                  id="data-password-error"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {errors.password}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label
                htmlFor="data-code"
                className={errors.code ? "text-destructive" : ""}
              >
                Code d’authentification ou de récupération
              </label>
              <Input
                id="data-code"
                autoComplete="one-time-code"
                placeholder="Code à 6 chiffres ou code de récupération"
                value={code}
                maxLength={64}
                disabled={mutation.isPending}
                aria-invalid={!!errors.code}
                aria-describedby="data-code-error"
                onBlur={() => validate("code")}
                onChange={(event) => {
                  setCode(event.target.value);
                  setErrors((current) => ({ ...current, code: "" }));
                }}
              />
              {errors.code && (
                <p
                  id="data-code-error"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {errors.code}
                </p>
              )}
            </div>
            {action.destructive && (
              <div className="space-y-2">
                <label
                  htmlFor="data-confirm"
                  className={errors.confirmation ? "text-destructive" : ""}
                >
                  Confirmation de suppression définitive
                </label>
                <Input
                  id="data-confirm"
                  placeholder="Saisis PURGER"
                  value={confirmation}
                  disabled={mutation.isPending}
                  aria-invalid={!!errors.confirmation}
                  aria-describedby="data-confirm-error"
                  onBlur={() => validate("confirmation")}
                  onChange={(event) => {
                    setConfirmation(event.target.value);
                    setErrors((current) => ({ ...current, confirmation: "" }));
                  }}
                />
                {errors.confirmation && (
                  <p
                    id="data-confirm-error"
                    role="alert"
                    className="text-sm text-destructive"
                  >
                    {errors.confirmation}
                  </p>
                )}
              </div>
            )}
          </form>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            <Undo2 aria-hidden />
            Annuler
          </Button>
          <Button
            form="admin-data-proof"
            type="submit"
            variant={action.destructive ? "destructive" : "default"}
            disabled={!me.data?.mfaEnabled || mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : action.destructive ? (
              <Trash2 aria-hidden />
            ) : (
              <ShieldCheck aria-hidden />
            )}
            {mutation.isPending ? "Traitement…" : "Confirmer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
