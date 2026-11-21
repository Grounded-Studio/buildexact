"""Internal links between calculators and blog articles, plus <lastmod> in the sitemap.

Run from the site root, after the other build scripts:
    python -I _tools/related_links.py

- Every calculator page gets a block "Related calculators" (same trade first)
  and "Read more" (matching blog articles), above the install strip.
- Every blog article that matches a calculator gets a box with links to those
  calculators, above the share buttons.
- Every blog article gets "Read also" with three related articles (READ_ALSO).
- Both homepages get "Latest guides": the six newest articles.
- Every page with an English version gets <link hreflang="x-default"> to it.
- sitemap.xml gets a <lastmod> per page: the date of the last commit of that
  file, or today for files changed since.

Blocks sit between <!-- related:start --> and <!-- related:end -->, so running
this again replaces them instead of adding a second copy.
"""
import datetime
import html
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "_tools"))
from build_calc_pages import CATALOG, GROUPS, NEW, UPGRADE  # noqa: E402

SITE = "https://buildexact.app"
START, END = "<!-- related:start -->", "<!-- related:end -->"

# Blog articles per calculator, most relevant first. Missing slugs are skipped.
ARTICLES = {
    "en": {
        "area": ["how-to-measure-a-room-accurately"],
        "volume": ["how-much-concrete-do-i-need", "how-to-measure-a-room-accurately"],
        "linear": ["how-to-measure-a-room-accurately"],
        "perimeter": ["how-to-measure-a-room-accurately"],
        "wall-area": ["how-much-paint-do-i-need", "how-much-wallpaper-do-i-need"],
        "paint": ["how-much-paint-do-i-need", "how-much-wallpaper-do-i-need"],
        "plaster": ["how-to-measure-a-room-accurately", "renovation-cost-estimate"],
        "drywall": ["how-much-insulation-do-i-need", "renovation-cost-estimate"],
        "insulation": ["how-much-insulation-do-i-need"],
        "tiles": ["how-to-calculate-tiles", "bathroom-renovation-cost"],
        "flooring": ["how-much-laminate-do-i-need", "how-to-measure-a-room-accurately"],
        "paving": ["how-much-concrete-do-i-need"],
        "concrete": ["how-much-concrete-do-i-need"],
        "round-column": ["how-much-concrete-do-i-need"],
        "bricks": ["how-many-bricks-per-m2"],
        "steel": ["how-much-concrete-do-i-need"],
        "fence": ["how-many-fence-posts-and-panels-do-i-need"],
        "excavation": ["how-much-concrete-do-i-need"],
        "cost": ["renovation-cost-estimate", "how-to-write-construction-quote", "track-hours-per-job-and-invoice"],
        "converter": ["how-to-measure-a-room-accurately", "phone-spirit-level-accuracy"],
        "drilling": ["digital-work-order-with-customer-signature", "track-hours-per-job-and-invoice", "payment-qr-code-on-invoices"],
        "stairs": ["phone-spirit-level-accuracy", "how-to-measure-a-room-accurately"],
        "wood": ["how-many-fence-posts-and-panels-do-i-need", "phone-spirit-level-accuracy"],
        "sheets": ["how-much-insulation-do-i-need", "renovation-cost-estimate"],
        "tank": ["how-much-concrete-do-i-need"],
    },
    "nl": {
        "volume": ["hoeveel-m3-beton-berekenen"],
        "tiles": ["snijverlies-berekenen-tegels-laminaat"],
        "flooring": ["snijverlies-berekenen-tegels-laminaat"],
        "paving": ["hoeveel-m3-beton-berekenen", "materialenprijzen-2026-bouwprijzen-per-m2"],
        "concrete": ["hoeveel-m3-beton-berekenen"],
        "round-column": ["hoeveel-m3-beton-berekenen"],
        "bricks": ["hoeveel-stenen-per-m2-metselwerk"],
        "steel": ["hoeveel-m3-beton-berekenen"],
        "drilling": ["kernboring-prijs-berekenen", "diamantboor-onderhoud", "digitale-werkbon-met-handtekening-klant"],
        "fence": ["schutting-berekenen-hoeveel-palen-en-schermen", "waterpas-app-hoe-nauwkeurig"],
        "excavation": ["hoeveel-m3-beton-berekenen"],
        "cost": ["materialenprijzen-2026-bouwprijzen-per-m2", "urenregistratie-zzp-bouw-uren-factureren", "van-meting-tot-factuur-in-5-minuten"],
        "stairs": ["waterpas-app-hoe-nauwkeurig"],
        "wood": ["schutting-berekenen-hoeveel-palen-en-schermen", "waterpas-app-hoe-nauwkeurig"],
        "converter": ["waterpas-app-hoe-nauwkeurig"],
    },
}
# "Read also" under every blog article: three related articles in the same language.
READ_ALSO = {
    "en": {
        "bathroom-renovation-cost": ["how-to-calculate-tiles", "renovation-cost-estimate", "how-to-write-construction-quote"],
        "client-management-for-contractors": ["recurring-invoices-maintenance-contracts", "send-quotes-invoices-whatsapp", "track-hours-per-job-and-invoice"],
        "contractor-hourly-rates-netherlands": ["track-hours-per-job-and-invoice", "how-to-write-construction-quote", "renovation-cost-estimate"],
        "digital-signatures-construction-quotes": ["digital-work-order-with-customer-signature", "how-to-write-construction-quote", "send-quotes-invoices-whatsapp"],
        "digital-work-order-with-customer-signature": ["digital-signatures-construction-quotes", "track-hours-per-job-and-invoice", "payment-qr-code-on-invoices"],
        "from-measurement-to-invoice-5-minutes": ["how-to-measure-a-room-accurately", "how-to-write-construction-quote", "payment-qr-code-on-invoices"],
        "how-many-bricks-per-m2": ["how-much-concrete-do-i-need", "how-many-fence-posts-and-panels-do-i-need", "how-much-insulation-do-i-need"],
        "how-many-fence-posts-and-panels-do-i-need": ["how-much-concrete-do-i-need", "how-many-bricks-per-m2", "phone-spirit-level-accuracy"],
        "how-much-concrete-do-i-need": ["how-many-bricks-per-m2", "how-many-fence-posts-and-panels-do-i-need", "how-to-measure-a-room-accurately"],
        "how-much-insulation-do-i-need": ["how-much-paint-do-i-need", "how-many-bricks-per-m2", "renovation-cost-estimate"],
        "how-much-laminate-do-i-need": ["how-to-calculate-tiles", "how-to-measure-a-room-accurately", "how-much-paint-do-i-need"],
        "how-much-paint-do-i-need": ["how-much-wallpaper-do-i-need", "how-to-measure-a-room-accurately", "how-much-laminate-do-i-need"],
        "how-much-wallpaper-do-i-need": ["how-much-paint-do-i-need", "how-to-measure-a-room-accurately", "how-much-laminate-do-i-need"],
        "how-to-calculate-tiles": ["how-much-laminate-do-i-need", "bathroom-renovation-cost", "how-to-measure-a-room-accurately"],
        "how-to-measure-a-room-accurately": ["phone-spirit-level-accuracy", "how-to-calculate-tiles", "how-much-paint-do-i-need"],
        "how-to-write-construction-quote": ["digital-signatures-construction-quotes", "send-quotes-invoices-whatsapp", "from-measurement-to-invoice-5-minutes"],
        "payment-qr-code-on-invoices": ["track-hours-per-job-and-invoice", "recurring-invoices-maintenance-contracts", "send-quotes-invoices-whatsapp"],
        "phone-spirit-level-accuracy": ["how-to-measure-a-room-accurately", "how-many-fence-posts-and-panels-do-i-need", "how-to-calculate-tiles"],
        "recurring-invoices-maintenance-contracts": ["client-management-for-contractors", "payment-qr-code-on-invoices", "track-hours-per-job-and-invoice"],
        "renovation-cost-estimate": ["bathroom-renovation-cost", "contractor-hourly-rates-netherlands", "how-to-write-construction-quote"],
        "send-quotes-invoices-whatsapp": ["digital-signatures-construction-quotes", "payment-qr-code-on-invoices", "how-to-write-construction-quote"],
        "track-hours-per-job-and-invoice": ["contractor-hourly-rates-netherlands", "digital-work-order-with-customer-signature", "payment-qr-code-on-invoices"],
    },
    "nl": {
        "betaal-qr-code-op-factuur": ["urenregistratie-zzp-bouw-uren-factureren", "onderhoudscontract-terugkerende-facturen-opzetten", "offerte-versturen-via-whatsapp"],
        "diamantboor-onderhoud": ["kernboring-prijs-berekenen", "waterpas-app-hoe-nauwkeurig", "materialenprijzen-2026-bouwprijzen-per-m2"],
        "digitale-werkbon-met-handtekening-klant": ["urenregistratie-zzp-bouw-uren-factureren", "offerte-versturen-via-whatsapp", "betaal-qr-code-op-factuur"],
        "hoeveel-m3-beton-berekenen": ["hoeveel-stenen-per-m2-metselwerk", "schutting-berekenen-hoeveel-palen-en-schermen", "snijverlies-berekenen-tegels-laminaat"],
        "hoeveel-stenen-per-m2-metselwerk": ["hoeveel-m3-beton-berekenen", "schutting-berekenen-hoeveel-palen-en-schermen", "materialenprijzen-2026-bouwprijzen-per-m2"],
        "kernboring-prijs-berekenen": ["diamantboor-onderhoud", "materialenprijzen-2026-bouwprijzen-per-m2", "digitale-werkbon-met-handtekening-klant"],
        "materialenprijzen-2026-bouwprijzen-per-m2": ["snijverlies-berekenen-tegels-laminaat", "hoeveel-stenen-per-m2-metselwerk", "van-meting-tot-factuur-in-5-minuten"],
        "offerte-versturen-via-whatsapp": ["digitale-werkbon-met-handtekening-klant", "betaal-qr-code-op-factuur", "van-meting-tot-factuur-in-5-minuten"],
        "onderhoudscontract-terugkerende-facturen-opzetten": ["betaal-qr-code-op-factuur", "urenregistratie-zzp-bouw-uren-factureren", "offerte-versturen-via-whatsapp"],
        "schutting-berekenen-hoeveel-palen-en-schermen": ["hoeveel-m3-beton-berekenen", "hoeveel-stenen-per-m2-metselwerk", "waterpas-app-hoe-nauwkeurig"],
        "snijverlies-berekenen-tegels-laminaat": ["materialenprijzen-2026-bouwprijzen-per-m2", "hoeveel-m3-beton-berekenen", "waterpas-app-hoe-nauwkeurig"],
        "urenregistratie-zzp-bouw-uren-factureren": ["digitale-werkbon-met-handtekening-klant", "betaal-qr-code-op-factuur", "onderhoudscontract-terugkerende-facturen-opzetten"],
        "van-meting-tot-factuur-in-5-minuten": ["offerte-versturen-via-whatsapp", "betaal-qr-code-op-factuur", "materialenprijzen-2026-bouwprijzen-per-m2"],
        "waterpas-app-hoe-nauwkeurig": ["schutting-berekenen-hoeveel-palen-en-schermen", "snijverlies-berekenen-tegels-laminaat", "diamantboor-onderhoud"],
    },
}
RA_START, RA_END = "<!-- readalso:start -->", "<!-- readalso:end -->"
G_START, G_END = "<!-- guides:start -->", "<!-- guides:end -->"
# Fill-up articles when a calculator has fewer than three matches.
FALLBACK = {
    "en": ["from-measurement-to-invoice-5-minutes", "how-to-write-construction-quote", "renovation-cost-estimate"],
    "nl": ["van-meting-tot-factuur-in-5-minuten", "materialenprijzen-2026-bouwprijzen-per-m2", "snijverlies-berekenen-tegels-laminaat"],
}
TXT = {
    "en": dict(calcs="Related calculators", read="Read more", box="🧮 Calculate it yourself",
               all="All calculators", blog="/blog/", calc="/calculators/", also="Read also",
               guides="Latest guides", guides_h="Practical guides from the job site",
               all_guides="All guides", home=""),
    "nl": dict(calcs="Andere calculators", read="Lees ook", box="🧮 Zelf uitrekenen",
               all="Alle calculators", blog="/nl/blog/", calc="/nl/calculators/", also="Lees ook",
               guides="Nieuwste artikelen", guides_h="Praktische uitleg van de bouwplaats",
               all_guides="Alle artikelen", home="nl/"),
}


