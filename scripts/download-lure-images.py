"""
Download lure images via image search (Google/Bing through ddgs).
Query always includes maker + lure name. Replaces near-white backgrounds with site color.

Usage:
  python scripts/download-lure-images.py              # skip existing files
  python scripts/download-lure-images.py --force      # re-download all
  python scripts/download-lure-images.py --only エスフォーneo125,ヨレヨレ
"""
from __future__ import annotations

import argparse
import csv
import re
import time
import unicodedata
import urllib.parse
from io import BytesIO
from pathlib import Path

import requests

try:
    from ddgs import DDGS
except ImportError:
    DDGS = None  # type: ignore

try:
    from PIL import Image
except ImportError:
    Image = None  # type: ignore

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "luredatabase" / "lures.csv"
OUT_DIR = ROOT / "luredatabase" / "images"
BG_COLOR = (13, 32, 53)  # --water-mid #0d2035
DELAY_SEC = 2.5

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Accept-Language": "ja-JP,ja;q=0.9",
}

MIN_URL_SCORE = 8

BLOCK_URL = (
    "walmart", "cupcake", "flower", "deviantart", "blogspot", "pinimg",
    "tenor.com", "ytimg.com", "gif", "simpsons", "quotesgram", "alamy",
    "chair", "kennedy", "pngtree", "clipart", "corey-seager", "ocregister",
    "pokemon", "template", "packing-list", "banner", "nfl_", "boxboxshirt",
    "dgm88.com", "national-sorry", "zukan.pokemon", "naturum-fishingstore",
    "newsatcl", "mosportshalloffame", "amd-img", "halloffame", "view.jpg?",
)
PREFER_URL = (
    "amazon.co.jp", "rakuten.co.jp", "yahoo.co.jp", "yimg.jp",
    "fishing", "anglers", "tsuriking", "honda", "daiwa", "megabass",
    "shimano", "duo-lure", "ima-japan", "jackall", "palms", "coreman",
    "timco", "evergreen", "o.s.p", "osp", "ecogear", "geecrack",
    "kingfisher.co.jp", "casting.co.jp", "f-marunishi", "waterhouse",
    "fishing-you", "openwater", "shop.r10s.jp",
)

AMAZON_IMG_RE = re.compile(
    r"https://m\.media-amazon\.com/images/I/([A-Za-z0-9+._%-]+)\._AC_[A-Za-z0-9_]+\.jpg"
)


def search_query(maker: str, name: str) -> str:
    return f"{maker} {name} シーバス ルアー".strip()


def score_url(url: str, name: str) -> int:
    low = url.lower()
    if any(b in low for b in BLOCK_URL):
        return -100
    if "yimg.jp" in low and any(x in low for x in ("/news", "amd-img", "sph-")):
        return -100
    s = 0
    if any(p in low for p in PREFER_URL):
        s += 12
    if "media-amazon.com" in low:
        s += 8
    compact = re.sub(r"\s+", "", name).lower()
    for token in (compact[:8], compact[-6:]):
        if len(token) >= 4 and token in low:
            s += 4
    return s


def collect_ddgs_urls(maker: str, name: str) -> list[str]:
    if DDGS is None:
        return []
    query = search_query(maker, name)
    found: list[str] = []
    for backend in ("bing", "auto", "google"):
        try:
            results = DDGS().images(query, region="jp-jp", max_results=15, backend=backend)
            for row in results:
                url = row.get("image")
                if url and url not in found:
                    found.append(url)
            if found:
                break
        except Exception as exc:
            log(f"  ddgs ({backend}) failed: {exc}")
        time.sleep(1)
    return found


def collect_bing_urls(maker: str, name: str) -> list[str]:
    query = search_query(maker, name)
    url = "https://www.bing.com/images/async?" + urllib.parse.urlencode(
        {"q": query, "first": 0, "count": 40, "mmasync": 1}
    )
    try:
        res = requests.get(url, headers=HEADERS, timeout=30)
        res.raise_for_status()
    except requests.RequestException as exc:
        log(f"  Bing async failed: {exc}")
        return []
    return list(dict.fromkeys(re.findall(r'murl&quot;:&quot;(https://[^&]+?)&quot;', res.text)))


def rank_urls(urls: list[str], name: str) -> list[str]:
    unique = list(dict.fromkeys(urls))
    return sorted(unique, key=lambda u: score_url(u, name), reverse=True)


def log(message: str) -> None:
    try:
        print(message)
    except UnicodeEncodeError:
        print(message.encode("cp932", errors="replace").decode("cp932"))


