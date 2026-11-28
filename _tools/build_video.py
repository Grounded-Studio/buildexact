"""Watch page for the BuildExact promo video: /video/ (EN) and /nl/video/ (NL).

Run from the site root:  python -I _tools/build_video.py

The video is the main content of the page, with VideoObject data and key
moments (Clip), so Google can show it in video results. It plays from YouTube
in privacy-enhanced mode after a click, like the video on the home page.

To switch to another upload: change VIDEO (id, upload date, duration) and
CHAPTERS, save a new thumbnail as assets/video/video-thumb-1280.webp and
-640.webp, and run this again.
"""
import html
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://buildexact.app"
PLAY = "https://play.google.com/store/apps/details?id=com.metenweten.bouw"

VIDEO = dict(id="OyRu-W6PEFg", upload="2026-11-23T15:19:04-08:00", seconds=74)

# start second, (title en, nl), (what you see en, nl)
CHAPTERS = [
    (0, ("Tile calculator", "Tegelcalculator"),
     ("How many tiles do I need? Type the size and pattern: 75 tiles, with boxes and adhesive.",
      "Hoeveel tegels heb ik nodig? Typ de maat en het patroon: 75 tegels, met dozen en lijm.")),
    (11, ("Fence planner", "Schuttingplanner"),
     ("Enter the length: 9 posts and 7 panels, end panels and gates included, shared in one tap.",
      "Vul de lengte in: 9 palen en 7 schermen, met pasvakken en poorten, in één tik gedeeld.")),
    (21, ("Quotes", "Offertes"),
     ("Write the quote on site: tap a line, add a price, and send a PDF with your logo and VAT.",
      "Maak de offerte op de bouw: tik een regel aan, vul de prijs in en verstuur een PDF met je logo en btw.")),
    (37, ("Payment reminder", "Betalingsherinnering"),
     ("Overdue invoices stand out and a reminder PDF goes out in one tap.",
      "Verlopen facturen vallen op en een herinnering-PDF verstuur je met één tik.")),
    (46, ("My Day", "Mijn Dag"),
     ("What you earned this week and what needs attention, at a glance.",
      "Wat je deze week verdiende en wat aandacht nodig heeft, in één oogopslag.")),
    (56, ("25 calculators", "25 calculators"),
     ("Concrete, fence, tiles, paint and more, collected per project in a material list.",
      "Beton, schutting, tegels, verf en meer, per project verzameld in een materiaallijst.")),
    (65, ("Get BuildExact", "BuildExact downloaden"),
     ("Free on Google Play.", "Gratis in Google Play.")),
]

T = {
    "en": dict(
        path="/video/", other="/nl/video/", base="/", locale="en_US", crumb="Breadcrumb",
        title="BuildExact Video: The App in Just Over a Minute",
        name="BuildExact: Construction Calculators, Quotes & Invoices in One Free App",
        desc="Watch BuildExact in just over a minute: tiles and fence posts worked out, a quote on site, a payment reminder, your week on one screen and 25 building calculators, in the real app.",
        h1="BuildExact in just over a minute",
        lede="Six things BuildExact does for you, in the real app: work out tiles and fence posts, write a quote on site, send a payment reminder, see your week and pick from 25 calculators.",
        play="Play video: BuildExact in just over a minute", badge="1:14 · Watch on YouTube",
        note="The video loads from YouTube (privacy-enhanced mode) once you press play.",
        chapters="Chapters", time="Time", part="Part", seen="What you see",
        about="About BuildExact",
        about_p=["BuildExact is a construction app for tradespeople and DIYers. You calculate materials, keep every job in a project and send quotes and invoices as PDF, straight from your phone.",
                 "The calculators also work in your browser. Try one of the <a href=\"/calculators/\">construction calculators</a>, or read how the workflow goes in <a href=\"/blog/from-measurement-to-invoice-5-minutes/\">From Measurement to Invoice in 5 Minutes</a>."],
        cta="Install BuildExact free", badge_alt="Get it on Google Play", badge_img="/assets/icons/google-play-badge-en.svg",
        thumb_alt="BuildExact video: measure, quote, get paid"),
    "nl": dict(
        path="/nl/video/", other="/video/", base="/nl/", locale="nl_NL", crumb="Kruimelpad",
        title="BuildExact video: de app in ruim een minuut",
        name="BuildExact: bouwcalculators, offertes en facturen in één gratis app",
        desc="Bekijk BuildExact in ruim een minuut: tegels en schuttingpalen berekenen, een offerte op de bouw, een betalingsherinnering, je week in één scherm en 25 bouwcalculators, in de echte app (Engelstalig).",
        h1="BuildExact in ruim een minuut",
        lede="Zes dingen die BuildExact voor je doet, in de echte app: tegels en schuttingpalen berekenen, een offerte op de bouw, een betalingsherinnering, je week in één scherm en 25 calculators. De video is Engelstalig.",
        play="Video afspelen: BuildExact in ruim een minuut", badge="1:14 · Engelstalig · Bekijk op YouTube",
        note="De video laadt van YouTube (privacyvriendelijke modus) zodra je op afspelen drukt.",
        chapters="Hoofdstukken", time="Tijd", part="Onderdeel", seen="Wat je ziet",
        about="Over BuildExact",
        about_p=["BuildExact is een bouw-app voor vakmensen en doe-het-zelvers. Je rekent materiaal uit, houdt elke klus bij in een project en verstuurt offertes en facturen als PDF, direct vanaf je telefoon.",
                 "De calculators werken ook in je browser. Probeer een van de <a href=\"/nl/calculators/\">bouwcalculators</a>, of lees hoe de werkwijze gaat in <a href=\"/nl/blog/van-meting-tot-factuur-in-5-minuten/\">Van meting tot factuur in 5 minuten</a>."],
        cta="Installeer BuildExact gratis", badge_alt="Ontdek het op Google Play", badge_img="/assets/icons/google-play-badge-nl.svg",
        thumb_alt="BuildExact video: meten, offreren, betaald worden"),
}

