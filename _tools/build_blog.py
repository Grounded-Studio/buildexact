"""Build new blog articles for buildexact.app from _tools/blog_posts.py.

Run from the site root:  python -I _tools/build_blog.py

For every post in blog_posts.py it writes blog/<slug>/index.html (EN) and/or
nl/blog/<slug>/index.html (NL) in the same layout as the existing articles,
with: breadcrumbs (visible + BreadcrumbList), canonical, hreflang between the
EN and NL version, Open Graph / Twitter tags, BlogPosting data, the Google
Play badge, share buttons and an install button. It also adds a card to the
top of the blog overview and a line to sitemap.xml (only once).

The 22 hand-written articles from before this script are not touched.
Edit a post's text in blog_posts.py and run this again to update it.
"""
import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "_tools"))
from blog_posts import POSTS  # noqa: E402

SITE = "https://buildexact.app"
PLAY = "https://play.google.com/store/apps/details?id=com.metenweten.bouw"
TITLE_MAX_PX, DESC_MAX_PX = 580, 1000  # Google's snippet limits

MONTHS = {
    "en": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    "nl": ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"],
}
T = {
    "en": dict(base="/", blog="/blog/", min="min read", share="Found this useful?", wa="Share on WhatsApp",
               copy="Copy link", install="Install BuildExact free", badge_alt="Get it on Google Play",
               badge="/assets/icons/google-play-badge-en.svg", locale="en_US", og="og-en.jpg", crumb="Breadcrumb"),
    "nl": dict(base="/nl/", blog="/nl/blog/", min="min lezen", share="Iets aan gehad?", wa="Deel via WhatsApp",
               copy="Link kopiëren", install="Installeer BuildExact gratis", badge_alt="Ontdek het op Google Play",
               badge="/assets/icons/google-play-badge-nl.svg", locale="nl_NL", og="og-nl.jpg", crumb="Kruimelpad"),
}
WA_ICON = ('<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.524 5.847L0 24l6.336-1.501A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.808 9.808 0 01-5.001-1.371l-.361-.214-3.762.891.952-3.657-.235-.375A9.808 9.808 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>')
COPY_ICON = ('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>')


def esc(s):
    return html.escape(s, quote=True)


def read(path):
    with open(os.path.join(ROOT, path), encoding="utf-8") as f:
        return f.read()


def write(path, text):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8", newline="") as f:
        f.write(text)


def nice_date(iso, lang):
    y, m, d = (int(x) for x in iso.split("-"))
    return f"{MONTHS['en'][m - 1]} {d}, {y}" if lang == "en" else f"{d} {MONTHS['nl'][m - 1]} {y}"


def check_lengths(lang, p):
    """Warn when the title or description would be cut off in Google."""
    try:
        from PIL import ImageFont
        ft, fd = ImageFont.truetype("arial.ttf", 20), ImageFont.truetype("arial.ttf", 14)
    except Exception:
        return
    tp = ft.getlength(p["title"] + " | BuildExact")
    dp = fd.getlength(p["desc"])
    if tp > TITLE_MAX_PX:
        print(f"  ! {lang}/{p['slug']}: title {tp:.0f}px > {TITLE_MAX_PX}px — shorten 'title'")
    if dp > DESC_MAX_PX:
        print(f"  ! {lang}/{p['slug']}: description {dp:.0f}px > {DESC_MAX_PX}px — shorten 'desc'")


def shell(lang):
    """Header (menu) and footer, taken from the live blog overview page."""
    s = read("nl/blog/index.html" if lang == "nl" else "blog/index.html")
    header = re.search(r"<header class=\"site-header\">.*?</header>", s, re.S).group(0)
    footer = re.search(r"<footer class=\"site-footer\">.*?</footer>", s, re.S).group(0)
    return header, footer


