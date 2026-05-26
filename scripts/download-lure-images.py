"""
Download lure product images from Amazon/Rakuten search URLs in lures.csv.
Usage: python scripts/download-lure-images.py
"""
from __future__ import annotations

import csv
import re
import time
import urllib.parse
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

import requests

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "luredatabase" / "lures.csv"
OUT_DIR = ROOT / "luredatabase" / "images"
DELAY_SEC = 1.2

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "ja-JP,ja;q=0.9,en;q=0.8",
}

AMAZON_IMG_RE = re.compile(
    r"https://m\.media-amazon\.com/images/I/([A-Za-z0-9+._%-]+)\._AC_[A-Za-z0-9_]+\.jpg"
)
RAKUTEN_PRODUCT_RE = re.compile(
    r"https://thumbnail\.image\.rakuten\.co\.jp/@0_mall/[^\"'\s>]+\.jpg"
)


def amazon_search_url(name: str, maker: str) -> str:
    query = f"{name} {maker}".strip()
    return "https://www.amazon.co.jp/s?k=" + urllib.parse.quote(query)


def rakuten_search_url(affiliate_or_search: str) -> str | None:
    if not affiliate_or_search:
        return None
    if "search.rakuten.co.jp" in affiliate_or_search:
        return affiliate_or_search
    parsed = urlparse(affiliate_or_search)
    pc = parse_qs(parsed.query).get("pc", [""])[0]
    if pc:
        return unquote(pc)
    return None


def upscale_amazon(url: str, image_id: str) -> str:
    return f"https://m.media-amazon.com/images/I/{image_id}._AC_SL1500_.jpg"


def fetch_amazon_image(session: requests.Session, url: str) -> str | None:
    try:
        res = session.get(url, headers=HEADERS, timeout=25)
        res.raise_for_status()
    except requests.RequestException as exc:
        print(f"  Amazon fetch failed: {exc}")
        return None

    seen: set[str] = set()
    for match in AMAZON_IMG_RE.finditer(res.text):
        image_id = match.group(1)
        if image_id in seen:
            continue
        seen.add(image_id)
        return upscale_amazon(match.group(0), image_id)
    return None


def fetch_rakuten_image(session: requests.Session, url: str) -> str | None:
    try:
        res = session.get(url, headers=HEADERS, timeout=25)
        res.raise_for_status()
    except requests.RequestException as exc:
        print(f"  Rakuten fetch failed: {exc}")
        return None

    for match in RAKUTEN_PRODUCT_RE.finditer(res.text):
        img = match.group(0)
        if "/cabinet/" in img or "/item" in img:
            return img.replace("?fitin=96:96", "").split("?")[0]
    matches = RAKUTEN_PRODUCT_RE.findall(res.text)
    return matches[0].split("?")[0] if matches else None


def download_file(session: requests.Session, url: str, dest: Path) -> bool:
    try:
        res = session.get(url, headers=HEADERS, timeout=30)
        res.raise_for_status()
        if "image" not in res.headers.get("Content-Type", "") and len(res.content) < 1000:
            print(f"  Not an image: {url}")
            return False
        dest.write_bytes(res.content)
        return True
    except requests.RequestException as exc:
        print(f"  Download failed: {exc}")
        return False


def safe_path_name(name: str) -> str:
    for ch in '<>:"/\\|?*':
        name = name.replace(ch, "_")
    return name.strip()


def main() -> None:
    if not CSV_PATH.exists():
        print(f"Missing {CSV_PATH}")
        raise SystemExit(1)

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    with CSV_PATH.open(encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    session = requests.Session()
    ok = 0
    skip = 0
    fail = 0

    for i, row in enumerate(rows, start=1):
        name = row["name"].strip()
        maker = row.get("maker", "").strip()
        dest = OUT_DIR / f"{safe_path_name(name)}.jpg"

        if dest.exists() and dest.stat().st_size > 2000:
            print(f"[{i}/{len(rows)}] Skip (exists): {name}")
            skip += 1
            continue

        print(f"[{i}/{len(rows)}] {name}")

        amazon_url = row.get("amazon_url") or amazon_search_url(name, maker)
        image_url = fetch_amazon_image(session, amazon_url)

        if not image_url:
            rakuten_url = rakuten_search_url(row.get("rakuten_url", ""))
            if rakuten_url:
                image_url = fetch_rakuten_image(session, rakuten_url)

        if not image_url:
            print("  No image found")
            fail += 1
            time.sleep(DELAY_SEC)
            continue

        if download_file(session, image_url, dest):
            print(f"  Saved -> {dest.name}")
            ok += 1
        else:
            fail += 1

        time.sleep(DELAY_SEC)

    print(f"\nDone: {ok} downloaded, {skip} skipped, {fail} failed")


if __name__ == "__main__":
    main()
