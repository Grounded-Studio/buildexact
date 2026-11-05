"""Turn the PRO discount (EUR 7.99 -> 5.99, 25% off) on or off, on both sites.

Run from the site root:  python -I _tools/promo_prices.py on|off

"on" swaps every price text in the table below and switches the popup on
(PROMO_ON in assets/js/main.js); "off" puts it all back. Running it twice is
safe. New page with the price on it? Add its sentence to PAIRS. Website credits
(EUR 2.99) are a different product and are not part of this.
The Google Play offer itself is set in the Play Console, not here.
"""
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GS = os.path.join(os.path.dirname(ROOT), "groundedstudio")
GS_FILES = ["index.html", "contact.html", "blog/van-meting-tot-factuur-in-5-minuten.html"]

CARD_EN = '<s class="price-was">€7.99</s> <span class="price-off">-25%</span>'
CARD_NL = '<s class="price-was">€7,99</s> <span class="price-off">-25%</span>'

# (normal text, discount text). The normal text must not occur in the discount text.
PAIRS = [
    ("const PROMO_ON = false;", "const PROMO_ON = true;"),
    # Calculator pages
    ("(one-off &euro;7.99 in the app)", "(now &euro;5.99 instead of &euro;7.99, one-off in the app)"),
    ("(one-off €7.99 in the app)", "(now €5.99 instead of €7.99, one-off in the app)"),
    ("(&euro;7,99 eenmalig in de app)", "(nu &euro;5,99 in plaats van &euro;7,99, eenmalig in de app)"),
    ("(€7,99 eenmalig in de app)", "(nu €5,99 in plaats van €7,99, eenmalig in de app)"),
    # Price cards on home and pricing
    ('margin:4px 0 14px;">€7.99</p>', f'margin:4px 0 14px;">€5.99 {CARD_EN}</p>'),
    ('margin:4px 0 14px;">€7,99</p>', f'margin:4px 0 14px;">€5,99 {CARD_NL}</p>'),
    # Home
    ("PRO unlocks unlimited · €7.99 one-time", "PRO unlocks unlimited · <strong>€5.99</strong> <s>€7.99</s> one-time"),
    ("PRO unlockt alles · €7,99 eenmalig", "PRO unlockt alles · <strong>€5,99</strong> <s>€7,99</s> eenmalig"),
    ("PRO is a single €7.99 payment", "PRO is a single payment of €5.99 instead of €7.99"),
    ("PRO is één betaling van €7,99", "PRO is één betaling van €5,99 in plaats van €7,99"),
    # Pricing
    ("Android app: one-off €7.99 PRO.", "Android app: PRO one-off €5.99 (normally €7.99)."),
    ("Android app: eenmalig €7,99 PRO.", "Android app: PRO eenmalig €5,99 (normaal €7,99)."),
    ("Then the app and one-off €7.99 pays off.", "Then the app and one-off €5.99 pays off."),
    ("Dan loont de app en de eenmalige €7,99.", "Dan loont de app en de eenmalige €5,99."),
    ("Yes. Pay €7.99 once on Google Play", "Yes. Pay once on Google Play (now €5.99 instead of €7.99)"),
    ("Ja. Betaal eenmalig €7,99 via Google Play", "Ja. Betaal eenmalig via Google Play (nu €5,99 in plaats van €7,99)"),
    # About, credits, terms
    ("Free core, one-time €7.99 for PRO.", "Free core, one-time €5.99 for PRO (normally €7.99)."),
    ("Gratis kern, eenmalig €7,99 voor PRO.", "Gratis kern, eenmalig €5,99 voor PRO (normaal €7,99)."),
    ("<strong>one-off €7.99</strong>", "<strong>one-off €5.99</strong> (normally €7.99)"),
    ("<strong>eenmalig €7,99</strong>", "<strong>eenmalig €5,99</strong> (normaal €7,99)"),
    ("BuildExact PRO costs €7.99 one-time via Google Play.", "BuildExact PRO costs €7.99 one-time via Google Play, reduced to €5.99 until 2 December 2026."),
    ("BuildExact PRO kost eenmalig €7,99 via Google Play.", "BuildExact PRO kost eenmalig €7,99 via Google Play, afgeprijsd naar €5,99 tot 2 december 2026."),
    # grounded-studio.app
    ("PRO costs €7.99 one-time and unlocks", "PRO costs €5.99 one-time (normally €7.99) and unlocks"),
    ("PRO kost €7,99 eenmalig en ontgrendelt", "PRO kost €5,99 eenmalig (normaal €7,99) en ontgrendelt"),
    ("BuildExact PRO is €7.99 one-time.", "BuildExact PRO is €5.99 one-time (normally €7.99)."),
    ("BuildExact PRO kost €7,99 eenmalig.", "BuildExact PRO kost €5,99 eenmalig (normaal €7,99)."),
    ("PRO tier at €7.99 one-time", "PRO tier at €5.99 one-time (normally €7.99)"),
    ("PRO-versie van €7,99 eenmalig", "PRO-versie van €5,99 eenmalig (normaal €7,99)"),
    ("zijn eenmalig €7,99.", "zijn eenmalig €5,99 (normaal €7,99)."),
    ("Pro-functies eenmalig €7,99", "Pro-functies eenmalig €5,99 (normaal €7,99)"),
    ('"name": "BuildExact PRO (one-time)", "price": "7.99"', '"name": "BuildExact PRO (one-time)", "price": "5.99"'),
]


def site_files():
    for folder, dirs, names in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in (".git", "__pycache__", "_tools")]
        for name in names:
            if name.endswith((".html", ".js")):
                yield os.path.join(folder, name)
    for name in GS_FILES:
        path = os.path.join(GS, name)
        if os.path.exists(path):
            yield path


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else ""
    if mode not in ("on", "off"):
        sys.exit("Usage: python -I _tools/promo_prices.py on|off")
    for normal, promo in PAIRS:
        assert normal not in promo, normal
    changed = 0
    for path in site_files():
        with open(path, encoding="utf-8", newline="") as f:
            text = f.read()
        new = text
        for normal, promo in PAIRS:
            new = new.replace(*((normal, promo) if mode == "on" else (promo, normal)))
        if new != text:
            with open(path, "w", encoding="utf-8", newline="") as f:
                f.write(new)
            changed += 1
    print(f"Discount {mode}: {changed} files changed.")


if __name__ == "__main__":
    main()
