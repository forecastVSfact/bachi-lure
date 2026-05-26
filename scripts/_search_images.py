import sys
from ddgs import DDGS

queries = [
    "モアザン ミドルアッパー ルアー",
    "コアマン アルカリ ルアー",
    "チキチータベイビー ハルシオンシステム",
    "ザブラシステムミノー123F",
    "パンチラインスリム90 アピア",
    "エクスセンス トライデント90S シマノ",
    "ワンダー60 ラッキークラフト",
    "にょろにょろ125 ジャクソン",
    "モアザン ヒソカ120F ダイワ"
]

for q in queries:
    print(f"\n--- {q} ---")
    results = DDGS().images(q, region="jp-jp", max_results=5)
    for i, r in enumerate(results):
        print(f"{i+1}: {r.get('image')}")