PLAY_JS = """<script>
document.querySelectorAll('.yt-video a[data-yt]').forEach(function (a) {
  a.addEventListener('click', function (e) {
    e.preventDefault();
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + a.dataset.yt + '?autoplay=1&rel=0' + (a.dataset.start ? '&start=' + a.dataset.start : '');
    f.title = a.getAttribute('aria-label');
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    f.allowFullScreen = true;
    a.replaceWith(f);
  });
});
// Chapter links start the video at that moment on this page.
document.querySelectorAll('a[data-seek]').forEach(function (c) {
  c.addEventListener('click', function (e) {
    var box = document.querySelector('.yt-video');
    if (!box) return;
    e.preventDefault();
    var id = '""" + VIDEO["id"] + """', s = c.dataset.seek;
    var f = box.querySelector('iframe') || document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&start=' + s;
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    f.allowFullScreen = true;
    var a = box.querySelector('a[data-yt]');
    if (a) { f.title = a.getAttribute('aria-label'); a.replaceWith(f); }
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
});
</script>"""


def read(path):
    with open(os.path.join(ROOT, path), encoding="utf-8-sig") as f:
        return f.read()


def write(path, text):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8", newline="") as f:
        f.write(text)


def esc(s):
    return html.escape(s, quote=True)


def mmss(s):
    return f"{s // 60}:{s % 60:02d}"


def shell(lang):
    s = read("nl/blog/index.html" if lang == "nl" else "blog/index.html")
    header = re.search(r'<header class="site-header">.*?</header>', s, re.S).group(0)
    footer = re.search(r'<footer class="site-footer">.*?</footer>', s, re.S).group(0)
    en, nl = T["en"]["path"], T["nl"]["path"]
    header = re.sub(r'<div class="lang-switch">.*?</div>',
                    f'<div class="lang-switch"><a href="{en}"{" class=\"active\"" if lang == "en" else ""}>EN</a>'
                    f'<a href="{nl}"{" class=\"active\"" if lang == "nl" else ""}>NL</a></div>', header, count=1, flags=re.S)
    return header, footer


def watch(lang, s=None):
    return f"https://www.youtube.com/watch?v={VIDEO['id']}" + (f"&t={s}s" if s else "")


def build(lang):
    t = T[lang]
    i = 0 if lang == "en" else 1
    header, footer = shell(lang)
    full = SITE + t["path"]
    secs = VIDEO["seconds"]

    clips = []
    for k, (start, title, _) in enumerate(CHAPTERS):
        end = CHAPTERS[k + 1][0] if k + 1 < len(CHAPTERS) else secs
        clips.append({"@type": "Clip", "name": title[i], "startOffset": start, "endOffset": end, "url": watch(lang, start)})
    video_ld = {
        "@context": "https://schema.org", "@type": "VideoObject", "name": t["name"], "description": t["desc"],
        "thumbnailUrl": [f"{SITE}/assets/video/video-thumb-1280.webp", f"https://i.ytimg.com/vi/{VIDEO['id']}/maxresdefault.jpg"],
        "uploadDate": VIDEO["upload"], "duration": f"PT{secs // 60}M{secs % 60}S",
        "embedUrl": f"https://www.youtube-nocookie.com/embed/{VIDEO['id']}", "contentUrl": watch(lang),
        "inLanguage": "en", "publisher": {"@type": "Organization", "name": "Grounded Studio", "url": "https://grounded-studio.app/"},
        "hasPart": clips,
    }
    crumb_ld = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE + t["base"]},
        {"@type": "ListItem", "position": 2, "name": "Video", "item": full}]}

    rows = "".join(
        f'\n      <tr><td><a href="{watch(lang, s)}" data-seek="{s}">{mmss(s)}</a></td><td>{esc(title[i])}</td><td>{esc(seen[i])}</td></tr>'
        for s, title, seen in CHAPTERS)
    about = "".join(f"\n    <p>{p}</p>" for p in t["about_p"])

    return f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(t['title'])} | BuildExact</title>
