import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thé Podcast People",
  description: "Spin the wheel and let fate pick this week's podcast.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a1625",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 py-6 sm:py-10">
          <header className="mb-10 flex items-center justify-between">
            <Link
              href="/"
              className="text-base font-bold tracking-[-0.02em] sm:text-lg"
              style={{ color: "var(--text)" }}
            >
              Thé Podcast People
            </Link>
            <Link href="/admin" className="btn-ghost text-xs sm:text-sm">
              Add podcast
            </Link>
          </header>
          <main className="flex-1">{children}</main>
          <footer
            className="mt-14 pb-4 text-center text-xs"
            style={{ color: "var(--text-muted)", opacity: 0.6 }}
          >
            Spin, discover, repeat.
          </footer>
        </div>
      </body>
    </html>
  );
}
