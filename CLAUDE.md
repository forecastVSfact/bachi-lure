# bachi-lure.com 更新時の注意

コラム追加・ルアー一覧の変更・コード修正のときは、次の既存の仕組みを壊さないこと。

## 流入・インデックス対策(2026-10-30に実装)
- **コラム末尾のルアーリンク**: `src/app/columns/[id]/page.tsx` が `ColumnLures`(評価の高いルアー6件+バチ種別ページへのリンク)を表示する。個別ルアーページへGoogleが辿る経路なので、外さない。
- **本文中の内部リンク**: 新しいコラムでは、関連するルアーへ `[名前](/lures/<id>)`、種別ページへ `/lures/river` `/lures/harbor` `/lures/kurukuru` `/lures/bottom` のリンクを本文に入れる。`/` 始まりのリンクは同じタブで開く(`ColumnMarkdown`)。ルアーIDは本番サイトの一覧ページ(`/lures`)のリンクから確認する。
- **sitemap**: `src/app/sitemap.ts` はルアー・コラム・種別ページを自動で含む。ページを新設したら含まれているか確認する。

## アフィリエイト
- Amazon/楽天のリンクは `src/components/AffiliateLink.tsx` を使う。`rel="sponsored"` と、GA4への `affiliate_click` イベント(store, lure_id, lure_name)送信が入っている。素の `<a>` に戻さない。
- 自己クリックは規約違反なので、動作確認でアフィリエイトリンクを押さない。確認が必要なら `gtag('event', 'affiliate_click', {store: 'test', ...})` のようにテスト送信する。

## 計測
- GA4タグ(G-TWKFGLYJZF)は `src/app/layout.tsx` にある。外さない。
- Search Consoleにサイトマップ `/sitemap.xml` 送信済み。新コラム公開後は、URL検査から「インデックス登録をリクエスト」を出す(1日の上限あり)。

## 運用
- コラムは `content/columns/` にmarkdownを追加し、masterへpushするとVercelが自動デプロイする。
- 型チェックは `npx tsc --noEmit`。`tsconfig.tsbuildinfo` は追跡されているので、変更が出たら戻す。
- 本番の確認は、プレビューURLが保護されているため、デプロイ後の本番で行う。