def read(path):
    with open(os.path.join(ROOT, path), encoding="utf-8-sig") as f:
        return f.read()


def write(path, text):
    with open(os.path.join(ROOT, path), "w", encoding="utf-8", newline="") as f:
        f.write(text)


def esc(s):
    return html.escape(s, quote=False)


def L(pair, lang):
    return pair[0] if lang == "en" else pair[1]


def calc_info(lang):
    """slug -> (title, short description, group), as on the calculator overview."""
    new = {s["slug"]: s for s in NEW}
    up = {s["slug"]: s for s in UPGRADE}
    out = {}
    for slug, _icon, group, title, desc, _tags in CATALOG:
        if slug in new:
            t = new[slug][lang]
            out[slug] = (t["nav"], t["card"], group)
        else:
            d = L(up[slug]["card"], lang) if slug in up else (L(desc, lang) if desc else "")
            out[slug] = (L(title, lang), d, group)
    return out


def article_title(lang, slug):
    path = f"{'nl/' if lang == 'nl' else ''}blog/{slug}/index.html"
    if not os.path.exists(os.path.join(ROOT, path)):
        return None
    m = re.search(r"<title>(.*?)</title>", read(path), re.S)
    if not m:
        return None
    return html.unescape(re.sub(r"\s*[|—-]\s*BuildExact\s*$", "", m.group(1).strip()))


