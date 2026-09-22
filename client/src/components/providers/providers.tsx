import { SessionProvider } from "next-auth/react";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Session } from "next-auth";

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <QueryProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            {children}
            <Toaster expand={true} richColors position="top-right" />
          </TooltipProvider>
        </ThemeProvider>
      </QueryProvider>
    </SessionProvider>
  );
}
