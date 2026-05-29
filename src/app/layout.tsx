import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Bebas_Neue, Noto_Sans_JP, Noto_Serif_JP } from "next/font/google";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`
  },
  description: DEFAULT_DESCRIPTION,
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITE_NAME }]
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: ["/opengraph-image"]
  }
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
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-TWKFGLYJZF" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-TWKFGLYJZF');
          `}
        </Script>
        <meta name="robots" content="noai, noimageai" />
      </head>
      <body className={`${notoSansJp.variable} ${notoSerifJp.variable} ${bebasNeue.variable}`}>
        <header className="bg-transparent">
          <div className="container-main flex items-center justify-between py-3 md:py-4">
            <Link href="/" className="logo-text text-xs">
              bachi-lure.com
            </Link>
            <nav className="flex items-center gap-4 text-[12px]">
              <Link href="/lures" className="text-[var(--muted)] hover:text-[var(--teal)]">
                ルアー一覧
              </Link>
              <Link href="/columns" className="text-[var(--muted)] hover:text-[var(--teal)]">
                コラム
              </Link>
            </nav>
          </div>
        </header>
        <main className="container-main pb-6 pt-0 md:py-8">{children}</main>
        <footer className="mt-12 border-t border-[var(--border)] bg-[#020810] px-4 py-8 text-center text-xs text-[var(--muted)]">
          <p className="logo-text mb-2 text-sm">bachi-lure.com</p>
          <p>© 2025 bachi-lure.com All Rights Reserved.</p>
          <p>当サイトのコンテンツの無断転載・AI学習データへの使用を禁止します。</p>
        </footer>
      </body>
    </html>
  );
}

