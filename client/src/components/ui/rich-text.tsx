import { cn } from "@/lib/utils";
import { isEmptyRichText, toRichHtml } from "@/lib/rich-text/html";

export function RichText({
  html,
  className,
}: {
  html?: string | null;
  className?: string;
}) {
  const safe = html ? toRichHtml(html) : "";
  if (isEmptyRichText(safe)) {
    return null;
  }
  return (
    <div
      className={cn("rich-text", className)}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