def build_post(post, lang, header, footer):
    p, t = post[lang], T[lang]
    other = "en" if lang == "nl" else "nl"
    url = f"{t['blog']}{p['slug']}/"
    full = SITE + url
    title = f"{p['title']} | BuildExact"
    other_url = f"{T[other]['blog']}{post[other]['slug']}/" if other in post else T[other]["blog"]

    # Language switch points to the translation (or the other blog overview).
    en_href, nl_href = (url, other_url) if lang == "en" else (other_url, url)
    hdr = re.sub(r'<div class="lang-switch">.*?</div>',
                 f'<div class="lang-switch"><a href="{en_href}"{" class=\"active\"" if lang == "en" else ""}>EN</a>'
                 f'<a href="{nl_href}"{" class=\"active\"" if lang == "nl" else ""}>NL</a></div>', header, count=1, flags=re.S)

    hreflang = f'<link rel="alternate" hreflang="{lang}" href="{full}">'
    if other in post:
        hreflang += f'\n<link rel="alternate" hreflang="{other}" href="{SITE}{other_url}">'

    crumbs = [("Home", t["base"]), ("Blog", t["blog"]), (p["title"], url)]
    crumb_ld = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": n, "item": SITE + u} for i, (n, u) in enumerate(crumbs)]}
    post_ld = {"@context": "https://schema.org", "@type": "BlogPosting", "headline": p["h1"], "description": p["desc"],
               "author": {"@type": "Organization", "name": "Grounded Studio"}, "datePublished": post["date"],
               "inLanguage": lang, "image": f"{SITE}/assets/og/{t['og']}", "mainEntityOfPage": full}
    crumb_html = (f'<nav class="breadcrumbs" aria-label="{t["crumb"]}"><div class="container"><ol>'
                  f'<li><a href="{t["base"]}">Home</a></li><li><a href="{t["blog"]}">Blog</a></li>'
                  f'<li aria-current="page">{esc(p["title"])}</li></ol></div></nav>')

    badge = (f'<p style="text-align:center;margin:28px 0;"><a href="{PLAY}" class="store-badge store-badge-img" target="_blank" '
             f'rel="noopener" aria-label="{t["badge_alt"]}"><img src="{t["badge"]}" alt="{t["badge_alt"]}"></a></p>')
    meta = f'{p["badge"]} &middot; 📅 {nice_date(post["date"], lang)} ⏱ {post["minutes"]} {t["min"]} ✍️ Grounded Studio'

    return f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(p['desc'])}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="BuildExact">
<meta property="og:url" content="{full}">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(p['desc'])}">
<meta property="og:image" content="{SITE}/assets/og/{t['og']}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="{t['locale']}">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="{full}">
{hreflang}
<link rel="icon" type="image/png" sizes="64x64" href="/assets/icons/icon-64.png">
<link rel="apple-touch-icon" sizes="512x512" href="/assets/icons/icon-512.png">
<meta name="theme-color" content="#2563EB">
<link rel="stylesheet" href="/assets/css/style.css">
<script src="/assets/js/lang.js"></script>
<script type="application/ld+json">{json.dumps(post_ld, ensure_ascii=False)}</script>
</head>
<body>
{hdr}
{crumb_html}
<script type="application/ld+json">{json.dumps(crumb_ld, ensure_ascii=False)}</script>

<article class="article">
  <h1>{esc(p['h1'])}</h1>
  <p class="meta">{meta}</p>

<p>{p['intro']}</p>

{p['body'].strip()}

{badge}

  <div class="share-section">
    <p class="share-label">{t['share']}</p>
    <div class="share-btns">
      <a class="share-btn wa" id="share-wa" target="_blank" rel="noopener">{WA_ICON} {t['wa']}</a>
      <button class="share-btn copy" id="share-copy">{COPY_ICON} {t['copy']}</button>
    </div>
  </div>

  <p style="margin-top:40px;text-align:center;">
    <a href="{PLAY}" class="btn btn-primary">{t['install']}</a>
  </p>
</article>

{footer}
<script src="/assets/js/main.js"></script>
</body>
</html>
"""


def add_card(post, lang):
    """Card at the top of the blog overview (once)."""
    p, t = post[lang], T[lang]
    url = f"{t['blog']}{p['slug']}/"
    path = "nl/blog/index.html" if lang == "nl" else "blog/index.html"
    s = read(path)
    if f'href="{url}"' in s:
        return False
    card = (f'\n      <a href="{url}" class="card">\n        <span class="badge">{esc(p["card_badge"])}</span>\n'
            f'        <h3>{esc(p["title"])}</h3>\n        <p>{esc(p["card_text"])}</p>\n      </a>')
    s, n = re.subn(r'(<div class="grid grid-3">)', lambda m: m.group(1) + card, s, count=1)
    if n != 1:
        print(f"  ! could not find the card grid in {path}")
        return False
    write(path, s)
    return True


def add_sitemap(url):
    s = read("sitemap.xml")
    loc = f"<loc>{SITE}{url}</loc>"
    if loc in s:
        return False
    s = s.replace("</urlset>", f"  <url>{loc}<priority>0.7</priority></url>\n</urlset>")
    write("sitemap.xml", s)
    return True


def main():
    if not POSTS:
        print("No posts in _tools/blog_posts.py yet. Copy the example there and fill it in.")
        return
    shells = {lang: shell(lang) for lang in ("en", "nl")}
    for post in POSTS:
        for lang in ("en", "nl"):
            if lang not in post:
                continue
            p = post[lang]
            check_lengths(lang, p)
            path = f"{'nl/' if lang == 'nl' else ''}blog/{p['slug']}/index.html"
            write(path, build_post(post, lang, *shells[lang]))
            card = add_card(post, lang)
            sm = add_sitemap(f"{T[lang]['blog']}{p['slug']}/")
            print(f"  {path}" + (" + card" if card else "") + (" + sitemap" if sm else ""))
    print("Done. Check the pages locally, then commit and push.")


if __name__ == "__main__":
    main()
