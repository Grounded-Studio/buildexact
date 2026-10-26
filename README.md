# BuildExact — buildexact.app

Standalone marketing + calculator site for **BuildExact**, the offline-first
Android app for Dutch and Belgian tradespeople and DIY builders.

Live site: <https://buildexact.app>
Play Store: <https://play.google.com/store/apps/details?id=com.metenweten.bouw>

## What's here

- `index.html` — English homepage
- `nl/index.html` — Dutch homepage
- `/calculators/` — overview + 15 working browser demos of the in-app calculators
- `/features/`, `/pricing/`, `/support/`, `/about/`, `/privacy/`, `/terms/`
- `/blog/` — long-form guides (migrated from grounded-studio.app)
- `/assets/css/style.css` — single global stylesheet (design tokens, components)
- `/assets/js/` — language switcher, calculator demos
- `CNAME` — custom domain (buildexact.app)
- `_tools/` — blog generator (see below)

## Writing a new blog article

1. Add the article (EN and/or NL) to `_tools/blog_posts.py` — the file explains every field.
2. Run from the site root: `python -I _tools/build_blog.py`
3. Check the page locally, then commit and push.

The generator writes the page in the same layout as the existing articles, with
breadcrumbs, hreflang, Open Graph tags, structured data, the Google Play badge and
share buttons, and adds a card to the blog overview plus a line to `sitemap.xml`.
The older hand-written articles are not touched by it.

## Design tokens

- Primary blue: `#2563EB` (same as the Android app's accent)
- Background: `#F2F5F9` (app surface, not pure white)
- Dark text: `#0F172A`
- Muted text: `#475569`
- Border: `#E2E8F0`
- Font: Inter, system fallback

## Calculator demos

Each demo is a self-contained HTML page with its own JS module. The demos
mirror the Flutter app's formulas but run entirely in the browser — no server,
no analytics on calculator pages.
