import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Content Gateway",
  description: "Upload once, publish to Instagram, Facebook, TikTok, YouTube, Threads & X.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100">
        <header className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-semibold text-lg tracking-tight">
            🚀 Content Gateway
          </Link>
          <nav className="flex gap-5 text-sm text-neutral-400">
            <Link href="/" className="hover:text-neutral-100">
              Upload
            </Link>
            <Link href="/settings" className="hover:text-neutral-100">
              Settings
            </Link>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