def articles_for(lang, slug):
    picks = []
    for s in ARTICLES[lang].get(slug, []) + FALLBACK[lang]:
        if s not in picks and article_title(lang, s):
            picks.append(s)
        if len(picks) == 3:
            break
    return picks


# Hand-picked related calculators where the trade grouping misses the obvious topic neighbours.
RELATED_OVERRIDE = {
    "volume": ["tank", "round-column", "concrete", "excavation", "area", "converter"],
    "tank": ["volume", "round-column", "excavation", "converter", "concrete", "cost"],
}


def related_calcs(info, slug):
    """Same trade first, then the neighbours in the catalogue order."""
    if slug in RELATED_OVERRIDE:
        return [s for s in RELATED_OVERRIDE[slug] if s in info and s != slug][:6]
    order = [c[0] for c in CATALOG]
    group = info[slug][2]
    same = [s for s in order if info[s][2] == group and s != slug]
    i = order.index(slug)
    near = sorted((s for s in order if s != slug and s not in same), key=lambda s: abs(order.index(s) - i))
    return (same + near)[:6]


def put_block(page, block, anchors, start=START, end=END):
    page = re.sub(re.escape(start) + r".*?" + re.escape(end) + r"\n?", "", page, flags=re.S)
    for a in anchors:
        k = page.find(a)
        if k >= 0:
            k = page.rfind("\n", 0, k) + 1  # keep the anchor's indentation
            return page[:k] + f"{start}\n{block}\n{end}\n" + page[k:]
    return None


