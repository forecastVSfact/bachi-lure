import type { Metadata } from "next";

export const SITE_URL = "https://www.bachi-lure.com";
export const SITE_NAME = "バチ抜けルアー地獄";

export const DEFAULT_DESCRIPTION =
  "川バチ・港湾バチ・クルクルバチ・底バチ。シーバスのバチ抜けに効くルアーを管理人の実釣インプレ付きで掲載。";

type CreateMetadataOptions = {
  title: string;
  description?: string;
  path?: string;
  absoluteTitle?: boolean;
  imageUrl?: string | null;
  noIndex?: boolean;
  keywords?: string[];
  openGraphType?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
};

function resolveUrl(path: string): string {
  if (path.startsWith("http")) return path;
  if (path === "/" || path === "") return SITE_URL;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
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

  const ogType = opts.openGraphType ?? "website";
  const resolvedImage = imageUrl ? resolveUrl(imageUrl) : null;
  const openGraphImages = resolvedImage
    ? [{ url: resolvedImage, width: 1200, height: 630, alt: titleText }]
    : [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITE_NAME }];

  return {
    title,
    description,
    ...(opts.keywords?.length ? { keywords: opts.keywords } : {}),
    alternates: { canonical: url },
    robots: opts.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: ogType,
      locale: "ja_JP",
      url,
      siteName: SITE_NAME,
      title: titleText,
      description,
      images: openGraphImages,
      ...(ogType === "article" && opts.publishedTime ? { publishedTime: opts.publishedTime } : {}),
      ...(ogType === "article" && opts.modifiedTime ? { modifiedTime: opts.modifiedTime } : {})
    },
    twitter: {
      card: "summary_large_image",
      title: titleText,
      description,
      images: openGraphImages.map((image) => image.url)
    }
  };
}
