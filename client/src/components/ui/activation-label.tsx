import { CircleCheck, CircleOff } from "lucide-react";

export function ActivationLabel({
  enabled,
  enabledLabel = "Activé",
  disabledLabel = "Désactivé",
}: {
  enabled: boolean;
  enabledLabel?: string;
  disabledLabel?: string;
}) {
  const Icon = enabled ? CircleCheck : CircleOff;
  return (
    <>
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span>{enabled ? enabledLabel : disabledLabel}</span>
    </>
  );
}
