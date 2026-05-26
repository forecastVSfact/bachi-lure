import requests
from pathlib import Path
from PIL import Image
from io import BytesIO

url = "https://www.kingfisher.co.jp/pic-labo/nyoro125-01.jpg"
out_path = Path("luredatabase/images/にょろにょろ125.jpg")

print(f"Downloading: {url}")
r = requests.get(url)
if r.status_code == 404:
    url = "https://www.kingfisher.co.jp/pic-labo/simg/nyoro125-01.jpg"
    r = requests.get(url)

r.raise_for_status()

img = Image.open(BytesIO(r.content)).convert("RGBA")
mask = img.convert("L").point(lambda p: 255 if p < 240 else 0)
img.putalpha(mask)
bg = Image.new("RGBA", img.size, (13, 32, 53, 255))
out = Image.alpha_composite(bg, img).convert("RGB")

out.save(out_path, format="JPEG", quality=85)
print("Saved にょろにょろ125.jpg")
