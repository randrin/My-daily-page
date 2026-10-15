"use client";

import { useTranslator } from "@/i18n/provider";
import { Localized } from "@/i18n/provider";
import { PageTitle } from "@/components/ui/page-title";
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
  const t = useTranslator();
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
      toast.success(t("messages.templateUpdated"));
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, t("messages.unableToUpdateTemplate")),
      );
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <PageTitle icon={FileStack}>
            <Localized>{t("messages.taskTemplates")}</Localized>
          </PageTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            <Localized>
              {t(
                "messages.prepareReusableListsThenScheduleThemFrom",
              )}
            </Localized>{" "}
            <Link href="/dashboard/today" className="underline">
              <Localized>{t("navigation.today")}</Localized>
            </Link>
            .
          </p>
        </div>
        <Button onClick={() => setEditing(null)}>
          <Plus />
          <Localized>{t("messages.newTemplate")}</Localized>
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
          description={t("messages.unableToLoadYourTemplates")}
        >
          <Button onClick={() => void query.refetch()}>
            <Localized>{t("common.retry")}</Localized>
          </Button>
        </FeedbackState>
      ) : !query.data?.length ? (
        <FeedbackState
          icon={FileStack}
          description={t(
            "messages.noTemplatesYetCreateAReusableListForYour",
          )}
        >
          <Button onClick={() => setEditing(null)}>
            <Plus />
            <Localized>{t("messages.createTemplate")}</Localized>
          </Button>
        </FeedbackState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {query.data.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
                <CardDescription className="whitespace-pre-wrap break-words">
                  {template.description || t("messages.reusableList")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {template.items.filter((i) => i.enabled).length} /{" "}
                  {template.items.length}{" "}
                  <Localized>{t("messages.enabledTasks")}</Localized>
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
            <DialogTitle>
              <Localized>{t("messages.deleteTemplate")}</Localized>
            </DialogTitle>
            <DialogDescription>
              <Localized>{t("messages.delete")}</Localized>
              {deleting?.name}{" "}
              <Localized>
                {t("messages.existingTasksWillBeKept")}
              </Localized>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={remove.isPending}
              onClick={() => setDeleting(undefined)}
            >
              <Undo2 />
              <Localized>{t("common.cancel")}</Localized>
            </Button>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={async () => {
                if (!deleting) return;
                try {
                  await remove.mutateAsync(deleting.id);
                  setDeleting(undefined);
                  toast.success(t("messages.templateDeleted"));
                } catch (error) {
                  toast.error(
                    getApiErrorMessage(
                      error,
                      t("messages.unableToDeleteTemplate"),
                    ),
                  );
                }
              }}
            >
              <Trash2 />
              <Localized>{t("common.delete")}</Localized>
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
  const t = useTranslator();
  const [value, setValue] = useState<TemplateInput>(
    template ?? { name: "", description: "", enabled: true, items: [] },
  );
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const validation = templateInputSchema.safeParse(value);
  const errors: Record<string, string> = {};
  if (!validation.success) {
    for (const issue of validation.error.issues) {
      const path = issue.path.join(".");
      if ((submitted || touched[path]) && !errors[path])
        errors[path] = issue.message;
    }
  }
  const touch = (path: string) =>
    setTouched((previous) => ({ ...previous, [path]: true }));
  const save = useSaveTaskTemplate();
  const suggestion = useMutation({
    mutationFn: (mode: "guided" | "ai") =>
      suggestTemplate(value.name.trim(), value.description, mode),
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, t("messages.unableToSuggestTasks")),
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
            {template ? t("messages.editTemplate") : t("messages.newTemplate")}
          </DialogTitle>
          <DialogDescription>
            <Localized>
              {t(
                "messages.describeYourGoalSuggestStepsAndAdjustThemBefore",
              )}
            </Localized>
          </DialogDescription>
        </DialogHeader>
        <label className="space-y-1 text-sm">
          <span className={errors.name ? "text-destructive" : undefined}>
            <Localized>{t("auth.lastName")}</Localized>
          </span>
          <Input
            value={value.name}
            placeholder={t("messages.eGPrepareATrip")}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "template-name-error" : undefined}
            onBlur={() => touch("name")}
            maxLength={120}
            disabled={busy}
            onChange={(e) => setValue({ ...value, name: e.target.value })}
          />
          {errors.name && (
            <p
              id="template-name-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {errors.name}
            </p>
          )}
        </label>
        <label className="space-y-1 text-sm">
          <span className={errors.description ? "text-destructive" : undefined}>
            <Localized>{t("messages.goalDescription")}</Localized>
          </span>
          <Textarea
            value={value.description}
            placeholder={t(
              "messages.eGOrganizeBookingsDocumentsAndLuggageBeforeDeparture",
            )}
            aria-invalid={!!errors.description}
            aria-describedby={
              errors.description ? "template-description-error" : undefined
            }
            onBlur={() => touch("description")}
            maxLength={2000}
            disabled={busy}
            onChange={(e) =>
              setValue({ ...value, description: e.target.value })
            }
          />
          {errors.description && (
            <p
              id="template-description-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {errors.description}
            </p>
          )}
        </label>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              disabled={busy || !value.name.trim()}
              onClick={() => suggestion.mutate("guided")}
            >
              <Sparkles />
              {suggestion.isPending
                ? t("messages.preparing")
                : t("messages.guidedSuggestions")}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy || !value.name.trim() || !aiConfig.data?.aiEnabled}
              onClick={() => suggestion.mutate("ai")}
            >
              <Sparkles />
              <Localized>{t("messages.suggestWithAi")}</Localized>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {aiConfig.isPending
              ? t("messages.checkingAiAvailability")
              : aiConfig.isError
                ? t(
                    "messages.aiUnavailableGuidedSuggestionsAreStillAvailable",
                  )
                : aiConfig.data?.aiEnabled
                  ? t(
                      "messages.thisButtonSendsOnlyTheNameAndDescriptionTo",
                    )
                  : t(
                      "messages.anAdministratorCanEnableAiGuidedSuggestionsWorkWithout",
                    )}
          </p>
        </div>
        {suggestion.data && (
          <div className="space-y-3 rounded-lg border bg-muted/40 p-4">
            <p className="font-medium">
              <Localized>{t("messages.suggestionsToReview")}</Localized>
              {suggestion.data.source === "openai" ? "IA" : t("messages.guided")})
            </p>
            <ul className="list-inside list-disc text-sm">
              {suggestion.data.items.map((item, i) => (
                <li key={i}>{item.title}</li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">
              <Localized>
                {t(
                  "messages.addingPreservesExistingTasksYouCanEditEachSuggestion",
                )}
              </Localized>
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
                <Localized>{t("messages.addTheseSuggestions")}</Localized>
              </Button>
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() => suggestion.reset()}
              >
                <Localized>{t("messages.dismiss")}</Localized>
              </Button>
            </div>
          </div>
        )}
        <TemplateItemsEditor
          items={value.items}
          errors={errors}
          onFieldBlur={touch}
          onChange={(items) => {
            setValue({ ...value, items });
          }}
          disabled={busy}
        />
        <Button
          role="switch"
          aria-label={t("messages.templateAvailableInCreateADatedList")}
          aria-checked={value.enabled}
          variant={value.enabled ? "default" : "outline"}
          disabled={busy}
          onClick={() => setValue({ ...value, enabled: !value.enabled })}
        >
          <ActivationLabel
            enabled={value.enabled}
            enabledLabel={t("messages.templateEnabled")}
            disabledLabel={t("messages.templateDisabled")}
          />
        </Button>
        <DialogFooter>
          <Button variant="outline" disabled={busy} onClick={onClose}>
            <Undo2 />
            <Localized>{t("common.cancel")}</Localized>
          </Button>
          <Button
            disabled={busy}
            onClick={async () => {
              setSubmitted(true);
              const parsed = templateInputSchema.safeParse(value);
              if (!parsed.success) {
                return;
              }
              try {
                await save.mutateAsync({
                  id: template?.id,
                  input: parsed.data,
                });
                toast.success(t("messages.templateSaved"));
                onClose();
              } catch (error) {
                toast.error(
                  getApiErrorMessage(
                    error,
                    t("messages.unableToSaveTemplate"),
                  ),
                );
              }
            }}
          >
            <Save />
            {save.isPending ? "Enregistrement…" : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
