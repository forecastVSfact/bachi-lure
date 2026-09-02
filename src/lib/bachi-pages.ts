import type { BachiType } from "@/types/db";

export type BachiPageSlug = "river" | "harbor" | "kurukuru" | "bottom";

export type BachiPageConfig = {
  slug: BachiPageSlug;
  bachiType: BachiType;
  label: string;
  title: string;
  description: string;
  intro: string;
};

export const BACHI_PAGE_CONFIGS: BachiPageConfig[] = [
  {
    slug: "river",
    bachiType: "river",
    label: "川バチ",
    title: "川バチ向けルアー一覧｜おすすめ比較",
    description:
      "川バチ・河川バチ向けシーバスルアー一覧。旧江戸川や多摩川などオープンエリアの表層・中層に対応したルアーを、管理人の実釣インプレ付きで比較できます。",
    intro:
      "川バチとは、河川のオープンエリアや緩やかな流れでバチが湧き、シーバスが表層〜中層で捕食するパターンのことです。旧江戸川、荒川、多摩川など東京湾奥の河川でよく見られます。引き波系のミノー、リップ付き水面直下ルアー、スローで吸い込ませるシンペンなどが定番です。本ページでは川バチ対応ルアーを一覧で掲載しています。レンジ（水深）・速度域・管理人評価で比較し、自分のポイントに合うルアーを探してください。"
  },
  {
    slug: "harbor",
    bachiType: "harbor",
    label: "港湾バチ",
    title: "港湾バチ向けルアー一覧｜おすすめ比較",
    description:
      "港湾バチ・運河バチ向けシーバスルアー一覧。江東区運河や港区の水路で使える表層引き波系・シンペンを、実釣インプレ付きで比較。",
    intro:
      "港湾バチとは、運河や港内の静かな水路でバチが湧き、シーバスが表層で捕食するパターンです。江東区の運河、港区の水路、旧江戸川の港湾部などが代表例です。エリア10のような引き波系ミノー、キャロットやにょろにょろなどのシンペンがよく使われます。桜の開花前後から本番に入り、5〜6月は連日抜けることも珍しくありません。港湾バチ対応ルアーを一覧で比較できます。"
  },
  {
    slug: "kurukuru",
    bachiType: "kurukuru",
    label: "クルクルバチ",
    title: "クルクルバチ向けルアー一覧｜おすすめ比較",
    description:
      "クルクルバチ向けシーバスルアー一覧。狭い水路・クルクルポイントで効く小型シンペンやペンシルを、管理人の実釣インプレ付きで比較。",
    intro:
      "クルクルバチとは、狭い水路や湾曲したポイントでバチが渦を巻くように湧き、シーバスが激しく追い回すパターンです。川幅が狭く、足場が近い場面でよく発生します。小型のシンペンやペンシル、早巻きでアピールできるルアーが有効です。ワンダー60、キャロット72S、アルデンテ70Sなどが定番として知られています。クルクルバチ対応ルアーをレンジ・サイズ・評価で比較できます。"
  },
  {
    slug: "bottom",
    bachiType: "bottom",
    label: "底バチ",
    title: "底バチ向けルアー一覧｜おすすめ比較",
    description:
      "底バチ向けシーバスルアー一覧。中層〜底層をスローで引けるシンペンやワームリグを、管理人の実釣インプレ付きで比較。",
    intro:
      "底バチとは、バチが中層〜底層にいるシーバスを、ボトム寄りのレンジで狙うパターンです。表層系ルアーでは反応が取れない場面で、スローで底のほうを引けるルアーが活きます。カーム110、ローリングベイト77、ジグヘッドワームなどが代表例です。レンジが深く、流れが緩い川のポイントや、港湾の底層狙いで使われます。底バチ対応ルアーを一覧で比較できます。"
  }
];

const configBySlug = new Map(BACHI_PAGE_CONFIGS.map((config) => [config.slug, config]));
const configByType = new Map(BACHI_PAGE_CONFIGS.map((config) => [config.bachiType, config]));

export function getBachiPageConfig(slug: string): BachiPageConfig | null {
  return configBySlug.get(slug as BachiPageSlug) ?? null;
}

export function getBachiPagePath(bachiType: string): string | null {
  return configByType.get(bachiType as BachiType)?.slug ? `/lures/${configByType.get(bachiType as BachiType)!.slug}` : null;
}
