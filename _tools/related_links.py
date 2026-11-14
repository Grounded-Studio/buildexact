"""Internal links between calculators and blog articles, plus <lastmod> in the sitemap.

Run from the site root, after the other build scripts:
    python -I _tools/related_links.py

- Every calculator page gets a block "Related calculators" (same trade first)
  and "Read more" (matching blog articles), above the install strip.
- Every blog article that matches a calculator gets a box with links to those
  calculators, above the share buttons.
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
        "cost": ["renovation-cost-estimate", "how-to-write-construction-quote", "bathroom-renovation-cost"],
        "converter": ["how-to-measure-a-room-accurately"],
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
        "drilling": ["kernboring-prijs-berekenen", "diamantboor-onderhoud"],
        "fence": ["schutting-berekenen-hoeveel-palen-en-schermen"],
        "excavation": ["hoeveel-m3-beton-berekenen"],
        "cost": ["materialenprijzen-2026-bouwprijzen-per-m2", "van-meting-tot-factuur-in-5-minuten"],
    },
}
# Fill-up articles when a calculator has fewer than three matches.
FALLBACK = {
    "en": ["from-measurement-to-invoice-5-minutes", "how-to-write-construction-quote", "renovation-cost-estimate"],
    "nl": ["van-meting-tot-factuur-in-5-minuten", "materialenprijzen-2026-bouwprijzen-per-m2", "snijverlies-berekenen-tegels-laminaat"],
}
TXT = {
    "en": dict(calcs="Related calculators", read="Read more", box="🧮 Calculate it yourself",
               all="All calculators", blog="/blog/", calc="/calculators/"),
    "nl": dict(calcs="Andere calculators", read="Lees ook", box="🧮 Zelf uitrekenen",
               all="Alle calculators", blog="/nl/blog/", calc="/nl/calculators/"),
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


def related_calcs(info, slug):
    """Same trade first, then the neighbours in the catalogue order."""
    order = [c[0] for c in CATALOG]
    group = info[slug][2]
    same = [s for s in order if info[s][2] == group and s != slug]
    i = order.index(slug)
    near = sorted((s for s in order if s != slug and s not in same), key=lambda s: abs(order.index(s) - i))
    return (same + near)[:6]


def put_block(page, block, anchors):
    page = re.sub(re.escape(START) + r".*?" + re.escape(END) + r"\n?", "", page, flags=re.S)
    for a in anchors:
        k = page.find(a)
        if k >= 0:
            k = page.rfind("\n", 0, k) + 1  # keep the anchor's indentation
            return page[:k] + f"{START}\n{block}\n{END}\n" + page[k:]
    return None


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
            page = put_block(read(path), block, ['<div class="share-section">', "</article>"])
            if page is None:
                print("  ! no place for the box in", path)
                continue
            write(path, page)


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
    sitemap_lastmod()
    print("Done: related blocks and sitemap dates.")


if __name__ == "__main__":
    main()
