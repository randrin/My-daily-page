import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
export function PageTitle({
  icon: Icon,
  children,
  id,
}: {
  icon: LucideIcon;
  children: ReactNode;
  id?: string;
}) {
  return (
    <h1
      id={id}
      className="flex items-center gap-2 text-2xl font-semibold tracking-tight"
    >
      <Icon className="size-6 shrink-0" aria-hidden />
      <span>{children}</span>
    </h1>
  );
}
