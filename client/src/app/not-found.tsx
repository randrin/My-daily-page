"use client";

// The auth route-handler tree owns unmatched URLs in this mixed-router project.
// Share the Pages Router 404 rather than duplicating its UI.
import { ThemeProvider } from "next-themes";
import NotFoundPage from "@/pages/404";
import "@/styles/globals.css";

export default function NotFound() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <title>Page introuvable — My Daily Page</title>
      <NotFoundPage standalone={false} />
    </ThemeProvider>
  );
}
