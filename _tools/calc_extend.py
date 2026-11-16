"""Put the extra content of calc_content_hand.HAND on the hand-written calculator pages.

Run from the site root, after build_calc_pages.py and before related_links.py:
    python -I _tools/calc_extend.py

Per page (EN + NL):
- worked example + extra sections go between <!-- guide-extra:start --> and
  <!-- guide-extra:end -->, just above the FAQ heading;
- extra FAQ items ("faq") go between <!-- faq-extra:start --> and
  <!-- faq-extra:end -->, after the existing FAQ items;
- the FAQPage JSON-LD is rebuilt from all FAQ items that are visible on the page,
  so the structured data always matches what people see.
Running it again replaces the blocks instead of adding copies.
"""
import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "_tools"))
from build_calc_pages import esc, extra_html  # noqa: E402
from calc_content_hand import HAND  # noqa: E402

G_START, G_END = "<!-- guide-extra:start -->", "<!-- guide-extra:end -->"
F_START, F_END = "<!-- faq-extra:start -->", "<!-- faq-extra:end -->"
FAQ_H = {"en": "<h2>Frequently asked questions</h2>", "nl": "<h2>Veelgestelde vragen</h2>"}


def read(path):
    with open(os.path.join(ROOT, path), encoding="utf-8-sig") as f:
        return f.read()


def write(path, text):
    with open(os.path.join(ROOT, path), "w", encoding="utf-8", newline="") as f:
        f.write(text)


def strip(page, start, end):
    return re.sub(r"[ \t]*" + re.escape(start) + r".*?" + re.escape(end) + r"\n?", "", page, flags=re.S)


def faq_ld(page):
    """Rebuild the FAQPage JSON-LD from the visible .faq-item blocks."""
    items = re.findall(r'<div class="faq-item">\s*<h3>(.*?)</h3>\s*<p>(.*?)</p>\s*</div>', page, re.S)
    plain = lambda s: html.unescape(re.sub(r"<[^>]+>", "", s)).strip()  # noqa: E731
    ld = json.dumps({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": plain(q), "acceptedAnswer": {"@type": "Answer", "text": plain(a)}}
        for q, a in items]}, ensure_ascii=False)
    new, n = re.subn(r'<script type="application/ld\+json">\{"@context": "https://schema.org", "@type": "FAQPage".*?</script>',
                     lambda m: f'<script type="application/ld+json">{ld}</script>', page, flags=re.S)
    return new if n == 1 else None


def extend(slug, lang, x):
    path = f"{'nl/' if lang == 'nl' else ''}calculators/{slug}/index.html"
    page = strip(strip(read(path), G_START, G_END), F_START, F_END)
    h = page.find(FAQ_H[lang])
    if h < 0:
        print("  ! no FAQ heading in", path)
        return
    body = extra_html(x).lstrip("\n")
    if body:
        page = page[:h] + f"{G_START}\n{body}\n    {G_END}\n    " + page[h:]
    if x.get("faq"):
        items = "".join(f'\n    <div class="faq-item">\n      <h3>{esc(q)}</h3>\n      <p>{esc(a)}</p>\n    </div>'
                        for q, a in x["faq"])
        k = page.find('<script type="application/ld+json">{"@context": "https://schema.org", "@type": "FAQPage"')
        if k < 0:
            print("  ! no FAQPage data in", path)
            return
        k = page.rfind("\n", 0, k) + 1
        page = page[:k] + f"    {F_START}{items}\n    {F_END}\n" + page[k:]
    new = faq_ld(page)
    if new is None:
        print("  ! could not rebuild the FAQPage data in", path)
        return
    write(path, new)


def main():
    for slug, langs in HAND.items():
        for lang, x in langs.items():
            extend(slug, lang, x)
    print(f"Done: extra content on {len(HAND)} calculators.")


if __name__ == "__main__":
    main()
