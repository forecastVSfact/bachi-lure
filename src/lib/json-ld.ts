import { columnMetaDescription, extractYouTubeIds, resolveColumnOgImage } from "@/lib/column-seo";
import { BACHI_TYPE_LABEL } from "@/lib/constants";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";
import type { ColumnPost, Lure } from "@/types/db";

const BLOG_ID = `${SITE_URL}/columns#blog`;

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export function buildWebSiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    inLanguage: "ja-JP",
    publisher: { "@id": ORG_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/lures?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

export function buildOrganizationJsonLd() {
  return {
    "@type": "Person",
    "@id": ORG_ID,
    name: "オヤビッチャ",
    description: "東京湾奥を中心にバチ抜けルアー釣りを続ける管理人。バチ抜け歴28年。",
    url: SITE_URL
  };
}

export function buildHomeFaqJsonLd() {
  return {
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "バチ抜けとは何ですか？",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "夜や薄明の時間帯にシーバスが水面近くでバチを追って食べるパターンの釣り方です。川バチ・港湾バチ・クルクルバチ・底バチなど場面ごとに使うルアーが異なります。"
        }
      },
      {
        "@type": "Question",
        name: "川バチ・港湾バチ・クルクルバチの違いは？",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "川バチは河川のオープンウォーター、港湾バチは港・運河の壁際や構造物、クルクルバチは狭い水路で水面をクルクル回るバチ、底バチはやや深めのレンジが対象です。使うルアーとタックルが異なります。"
        }
      },
      {
        "@type": "Question",
        name: "バチ抜けルアーはどう選べばよいですか？",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "バチ種別・レンジ（水深）・速度域・サイズの一致が重要です。本サイトでは管理人の実釣インプレとスペックで、場面に合うルアーを比較できます。"
        }
      }
    ]
  };
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`
    }))
  };
}

export function buildLureProductJsonLd(lure: Lure) {
  const bachiLabel = lure.bachi_types.map((t) => BACHI_TYPE_LABEL[t] ?? t).join("、");

  return {
    "@type": "Product",
    name: lure.name,
    brand: { "@type": "Brand", name: lure.maker },
    description: lure.comment?.trim() || `${lure.name}のバチ抜け向けシーバスルアー。${bachiLabel}対応。`,
    ...(lure.image_url ? { image: [lure.image_url] } : {}),
    url: `${SITE_URL}/lures/${lure.id}`,
    ...(lure.price_yen
      ? {
          offers: {
            "@type": "Offer",
            price: lure.price_yen,
            priceCurrency: "JPY",
            availability: "https://schema.org/InStock",
            url: lure.amazon_url || lure.rakuten_url || `${SITE_URL}/lures/${lure.id}`
          }
        }
      : {})
  };
}

export function buildLureCollectionJsonLd(lures: Lure[]) {
  return {
    "@type": "CollectionPage",
    name: "バチ抜けルアー一覧",
    url: `${SITE_URL}/lures`,
    description: "バチ抜け向けシーバスルアーの一覧。バチ種別・速度域・飛距離で絞り込み可能。",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: lures.length,
      itemListElement: lures.slice(0, 20).map((lure, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}/lures/${lure.id}`,
        name: lure.name
      }))
    }
  };
}

export function buildColumnArticleJsonLd(column: ColumnPost) {
  const url = `${SITE_URL}/columns/${column.id}`;
  const image = resolveColumnOgImage(column);
  const description = columnMetaDescription(column);
  const videoIds = extractYouTubeIds(column.body);

  return {
    "@type": "BlogPosting",
    "@id": url,
    headline: column.title,
    description,
    ...(image ? { image: [image] } : {}),
    articleSection: column.category,
    datePublished: column.published_at ?? undefined,
    dateModified: column.updated_at ?? column.published_at ?? undefined,
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    inLanguage: "ja-JP",
    isPartOf: { "@type": "Blog", "@id": BLOG_ID, name: "管理人コラム", url: `${SITE_URL}/columns` },
    ...(videoIds.length
      ? {
          video: videoIds.map((id) => ({
            "@type": "VideoObject",
            name: column.title,
            description,
            uploadDate: column.published_at ?? column.created_at,
            embedUrl: `https://www.youtube.com/embed/${id}`,
            thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
          }))
        }
      : {})
  };
}

export function buildColumnCollectionJsonLd(columns: ColumnPost[]) {
  return {
    "@type": "CollectionPage",
    name: "管理人コラム一覧",
    url: `${SITE_URL}/columns`,
    description: "バチ抜け・シーバス釣りに関する管理人コラム一覧。テクニック、タックル、エリアガイドなど実釣ベースの記事。",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: columns.length,
      itemListElement: columns.map((column, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}/columns/${column.id}`,
        name: column.title
      }))
    }
  };
}
