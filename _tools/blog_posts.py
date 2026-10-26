"""New blog articles for buildexact.app. Rendered by build_blog.py.

How to add an article:
1. Copy the EXAMPLE below into POSTS (remove the comment marks) and fill it in.
   You can write only "en", only "nl", or both; with both, the pages link to
   each other (hreflang + language switch).
2. Run from the site root:  python -I _tools/build_blog.py
3. Open the page locally, check it, then commit and push.

Fields per language:
  slug       – web address part, lowercase-with-dashes
  title      – short title (Google tab + breadcrumb + card), max ~50 chars
  h1         – the big heading on the page (may be longer)
  desc       – meta description for Google, ~150 chars
  badge      – meta line category, e.g. "🏗️ Calculations"
  card_badge – small label on the blog overview card
  card_text  – one sentence on the blog overview card
  intro      – first paragraph (HTML allowed)
  body       – the article in HTML: <h2>, <p>, <ul>, <table>, ...

Keep it country-neutral (metric, no national VAT or building rules) unless an
article is explicitly about one country.
"""

POSTS = [
    # EXAMPLE — copy, uncomment and fill in:
    # {
    #     "date": "2026-11-01",
    #     "minutes": 5,
    #     "en": {
    #         "slug": "how-much-grout-do-i-need",
    #         "title": "How Much Grout Do I Need?",
    #         "h1": "How Much Grout Do I Need? A Simple Guide per m²",
    #         "desc": "Work out how much grout you need per m² from tile size, joint width and depth, with worked examples.",
    #         "badge": "🏗️ Calculations",
    #         "card_badge": "Materials",
    #         "card_text": "Grout per m² from tile size, joint width and depth.",
    #         "intro": "Grout is cheap, but running out halfway through a wall is not.",
    #         "body": """
    # <h2>The formula</h2>
    # <p>...</p>
    # """,
    #     },
    #     "nl": {
    #         "slug": "hoeveel-voegmiddel-heb-ik-nodig",
    #         "title": "Hoeveel voegmiddel heb ik nodig?",
    #         "h1": "Hoeveel voegmiddel heb ik nodig? Uitleg per m²",
    #         "desc": "Reken uit hoeveel voegmiddel je per m² nodig hebt op basis van tegelmaat, voegbreedte en voegdiepte.",
    #         "badge": "🏗️ Berekeningen",
    #         "card_badge": "Materialen",
    #         "card_text": "Voegmiddel per m² uit tegelmaat, voegbreedte en diepte.",
    #         "intro": "Voegmiddel is goedkoop, maar halverwege een wand opraken niet.",
    #         "body": """
    # <h2>De formule</h2>
    # <p>...</p>
    # """,
    #     },
    # },
]
