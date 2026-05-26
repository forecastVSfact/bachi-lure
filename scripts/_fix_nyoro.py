import re
import requests
from pathlib import Path
from PIL import Image
from io import BytesIO

url = "https://www.kingfisher.co.jp/SHOP/4511729215.html"
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

def get_image():
    r = requests.get(url, headers=HEADERS)
    m = re.search(r'<img[^>]+src="([^"]+)"[^>]*id="mainImage"', r.text)
    if not m:
        m = re.search(r'<img[^>]+src="(https://www\.kingfisher\.co\.jp/pic-labo/[^"]+)"', r.text)
    if m:
        img_url = m.group(1)
        if img_url.startswith("/"):
            img_url = "https://www.kingfisher.co.jp" + img_url
        print("Found:", img_url)
        return img_url
    return None

img_url = get_image()
if img_url:
    r = requests.get(img_url, headers=HEADERS)
    r.raise_for_status()
    img = Image.open(BytesIO(r.content)).convert("RGBA")
    r_data, g_data, b_data, a_data = img.split()
    mask = img.convert("L").point(lambda p: 255 if p < 240 else 0)
    img.putalpha(mask)
    bg = Image.new("RGBA", img.size, (13, 32, 53, 255))
    out = Image.alpha_composite(bg, img).convert("RGB")
    out.save("luredatabase/images/にょろにょろ125.jpg", format="JPEG", quality=85)
    print("Saved にょろにょろ125.jpg")
else:
    print("Image not found on Kingfisher.")