def fetch_amazon_image(session: requests.Session, maker: str, name: str) -> str | None:
    query = urllib.parse.quote(f"{maker} {name}")
    url = f"https://www.amazon.co.jp/s?k={query}"
    try:
        res = session.get(url, headers=HEADERS, timeout=25)
        res.raise_for_status()
    except requests.RequestException as exc:
        print(f"  Amazon fallback failed: {exc}")
        return None

    seen: set[str] = set()
    for match in AMAZON_IMG_RE.finditer(res.text):
        image_id = match.group(1)
        if image_id in seen:
            continue
        seen.add(image_id)
        return f"https://m.media-amazon.com/images/I/{image_id}._AC_SL1500_.jpg"
    return None


def download_bytes(session: requests.Session, url: str) -> bytes | None:
    try:
        res = session.get(url, headers=HEADERS, timeout=30)
        res.raise_for_status()
        if len(res.content) < 1500:
            return None
        return res.content
    except requests.RequestException as exc:
        print(f"  Download failed: {exc}")
        return None


def apply_background(data: bytes, dest: Path) -> None:
    if Image is None:
        dest.write_bytes(data)
        return

    img = Image.open(BytesIO(data)).convert("RGBA")
    pixels = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a < 20:
                pixels[x, y] = (*BG_COLOR, 255)
                continue
            brightness = (r + g + b) / 3
            if brightness >= 248:
                pixels[x, y] = (*BG_COLOR, 255)
            elif brightness >= 210:
                t = (brightness - 210) / 38
                nr = int(r * (1 - t) + BG_COLOR[0] * t)
                ng = int(g * (1 - t) + BG_COLOR[1] * t)
                nb = int(b * (1 - t) + BG_COLOR[2] * t)
                pixels[x, y] = (nr, ng, nb, 255)

    rgb = Image.new("RGB", img.size, BG_COLOR)
    rgb.paste(img, mask=img.split()[3])
    rgb.save(dest, format="JPEG", quality=90)


def safe_path_name(name: str) -> str:
    for ch in '<>:"/\\|?*':
        name = name.replace(ch, "_")
    return name.strip()


def normalize_match_key(name: str) -> str:
    compact = re.sub(r"\s+", "", name).lower()
    return unicodedata.normalize("NFKC", compact)


def load_rows(only: set[str] | None) -> list[dict[str, str]]:
    with CSV_PATH.open(encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    if not only:
        return rows
    keys = {normalize_match_key(x) for x in only}
    filtered = [row for row in rows if normalize_match_key(row["name"]) in keys]
    return filtered


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="Re-download even if file exists")
    parser.add_argument(
        "--only",
        help="Comma-separated lure names to update (e.g. エスフォーneo125,ヨレヨレ)",
    )
    args = parser.parse_args()

    if not CSV_PATH.exists():
        print(f"Missing {CSV_PATH}")
        raise SystemExit(1)
    if DDGS is None:
        print("Install: pip install ddgs")
        raise SystemExit(1)
    if Image is None:
        print("Install: pip install pillow")
        raise SystemExit(1)

    only = None
    if args.only:
        only = {part.strip() for part in args.only.split(",") if part.strip()}

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    rows = load_rows(only)
    session = requests.Session()
    ok = skip = fail = 0

    for i, row in enumerate(rows, start=1):
        name = row["name"].strip()
        maker = row.get("maker", "").strip()
        dest = OUT_DIR / f"{safe_path_name(name)}.jpg"

        if dest.exists() and dest.stat().st_size > 2000 and not args.force:
            log(f"[{i}/{len(rows)}] Skip (exists): {name}")
            skip += 1
            continue

        log(f"[{i}/{len(rows)}] {maker} / {name}")

        candidates = rank_urls(
            collect_ddgs_urls(maker, name) + collect_bing_urls(maker, name),
            name,
        )
        amazon_url = fetch_amazon_image(session, maker, name)
        if amazon_url:
            candidates = rank_urls([amazon_url] + candidates, name)

        saved = False
        for image_url in candidates:
            if score_url(image_url, name) < MIN_URL_SCORE:
                continue
            log(f"  try score={score_url(image_url, name)}: {image_url[:80]}...")
            raw = download_bytes(session, image_url)
            if not raw:
                continue
            apply_background(raw, dest)
            log(f"  Saved -> {dest.name}")
            ok += 1
            saved = True
            break

        if not saved:
            log("  No suitable image found")
            fail += 1
        time.sleep(DELAY_SEC)

    print(f"\nDone: {ok} downloaded, {skip} skipped, {fail} failed")


if __name__ == "__main__":
    main()
