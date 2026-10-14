"use client";
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
      toast.success("Rôle modifié. Les sessions du compte ont été révoquées.");
      await cache.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Modification du rôle impossible"));
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
        Rôle
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
            <DialogTitle>Modifier les droits</DialogTitle>
            <DialogDescription>
              {user.email} · Action auditée. La modification révoque les
              sessions du compte concerné. Le rôle support permet uniquement la
              lecture de l’administration.
            </DialogDescription>
          </DialogHeader>
          {!me.data.mfaEnabled ? (
            <p className="text-sm">
              Active d’abord ta MFA dans{" "}
              <Link href="/dashboard/settings" className="underline">
                Paramètres → Sécurité et MFA
              </Link>
              .
            </p>
          ) : (
            <div className="space-y-4">
              <label className="block space-y-2 text-sm">
                Rôle
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
                    <SelectItem value="user">Utilisateur</SelectItem>
                    <SelectItem value="support">
                      Support — lecture seule
                    </SelectItem>
                    <SelectItem value="admin" disabled={!user.mfaEnabled}>
                      Administrateur{" "}
                      {user.mfaEnabled ? "" : "— MFA cible requise"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </label>
              {!user.mfaEnabled && (
                <p className="text-xs text-muted-foreground">
                  Le compte cible doit activer sa MFA avant une promotion
                  administrateur.
                </p>
              )}
              <label
                htmlFor={`role-password-${user.id}`}
                className={errors.password ? "text-destructive" : ""}
              >
                Ton mot de passe
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
                Ton second facteur
              </label>
              <Input
                id={`role-code-${user.id}`}
                autoComplete="one-time-code"
                placeholder="Code d’authentification ou de récupération"
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
              Annuler
            </Button>
            <Button
              disabled={
                mutation.isPending || !me.data.mfaEnabled || role === user.role
              }
              onClick={save}
            >
              {mutation.isPending ? "Vérification…" : "Confirmer le changement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
