import re
import requests
from pathlib import Path
from PIL import Image
from io import BytesIO
import time

lures = [
    ("ダイワ", "モアザン ミドルアッパー"),
    ("コアマン", "アルカリ"),
    ("ハルシオンシステム", "チキチータベイビー"),
    ("ジップベイツ", "ザブラシステムミノー123F"),
    ("アピア", "パンチラインスリム90"),
    ("シマノ", "エクスセンス トライデント90S"),
    ("ラッキークラフト", "ワンダー60"),
    ("ジャクソン", "にょろにょろ125"),
    ("ダイワ", "モアザン ヒソカ120F")
]

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0"}

def scrape_kingfisher_or_rakuten(maker, name):
    url = f"https://search.rakuten.co.jp/search/mall/{maker} {name}/"
    r = requests.get(url, headers=HEADERS, timeout=10)
    # Find the first item image
    m = re.search(r'<img[^>]+src="([^"]+\.jpg\?[^"]*)"[^>]*class="searchresultitem', r.text)
    if not m:
        m = re.search(r'<img[^>]+src="([^"]+\.jpg\?[^"]*)"', r.text)
    if m:
        return m.group(1).replace("?_ex=128x128", "?_ex=400x400")
    return None

def process_image(img_url, out_path):
    print(f"Downloading: {img_url}", flush=True)
    r = requests.get(img_url, headers=HEADERS, timeout=10)
    r.raise_for_status()
    img = Image.open(BytesIO(r.content)).convert("RGBA")
    
    # Fast approach
    # anything > 230 becomes transparent
    r_data, g_data, b_data, a_data = img.split()
    mask = img.convert("L").point(lambda p: 255 if p < 240 else 0)
    a_data = mask
    img.putalpha(a_data)
    
    bg = Image.new("RGBA", img.size, (13, 32, 53, 255))
    out = Image.alpha_composite(bg, img).convert("RGB")
    out.save(out_path, format="JPEG", quality=85)

out_dir = Path("luredatabase/images")
for maker, name in lures:
    print(f"--- {name} ---", flush=True)
    try:
        url = scrape_kingfisher_or_rakuten(maker, name)
        if url:
            url = re.sub(r'\?.*', '', url)
            process_image(url, out_dir / f"{name}.jpg")
            print(f"Saved {name}.jpg", flush=True)
        else:
            print("Not found.", flush=True)
    except Exception as e:
        print(f"Error: {e}", flush=True)
    time.sleep(1)