<meta name="description" content="{esc(t['desc'])}">
<meta property="og:type" content="video.other">
<meta property="og:site_name" content="BuildExact">
<meta property="og:url" content="{full}">
<meta property="og:title" content="{esc(t['title'])}">
<meta property="og:description" content="{esc(t['desc'])}">
<meta property="og:image" content="{SITE}/assets/video/video-thumb-1280.webp">
<meta property="og:image:width" content="1280">
<meta property="og:image:height" content="720">
<meta property="og:locale" content="{t['locale']}">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="{full}">
<link rel="alternate" hreflang="en" href="{SITE}{T['en']['path']}">
<link rel="alternate" hreflang="nl" href="{SITE}{T['nl']['path']}">
<link rel="icon" type="image/png" sizes="64x64" href="/assets/icons/icon-64.png">
<link rel="apple-touch-icon" sizes="512x512" href="/assets/icons/icon-512.png">
<meta name="theme-color" content="#2563EB">
<link rel="stylesheet" href="/assets/css/style.css">
<script src="/assets/js/lang.js"></script>
<script type="application/ld+json">{json.dumps(video_ld, ensure_ascii=False)}</script>
</head>
<body>
{header}
<nav class="breadcrumbs" aria-label="{t['crumb']}"><div class="container"><ol><li><a href="{t['base']}">Home</a></li><li aria-current="page">Video</li></ol></div></nav>
<script type="application/ld+json">{json.dumps(crumb_ld, ensure_ascii=False)}</script>

<section class="section" style="padding-top:40px;">
  <div class="container">
    <div class="section-head">
      <h1>{esc(t['h1'])}</h1>
      <p class="lede">{esc(t['lede'])}</p>
    </div>
    <div class="yt-video">
      <a href="{watch(lang)}" data-yt="{VIDEO['id']}" aria-label="{esc(t['play'])}">
        <img src="/assets/video/video-thumb-1280.webp" srcset="/assets/video/video-thumb-640.webp 640w, /assets/video/video-thumb-1280.webp 1280w" sizes="(max-width: 920px) 100vw, 880px" width="1280" height="720" alt="{esc(t['thumb_alt'])}" decoding="async">
        <span class="yt-play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.6-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg></span>
        <span class="yt-badge">{esc(t['badge'])}</span>
      </a>
    </div>
    <p class="yt-note">{esc(t['note'])}</p>
  </div>
</section>

<section class="section calc-guide">
  <div class="container calc-guide-inner">
    <h2>{t['chapters']}</h2>
    <div class="table-wrap"><table><tr><th>{t['time']}</th><th>{t['part']}</th><th>{t['seen']}</th></tr>{rows}
    </table></div>
    <h2>{t['about']}</h2>{about}
    <p style="text-align:center;margin:28px 0;"><a href="{PLAY}" class="store-badge store-badge-img" target="_blank" rel="noopener" aria-label="{t['badge_alt']}"><img src="{t['badge_img']}" alt="{t['badge_alt']}"></a></p>
  </div>
</section>

{footer}
<script src="/assets/js/main.js"></script>
{PLAY_JS}
</body>
</html>
"""


def add_sitemap():
    sm = read("sitemap.xml")
    for lang in ("en", "nl"):
        loc = f"<loc>{SITE}{T[lang]['path']}</loc>"
        if loc not in sm:
            sm = sm.replace("</urlset>", f"  <url>{loc}<priority>0.7</priority></url>\n</urlset>")
    write("sitemap.xml", sm)


def link_from_home():
    """A line under the home page video that points to the watch page (once)."""
    for path, lang in (("index.html", "en"), ("nl/index.html", "nl")):
        page = read(path)
        if f'href="{T[lang]["path"]}"' in page:
            continue
        text = "Chapters and a full overview on the video page &rarr;" if lang == "en" else "Hoofdstukken en een volledig overzicht op de videopagina &rarr;"
        page, n = re.subn(r'(<p class="yt-note">.*?</p>)', lambda m: m.group(1) + f'\n    <p class="yt-note"><a href="{T[lang]["path"]}">{text}</a></p>',
                          page, count=1, flags=re.S)
        if n:
            write(path, page)


def main():
    for lang in ("en", "nl"):
        write(T[lang]["path"].strip("/") + "/index.html", build(lang))
        print("  " + T[lang]["path"])
    add_sitemap()
    link_from_home()
    print("Done. Run _tools/related_links.py for the sitemap dates.")


if __name__ == "__main__":
    main()

# Cross-promo block for the other Grounded Studio apps (re-added after every build).
if __name__ == "__main__":
    import os as _os, subprocess as _sp, sys as _sys
    _XP = r"C:\meten_weten_bouw\scripts\cross_promo.py"
    if _os.path.exists(_XP):
        _sp.run([_sys.executable, "-I", _XP, "buildexact"], check=False)
