"""Build the Updates page (app changelog) for EN and NL.

Run from the site root:  python -I _tools/build_updates.py

Reads _tools/changelog.py and writes updates/index.html and
nl/updates/index.html, with the header and footer of the features page.
Also (only once) adds an "Updates" link to the footer of every page and the
two URLs to sitemap.xml.
"""
import glob
import html
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "_tools"))
from changelog import RELEASES  # noqa: E402

SITE = "https://buildexact.app"
PLAY = "https://play.google.com/store/apps/details?id=com.metenweten.bouw"
TXT = {
    "en": dict(title="Updates", page_title="App updates & changelog — BuildExact",
               desc="What's new in the BuildExact app: every update with its new calculators, tools and improvements.",
               eyebrow="Changelog", h1="What's new in BuildExact",
               lede="Every app update with what changed. Update via Google Play to get the latest version.",
               btn="Update on Google Play", crumb_from="Features"),
    "nl": dict(title="Updates", page_title="App-updates & changelog — BuildExact",
               desc="Wat is er nieuw in de BuildExact app: elke update met nieuwe calculators, gereedschap en verbeteringen.",
               eyebrow="Changelog", h1="Wat is er nieuw in BuildExact",
               lede="Elke app-update met wat er veranderd is. Update via Google Play voor de nieuwste versie.",
               btn="Update via Google Play", crumb_from="Functies"),
}


def esc(s):
    return html.escape(s, quote=False)


def read(path):
    with open(os.path.join(ROOT, path), encoding="utf-8-sig") as f:
        return f.read()


def write(path, text):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8", newline="") as f:
        f.write(text)


def page(lang):
    t = TXT[lang]
    pre = "nl/" if lang == "nl" else ""
    tpl = read(pre + "features/index.html")
    a = tpl.index("<title>")
    b = tpl.index("</title>") + len("</title>")
    top = tpl[:a] + f"<title>{t['page_title']}</title>" + tpl[b:tpl.index('<section class="section">')]
    old_title = tpl[a + 7:b - 8]
    top = top.replace(old_title, t["page_title"]).replace("/features/", "/updates/")
    # Description (meta + og) and breadcrumb label.
    import re
    top = re.sub(r'(<meta (?:name|property)="(?:og:)?description" content=")[^"]*(">)', r"\g<1>" + t["desc"] + r"\g<2>", top)
    top = top.replace(f'<li aria-current="page">{t["crumb_from"]}</li>', f'<li aria-current="page">{t["title"]}</li>')
    top = top.replace(f'"name": "{t["crumb_from"]}"', f'"name": "{t["title"]}"')
    # The nav keeps pointing at the real features page.
    top = top.replace(f'<a href="/{pre}updates/">{t["crumb_from"]}</a></li>', f'<a href="/{pre}features/">{t["crumb_from"]}</a></li>')

    rel = []
    for r in RELEASES:
        c = r[lang]
        date = r["date_nl" if lang == "nl" else "date_en"]
        items = "".join(f"<li><strong>{esc(k)}</strong> — {esc(v)}</li>" for k, v in c["items"])
        rel.append(f'''    <article class="release" id="v{r["version"].replace(".", "-")}">
      <div class="release-head"><span class="release-ver">v{r["version"]}</span><h2>{esc(c["title"])}</h2>{f'<span class="release-date">{date}</span>' if date else ""}</div>
      <ul>{items}</ul>
    </article>''')
    body = f'''<section class="section">
  <div class="container" style="max-width:820px;">
    <div class="section-head">
      <span class="eyebrow">{t["eyebrow"]}</span>
      <h1>{t["h1"]}</h1>
      <p class="lede">{t["lede"]}</p>
    </div>
{chr(10).join(rel)}
    <div style="text-align:center;margin-top:24px;">
      <a href="{PLAY}" class="btn btn-primary">{t["btn"]}</a>
    </div>
  </div>
</section>

'''
    foot = tpl[tpl.index('<footer class="site-footer">'):]
    write(pre + "updates/index.html", top + body + foot)
    print("updates", lang)


def footer_links():
    n = 0
    for path in glob.glob(os.path.join(ROOT, "**", "*.html"), recursive=True):
        rel = os.path.relpath(path, ROOT).replace(os.sep, "/")
        if rel.startswith(("_", "node_modules")):
            continue
        with open(path, encoding="utf-8-sig") as f:
            s = f.read()
        bom = open(path, "rb").read(3) == b"\xef\xbb\xbf"
        new = s
        # The footer's Product column ends with Support; the nav uses </li>, so this only hits the footer.
        for pre in ("/nl", ""):
            old = f'<a href="{pre}/support/">Support</a></div>'
            if "<h4>Product</h4>" in new and f'href="{pre}/updates/">Updates</a>' not in new:
                new = new.replace(old, f'<a href="{pre}/support/">Support</a><a href="{pre}/updates/">Updates</a></div>', 1)
        if new != s:
            with open(path, "w", encoding="utf-8-sig" if bom else "utf-8", newline="") as f:
                f.write(new)
            n += 1
    print("footer links", n)


def sitemap():
    sm = read("sitemap.xml")
    for pre in ("", "/nl"):
        url = f"{SITE}{pre}/updates/"
        if f"<loc>{url}</loc>" not in sm:
            sm = sm.replace("</urlset>", f"  <url><loc>{url}</loc><priority>0.6</priority></url>\n</urlset>")
    write("sitemap.xml", sm)


if __name__ == "__main__":
    page("en")
    page("nl")
    footer_links()
    sitemap()
