"use client";

import { ActivationLabel } from "@/components/ui/activation-label";
import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import {
  FileStack,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useTaskTemplates,
  useTemplateSuggestionConfig,
  useSaveTaskTemplate,
  useDeleteTaskTemplate,
  suggestTemplate,
  templateInputSchema,
  type TaskTemplate,
  type TemplateInput,
} from "@/hooks/use-task-templates";
import { TemplateItemsEditor } from "./template-items-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { FeedbackState } from "@/components/ui/feedback-state";
import { Skeleton } from "@/components/ui/skeleton";
import { showQuerySkeleton } from "@/lib/query-skeleton";
import { getApiErrorMessage } from "@/lib/api-error";

export function TemplatesScreen() {
  const query = useTaskTemplates();
  const save = useSaveTaskTemplate();
  const remove = useDeleteTaskTemplate();
  const [editing, setEditing] = useState<TaskTemplate | null>();
  const [deleting, setDeleting] = useState<TaskTemplate>();
  const toggle = async (template: TaskTemplate) => {
    try {
      await save.mutateAsync({
        id: template.id,
        input: { ...template, enabled: !template.enabled },
      });
      toast.success("Modèle mis à jour");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Impossible de modifier le modèle"),
      );
    }
  };
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Modèles de tâches</h1>
          <p className="text-sm text-muted-foreground">
            Prépare tes listes réutilisables, puis planifie-les depuis la{" "}
            <Link href="/dashboard/today" className="underline">
              Page du jour
            </Link>
            .
          </p>
        </div>
        <Button onClick={() => setEditing(null)}>
          <Plus />
          Nouveau modèle
        </Button>
      </div>
      {showQuerySkeleton(query) ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : query.isError ? (
        <FeedbackState
          variant="error"
          description="Impossible de charger tes modèles."
        >
          <Button onClick={() => void query.refetch()}>Réessayer</Button>
        </FeedbackState>
      ) : !query.data?.length ? (
        <FeedbackState
          icon={FileStack}
          description="Aucun modèle pour l’instant. Crée une liste réutilisable adaptée à tes besoins."
        >
          <Button onClick={() => setEditing(null)}>
            <Plus />
            Créer un modèle
          </Button>
        </FeedbackState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {query.data.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
                <CardDescription className="whitespace-pre-wrap break-words">
                  {template.description || "Liste réutilisable"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {template.items.filter((i) => i.enabled).length} /{" "}
                  {template.items.length} tâches activées
                </p>
                <div className="flex items-center justify-between gap-2">
                  <Button
                    role="switch"
                    aria-label={`Activer le modèle ${template.name}`}
                    aria-checked={template.enabled}
                    variant={template.enabled ? "default" : "outline"}
                    disabled={save.isPending}
                    onClick={() => void toggle(template)}
                  >
                    <ActivationLabel enabled={template.enabled} />
                  </Button>
                  <div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Modifier ${template.name}`}
                      onClick={() => setEditing(template)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Supprimer ${template.name}`}
                      onClick={() => setDeleting(template)}
                    >
                      <Trash2 className="text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {editing !== undefined && (
        <TemplateForm
          key={editing?.id ?? "new"}
          template={editing}
          onClose={() => setEditing(undefined)}
        />
      )}
      <Dialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open && !remove.isPending) setDeleting(undefined);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le modèle</DialogTitle>
            <DialogDescription>
              Supprimer « {deleting?.name} » ? Les tâches déjà créées seront
              conservées.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={remove.isPending}
              onClick={() => setDeleting(undefined)}
            >
              <Undo2 />
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={async () => {
                if (!deleting) return;
                try {
                  await remove.mutateAsync(deleting.id);
                  setDeleting(undefined);
                  toast.success("Modèle supprimé");
                } catch (error) {
                  toast.error(
                    getApiErrorMessage(
                      error,
                      "Impossible de supprimer le modèle",
                    ),
                  );
                }
              }}
            >
              <Trash2 />
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
function TemplateForm({
  template,
  onClose,
}: {
  template: TaskTemplate | null;
  onClose: () => void;
}) {
  const [value, setValue] = useState<TemplateInput>(
    template ?? { name: "", description: "", enabled: true, items: [] },
  );
  const [error, setError] = useState<string>();
  const save = useSaveTaskTemplate();
  const suggestion = useMutation({
    mutationFn: (mode: "guided" | "ai") =>
      suggestTemplate(value.name.trim(), value.description, mode),
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "Impossible de proposer des tâches"),
      ),
  });
  const aiConfig = useTemplateSuggestionConfig();
  const busy = save.isPending || suggestion.isPending;
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <DialogContent
        className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {template ? "Modifier le modèle" : "Nouveau modèle"}
          </DialogTitle>
          <DialogDescription>
            Décris ton objectif, propose des étapes puis ajuste-les avant
            d’enregistrer. Les suggestions guidées fonctionnent sans IA ni
            transmission externe.
          </DialogDescription>
        </DialogHeader>
        <label className="space-y-1 text-sm">
          Nom
          <Input
            value={value.name}
            maxLength={120}
            disabled={busy}
            onChange={(e) => setValue({ ...value, name: e.target.value })}
          />
        </label>
        <label className="space-y-1 text-sm">
          Objectif / description
          <Textarea
            value={value.description}
            maxLength={2000}
            disabled={busy}
            onChange={(e) =>
              setValue({ ...value, description: e.target.value })
            }
          />
        </label>
        <Button
          variant="outline"
          disabled={busy || !value.name.trim()}
          onClick={() => suggestion.mutate("guided")}
        >
          <Sparkles />
          {suggestion.isPending ? "Préparation…" : "Suggestions guidées"}
        </Button>
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            disabled={busy || !value.name.trim() || !aiConfig.data?.aiEnabled}
            onClick={() => suggestion.mutate("ai")}
          >
            <Sparkles />
            Suggérer avec l’IA
          </Button>
          <p className="text-xs text-muted-foreground">
            {aiConfig.isPending
              ? "Vérification de la disponibilité de l’IA…"
              : aiConfig.isError
                ? "IA indisponible. Les suggestions guidées restent accessibles."
                : aiConfig.data?.aiEnabled
                  ? "Ce bouton transmet uniquement le nom et la description à OpenAI pour proposer des étapes. Vérifie les suggestions avant de les ajouter."
                  : "L’IA peut être activée par l’administrateur. Les suggestions guidées restent disponibles sans configuration."}
          </p>
        </div>
        {suggestion.data && (
          <div className="space-y-3 rounded-lg border bg-muted/40 p-4">
            <p className="font-medium">
              Suggestions à valider (
              {suggestion.data.source === "openai" ? "IA" : "guidées"})
            </p>
            <ul className="list-inside list-disc text-sm">
              {suggestion.data.items.map((item, i) => (
                <li key={i}>{item.title}</li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">
              L’ajout conserve les tâches déjà saisies. Tu pourras modifier
              chaque suggestion.
            </p>
            <div className="flex gap-2">
              <Button
                disabled={
                  busy || value.items.length + suggestion.data.items.length > 20
                }
                onClick={() => {
                  setValue({
                    ...value,
                    items: [...value.items, ...suggestion.data!.items],
                  });
                  suggestion.reset();
                }}
              >
                Ajouter ces suggestions
              </Button>
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() => suggestion.reset()}
              >
                Ignorer
              </Button>
            </div>
          </div>
        )}
        <TemplateItemsEditor
          items={value.items}
          onChange={(items) => {
            setValue({ ...value, items });
            setError(undefined);
          }}
          disabled={busy}
        />
        <Button
          role="switch"
          aria-label="Modèle disponible dans Créer une liste datée"
          aria-checked={value.enabled}
          variant={value.enabled ? "default" : "outline"}
          disabled={busy}
          onClick={() => setValue({ ...value, enabled: !value.enabled })}
        >
          <ActivationLabel
            enabled={value.enabled}
            enabledLabel="Modèle activé"
            disabledLabel="Modèle désactivé"
          />
        </Button>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" disabled={busy} onClick={onClose}>
            <Undo2 />
            Annuler
          </Button>
          <Button
            disabled={busy}
            onClick={async () => {
              const parsed = templateInputSchema.safeParse(value);
              if (!parsed.success) {
                setError(parsed.error.issues[0].message);
                return;
              }
              try {
                await save.mutateAsync({
                  id: template?.id,
                  input: parsed.data,
                });
                toast.success("Modèle enregistré");
                onClose();
              } catch (error) {
                toast.error(
                  getApiErrorMessage(
                    error,
                    "Impossible d’enregistrer le modèle",
                  ),
                );
              }
            }}
          >
            <Save />
            {save.isPending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
