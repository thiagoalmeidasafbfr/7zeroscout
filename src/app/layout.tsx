import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "7a0 Scout",
  description: "Catálogo de elencos e forças reais do jogo 7a0 (modo clássico).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen antialiased">
        <header className="border-b border-ink-700 bg-ink-900/80 backdrop-blur sticky top-0 z-10">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <span className="inline-block h-3 w-3 rounded-full bg-pitch-400 shadow-[0_0_12px_#34a35d]" />
              <span>
                7a0 <span className="text-pitch-300">Scout</span>
              </span>
            </Link>
            <nav className="flex items-center gap-4 text-sm text-ink-200">
              <Link href="/" className="hover:text-pitch-300">
                Elencos
              </Link>
              <Link href="/players" className="hover:text-pitch-300">
                Ranking
              </Link>
              <Link href="/admin" className="hover:text-pitch-300">
                Admin
              </Link>
            </nav>
            <div className="ml-auto text-xs text-ink-400 font-mono hidden sm:block">
              modo clássico
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 py-10 text-xs text-ink-400">
          Dados extraídos de 7a0.com.br · forças do modo clássico (1–99)
        </footer>
      </body>
    </html>
  );
}
