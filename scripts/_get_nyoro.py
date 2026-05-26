import re, requests
r = requests.get('https://www.kingfisher.co.jp/SHOP/4511729215.html')
m = re.search(r'<img[^>]+src="([^"]+)"[^>]*id="mainImage"', r.text)
if m:
    url = m.group(1)
    if url.startswith('/'):
        url = 'https://www.kingfisher.co.jp' + url
    print("Found:", url)
else:
    m2 = re.search(r'<img[^>]+src="([^"]+nyoro[^"]+)"', r.text)
    if m2:
        print("Found backup:", m2.group(1))
