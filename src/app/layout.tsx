import type { Metadata } from "next";
import Link from "next/link";
import { Bebas_Neue, Noto_Sans_JP, Noto_Serif_JP } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "バチ抜けルアー図鑑",
  description: "シーバスバチ抜け特化データベース",
  robots: { index: true, follow: true }
};

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-sans-jp"
});

const notoSerifJp = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-serif-jp"
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas"
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta name="robots" content="noai, noimageai" />
      </head>
      <body className={`${notoSansJp.variable} ${notoSerifJp.variable} ${bebasNeue.variable}`}>
        <header className="bg-transparent">
          <div className="container-main py-4">
            <Link href="/" className="logo-text text-xs">
              bachi-lure.com
            </Link>
          </div>
        </header>
        <main className="container-main py-8">{children}</main>
        <footer className="mt-12 border-t border-[var(--border)] bg-[#020810] px-4 py-8 text-center text-xs text-[var(--muted)]">
          <p className="logo-text mb-2 text-sm">bachi-lure.com</p>
          <p>© 2025 bachi-lure.com All Rights Reserved.</p>
          <p>当サイトのコンテンツの無断転載・AI学習データへの使用を禁止します。</p>
        </footer>
      </body>
    </html>
  );
}

