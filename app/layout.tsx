import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Podcast Club",
  description: "Spin the wheel and let fate pick this week's podcast.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#5b21b6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-6 sm:px-6 sm:py-10">
          <header className="mb-8 flex items-center justify-between gap-4">
            <Link href="/" className="text-lg font-bold tracking-tight sm:text-xl">
              🎧 Podcast Club
            </Link>
            <nav className="flex items-center gap-2 text-sm">
              <Link href="/" className="btn-ghost">
                Wheel
              </Link>
              <Link href="/admin" className="btn-ghost">
                Admin
              </Link>
            </nav>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="mt-10 text-center text-xs text-white/50">
            Built with Next.js, Supabase &amp; a lot of spinning.
          </footer>
        </div>
      </body>
    </html>
  );
}