def article_meta(lang, slug):
    """(title, description, datePublished) of a blog article, or None."""
    path = f"{'nl/' if lang == 'nl' else ''}blog/{slug}/index.html"
    if not os.path.exists(os.path.join(ROOT, path)):
        return None
    page = read(path)
    if 'content="noindex' in page:
        return None
    d = re.search(r'<meta name="description" content="([^"]*)"', page)
    p = re.search(r'"datePublished":\s*"([^"]+)"', page)
    return article_title(lang, slug), html.unescape(d.group(1)) if d else "", p.group(1) if p else ""


def read_also_pages():
    """Three related articles under every blog article, above the share buttons."""
    for lang in ("en", "nl"):
        t = TXT[lang]
        for art, picks in READ_ALSO[lang].items():
            path = f"{t['home']}blog/{art}/index.html"
            if not os.path.exists(os.path.join(ROOT, path)):
                continue
            items = ""
            for s in picks:
                meta = article_meta(lang, s)
                if meta:
                    items += f'\n    <li><a href="{t["blog"]}{s}/">{esc(meta[0])}</a></li>'
            block = f'''<div class="read-also">
  <h2>{t["also"]}</h2>
  <ul class="related-articles">{items}
  </ul>
</div>'''
            page = put_block(read(path), block, ['<div class="share-section">', "</article>"], RA_START, RA_END)
            if page is None:
                print("  ! no place for read-also in", path)
                continue
            write(path, page)


