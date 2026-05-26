# bachi-lure.com

Next.js 14 + Supabase based seabass bachi lure database.

## Setup

1. Install dependencies

```bash
npm install
```

2. Set env vars in `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://jcczxgayhuofzongbzzn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

3. Execute SQL in `supabase/schema.sql` on Supabase SQL Editor.

4. Run app

```bash
npm run dev
```

## ルアーデータの更新（Excel）

**手順の詳細は [docs/データ更新手順.md](docs/データ更新手順.md) を参照してください。**

要約:

1. Excel を `luredatabase/` に置く（既定: `05131403_lures-data-v3.xlsx`）
2. `npm run import:lures` で Supabase に反映
3. `npm run dev` で http://localhost:3000/lures を確認

