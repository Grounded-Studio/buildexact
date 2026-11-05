"""Search titles, h1 and descriptions of the calculator pages, per language.

Run from the site root:  python -I _tools/seo.py
(build_calc_pages.py also runs this at the end, so generated pages keep them.)

Titles lead with what people type into Google: in Dutch that is "tegels
berekenen" or "m2 berekenen", rarely "tegel calculator". The title gets
" | BuildExact" appended; the h1 is the title itself. Lengths are checked
against Google's snippet width.
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TITLE_MAX_PX, DESC_MAX_PX = 580, 990

# slug: (EN title, EN description, NL title, NL description)
PAGES = {
    "": ("Construction Calculators: Tiles, Concrete, Paint",
         "25 construction calculators in your browser: tiles, concrete, paint, plaster, bricks, fence, roof and more. Try every one free, no login needed.",
         "Bouwcalculators: tegels, beton en verf berekenen",
         "25 bouwcalculators in je browser: tegels, beton, verf, stucwerk, stenen, schutting, dak en meer berekenen. Elke calculator gratis te proberen."),
    "area": ("Area Calculator (m²): Square Metres of Any Room",
             "Work out square metres for rectangles, triangles, circles and L-shaped rooms, minus openings, plus waste. Free, straight in your browser.",
             "m² berekenen: oppervlakte van elke ruimte",
             "Bereken vierkante meters van rechthoeken, driehoeken, cirkels en L-vormige ruimtes, min openingen en plus snijverlies. Gratis, direct online."),
    "volume": ("Volume Calculator (m³): Cubic Metres & Litres",
               "Calculate cubic metres for blocks and cylinders, in litres and tonnes, for soil, sand, gravel or concrete. Free, straight in your browser.",
               "m³ berekenen: inhoud in kuub en liters",
               "Bereken kubieke meters (kuub) van blokken en cilinders, in liters en tonnen, voor grond, zand, grind of beton. Gratis, direct online."),
    "linear": ("Linear Metre Calculator: Lengths, Stock & Waste",
               "Add up linear metres, convert to stock lengths and add cutting waste and cost, for skirting, battens, trim or pipe. Free in your browser.",
               "Strekkende meter berekenen: lengtes en zaagverlies",
               "Tel strekkende meters op, reken om naar handelslengtes en voeg zaagverlies en kosten toe, voor plinten, latten, lijsten of buis. Gratis."),
    "perimeter": ("Skirting Board Calculator: Room Perimeter",
                  "Calculate the perimeter of a room minus door openings, and how many skirting boards or trim lengths to buy. Free, straight in your browser.",
                  "Plinten berekenen: omtrek van de kamer",
                  "Bereken de omtrek van een kamer min deuropeningen, en hoeveel plinten of lijsten je moet kopen, inclusief zaagverlies. Gratis, direct online."),
    "wall-area": ("Wall Area Calculator: m² Minus Doors & Windows",
                  "Calculate the wall area of a room or separate walls in m², minus doors and windows, for paint, plaster or wallpaper. Free in your browser.",
                  "Wandoppervlak berekenen: m² zonder ramen",
                  "Bereken het wandoppervlak van een kamer of losse wanden in m², min deuren en ramen, voor verf, stucwerk of behang. Gratis, direct online."),
    "paint": ("Paint Calculator: How Much Paint Do I Need?",
              "Work out how many litres of paint and primer you need per m², with coats, coverage, brush or spray and can sizes. Try it free, no login.",
              "Hoeveel verf heb ik nodig? Verf berekenen per m²",
              "Bereken hoeveel liter verf en grondverf je nodig hebt per m², met lagen, dekkend vermogen, kwast of spuit en blikmaten. Gratis proberen."),
    "plaster": ("Plaster Calculator: Bags of Plaster per m²",
                "Calculate how many bags of plaster you need for walls and ceilings per m² and layer thickness, plus primer. Try it free, no login needed.",
                "Stucwerk berekenen: zakken pleister per m²",
                "Bereken hoeveel zakken stucpleister je nodig hebt voor wanden en plafonds per m² en laagdikte, plus voorstrijk. Gratis proberen, geen login."),
    "drywall": ("Drywall Calculator: Plasterboard Sheets & Studs",
                "Calculate plasterboard sheets, metal studs, tracks and screws for a ceiling, wall or partition, with waste. Try it free, no login needed.",
                "Gipsplaten berekenen: platen en profielen",
                "Bereken gipsplaten, metal stud profielen, U-profielen en schroeven voor een plafond, wand of scheidingswand. Gratis proberen, geen login."),
    "insulation": ("Insulation Calculator: Rolls, Boards & R-Value",
                   "Calculate insulation rolls or boards for walls, roofs and floors, with layers, R-value and vapour barrier. Try it free, no login needed.",
                   "Isolatie berekenen: pakken, platen en Rd-waarde",
                   "Bereken isolatiepakken of -platen voor muur, dak en vloer, met lagen, Rd-waarde en dampremmende folie. Gratis proberen, geen login nodig."),
    "tiles": ("Tile Calculator: Tiles, Grout & Adhesive per m²",
              "How many tiles do you need? Calculate tiles and boxes per m² with cutting waste per pattern, plus grout, adhesive and trim. Try it free.",
              "Tegels berekenen: aantal tegels, voegsel en lijm",
              "Hoeveel tegels heb je nodig? Bereken tegels en dozen per m² met snijverlies per legpatroon, plus voegsel, tegellijm en profiel. Gratis."),
    "flooring": ("Flooring Calculator: Carpet, Vinyl & Lino Rolls",
                 "Calculate how many metres of carpet, vinyl or lino to buy from the roll, with seams, pattern repeat and waste. Try it free, no login.",
                 "Vloerbedekking berekenen: tapijt, vinyl en linoleum",
                 "Bereken hoeveel meter tapijt, vinyl of linoleum je van de rol koopt, met naden, patroon en snijverlies. Gratis proberen, geen login nodig."),
    "paving": ("Paving Calculator: Pavers, Sand & Sub-base",
               "Calculate paving stones per m², bedding sand, sub-base, joint sand and edging for a patio, path or driveway. Try it free, no login needed.",
               "Bestrating berekenen: stenen en straatzand",
               "Bereken klinkers of tegels per m², straatzand, fundering, voegzand en opsluitbanden voor terras, pad of oprit. Gratis proberen, geen login."),
    "concrete": ("Concrete Calculator: m³, Bags & Rebar",
                 "How much concrete do you need? Calculate m³ for a slab, footing or driveway, ready-mix or bags, plus rebar and formwork. Try it free.",
                 "Beton berekenen: m³, zakken en wapening",
                 "Hoeveel beton heb je nodig? Bereken m³ voor een vloer, fundering of oprit, als betonmortel of in zakken, plus wapening en bekisting. Gratis."),
    "round-column": ("Concrete Column Calculator: Round Pillar Volume",
                     "Calculate the concrete volume of a round column or concrete pipe in m³, the number of bags and the form tube. Try it free, no login.",
                     "Betonkolom berekenen: inhoud van een ronde kolom",
                     "Bereken de inhoud van een ronde betonkolom of betonbuis in m³, het aantal zakken en de bekistingsbuis. Gratis proberen, geen login nodig."),
    "bricks": ("Brick Calculator: Bricks & Mortar per m²",
               "How many bricks do you need? Calculate bricks per m² minus openings, plus mortar, lintels and cavity ties. Try it free, no login needed.",
               "Stenen berekenen: bakstenen en mortel per m²",
               "Hoeveel stenen heb je nodig? Bereken bakstenen per m² min openingen, plus metselmortel, lateien en spouwankers. Gratis proberen, geen login."),
    "steel": ("Steel Weight Calculator: Rebar & Plate in kg",
              "Calculate the weight of rebar and steel plate in kg per metre and in total, with cost. Try it free in your browser, no login needed.",
              "Staalgewicht berekenen: wapening en plaat in kg",
              "Bereken het gewicht van betonstaal en staalplaat in kg per meter en totaal, met kosten. Gratis proberen in je browser, geen login nodig."),
    "drilling": ("Core Drilling Cost Calculator: Price per Hole",
                 "Price core drilling and wall or floor sawing: per hole by diameter and depth or per metre, with reinforced concrete uplift. Try it free.",
                 "Kernboring prijs berekenen: kosten per gat",
                 "Bereken de prijs van kernboringen en wand- of vloerzagen: per gat op diameter en diepte of per meter, met toeslag voor gewapend beton."),
    "wood": ("Timber Calculator: Boards, Beams & m³",
             "Calculate timber for boards or beams: pieces, m³, screws and stain, for decking, cladding or framing. Try it free, no login needed.",
             "Hout berekenen: planken, balken en m³",
             "Bereken hout voor planken of balken: aantal, m³, schroeven en beits, voor vlonder, gevelbekleding of regelwerk. Gratis proberen, geen login."),
    "sheets": ("Plywood & OSB Calculator: Sheets Needed",
               "Calculate how many sheets of plywood, OSB or MDF you need for a floor, wall or roof, with waste, screws and cost. Try it free, no login.",
               "Plaatmateriaal berekenen: multiplex, OSB en MDF",
               "Bereken hoeveel platen multiplex, OSB of MDF je nodig hebt voor vloer, wand of dak, met zaagverlies, schroeven en kosten. Gratis proberen."),
    "roof": ("Roof Pitch Calculator: Roof Area & Roof Tiles",
             "Calculate roof pitch and real roof area, then roof tiles, bitumen, EPDM or metal sheets and battens. Try it free, no login needed.",
             "Dakhelling berekenen: dakoppervlak en dakpannen",
             "Bereken de dakhelling en het echte dakoppervlak, en daarna dakpannen, bitumen, EPDM of golfplaat en panlatten. Gratis proberen, geen login."),
    "stairs": ("Stair Calculator: Rise, Going & Stringer Length",
               "Calculate a straight, L or U staircase: number of steps, rise and going, stringer length and handrail. Try it free, no login needed.",
               "Trap berekenen: optrede, aantrede en traplengte",
               "Bereken een rechte trap, kwartslag of halve draai: aantal treden, optrede en aantrede, traplengte, trapbomen en leuning. Gratis proberen."),
    "fence": ("Fence Calculator: Posts, Panels & Gates",
              "Calculate fence posts, panels, end panels and gates for straight, L and U-shaped fences, with concrete per post. Try it free, no login.",
              "Schutting berekenen: palen, schermen en poorten",
              "Bereken schuttingpalen, schermen, pasvakken en poorten voor een rechte, L- of U-vormige schutting, met beton per paal. Gratis proberen."),
    "excavation": ("Excavation Calculator: Dig Volume, Skips & Tonnes",
                   "Calculate how much soil you dig out in m³, with bulking, the number of skips or trucks and the weight in tonnes. Try it free, no login.",
                   "Grondwerk berekenen: m³ grond en containers",
                   "Bereken hoeveel m³ grond je afgraaft, met opbulking, het aantal containers of vrachten en het gewicht in tonnen. Gratis proberen, geen login."),
    "tank": ("Tank Volume Calculator: Litres in a Tank",
             "Calculate the volume in litres of a vertical, horizontal or rectangular tank, also when it is partly full. Try it free, no login needed.",
             "Inhoud tank berekenen: liters in een tank",
             "Bereken de inhoud in liters van een staande, liggende of rechthoekige tank, ook als hij maar deels vol is. Gratis proberen, geen login nodig."),
    "cost": ("Construction Cost Estimator: Lines, Discount & VAT",
             "Make a quick construction cost estimate: materials and labour lines, discount, VAT and total. Free, straight in your browser.",
             "Kostenraming maken: regels, korting en btw",
             "Maak snel een kostenraming voor een klus: regels voor materiaal en arbeid, korting, btw en totaal. Gratis, direct in je browser."),
    "converter": ("Construction Unit Converter: m, m², m³, kg & Slope",
                  "Convert length, area, volume and weight, and slope between degrees, percent and 1:x with the rise per metre. Free, no login needed.",
                  "Eenheden omrekenen: m, m², m³, kg en helling",
                  "Reken lengte, oppervlakte, volume en gewicht om, en helling tussen graden, procent en 1:x met de stijging per meter. Gratis, geen login."),
}


def esc(s):
    return s.replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;")


def path_for(slug, lang):
    base = "nl/" if lang == "nl" else ""
    return f"{base}calculators/{slug + '/' if slug else ''}index.html"


def apply(path, title, desc):
    full = os.path.join(ROOT, path)
    with open(full, encoding="utf-8-sig") as f:
        s = f.read()
    t, d = esc(title), esc(desc)
    s = re.sub(r"<title>.*?</title>", lambda m: f"<title>{t} | BuildExact</title>", s, count=1, flags=re.S)
    s = re.sub(r'(<meta (?:property|name)="(?:og|twitter):title" content=")[^"]*"',
               lambda m: f'{m.group(1)}{t} | BuildExact"', s)
    s = re.sub(r'(<meta (?:name="description"|property="og:description"|name="twitter:description") content=")[^"]*"',
               lambda m: f'{m.group(1)}{d}"', s)
    s = re.sub(r"(<h1[^>]*>).*?(</h1>)", lambda m: f"{m.group(1)}{t}{m.group(2)}", s, count=1, flags=re.S)
    with open(full, "w", encoding="utf-8", newline="") as f:
        f.write(s)


def check(lang, slug, title, desc):
    try:
        from PIL import ImageFont
        ft, fd = ImageFont.truetype("arial.ttf", 20), ImageFont.truetype("arial.ttf", 14)
    except Exception:
        return
    tp, dp = ft.getlength(title + " | BuildExact"), fd.getlength(desc)
    if tp > TITLE_MAX_PX:
        print(f"  ! {lang}/{slug or 'index'}: title {tp:.0f}px > {TITLE_MAX_PX}px")
    if dp > DESC_MAX_PX:
        print(f"  ! {lang}/{slug or 'index'}: description {dp:.0f}px > {DESC_MAX_PX}px")


def apply_all():
    n = 0
    for slug, (te, de, tn, dn) in PAGES.items():
        for lang, title, desc in (("en", te, de), ("nl", tn, dn)):
            check(lang, slug, title, desc)
            if os.path.exists(os.path.join(ROOT, path_for(slug, lang))):
                apply(path_for(slug, lang), title, desc)
                n += 1
    print(f"seo: {n} pages updated")


if __name__ == "__main__":
    apply_all()
