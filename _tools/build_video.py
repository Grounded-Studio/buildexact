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

VIDEO = dict(id="ArBX3mV-2jI", upload="2026-11-12T13:41:40-08:00", seconds=110)

# start second, (title en, nl), (what you see en, nl)
CHAPTERS = [
    (0, ("Intro", "Intro"), ("Measure, quote and get paid in one app.", "Meten, offreren en betaald worden in één app.")),
    (4, ("Business overview", "Bedrijfsoverzicht"),
     ("Open quotes, unpaid and overdue invoices and this month's income at a glance.",
      "Open offertes, onbetaalde en te late facturen en je omzet van deze maand in één oogopslag.")),
    (11, ("Calculators", "Calculators"),
     ("Type a size and get the materials: tiles, paint, concrete, paving, bricks and more.",
      "Vul een maat in en krijg het materiaal: tegels, verf, beton, bestrating, stenen en meer.")),
    (28, ("Fence planner", "Schuttingplanner"),
     ("Posts, panels, end panels and gates counted exactly, shared as a neat result card.",
      "Palen, schermen, pasvakken en poorten exact geteld, gedeeld als nette resultaatkaart.")),
    (37, ("Projects", "Projecten"),
     ("All measurements of a job in one project, with a material list and totals.",
      "Alle metingen van een klus in één project, met een materiaallijst en totalen.")),
    (47, ("Quotes", "Offertes"),
     ("Tap a line, add a price and send a quote PDF with your logo, VAT and signature.",
      "Tik een regel aan, vul de prijs in en verstuur een offerte-PDF met je logo, btw en handtekening.")),
    (73, ("Invoices", "Facturen"),
     ("Turn the quote into an invoice, see what is paid or overdue and send a reminder.",
      "Maak van de offerte een factuur, zie wat betaald of te laat is en stuur een herinnering.")),
    (83, ("My Day", "Mijn Dag"),
     ("This week's earnings, what needs attention today and a trade tip.",
      "De omzet van deze week, wat vandaag aandacht nodig heeft en een vak-tip.")),
    (89, ("Clients & branding", "Klanten & bedrijf"),
     ("Your clients with call, WhatsApp and e-mail, and your logo on every PDF.",
      "Je klanten met bellen, WhatsApp en e-mail, en je logo op elke PDF.")),
    (101, ("Private & offline", "Privé & offline"),
     ("Your data stays on your phone. Works without internet, with dark mode.",
      "Je gegevens blijven op je telefoon. Werkt zonder internet, met donkere modus.")),
    (104, ("Get BuildExact", "BuildExact downloaden"),
     ("Free on Google Play.", "Gratis in Google Play.")),
]

T = {
    "en": dict(
        path="/video/", other="/nl/video/", base="/", locale="en_US", crumb="Breadcrumb",
        title="BuildExact Video: The App in 2 Minutes",
        name="BuildExact – Measure, Quote & Get Paid | The All-in-One App for Builders",
        desc="Watch BuildExact in under two minutes: calculators, fence planner, projects, quote PDFs, invoices and reminders, step by step in the real app.",
        h1="BuildExact in 2 minutes",
        lede="The whole workflow in the real app: from the first measurement and the materials to a quote, an invoice and getting paid.",
        play="Play video: BuildExact in 2 minutes", badge="1:50 · Watch on YouTube",
        note="The video loads from YouTube (privacy-enhanced mode) once you press play.",
        chapters="Chapters", time="Time", part="Part", seen="What you see",
        about="About BuildExact",
        about_p=["BuildExact is a construction app for tradespeople and DIYers. You calculate materials, keep every job in a project and send quotes and invoices as PDF, straight from your phone.",
                 "The calculators also work in your browser. Try one of the <a href=\"/calculators/\">construction calculators</a>, or read how the workflow goes in <a href=\"/blog/from-measurement-to-invoice-5-minutes/\">From Measurement to Invoice in 5 Minutes</a>."],
        cta="Install BuildExact free", badge_alt="Get it on Google Play", badge_img="/assets/icons/google-play-badge-en.svg",
        thumb_alt="BuildExact video: measure, quote, get paid"),
    "nl": dict(
        path="/nl/video/", other="/video/", base="/nl/", locale="nl_NL", crumb="Kruimelpad",
        title="BuildExact video: de app in 2 minuten",
        name="BuildExact – Meten, offreren en betaald worden | De alles-in-één app voor bouwers",
        desc="Bekijk BuildExact in nog geen twee minuten: calculators, schuttingplanner, projecten, offerte-PDF's, facturen en herinneringen in de echte app.",
        h1="BuildExact in 2 minuten",
        lede="De hele werkwijze in de echte app: van de eerste meting en het materiaal tot een offerte, een factuur en betaald worden.",
        play="Video afspelen: BuildExact in 2 minuten", badge="1:50 · Bekijk op YouTube",
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
