"""Turn the PRO discount (EUR 7.99 -> 5.99, 25% off) on or off, on both sites.

Run from the site root:  python -I _tools/promo_prices.py on|off

"on" swaps every price text in the table below; "off" puts it all back.
Running it twice is safe. New page with the price on it? Add its sentence to
PAIRS. Website credits (EUR 2.99) are a different product and are not part of this.
The Google Play offer itself is set in the Play Console, not here.

On buildexact.app the discount price is shown as the plain current price
(EUR 5.99 one-time, no subscription): no struck-through old price and no
"25% off" (the user's choice, 2026-11-16). The popup in main.js stays off.
The grounded-studio.app sentences at the bottom still say "normally EUR 7.99".
"""
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GS = os.path.join(os.path.dirname(ROOT), "groundedstudio")
GS_FILES = ["index.html", "contact.html", "blog/van-meting-tot-factuur-in-5-minuten.html"]

NOTE_EN = '<span class="price-note">one-time, no subscription</span>'
NOTE_NL = '<span class="price-note">eenmalig, geen abonnement</span>'

# (normal text, discount text). The normal text must not occur in the discount text.
PAIRS = [
    # Calculator pages: install strip, and the fallback text in _helpers.js
    ("branded quotes: <strong>&euro;7.99</strong> one-time", "branded quotes: <strong>&euro;5.99</strong> one-time"),
    ("offertes met je logo: <strong>&euro;7,99</strong> eenmalig", "offertes met je logo: <strong>&euro;5,99</strong> eenmalig"),
    ("PRO: €7.99 one-time, no subscription.", "PRO: €5.99 one-time, no subscription."),
    ("PRO: €7,99 eenmalig, geen abonnement.", "PRO: €5,99 eenmalig, geen abonnement."),
    # Price cards on home and pricing
    ('margin:4px 0 14px;">€7.99</p>', f'margin:4px 0 14px;">€5.99 {NOTE_EN}</p>'),
    ('margin:4px 0 14px;">€7,99</p>', f'margin:4px 0 14px;">€5,99 {NOTE_NL}</p>'),
    # Structured data (SoftwareApplication offer on both homepages)
    ('"name": "BuildExact PRO", "price": "7.99"', '"name": "BuildExact PRO", "price": "5.99"'),
    # Home
    ("PRO unlocks unlimited · €7.99 one-time", "PRO unlocks unlimited · <strong>€5.99</strong> one-time, no subscription"),
    ("PRO unlockt alles · €7,99 eenmalig", "PRO unlockt alles · <strong>€5,99</strong> eenmalig, geen abonnement"),
    ("PRO is a single €7.99 payment", "PRO is a single €5.99 payment"),
    ("PRO is één betaling van €7,99", "PRO is één betaling van €5,99"),
    # Pricing
    ("Android app: one-off €7.99 PRO.", "Android app: one-off €5.99 PRO."),
    ("Android app: eenmalig €7,99 PRO.", "Android app: eenmalig €5,99 PRO."),
    ("Then the app and one-off €7.99 pays off.", "Then the app and one-off €5.99 pays off."),
    ("Dan loont de app en de eenmalige €7,99.", "Dan loont de app en de eenmalige €5,99."),
    ("Yes. Pay €7.99 once on Google Play", "Yes. Pay €5.99 once on Google Play"),
    ("Ja. Betaal eenmalig €7,99 via Google Play", "Ja. Betaal eenmalig €5,99 via Google Play"),
    # About, credits, terms
    ("Free core, one-time €7.99 for PRO.", "Free core, one-time €5.99 for PRO."),
    ("Gratis kern, eenmalig €7,99 voor PRO.", "Gratis kern, eenmalig €5,99 voor PRO."),
    ("<strong>one-off €7.99</strong>", "<strong>one-off €5.99</strong>"),
    ("<strong>eenmalig €7,99</strong>", "<strong>eenmalig €5,99</strong>"),
    ("BuildExact PRO costs €7.99 one-time via Google Play.", "BuildExact PRO costs €5.99 one-time via Google Play."),
    ("BuildExact PRO kost eenmalig €7,99 via Google Play.", "BuildExact PRO kost eenmalig €5,99 via Google Play."),
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
