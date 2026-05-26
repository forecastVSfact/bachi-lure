# ルアー画像フォルダ

ここに **自分で用意した画像** を置き、Supabase へアップロードします。

```bash
npm run import:images
```

## ファイル名

**DB のルアー名（Excel の name）と同じ** にしてください。

| ルアー名 | ファイル名 |
|----------|------------|
| ノガレ120F | `ノガレ120F.jpg` |
| コアマン アルカリ | `コアマン アルカリ.jpg` |

形式: `.jpg` `.jpeg` `.png` `.webp` `.gif`

## 未登録の確認

```bash
npm run images:missing
```

## 注意

- 自動ダウンロード・外部 URL は使いません
- 差し替えは `npm run import:images:only -- "ルアー名"` を推奨

詳細: [docs/画像の追加方法.md](../../docs/画像の追加方法.md)
