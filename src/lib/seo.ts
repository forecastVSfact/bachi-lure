import type { Metadata } from "next";

export const SITE_URL = "https://www.bachi-lure.com";
export const SITE_NAME = "バチ抜けルアー図鑑";

export const DEFAULT_DESCRIPTION =
  "川バチ・港湾バチ・クルクルバチ・底バチ。シーバスのバチ抜けに効くルアーを管理人の実釣インプレ付きで掲載。";

type CreateMetadataOptions = {
  title: string;
  description?: string;
  path?: string;
  absoluteTitle?: boolean;
  imageUrl?: string | null;
  noIndex?: boolean;
};

function resolveUrl(path: string): string {
  return path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function resolveTitleText(title: Metadata["title"], fallback: string): string {
  if (typeof title === "string") return title;
  if (title && typeof title === "object" && "absolute" in title && title.absolute) return title.absolute;
  if (title && typeof title === "object" && "default" in title && title.default) return title.default;
  return fallback;
}

export function createMetadata(opts: CreateMetadataOptions): Metadata {
  const description = opts.description ?? DEFAULT_DESCRIPTION;
  const path = opts.path ?? "/";
  const url = resolveUrl(path);
  const title = opts.absoluteTitle ? { absolute: opts.title } : opts.title;
  const titleText = resolveTitleText(title, opts.title);
  const imageUrl = opts.imageUrl?.trim() || null;

  const openGraphImages = imageUrl
    ? [{ url: imageUrl, width: 1200, height: 630, alt: titleText }]
    : [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITE_NAME }];

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: opts.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "ja_JP",
      url,
      siteName: SITE_NAME,
      title: titleText,
      description,
      images: openGraphImages
    },
    twitter: {
      card: "summary_large_image",
      title: titleText,
      description,
      images: openGraphImages.map((image) => image.url)
    }
  };
}
