"use client";
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
      toast.success(suspended ? "Compte réactivé" : "Compte suspendu");
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
        {suspended ? "Réactiver" : "Suspendre"}
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
              {suspended ? "Réactiver le compte" : "Suspendre le compte"}
            </DialogTitle>
            <DialogDescription>
              {user.email} ·{" "}
              {suspended
                ? "Une nouvelle connexion sera nécessaire. Les rappels futurs reprendront selon les préférences ; les rappels expirés ne seront pas rattrapés."
                : "Les sessions seront révoquées, les connexions refusées et les rappels arrêtés. Les données et préférences seront conservées. Un message déjà envoyé ne peut pas être rappelé."}
            </DialogDescription>
          </DialogHeader>
          {!suspended && (
            <div className="space-y-2">
              <label
                htmlFor={`suspend-reason-${user.id}`}
                className={error ? "text-destructive" : ""}
              >
                Motif
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
                  <SelectItem value="security">Sécurité du compte</SelectItem>
                  <SelectItem value="abuse">Usage abusif</SelectItem>
                  <SelectItem value="user_request">
                    Demande de l’utilisateur
                  </SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
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
              Annuler
            </Button>
            <Button
              variant={suspended ? "default" : "destructive"}
              disabled={action.isPending}
              onClick={submit}
            >
              {action.isPending
                ? "Enregistrement…"
                : suspended
                  ? "Confirmer la réactivation"
                  : "Confirmer la suspension"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
