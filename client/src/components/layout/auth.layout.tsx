import FooterLayout from "@/components/layout/footer.layout";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header with Logo and Theme Toggle */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Image
            src="/next.svg"
            alt="My Daily Page"
            width={100}
            height={20}
            className="dark:invert"
            priority
          />
          <span className="hidden text-lg font-semibold md:inline-block">
            My Daily Page
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Area - Centered */}
      <main className="flex flex-1 items-center justify-center px-4 py-8 md:px-6 md:py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <FooterLayout />
    </div>
  );
};

export default AuthLayout;