def home_guides():
    """The six newest articles on the homepage, after the calculator block."""
    for lang in ("en", "nl"):
        t = TXT[lang]
        folder = os.path.join(ROOT, t["home"], "blog")
        arts = []
        for slug in os.listdir(folder):
            meta = article_meta(lang, slug) if os.path.isdir(os.path.join(folder, slug)) else None
            if meta and meta[2]:
                arts.append((meta[2], slug, meta))
        arts.sort(reverse=True)
        cards = "".join(
            f'\n      <a href="{t["blog"]}{slug}/" class="card"><h3>{esc(m[0])}</h3><p>{esc(m[1])}</p></a>'
            for _d, slug, m in arts[:6])
        block = f'''<section class="section latest-guides">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">{t["guides"]}</span>
      <h2>{t["guides_h"]}</h2>
    </div>
    <div class="grid grid-3">{cards}
    </div>
    <div style="text-align:center;margin-top:28px;">
      <a href="{t["blog"]}" class="btn btn-ghost">{t["all_guides"]} &rarr;</a>
    </div>
  </div>
</section>'''
        path = f"{t['home']}index.html"
        page = read(path)
        page = re.sub(r"\n?" + re.escape(G_START) + r".*?" + re.escape(G_END) + r"\n?", "", page, flags=re.S)
        btn = page.find(f'<a href="{t["calc"]}" class="btn btn-ghost">')
        k = page.find("</section>", btn) + len("</section>\n")
        if btn < 0 or k < len("</section>\n"):
            print("  ! no place for the guides on", path)
            continue
        write(path, page[:k] + f"\n{G_START}\n{block}\n{G_END}\n" + page[k:])


def calc_pages():
    for lang in ("en", "nl"):
        t, info = TXT[lang], calc_info(lang)
        for slug in info:
            path = f"{'nl/' if lang == 'nl' else ''}calculators/{slug}/index.html"
            cards = "".join(
                f'\n      <a href="{t["calc"]}{s}/" class="card"><h3>{esc(info[s][0])}</h3><p>{esc(info[s][1])}</p></a>'
                for s in related_calcs(info, slug))
            arts = "".join(
                f'\n      <li><a href="{t["blog"]}{a}/">{esc(article_title(lang, a))}</a></li>'
                for a in articles_for(lang, slug))
            block = f'''<section class="section related-links">
  <div class="container">
    <h2>{t["calcs"]}</h2>
    <div class="grid grid-3">{cards}
    </div>
    <p style="margin-top:16px;"><a href="{t["calc"]}">{t["all"]} &rarr;</a></p>
    <h2 style="margin-top:40px;">{t["read"]}</h2>
    <ul class="related-articles">{arts}
    </ul>
  </div>
</section>'''
            page = put_block(read(path), block, ['<section class="install-strip">', '<footer class="site-footer">'])
            if page is None:
                print("  ! no place for the block in", path)
                continue
            write(path, page)


