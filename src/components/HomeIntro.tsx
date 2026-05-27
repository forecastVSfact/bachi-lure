import Link from "next/link";

export function HomeIntro({ className }: { className?: string }) {
  return (
    <section
      className={`rounded border border-[var(--border)] bg-[var(--water-mid)]/40 px-5 py-6 md:px-8 md:py-8${className ? ` ${className}` : ""}`}
    >
      <h2 className="serif-title mb-4 text-xl font-bold text-[var(--moon)]">バチ抜けルアー地獄とは</h2>
      <div className="space-y-4 text-[13px] leading-[1.9] text-[var(--paper)]">
        <p>
          <strong className="font-medium text-[var(--moon)]">バチ抜け</strong>
          とは、夜や薄明の時間帯にシーバスが水面近くでバチを追って食べるパターンの釣り方です。
        </p>
        <p>
          本サイト bachi-lure.com は、
          <strong className="font-medium text-[var(--moon)]">川バチ・港湾バチ・クルクルバチ・底バチ</strong>
          の各場面で実際に使えるルアーだけを管理人が厳選したデータベースです。メーカー公称値だけでなく、
          <strong className="font-medium text-[var(--moon)]">レンジ（水深）・速度域・飛距離・管理人評価</strong>
          といった実釣目線の情報で、ルアー選びや買い替えの比較に使えます。バチ抜けは簡単な状況もありますが、シビアな状況もあります。打破するのは手札の多さです。手札を追加する際にこちらのサイトを利用してください。
        </p>
        <p>
          「バチ抜け ルアー」「バチ抜け おすすめ」「川バチ ルアー」などでお探しの方は、
          <Link href="/lures" className="text-[var(--teal)] underline-offset-2 hover:underline">
            ルアー一覧
          </Link>
          からバチ種別で絞り込んでまだ使っていないルアーとその使い方をご覧ください。また
          <Link href="/columns" className="text-[var(--teal)] underline-offset-2 hover:underline">
            管理人コラム
          </Link>
          でテクニック記事も追加していく予定です。
        </p>
      </div>
    </section>
  );
}
