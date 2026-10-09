import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="fr">
      <Head><link rel="manifest" href="/manifest.webmanifest" /><meta name="theme-color" content="#2563eb" /><link rel="apple-touch-icon" href="/icons/icon-192.png" /></Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
