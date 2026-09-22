import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers/providers";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
    >
      <Providers session={session}>
        <Component {...pageProps} />
      </Providers>
    </div>
  );
}
