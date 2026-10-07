import type { ReactNode } from "react";
import { Inbox, TriangleAlert, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackStateProps {
  description: ReactNode;
  title?: string;
  icon?: LucideIcon;
  variant?: "empty" | "error";
  children?: ReactNode;
  className?: string;
}

export function FeedbackState({ description, title, icon, variant = "empty", children, className }: FeedbackStateProps) {
  const Icon = icon ?? (variant === "error" ? TriangleAlert : Inbox);
  return (
    <div role={variant === "error" ? "alert" : "status"} className={cn("flex flex-col items-center justify-center gap-3 px-4 py-10 text-center", className)}>
      <Icon aria-hidden="true" className={cn("size-9 shrink-0", variant === "error" ? "text-destructive" : "text-muted-foreground")} />
      {title ? <p className="font-medium">{title}</p> : null}
      <p className={cn("max-w-md text-sm", variant === "error" ? "text-destructive" : "text-muted-foreground")}>{description}</p>
      {children ? <div className="flex flex-wrap justify-center gap-2">{children}</div> : null}
    </div>
  );
}
