import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Brand } from "@/components/brand";
import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
        <Brand />
        <div className="flex items-center gap-2">
          <ButtonLink />
          <ThemeToggle />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-8 md:px-6 md:py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
};

function ButtonLink() {
  return (
    <Link
      href="/"
      className="text-sm text-muted-foreground underline-offset-4 hover:underline"
    >
      Accueil
    </Link>
  );
}

export default AuthLayout;
