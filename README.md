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

## CSV import

```bash
npx ts-node scripts/import-csv.ts lures.csv
```

