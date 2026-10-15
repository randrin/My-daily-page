"use client";

import { useTranslator } from "@/i18n/provider";
import { Localized } from "@/i18n/provider";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { useDeleteFile, useUploadFile } from "@/hooks/use-files";
import { getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";

export const TASK_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
const TASK_IMAGE_TYPES = new Set(TASK_IMAGE_ACCEPT.split(","));
const TASK_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

type TaskImageFieldProps = {
  value: string | null;
  fileId?: string | null;
  disabled?: boolean;
  onChange: (url: string | null, fileId: string | null) => void;
  onBusyChange?: (busy: boolean) => void;
};

export function TaskImageField({
  value,
  fileId,
  disabled,
  onChange,
  onBusyChange,
}: TaskImageFieldProps) {
  const t = useTranslator();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const upload = useUploadFile();
  const remove = useDeleteFile();
  const busy = upload.isPending || remove.isPending || disabled;

  React.useEffect(() => {
    onBusyChange?.(upload.isPending || remove.isPending);
  }, [onBusyChange, remove.isPending, upload.isPending]);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    if (!TASK_IMAGE_TYPES.has(file.type)) {
      toast.error(t("messages.acceptedFormatsJpegPngWebpGif"));
      return;
    }
    if (file.size > TASK_IMAGE_MAX_BYTES) {
      toast.error(t("messages.imageMustNotExceed5Mb"));
      return;
    }
    try {
      const stored = await upload.mutateAsync({ file, kind: "task-image" });
      if (fileId) {
        try {
          await remove.mutateAsync(fileId);
        } catch {
          // the new image is already stored
        }
      }
      onChange(stored.url, stored.id);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Impossible d’envoyer l’image"));
    }
  };

  const clear = async () => {
    if (fileId) {
      try {
        await remove.mutateAsync(fileId);
      } catch {
        // still clear the form so the task is saved without image
      }
    }
    onChange(null, null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Field>
      <FieldLabel htmlFor="task-image">
        <Localized>{t("messages.imageOptional")}</Localized>
      </FieldLabel>
      <input
        ref={inputRef}
        id="task-image"
        type="file"
        accept={TASK_IMAGE_ACCEPT}
        className="sr-only"
        disabled={busy}
        onChange={(event) => {
          void pick(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      {value ? (
        <div className="overflow-hidden rounded-lg border bg-muted/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={t("messages.taskPreview")}
            className="h-40 w-full object-cover"
          />
          <div className="flex items-center justify-end gap-2 p-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              {upload.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <ImagePlus className="size-3.5" />
              )}
              <Localized>{t("messages.replace")}</Localized>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              disabled={busy}
              onClick={() => void clear()}
            >
              <Trash2 className="size-3.5" />
              <Localized>{t("messages.remove")}</Localized>
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex h-28 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground transition-colors hover:bg-muted/40",
            busy && "pointer-events-none opacity-60",
          )}
        >
          {upload.isPending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <ImagePlus className="size-5" />
          )}
          {upload.isPending ? "Envoi…" : t("messages.addAnImage")}
        </button>
      )}
    </Field>
  );
}