def blog_pages():
    for lang in ("en", "nl"):
        t, info = TXT[lang], calc_info(lang)
        by_article = {}
        for slug, arts in ARTICLES[lang].items():
            for a in arts:
                by_article.setdefault(a, []).append(slug)
        for art, slugs in by_article.items():
            path = f"{'nl/' if lang == 'nl' else ''}blog/{art}/index.html"
            if not os.path.exists(os.path.join(ROOT, path)):
                continue
            items = "".join(
                f'<li><a href="{t["calc"]}{s}/">{esc(info[s][0])}</a>{" &ndash; " + esc(info[s][1]) if info[s][1] else ""}</li>'
                for s in slugs[:4])
            block = f'<div class="tip"><h3>{t["box"]}</h3><ul>{items}</ul></div>'
            page = put_block(read(path), block, [RA_START, '<div class="share-section">', "</article>"])
            if page is None:
                print("  ! no place for the box in", path)
                continue
            write(path, page)


def hreflang_xdefault():
    """Every page with an English version gets x-default -> that English URL, after its other hreflang tags.
    Dutch-only pages get none (there is no international version to send people to)."""
    for folder, dirs, names in os.walk(ROOT):
        dirs[:] = [d for d in dirs if not d.startswith(".") and d not in ("_tools", "__pycache__")]
        for name in names:
            if name != "index.html":
                continue
            path = os.path.relpath(os.path.join(folder, name), ROOT)
            page = read(path)
            en = re.search(r'<link rel="alternate" hreflang="en" href="([^"]+)">', page)
            if not en:
                continue
            new = re.sub(r'<link rel="alternate" hreflang="x-default" href="[^"]*">\r?\n?', "", page)
            last = list(re.finditer(r'<link rel="alternate" hreflang="[^"]+" href="[^"]+">\r?\n', new))[-1]
            tag = f'<link rel="alternate" hreflang="x-default" href="{en.group(1)}">\n'
            new = new[:last.end()] + tag + new[last.end():]
            if new != page:
                write(path, new)


def url_to_file(url):
    rel = url[len(SITE):].strip("/")
    return os.path.join(rel, "index.html") if rel else "index.html"


def sitemap_lastmod():
    changed = set(subprocess.run(["git", "status", "--porcelain"], cwd=ROOT, capture_output=True,
                                 text=True).stdout.split("\n"))
    changed = {line[3:].strip().strip('"').rstrip("/") for line in changed if line.strip()}
    today = datetime.date.today().isoformat()

    def date_for(f):
        f = f.replace(os.sep, "/")
        if f in changed or any(f.startswith(c + "/") for c in changed):
            return today
        out = subprocess.run(["git", "log", "-1", "--format=%cs", "--", f], cwd=ROOT,
                             capture_output=True, text=True).stdout.strip()
        return out or today

    sm = read("sitemap.xml")

    def fix(m):
        loc = m.group(1)
        f = url_to_file(loc)
        if not os.path.exists(os.path.join(ROOT, f)):
            return m.group(0)
        body = re.sub(r"<lastmod>[^<]*</lastmod>", "", m.group(2))
        return f"<url><loc>{loc}</loc><lastmod>{date_for(f)}</lastmod>{body}</url>"

    sm = re.sub(r"<url><loc>([^<]+)</loc>(.*?)</url>", fix, sm, flags=re.S)
    write("sitemap.xml", sm)


def main():
    calc_pages()
    blog_pages()
    read_also_pages()
    home_guides()
    hreflang_xdefault()
    sitemap_lastmod()
    print("Done: related blocks, read-also, homepage guides, x-default and sitemap dates.")


if __name__ == "__main__":
    main()
