import Link from "next/link";

export function HomeIntro() {
  return (
    <section className="rounded border border-[var(--border)] bg-[var(--water-mid)]/40 px-5 py-6 md:px-8 md:py-8">
      <h2 className="serif-title mb-4 text-xl font-bold text-[var(--moon)]">バチ抜けルアー図鑑とは</h2>
      <div className="space-y-4 text-[13px] leading-[1.9] text-[var(--paper)]">
        <p>
          <strong className="font-medium text-[var(--moon)]">バチ抜け</strong>
          とは、夜や薄明の時間帯にシーバスが水面近くで餌を追い、波紋（いわゆる「バチ」）を立てながら食べるパターンの釣り方です。表層〜水面直下をゆっくり引くルアーが有効で、ミノー・ペンシル・シンペン系の細身ルアーがよく使われます。
        </p>
        <p>
          本サイト bachi-lure.com は、
          <strong className="font-medium text-[var(--moon)]">川バチ・港湾バチ・クルクルバチ・底バチ</strong>
          の各場面で実際に使えるルアーだけを管理人が厳選したデータベースです。メーカー公称値だけでなく、
          <strong className="font-medium text-[var(--moon)]">レンジ（水深）・速度域・飛距離・管理人評価</strong>
          といった実釣目線の情報で、ルアー選びや買い替えの比較に使えます。
        </p>
        <p>
          「バチ抜け ルアー」「バチ抜け おすすめ」「川バチ ルアー」などでお探しの方は、
          <Link href="/lures" className="text-[var(--teal)] underline-offset-2 hover:underline">
            ルアー一覧
          </Link>
          からバチ種別で絞り込むか、
          <Link href="/columns" className="text-[var(--teal)] underline-offset-2 hover:underline">
            管理人コラム
          </Link>
          でテクニック記事もご覧ください。
        </p>
      </div>
    </section>
  );
}
