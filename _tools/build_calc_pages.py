"""Build the calculator pages that are generated from data, for EN and NL.

Run from the site root:  python -I _tools/build_calc_pages.py

- New calculators (NEW): a full page each, with form, result card, guide and
  FAQ (+ FAQPage data). The page chrome (head, header, footer) is copied from
  the tile calculator so it matches the hand-written pages.
- Upgraded simple calculators (UPGRADE): only the lede and the form/result
  block of the existing page are replaced; their guide and FAQ stay.
- The calculator overview (calculators/index.html, nl/...) is rebuilt from
  CATALOG: compact tiles grouped by trade, with a search box.
- New pages get a line in sitemap.xml (only once).

The calculation code lives in assets/js/calculators/<slug>.js.
"""
import html
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from icons import svg  # noqa: E402
from calc_content import EXTRA  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://buildexact.app"
PLAY = "https://play.google.com/store/apps/details?id=com.metenweten.bouw"
LANGS = ("en", "nl")


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


def prefix(lang):
    return "/nl" if lang == "nl" else ""


# ---------------------------------------------------------------- form parts
# Labels are (en, nl) tuples; every helper takes the language.

def L(t, lang):
    return t[1] if lang == "nl" else t[0]


def section(title, lang, first=False):
    style = "" if first else ' style="margin-top:28px;"'
    return f'<h3{style}>{L(title, lang)}</h3>'


def field(fid, label, value, step, lang, minv="0"):
    return (f'<div class="field"><label for="{fid}">{L(label, lang)}</label>'
            f'<input type="number" id="{fid}" value="{value}" min="{minv}" step="{step}"></div>')


def row(*fields):
    cls = "field-row three" if len(fields) == 3 else "field-row"
    return f'<div class="{cls}">' + "".join(fields) + "</div>"


def chips(cid, items, lang):
    out = []
    for i, it in enumerate(items):
        value, label = it[0], it[1]
        data = "".join(f' data-{k}="{v}"' for k, v in (it[2] if len(it) > 2 else {}).items())
        act = " active" if i == 0 else ""
        out.append(f'<button type="button" class="chip{act}" data-value="{value}"{data}>{L(label, lang)}</button>')
    return f'<div class="chips" id="{cid}">' + "".join(out) + "</div>"


def toggle(tid, label, lang, checked=False):
    c = " checked" if checked else ""
    return f'<label class="toggle-row"><span>{L(label, lang)}</span><input type="checkbox" id="{tid}"{c}></label>'


def hint(text, lang):
    return f'<p class="hint-line">{L(text, lang)}</p>'


def wrap_id(wid, inner, hidden=False):
    st = ' style="display:none"' if hidden else ""
    return f'<div id="{wid}"{st}>{inner}</div>'


def dyn(list_id, add_label, lang):
    return (f'<div id="{list_id}"></div>'
            f'<button type="button" class="btn btn-ghost btn-sm add-row" id="{list_id}Add">+ {L(add_label, lang)}</button>')


CALC_BTN = ("Calculate (&minus;1 credit)", "Bereken (&minus;1 credit)")
RESULT = ("Result", "Resultaat")


# ---------------------------------------------------------------- new pages

def plaster_form(lang):
    return "".join([
        section(("Surface", "Oppervlak"), lang, True),
        chips("typeChips", [
            ("gypsum", ("Gypsum plaster", "Gipspleister"), {"kg": "1.0", "mm": "10"}),
            ("cement", ("Lime-cement render", "Kalkcementpleister"), {"kg": "1.6", "mm": "12"}),
            ("skim", ("Finish / skim coat", "Finish / schuurpleister"), {"kg": "1.2", "mm": "2"}),
        ], lang),
        row(field("area", ("Wall or ceiling area (m²)", "Wand- of plafondoppervlak (m²)"), 30, 0.1, lang),
            field("openings", ("Minus openings (m²)", "Min openingen (m²)"), 2, 0.1, lang)),
        field("mm", ("Layer thickness (mm)", "Laagdikte (mm)"), 10, 1, lang),
        section(("Material", "Materiaal"), lang),
        row(field("kg", ("Use (kg/m² per mm)", "Verbruik (kg/m² per mm)"), 1.0, 0.1, lang),
            field("bag", ("Bag content (kg)", "Inhoud zak (kg)"), 25, 1, lang)),
        row(field("waste", ("Waste (%)", "Verlies (%)"), 10, 1, lang),
            field("price", ("Price per bag (€, optional)", "Prijs per zak (€, optioneel)"), 0, 0.5, lang)),
        toggle("primer", ("Add primer / bonding agent", "Voorstrijkmiddel meerekenen"), lang, True),
        wrap_id("primerField", field("primerCov", ("Primer use (L/m²)", "Verbruik voorstrijk (L/m²)"), 0.15, 0.01, lang)),
    ])


def excavation_form(lang):
    return "".join([
        section(("Excavation", "Uitgraving"), lang, True),
        chips("shapeChips", [
            ("pit", ("Pit / foundation", "Bouwput / fundering")),
            ("trench", ("Trench", "Sleuf")),
            ("round", ("Round hole", "Rond gat")),
        ], lang),
        wrap_id("boxFields", row(field("l", ("Length (m)", "Lengte (m)"), 6, 0.1, lang),
                                 field("w", ("Width (m)", "Breedte (m)"), 4, 0.1, lang))),
        wrap_id("roundFields", row(field("dia", ("Diameter (m)", "Diameter (m)"), 1.2, 0.1, lang),
                                   field("count", ("Number of holes", "Aantal gaten"), 1, 1, lang)), hidden=True),
        field("d", ("Depth (m)", "Diepte (m)"), 0.6, 0.05, lang),
        section(("Removal", "Afvoer"), lang),
        row(field("swell", ("Bulking (%)", "Opbulking (%)"), 25, 1, lang),
            field("density", ("Soil weight (t/m³)", "Gewicht grond (t/m³)"), 1.6, 0.1, lang)),
        row(field("cont", ("Skip size (m³)", "Container (m³)"), 6, 1, lang),
            field("contPrice", ("Price per skip (€, optional)", "Prijs per container (€, optioneel)"), 0, 5, lang)),
        field("truck", ("Truck load (t, optional)", "Vrachtwagen (ton, optioneel)"), 0, 1, lang),
    ])


def round_column_form(lang):
    return "".join([
        section(("Column or pipe", "Kolom of buis"), lang, True),
        chips("diaChips", [
            ("20", ("Ø 20 cm", "Ø 20 cm")), ("25", ("Ø 25 cm", "Ø 25 cm")), ("30", ("Ø 30 cm", "Ø 30 cm")),
            ("40", ("Ø 40 cm", "Ø 40 cm")), ("50", ("Ø 50 cm", "Ø 50 cm")),
        ], lang),
        row(field("dia", ("Diameter (cm)", "Diameter (cm)"), 30, 1, lang),
            field("h", ("Height (m)", "Hoogte (m)"), 3, 0.1, lang)),
        row(field("n", ("Number of columns", "Aantal kolommen"), 1, 1, lang),
            field("waste", ("Waste (%)", "Verlies (%)"), 5, 1, lang)),
        toggle("hollow", ("Concrete pipe (hollow)", "Betonbuis (hol)"), lang),
        wrap_id("wallField", field("wall", ("Wall thickness (cm)", "Wanddikte (cm)"), 5, 0.5, lang), hidden=True),
        section(("Concrete", "Beton"), lang),
        row(field("yield", ("Yield per bag (L)", "Opbrengst per zak (L)"), 11.5, 0.5, lang),
            field("bagKg", ("Bag weight (kg)", "Gewicht zak (kg)"), 25, 1, lang)),
        field("price", ("Ready-mix price (€/m³, optional)", "Prijs betonmortel (€/m³, optioneel)"), 0, 5, lang),
    ])


def sheets_form(lang):
    return "".join([
        section(("Surface", "Oppervlak"), lang, True),
        row(field("l", ("Length (m)", "Lengte (m)"), 5, 0.1, lang),
            field("w", ("Width or height (m)", "Breedte of hoogte (m)"), 2.6, 0.1, lang)),
        field("openings", ("Minus openings (m²)", "Min openingen (m²)"), 0, 0.1, lang),
        section(("Sheet size", "Plaatmaat"), lang),
        chips("sizeChips", [
            ("2440x1220", ("2440 × 1220", "2440 × 1220")),
            ("2500x1250", ("2500 × 1250", "2500 × 1250")),
            ("2600x1200", ("2600 × 1200 (drywall)", "2600 × 1200 (gips)")),
            ("3050x1220", ("3050 × 1220", "3050 × 1220")),
        ], lang),
        row(field("sl", ("Sheet length (mm)", "Plaatlengte (mm)"), 2440, 10, lang),
            field("sw", ("Sheet width (mm)", "Plaatbreedte (mm)"), 1220, 10, lang)),
        row(field("waste", ("Waste (%)", "Verlies (%)"), 10, 1, lang),
            field("screws", ("Screws per sheet", "Schroeven per plaat"), 30, 1, lang)),
        field("price", ("Price per sheet (€, optional)", "Prijs per plaat (€, optioneel)"), 0, 0.5, lang),
    ])


def steel_form(lang):
    return "".join([
        section(("Round bar / rebar", "Rond staal / wapening"), lang, True),
        chips("diaChips", [(d, (f"Ø{d}", f"Ø{d}")) for d in ("6", "8", "10", "12", "16", "20", "25")], lang),
        row(field("d", ("Diameter (mm)", "Diameter (mm)"), 6, 1, lang),
            field("l", ("Length per bar (m)", "Lengte per staaf (m)"), 6, 0.1, lang)),
        field("n", ("Number of bars", "Aantal staven"), 10, 1, lang),
        section(("Steel plate (optional)", "Plaatstaal (optioneel)"), lang),
        row(field("pl", ("Length (mm)", "Lengte (mm)"), 0, 10, lang),
            field("pw", ("Width (mm)", "Breedte (mm)"), 0, 10, lang)),
        row(field("pt", ("Thickness (mm)", "Dikte (mm)"), 0, 1, lang),
            field("pn", ("Number of plates", "Aantal platen"), 1, 1, lang)),
        section(("Price", "Prijs"), lang),
        field("price", ("Price per kg (€, optional)", "Prijs per kg (€, optioneel)"), 0, 0.05, lang),
    ])


def tank_form(lang):
    return "".join([
        section(("Tank shape", "Vorm van de tank"), lang, True),
        chips("shapeChips", [
            ("upright", ("Round, upright", "Rond, staand")),
            ("lying", ("Round, lying", "Rond, liggend")),
            ("box", ("Rectangular", "Rechthoekig")),
        ], lang),
        wrap_id("roundFields", row(field("dia", ("Diameter (cm)", "Diameter (cm)"), 100, 1, lang),
                                   field("len", ("Height or length (cm)", "Hoogte of lengte (cm)"), 120, 1, lang))),
        wrap_id("boxFields", "".join([
            row(field("bl", ("Length (cm)", "Lengte (cm)"), 120, 1, lang),
                field("bw", ("Width (cm)", "Breedte (cm)"), 80, 1, lang)),
            field("bh", ("Height (cm)", "Hoogte (cm)"), 100, 1, lang)]), hidden=True),
        section(("Contents", "Inhoud"), lang),
        field("level", ("Liquid level (cm from bottom, 0 = full)", "Vloeistofhoogte (cm vanaf bodem, 0 = vol)"), 0, 1, lang),
        hint(("For a lying tank the litres per cm are not linear; the calculator uses the exact circle segment.",
              "Bij een liggende tank is de inhoud per cm niet gelijk; de calculator rekent met het exacte cirkelsegment."), lang),
    ])


def flooring_form(lang):
    return "".join([
        section(("Room", "Ruimte"), lang, True),
        row(field("l", ("Length (m)", "Lengte (m)"), 5, 0.01, lang),
            field("w", ("Width (m)", "Breedte (m)"), 3.5, 0.01, lang)),
        section(("Roll", "Rol"), lang),
        chips("rollChips", [
            ("2", ("2 m", "2 m")), ("3", ("3 m", "3 m")), ("4", ("4 m", "4 m")), ("5", ("5 m", "5 m")),
        ], lang),
        row(field("roll", ("Roll width (m)", "Rolbreedte (m)"), 4, 0.1, lang),
            field("extra", ("Extra per strip (cm)", "Extra per baan (cm)"), 10, 1, lang)),
        field("repeat", ("Pattern repeat (cm, 0 = none)", "Patroonrapport (cm, 0 = geen)"), 0, 1, lang),
        section(("Extras", "Extra"), lang),
        toggle("underlay", ("Underlay", "Ondervloer"), lang),
        toggle("edge", ("Edge strip along the walls", "Afwerkprofiel langs de wanden"), lang),
        field("price", ("Price per m² (€, optional)", "Prijs per m² (€, optioneel)"), 0, 0.5, lang),
    ])


def converter_form(lang):
    cats = [("length", ("Length", "Lengte")), ("area", ("Area", "Oppervlakte")), ("volume", ("Volume", "Volume")),
            ("weight", ("Weight", "Gewicht")), ("slope", ("Slope", "Helling"))]
    return "".join([
        section(("What do you convert?", "Wat reken je om?"), lang, True),
        chips("catChips", cats, lang),
        row('<div class="field"><label for="val">' + L(("Value", "Waarde"), lang) +
            '</label><input type="number" id="val" value="1" step="any"></div>',
            '<div class="field"><label for="from">' + L(("From", "Van"), lang) +
            '</label><select id="from"></select></div>'),
    ])


NEW = [
    dict(slug="plaster", icon="🧱", group="walls", js="plaster", free=False,
         en=dict(title="Plaster calculator", nav="Plastering",
                 desc="Plaster calculator: bags of gypsum or lime-cement plaster per m², layer thickness, waste, primer and cost.",
                 lede="Bags of plaster for walls and ceilings, by layer thickness, with primer and cost.",
                 card="Bags per m² and layer, primer, cost.",
                 hero="Needed", note="Estimates only - check the use per mm on the bag; uneven walls need more.",
                 how="How the plaster calculator works",
                 guide=["Enter the area you plaster and subtract doors and windows. Pick the type of plaster: it fills in a typical use per m² per mm and a usual layer thickness. Change both to what your bag says.",
                        "The calculator multiplies area × thickness × use, adds waste and rounds up to whole bags. With primer switched on it also gives the litres of primer or bonding agent."],
                 tip="Margin tip: walls are rarely flat. Measure the thickest spot and add 10-15% on old walls.",
                 faq=[("How much plaster do I need per m²?", "About 1 kg per m² for every mm of gypsum plaster, so 10 kg/m² for a 10 mm layer. Lime-cement render is heavier: around 1.5 to 1.8 kg per m² per mm."),
                      ("How many bags of plaster for a wall of 10 m²?", "With 10 mm gypsum plaster (1 kg/m²/mm) you need 100 kg, plus 10% waste is 110 kg: 5 bags of 25 kg."),
                      ("How thick should plaster be?", "Gypsum plaster on brick or block is usually 8 to 15 mm, a finish coat 1 to 3 mm. On concrete a thin coat of 3 to 5 mm is often enough.")]),
         nl=dict(title="Stucwerk calculator", nav="Stucwerk",
                 desc="Stucwerk calculator: zakken gips- of kalkcementpleister per m², laagdikte, verlies, voorstrijk en kosten.",
                 lede="Zakken pleister voor wanden en plafonds, per laagdikte, met voorstrijk en kosten.",
                 card="Zakken per m² en laag, voorstrijk, kosten.",
                 hero="Nodig", note="Alleen een schatting - kijk naar het verbruik per mm op de zak; scheve wanden vragen meer.",
                 how="Zo werkt de stucwerk calculator",
                 guide=["Vul het oppervlak in dat je stuct en trek deuren en ramen eraf. Kies het soort pleister: dat vult een gebruikelijk verbruik per m² per mm en een normale laagdikte in. Pas beide aan naar wat op je zak staat.",
                        "De calculator rekent oppervlak × laagdikte × verbruik, telt het verlies erbij op en rondt af op hele zakken. Met voorstrijk aan krijg je ook de liters voorstrijkmiddel."],
                 tip="Marge-tip: wanden zijn zelden vlak. Meet de dikste plek en reken op oude muren 10-15% extra.",
                 faq=[("Hoeveel pleister heb ik nodig per m²?", "Ongeveer 1 kg per m² per mm gipspleister, dus 10 kg/m² bij een laag van 10 mm. Kalkcementpleister is zwaarder: zo'n 1,5 tot 1,8 kg per m² per mm."),
                      ("Hoeveel zakken pleister voor een muur van 10 m²?", "Met 10 mm gipspleister (1 kg/m²/mm) heb je 100 kg nodig, met 10% verlies 110 kg: 5 zakken van 25 kg."),
                      ("Hoe dik moet stucwerk zijn?", "Gipspleister op metselwerk of blokken is meestal 8 tot 15 mm, een finishlaag 1 tot 3 mm. Op beton is vaak een dunne laag van 3 tot 5 mm genoeg.")]),
         form=plaster_form),
    dict(slug="excavation", icon="🚜", group="ground", js="excavation", free=False,
         en=dict(title="Excavation calculator", nav="Excavation",
                 desc="Excavation calculator: dig volume in m³, bulking, number of skips, tonnes of soil and truck loads.",
                 lede="Dig volume for pits, trenches and holes, with bulking, skips, tonnes and truck loads.",
                 card="Dig volume, bulking, skips, tonnes.",
                 hero="Dig out", note="Estimates only - soil weight and bulking differ per soil type.",
                 how="How the excavation calculator works",
                 guide=["Choose a pit, a trench or round holes and enter the size and depth. The calculator gives the solid volume you dig out in m³.",
                        "Dug soil takes up more room than it did in the ground: that is bulking, usually 20-30% for sand and up to 40% for clay. The loose volume decides how many skips you need. The weight in tonnes uses the soil weight you enter."],
                 tip="Tip: a 6 m³ skip may not always be filled to the top with heavy soil because of its weight limit. Ask your supplier.",
                 faq=[("How do I calculate excavation volume?", "Length × width × depth, all in metres. A pit of 6 × 4 m and 0.6 m deep is 14.4 m³ of solid soil."),
                      ("What is bulking of soil?", "Soil loosens when you dig it. 1 m³ in the ground becomes about 1.2 to 1.4 m³ loose. Sand bulks less, clay more."),
                      ("How much does 1 m³ of soil weigh?", "Roughly 1.5 to 1.9 tonnes. Dry sand is around 1.6 t/m³, wet clay can be 1.9 t/m³ or more.")]),
         nl=dict(title="Grondwerk calculator", nav="Grondwerk",
                 desc="Grondwerk calculator: graafvolume in m³, opbulking, aantal containers, tonnen grond en vrachtwagens.",
                 lede="Graafvolume voor bouwputten, sleuven en gaten, met opbulking, containers, tonnen en vrachten.",
                 card="Graafvolume, opbulking, containers, tonnen.",
                 hero="Uitgraven", note="Alleen een schatting - gewicht en opbulking verschillen per grondsoort.",
                 how="Zo werkt de grondwerk calculator",
                 guide=["Kies een bouwput, een sleuf of ronde gaten en vul maat en diepte in. De calculator geeft het vaste volume dat je uitgraaft in m³.",
                        "Uitgegraven grond neemt meer ruimte in dan in de bodem: dat heet opbulking, meestal 20-30% bij zand en tot 40% bij klei. Het losse volume bepaalt hoeveel containers je nodig hebt. Het gewicht in tonnen gebruikt het grondgewicht dat je invult."],
                 tip="Tip: een container van 6 m³ mag met zware grond vaak niet tot de rand vol vanwege het maximale gewicht. Vraag het je verhuurder.",
                 faq=[("Hoe bereken ik het graafvolume?", "Lengte × breedte × diepte, alles in meters. Een put van 6 × 4 m en 0,6 m diep is 14,4 m³ vaste grond."),
                      ("Wat is opbulking van grond?", "Grond wordt losser als je hem uitgraaft. 1 m³ in de bodem wordt ongeveer 1,2 tot 1,4 m³ los. Zand bulkt minder, klei meer."),
                      ("Hoeveel weegt 1 m³ grond?", "Ongeveer 1,5 tot 1,9 ton. Droog zand zit rond 1,6 t/m³, natte klei kan 1,9 t/m³ of meer zijn.")]),
         form=excavation_form),
    dict(slug="round-column", icon="🛢️", group="concrete", js="round-column", free=False,
         en=dict(title="Round column calculator", nav="Round column",
                 desc="Round column and concrete pipe calculator: concrete volume in m³, bags of concrete, form tube and cost.",
                 lede="Concrete for round columns, form tubes and concrete pipes: m³, bags and cost.",
                 card="Column or pipe: m³, bags, form tube.",
                 hero="Concrete", note="Estimates only - check the yield per bag on the packaging.",
                 how="How the round column calculator works",
                 guide=["Enter the diameter in cm and the height in metres. The volume of one column is π × r² × height; the calculator multiplies by the number of columns and adds waste.",
                        "For a concrete pipe switch on Hollow and enter the wall thickness: only the ring is counted. The result shows ready-mix in m³, the number of bags of concrete and the length of form tube you need."],
                 tip="Tip: from about 0.5 m³ ready-mix concrete is usually cheaper and stronger than mixing bags yourself.",
                 faq=[("How much concrete is in a round column?", "π × radius² × height. A column of Ø30 cm and 3 m high: 3.1416 × 0.15² × 3 = 0.212 m³."),
                      ("How many bags of concrete for a post hole?", "A hole of Ø30 cm and 80 cm deep is about 57 litres: 5 bags of 25 kg with about 11.5 litres each."),
                      ("What is a form tube?", "A cardboard tube you fill with concrete to cast a round column or foundation pile. You buy it per metre in the diameter you need.")]),
         nl=dict(title="Ronde kolom calculator", nav="Ronde kolom",
                 desc="Ronde kolom en betonbuis calculator: betonvolume in m³, zakken beton, bekistingsbuis en kosten.",
                 lede="Beton voor ronde kolommen, bekistingsbuizen en betonbuizen: m³, zakken en kosten.",
                 card="Kolom of buis: m³, zakken, bekistingsbuis.",
                 hero="Beton", note="Alleen een schatting - kijk naar de opbrengst per zak op de verpakking.",
                 how="Zo werkt de ronde kolom calculator",
                 guide=["Vul de diameter in cm en de hoogte in meters in. Het volume van één kolom is π × r² × hoogte; de calculator vermenigvuldigt met het aantal kolommen en telt het verlies erbij op.",
                        "Voor een betonbuis zet je Hol aan en vul je de wanddikte in: dan telt alleen de ring mee. Je ziet betonmortel in m³, het aantal zakken beton en de lengte bekistingsbuis die je nodig hebt."],
                 tip="Tip: vanaf ongeveer 0,5 m³ is betonmortel uit de mixer meestal goedkoper en sterker dan zelf zakken mengen.",
                 faq=[("Hoeveel beton gaat er in een ronde kolom?", "π × straal² × hoogte. Een kolom van Ø30 cm en 3 m hoog: 3,1416 × 0,15² × 3 = 0,212 m³."),
                      ("Hoeveel zakken beton voor een paalgat?", "Een gat van Ø30 cm en 80 cm diep is ongeveer 57 liter: 5 zakken van 25 kg met elk zo'n 11,5 liter."),
                      ("Wat is een bekistingsbuis?", "Een kartonnen koker die je met beton vult om een ronde kolom of poer te storten. Je koopt hem per meter in de diameter die je nodig hebt.")]),
         form=round_column_form),
    dict(slug="sheets", icon="🪵", group="wood", js="sheets", free=False,
         en=dict(title="Sheet material calculator", nav="Sheet material",
                 desc="Sheet material calculator: number of plywood, OSB, MDF or drywall sheets, waste, screws and cost.",
                 lede="Plywood, OSB, MDF or drywall sheets for walls, floors and roofs, with screws and cost.",
                 card="Plywood, OSB, MDF: sheets, screws, cost.",
                 hero="Needed", note="Estimates only - plan the layout for large cut-outs.",
                 how="How the sheet material calculator works",
                 guide=["Enter the size of the wall, floor or roof and subtract openings. Pick a common sheet size or type your own in mm.",
                        "The calculator adds waste and divides by the area of one sheet, rounded up to whole sheets. It also gives the number of screws, so you can buy everything in one go."],
                 tip="Tip: lay sheets staggered like bricks. You lose less material and the floor or wall is stronger.",
                 faq=[("How many sheets of plywood do I need?", "Area plus 10% waste, divided by the area of one sheet. A wall of 5 × 2.6 m (13 m²) needs 5 sheets of 2440 × 1220 mm."),
                      ("What size is a sheet of OSB?", "The most common size is 2440 × 1220 mm (2.98 m²). Tongue-and-groove floor sheets are often 2440 × 590 or 2500 × 675 mm."),
                      ("How many screws per sheet?", "About 25 to 35 per standard sheet: every 15-20 cm along the edges and every 30 cm on the studs in between.")]),
         nl=dict(title="Plaatmateriaal calculator", nav="Plaatmateriaal",
                 desc="Plaatmateriaal calculator: aantal platen multiplex, OSB, MDF of gips, zaagverlies, schroeven en kosten.",
                 lede="Multiplex, OSB, MDF of gipsplaten voor wanden, vloeren en daken, met schroeven en kosten.",
                 card="Multiplex, OSB, MDF: platen, schroeven, kosten.",
                 hero="Nodig", note="Alleen een schatting - maak een legplan bij grote uitsparingen.",
                 how="Zo werkt de plaatmateriaal calculator",
                 guide=["Vul de maat van de wand, vloer of het dak in en trek openingen eraf. Kies een gangbare plaatmaat of typ je eigen maat in mm.",
                        "De calculator telt het zaagverlies erbij op en deelt door het oppervlak van één plaat, afgerond op hele platen. Je krijgt ook het aantal schroeven, zodat je alles in één keer koopt."],
                 tip="Tip: leg platen in halfsteens verband. Je verliest minder materiaal en de vloer of wand wordt steviger.",
                 faq=[("Hoeveel platen multiplex heb ik nodig?", "Oppervlak plus 10% verlies, gedeeld door het oppervlak van één plaat. Een wand van 5 × 2,6 m (13 m²) vraagt 5 platen van 2440 × 1220 mm."),
                      ("Wat is de maat van een OSB-plaat?", "De meest gangbare maat is 2440 × 1220 mm (2,98 m²). Vloerplaten met messing en groef zijn vaak 2440 × 590 of 2500 × 675 mm."),
                      ("Hoeveel schroeven per plaat?", "Ongeveer 25 tot 35 per standaardplaat: om de 15-20 cm langs de randen en om de 30 cm op de regels ertussen.")]),
         form=sheets_form),
    dict(slug="steel", icon="🔩", group="concrete", js="steel", free=False,
         en=dict(title="Steel weight calculator", nav="Steel weight",
                 desc="Steel weight calculator: kg per metre for rebar and round bar, weight of steel plate, total weight and cost.",
                 lede="Weight of rebar, round bar and steel plate in kg, with kg per metre and cost.",
                 card="Rebar and plate: kg/m, total kg, cost.",
                 hero="Weight", note="Uses steel at 7850 kg/m³.",
                 how="How the steel weight calculator works",
                 guide=["Pick a bar diameter, enter the length per bar and the number of bars. The weight per metre is π × r² × 7850 kg/m³: for Ø12 mm that is 0.888 kg/m.",
                        "Add a steel plate if you need one: length × width × thickness in mm. With a price per kg you see the cost of all steel at once."],
                 tip="Tip: rebar is often sold per 6 or 12 m bar. Count overlaps of about 40 × the diameter where bars join.",
                 faq=[("How much does rebar weigh per metre?", "Ø8 mm 0.395 kg/m, Ø10 mm 0.617 kg/m, Ø12 mm 0.888 kg/m, Ø16 mm 1.58 kg/m and Ø20 mm 2.47 kg/m."),
                      ("How do I calculate the weight of a steel plate?", "Length × width × thickness in metres × 7850. A plate of 1000 × 500 × 10 mm weighs 39.3 kg."),
                      ("What is the density of steel?", "About 7850 kg per m³ for normal construction steel.")]),
         nl=dict(title="Staalgewicht calculator", nav="Staalgewicht",
                 desc="Staalgewicht calculator: kg per meter voor wapeningsstaal en rond staal, gewicht van plaatstaal, totaal en kosten.",
                 lede="Gewicht van wapening, rond staal en plaatstaal in kg, met kg per meter en kosten.",
                 card="Wapening en plaat: kg/m, totaal kg, kosten.",
                 hero="Gewicht", note="Rekent met staal van 7850 kg/m³.",
                 how="Zo werkt de staalgewicht calculator",
                 guide=["Kies een staafdiameter, vul de lengte per staaf en het aantal staven in. Het gewicht per meter is π × r² × 7850 kg/m³: voor Ø12 mm is dat 0,888 kg/m.",
                        "Voeg plaatstaal toe als je dat nodig hebt: lengte × breedte × dikte in mm. Met een prijs per kg zie je meteen wat al het staal kost."],
                 tip="Tip: wapening wordt vaak per staaf van 6 of 12 m verkocht. Reken bij verbindingen een overlap van ongeveer 40 × de diameter.",
                 faq=[("Hoeveel weegt wapeningsstaal per meter?", "Ø8 mm 0,395 kg/m, Ø10 mm 0,617 kg/m, Ø12 mm 0,888 kg/m, Ø16 mm 1,58 kg/m en Ø20 mm 2,47 kg/m."),
                      ("Hoe bereken ik het gewicht van plaatstaal?", "Lengte × breedte × dikte in meters × 7850. Een plaat van 1000 × 500 × 10 mm weegt 39,3 kg."),
                      ("Wat is de soortelijke massa van staal?", "Ongeveer 7850 kg per m³ voor gewoon constructiestaal.")]),
         form=steel_form),
    dict(slug="tank", icon="💧", group="ground", js="tank", free=False,
         en=dict(title="Tank volume calculator", nav="Tank volume",
                 desc="Tank volume calculator: litres in a round upright, lying or rectangular tank, also when partly filled.",
                 lede="Litres in an upright, lying or rectangular tank, also at the current liquid level.",
                 card="Upright, lying or box tank in litres.",
                 hero="Capacity", note="Inside dimensions give the real capacity; walls and fittings take some space.",
                 how="How the tank volume calculator works",
                 guide=["Pick the shape and enter the inside dimensions in cm. Upright round tanks use π × r² × height, rectangular tanks length × width × height.",
                        "Enter the liquid level to see how much is in the tank now. For a lying round tank the calculator uses the exact circle segment, because the middle of the tank holds much more per cm than the bottom."],
                 tip="Tip: 1 m³ is 1000 litres. A rain barrel of Ø60 cm and 90 cm high holds about 254 litres.",
                 faq=[("How do I calculate the litres in a round tank?", "π × radius² × height in dm. A tank of Ø100 cm and 100 cm high: 3.1416 × 5² × 10 = 785 litres."),
                      ("How much is in a lying tank that is half full?", "Exactly half of the capacity. Above or below half the litres per cm change; enter the level and the calculator does the segment maths."),
                      ("How many litres is 1 m³?", "1000 litres. 1 litre is 1 dm³.")]),
         nl=dict(title="Tankinhoud calculator", nav="Tankinhoud",
                 desc="Tankinhoud calculator: liters in een ronde staande, liggende of rechthoekige tank, ook als hij deels vol is.",
                 lede="Liters in een staande, liggende of rechthoekige tank, ook bij de huidige vloeistofhoogte.",
                 card="Staande, liggende of rechthoekige tank in liters.",
                 hero="Inhoud", note="Binnenmaten geven de echte inhoud; wanden en aansluitingen nemen wat ruimte in.",
                 how="Zo werkt de tankinhoud calculator",
                 guide=["Kies de vorm en vul de binnenmaten in cm in. Staande ronde tanks rekenen met π × r² × hoogte, rechthoekige met lengte × breedte × hoogte.",
                        "Vul de vloeistofhoogte in om te zien hoeveel er nu in zit. Bij een liggende ronde tank rekent de calculator met het exacte cirkelsegment, want in het midden zit per cm veel meer dan onderin."],
                 tip="Tip: 1 m³ is 1000 liter. Een regenton van Ø60 cm en 90 cm hoog bevat ongeveer 254 liter.",
                 faq=[("Hoe bereken ik de liters in een ronde tank?", "π × straal² × hoogte in dm. Een tank van Ø100 cm en 100 cm hoog: 3,1416 × 5² × 10 = 785 liter."),
                      ("Hoeveel zit er in een liggende tank die half vol is?", "Precies de helft van de inhoud. Boven of onder de helft verandert het aantal liters per cm; vul de hoogte in en de calculator rekent het segment uit."),
                      ("Hoeveel liter is 1 m³?", "1000 liter. 1 liter is 1 dm³.")]),
         form=tank_form),
    dict(slug="flooring", icon="🟩", group="floors", js="flooring", free=False,
         en=dict(title="Flooring calculator", nav="Floor covering",
                 desc="Flooring calculator for carpet, vinyl and lino from the roll: metres to buy, strips, seams, underlay and cost.",
                 lede="Carpet, vinyl and lino from the roll: metres to buy, strips, pattern repeat, underlay and cost.",
                 card="Carpet, vinyl, lino: metres of roll, strips.",
                 hero="Buy", note="Estimates only - measure at the widest point and check the roll direction.",
                 how="How the flooring calculator works",
                 guide=["Enter the room size and the roll width. The calculator lays the strips along the longest wall, so you get the fewest seams, and adds a little extra per strip for trimming.",
                        "With a pattern repeat each strip is rounded up to a whole repeat, so the pattern lines up at the seams. You see the metres of roll to buy, the purchased m² and the waste."],
                 tip="Tip: a room up to 4 m wide fits a 4 m roll without seams. Then you only buy room length + 10 cm.",
                 faq=[("How many metres of carpet do I need?", "Divide the room width by the roll width, round up, and multiply by the room length plus 10 cm. A room of 5 × 3.5 m with a 4 m roll: 1 strip of 5.10 m."),
                      ("Which roll width should I choose?", "The width that covers the room in as few strips as possible. Vinyl and carpet come in 2, 3, 4 and 5 m."),
                      ("What is a pattern repeat?", "The distance after which the pattern repeats. Each strip has to start at the same point of the pattern, so you lose some material per strip.")]),
         nl=dict(title="Vloerbedekking calculator", nav="Vloerbedekking",
                 desc="Vloerbedekking calculator voor tapijt, vinyl en linoleum van de rol: meters kopen, banen, naden, ondervloer en kosten.",
                 lede="Tapijt, vinyl en linoleum van de rol: meters kopen, banen, patroonrapport, ondervloer en kosten.",
                 card="Tapijt, vinyl, linoleum: meters van de rol.",
                 hero="Kopen", note="Alleen een schatting - meet op het breedste punt en let op de looprichting van de rol.",
                 how="Zo werkt de vloerbedekking calculator",
                 guide=["Vul de maat van de kamer en de rolbreedte in. De calculator legt de banen langs de langste wand, zodat je zo min mogelijk naden hebt, en telt per baan wat extra voor het afsnijden.",
                        "Met een patroonrapport wordt elke baan afgerond op een heel rapport, zodat het patroon bij de naden doorloopt. Je ziet hoeveel meter je van de rol koopt, de afgenomen m² en het verlies."],
                 tip="Tip: een kamer tot 4 m breed past op een rol van 4 m zonder naad. Dan koop je alleen kamerlengte + 10 cm.",
                 faq=[("Hoeveel meter tapijt heb ik nodig?", "Deel de kamerbreedte door de rolbreedte, rond naar boven af en vermenigvuldig met de kamerlengte plus 10 cm. Een kamer van 5 × 3,5 m met een rol van 4 m: 1 baan van 5,10 m."),
                      ("Welke rolbreedte kies ik?", "De breedte waarmee je de kamer in zo min mogelijk banen legt. Vinyl en tapijt zijn er in 2, 3, 4 en 5 m."),
                      ("Wat is een patroonrapport?", "De afstand waarna het patroon zich herhaalt. Elke baan moet op hetzelfde punt van het patroon beginnen, dus je verliest per baan wat materiaal.")]),
         form=flooring_form),
    dict(slug="converter", icon="🔁", group="tools", js="converter", free=True,
         en=dict(title="Unit converter", nav="Unit converter",
                 desc="Free unit converter for builders: length, area, volume, weight and slope in degrees, percent and 1:x.",
                 lede="Length, area, volume, weight and slope (degrees, % and 1:x). Free, no credits needed.",
                 card="Length, area, volume, weight, slope.",
                 hero="Result", note="Free to use - no login and no credits.",
                 how="How the unit converter works",
                 guide=["Pick what you convert, type a value and choose its unit. You see the value in every other unit at once, so you never have to look up a factor.",
                        "Slope converts between degrees, percent and a ratio of 1:x, and shows the rise per metre. Handy for ramps, roofs and the fall of drains and terraces."],
                 tip="Tip: a fall of 1:100 is 1% or 10 mm per metre, which is the usual minimum for a terrace.",
                 faq=[("How many square feet is 1 m²?", "1 m² is 10.764 square feet. 1 square foot is 0.0929 m²."),
                      ("How do I convert a slope in degrees to percent?", "Percent = tan(degrees) × 100. 30° is 57.7%, 45° is 100%."),
                      ("What does a slope of 1:50 mean?", "1 unit up for every 50 units across: 2% or 20 mm per metre.")]),
         nl=dict(title="Eenheden omrekenen", nav="Eenheden omrekenen",
                 desc="Gratis eenheden omrekenen voor de bouw: lengte, oppervlakte, volume, gewicht en helling in graden, procent en 1:x.",
                 lede="Lengte, oppervlakte, volume, gewicht en helling (graden, % en 1:x). Gratis, zonder credits.",
                 card="Lengte, oppervlakte, volume, gewicht, helling.",
                 hero="Resultaat", note="Gratis te gebruiken - zonder inloggen en zonder credits.",
                 how="Zo werkt het omrekenen",
                 guide=["Kies wat je omrekent, typ een waarde en kies de eenheid. Je ziet de waarde meteen in alle andere eenheden, dus je hoeft nooit een factor op te zoeken.",
                        "Helling reken je om tussen graden, procent en een verhouding 1:x, met de stijging per meter erbij. Handig voor hellingbanen, daken en het afschot van afvoeren en terrassen."],
                 tip="Tip: een afschot van 1:100 is 1% of 10 mm per meter, het gebruikelijke minimum voor een terras.",
                 faq=[("Hoeveel square feet is 1 m²?", "1 m² is 10,764 square feet. 1 square foot is 0,0929 m²."),
                      ("Hoe reken ik een helling in graden om naar procent?", "Procent = tan(graden) × 100. 30° is 57,7%, 45° is 100%."),
                      ("Wat betekent een afschot van 1:50?", "1 eenheid omhoog per 50 eenheden lengte: 2% of 20 mm per meter.")]),
         form=converter_form),
]


# ---------------------------------------------------------------- upgrades of simple calcs

def area_form(lang):
    return "".join([
        section(("Shapes", "Vormen"), lang, True),
        hint(("Add a shape per part of the room. Tick \"subtract\" for a column or a bath.",
              "Voeg een vorm toe per deel van de ruimte. Vink \"aftrekken\" aan voor een kolom of een bad."), lang),
        dyn("shapes", ("Add shape", "Vorm toevoegen"), lang),
        section(("Extra", "Extra"), lang),
        field("waste", ("Waste (%)", "Snijverlies (%)"), 0, 1, lang),
    ])


def volume_form(lang):
    return "".join([
        section(("Shapes", "Vormen"), lang, True),
        dyn("shapes", ("Add shape", "Vorm toevoegen"), lang),
        section(("Material", "Materiaal"), lang),
        chips("matChips", [
            ("none", ("Just m³", "Alleen m³"), {"t": "0"}),
            ("sand", ("Sand", "Zand"), {"t": "1.6"}),
            ("gravel", ("Gravel", "Grind"), {"t": "1.7"}),
            ("soil", ("Topsoil", "Tuinaarde"), {"t": "1.3"}),
            ("concrete", ("Concrete", "Beton"), {"t": "2.4"}),
        ], lang),
        row(field("waste", ("Extra (%)", "Extra (%)"), 5, 1, lang),
            field("density", ("Weight (t/m³)", "Gewicht (t/m³)"), 0, 0.1, lang)),
    ])


def linear_form(lang):
    return "".join([
        section(("Lengths", "Lengtes"), lang, True),
        hint(("Add every run you need, with how many times you need it.",
              "Voeg elke lengte toe die je nodig hebt, met hoe vaak je hem nodig hebt."), lang),
        dyn("segs", ("Add length", "Lengte toevoegen"), lang),
        section(("Buying", "Inkopen"), lang),
        row(field("stock", ("Stock length (m)", "Handelslengte (m)"), 2.4, 0.1, lang),
            field("waste", ("Waste (%)", "Snijverlies (%)"), 10, 1, lang)),
        field("price", ("Price per metre (€, optional)", "Prijs per meter (€, optioneel)"), 0, 0.1, lang),
    ])


def wall_form(lang):
    return "".join([
        section(("Walls", "Wanden"), lang, True),
        chips("modeChips", [("room", ("Whole room", "Hele kamer")), ("walls", ("Separate walls", "Losse wanden"))], lang),
        wrap_id("roomFields", "".join([
            row(field("rl", ("Room length (m)", "Lengte kamer (m)"), 5, 0.1, lang),
                field("rw", ("Room width (m)", "Breedte kamer (m)"), 4, 0.1, lang)),
            field("rh", ("Wall height (m)", "Wandhoogte (m)"), 2.6, 0.05, lang),
            toggle("ceiling", ("Include the ceiling", "Plafond meetellen"), lang)])),
        wrap_id("wallFields", dyn("walls", ("Add wall", "Wand toevoegen"), lang), hidden=True),
        section(("Openings", "Openingen"), lang),
        row(field("doors", ("Doors", "Deuren"), 1, 1, lang),
            field("doorSize", ("Door size (m²)", "Maat deur (m²)"), 1.9, 0.1, lang)),
        dyn("wins", ("Add window", "Raam toevoegen"), lang),
        section(("Material", "Materiaal"), lang),
        field("waste", ("Waste (%)", "Verlies (%)"), 0, 1, lang),
    ])


def perimeter_form(lang):
    return "".join([
        section(("Room", "Ruimte"), lang, True),
        chips("modeChips", [("rect", ("Rectangle", "Rechthoek")), ("sides", ("Own sides", "Eigen zijden"))], lang),
        wrap_id("rectFields", row(field("length", ("Length (m)", "Lengte (m)"), 5, 0.1, lang),
                                  field("width", ("Width (m)", "Breedte (m)"), 4, 0.1, lang))),
        wrap_id("sideFields", dyn("sides", ("Add side", "Zijde toevoegen"), lang), hidden=True),
        row(field("doors", ("Door openings", "Deuropeningen"), 1, 1, lang),
            field("doorW", ("Door width (m)", "Breedte deur (m)"), 0.9, 0.05, lang)),
        section(("Skirting", "Plint"), lang),
        row(field("stock", ("Length per piece (m)", "Lengte per stuk (m)"), 2.4, 0.1, lang),
            field("waste", ("Waste (%)", "Snijverlies (%)"), 10, 1, lang)),
        field("price", ("Price per metre (€, optional)", "Prijs per meter (€, optioneel)"), 0, 0.1, lang),
    ])


UPGRADE = [
    dict(slug="area", form=area_form, hero=("Area", "Oppervlak"),
         lede=("Rectangles, triangles, circles and trapezoids added up, minus columns or a bath, with waste.",
               "Rechthoeken, driehoeken, cirkels en trapezia bij elkaar opgeteld, min kolommen of een bad, met snijverlies."),
         card=("Several shapes, minus parts, waste.", "Meerdere vormen, min delen, snijverlies.")),
    dict(slug="volume", form=volume_form, hero=("Volume", "Volume"),
         lede=("Blocks and cylinders in m³ and litres, with the weight of sand, gravel, topsoil or concrete.",
               "Blokken en cilinders in m³ en liters, met het gewicht van zand, grind, tuinaarde of beton."),
         card=("Blocks and cylinders, litres, tonnes.", "Blokken en cilinders, liters, tonnen.")),
    dict(slug="linear", form=linear_form, hero=("Total length", "Totale lengte"),
         lede=("Add up all your runs and see how many stock lengths to buy, with waste and cost.",
               "Tel al je lengtes op en zie hoeveel handelslengtes je koopt, met snijverlies en kosten."),
         card=("All runs, stock lengths, cost.", "Alle lengtes, handelslengtes, kosten.")),
    dict(slug="wall-area", form=wall_form, hero=("Net wall area", "Netto wandoppervlak"),
         lede=("A whole room or separate walls, minus doors and windows, with the ceiling if you want.",
               "Een hele kamer of losse wanden, min deuren en ramen, met het plafond als je wilt."),
         card=("Room or walls, minus doors and windows.", "Kamer of wanden, min deuren en ramen.")),
    dict(slug="perimeter", form=perimeter_form, hero=("Skirting needed", "Plint nodig"),
         lede=("Perimeter of a room minus door openings, turned into skirting pieces with waste and cost.",
               "Omtrek van een ruimte min deuropeningen, omgerekend naar plinten met snijverlies en kosten."),
         card=("Perimeter minus doors, pieces, cost.", "Omtrek min deuren, stuks, kosten.")),
]


# ---------------------------------------------------------------- overview

GROUPS = [
    ("basics", ("Measure", "Meten")),
    ("walls", ("Walls, ceilings & paint", "Wanden, plafonds & verf")),
    ("floors", ("Floors & tiles", "Vloeren & tegels")),
    ("concrete", ("Concrete, masonry & steel", "Beton, metselwerk & staal")),
    ("wood", ("Wood, roof & stairs", "Hout, dak & trap")),
    ("ground", ("Garden, ground & water", "Tuin, grond & water")),
    ("money", ("Money", "Geld")),
    ("tools", ("Tools", "Gereedschap")),
]

# slug, icon, group, (title en, nl), (desc en, nl), tags
CATALOG = [
    ("area", "⬛", "basics", ("Area (m²)", "Oppervlak (m²)"), None, ["free"]),
    ("volume", "📦", "basics", ("Volume (m³)", "Volume (m³)"), None, ["free"]),
    ("linear", "📏", "basics", ("Linear metres", "Strekkende meter"), None, ["free"]),
    ("perimeter", "📐", "basics", ("Perimeter & skirting", "Omtrek & plint"), None, ["free"]),
    ("wall-area", "🧱", "walls", ("Wall area", "Wandoppervlak"), None, ["free"]),
    ("paint", "🎨", "walls", ("Paint", "Verf"), ("Primer, coats, brush vs spray, cans.", "Grondverf, lagen, kwast vs spuit, blikken."), []),
    ("plaster", "🧱", "walls", None, None, ["new"]),
    ("drywall", "🪞", "walls", ("Drywall", "Gipsplaat"), ("Ceiling, wall or partition with studs.", "Plafond, wand of scheidingswand met profielen."), []),
    ("insulation", "🧊", "walls", ("Insulation", "Isolatie"), ("Layers, R-value, vapour barrier, tape.", "Lagen, Rd-waarde, dampremmer, tape."), []),
    ("tiles", "🟫", "floors", ("Tiles", "Tegels"), ("4 patterns, grout, boxes, adhesive, trim.", "4 patronen, voegsel, dozen, lijm, profiel."), []),
    ("flooring", "🟩", "floors", None, None, ["new"]),
    ("paving", "🧩", "floors", ("Paving", "Bestrating"), ("Patterns, sub-base, bedding, edging.", "Patronen, fundering, straatzand, opsluiting."), []),
    ("concrete", "🏗️", "concrete", ("Concrete", "Beton"), ("Presets, ready-mix vs bags, rebar, formwork.", "Presets, mortel vs zakken, wapening, bekisting."), []),
    ("round-column", "🛢️", "concrete", None, None, ["new"]),
    ("bricks", "🧱", "concrete", ("Bricks", "Bakstenen"), ("Openings, lintels, mortar, cavity ties.", "Openingen, lateien, mortel, spouwankers."), []),
    ("steel", "🔩", "concrete", None, None, ["new"]),
    ("drilling", "⚫", "concrete", ("Drilling & sawing", "Boor- & zaagwerk"), ("Core holes and cuts, price per hole or metre.", "Kernboringen en zagen, prijs per gat of meter."), []),
    ("wood", "🪚", "wood", ("Wood", "Hout"), ("Volume, boards or beams, screws, stain.", "Volume, planken of balken, schroeven, beits."), []),
    ("sheets", "🪵", "wood", None, None, ["new"]),
    ("roof", "🏠", "wood", ("Roof pitch", "Dakhelling"), ("Tiles, bitumen, EPDM or metal, battens.", "Pannen, bitumen, EPDM of metaal, latten."), []),
    ("stairs", "🪜", "wood", ("Stairs", "Trap"), ("Straight, L or U; treads, stringers, rail.", "Recht, kwart of half; treden, bomen, leuning."), []),
    ("fence", "🪵", "ground", ("Fence", "Schutting"), ("Posts, panels, gates, L & U corners.", "Palen, schermen, poorten, L- en U-hoeken."), []),
    ("excavation", "🚜", "ground", None, None, ["new"]),
    ("tank", "💧", "ground", None, None, ["new"]),
    ("cost", "💶", "money", ("Cost estimator", "Kostenraming"), ("Line items, discount, VAT, total.", "Regels, korting, btw, totaal."), []),
    ("converter", "🔁", "tools", None, None, ["free", "new"]),
]
APP_TOOLS = [
    ("level", ("Spirit level", "Waterpas"), ("Bubble and edge level with calibration.", "Bel- en randwaterpas met kalibratie.")),
    ("ruler", ("On-screen ruler", "Liniaal op je scherm"), ("cm or inch, calibrate with a bank card.", "cm of inch, kalibreren met een bankpas.")),
]
TAG_TXT = {"free": ("Free", "Gratis"), "new": ("New", "Nieuw"), "credit": ("3× free", "3× gratis"), "app": ("In the app", "In de app")}


# ---------------------------------------------------------------- page chrome

def chrome_top(lang, slug, title, desc):
    tpl = read(("nl/" if lang == "nl" else "") + "calculators/tiles/index.html")
    top = tpl[:tpl.index('<section class="section" style="padding-top:40px;">')]
    old_title = "Tegel calculator" if lang == "nl" else "Tile calculator"
    old_desc = re.search(r'<meta name="description" content="([^"]*)">', top).group(1)
    top = top.replace("/calculators/tiles/", f"/calculators/{slug}/")
    top = top.replace(old_desc, esc(desc).replace('"', "&quot;"))
    top = top.replace(old_title, title)
    return top


def chrome_bottom(lang, scripts):
    tpl = read(("nl/" if lang == "nl" else "") + "calculators/tiles/index.html")
    a = tpl.index('<section class="install-strip">')
    b = tpl.index('<script src="/assets/js/main.js"></script>')
    return tpl[a:b] + '<script src="/assets/js/main.js"></script>\n' + "".join(
        f'<script src="{s}"></script>\n' for s in scripts) + "</body>\n</html>"


def calc_block(lang, form_html, hero, note, monetised):
    btn = f'\n        <button type="button" id="calcBtn" class="calc-btn" data-action="calc">{L(CALC_BTN, lang)}</button>' if monetised else ""
    lock = "" if monetised else ' data-no-lock="true"'
    return f'''<div class="calc-shell">
      <form class="calc-form" novalidate>
        {form_html}{btn}
      </form>
      <aside class="calc-result"{lock}>
        <h3>{L(RESULT, lang)}</h3>
        <div class="result-hero"><div class="label" id="heroLabel">{hero}</div><div><span class="value" id="heroValue">&ndash;</span></div></div>
        <div class="result-rows" id="resultRows"></div>
        <div class="calc-note">{note}</div>
      </aside>
    </div>'''


def table_html(head, rows):
    th = "".join(f"<th>{esc(h)}</th>" for h in head) if head else ""
    trs = "".join(f"\n      <tr><td>{esc(a)}</td><td>{esc(b)}</td></tr>" for a, b in rows)
    return f'\n    <div class="table-wrap"><table>{"<tr>" + th + "</tr>" if th else ""}{trs}\n    </table></div>'


def extra_html(x):
    """Worked example and extra sections from calc_content.EXTRA."""
    if not x:
        return ""
    out = ""
    if "example" in x:
        title, intro, rows, outro = x["example"]
        out += f"\n    <h2>{esc(title)}</h2>\n    <p>{esc(intro)}</p>{table_html(None, rows)}\n    <p>{esc(outro)}</p>"
    for i, (title, paras) in enumerate(x.get("more", [])):
        out += f"\n    <h2>{esc(title)}</h2>" + "".join(f"\n    <p>{esc(p)}</p>" for p in paras)
        if i == 0 and "table" in x:
            a, b, rows = x["table"]
            out += table_html((a, b), rows)
    return out


def guide_block(t, x=None):
    faqs = list(t["faq"]) + list((x or {}).get("faq", []))
    faq = "".join(f'\n    <div class="faq-item">\n      <h3>{esc(q)}</h3>\n      <p>{esc(a)}</p>\n    </div>' for q, a in faqs)
    ld = json.dumps({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faqs]},
        ensure_ascii=False)
    paras = "".join(f"\n    <p>{esc(p)}</p>" for p in t["guide"])
    faqh = "Veelgestelde vragen" if t["how"].startswith("Zo") else "Frequently asked questions"
    return f'''<section class="section calc-guide">
  <div class="container calc-guide-inner">
    <h2>{esc(t["how"])}</h2>{paras}
    <p class="calc-guide-tip">{esc(t["tip"])}</p>{extra_html(x)}
    <h2>{faqh}</h2>{faq}
    <script type="application/ld+json">{ld}</script>
  </div>
</section>'''


def build_new(spec):
    for lang in LANGS:
        t = spec[lang]
        top = chrome_top(lang, spec["slug"], t["title"], t["desc"])
        body = f'''<section class="section" style="padding-top:40px;">
  <div class="container">
    <h1>{esc(t["title"])}</h1>
    <p class="lede" style="margin-bottom:32px;">{esc(t["lede"])}</p>
    {calc_block(lang, spec["form"](lang), esc(t["hero"]), esc(t["note"]), not spec["free"])}
  </div>
</section>

{guide_block(t, EXTRA.get(spec["slug"], {}).get(lang))}

'''
        scripts = ["/assets/js/calculators/_helpers.js", f"/assets/js/calculators/{spec['js']}.js"]
        write(f"{'nl/' if lang == 'nl' else ''}calculators/{spec['slug']}/index.html",
              top + body + chrome_bottom(lang, scripts))
    print("new", spec["slug"])


def build_upgrade(spec):
    for lang in LANGS:
        path = f"{'nl/' if lang == 'nl' else ''}calculators/{spec['slug']}/index.html"
        page = read(path)
        page = re.sub(r'<p class="lede" style="margin-bottom:32px;">.*?</p>',
                      f'<p class="lede" style="margin-bottom:32px;">{esc(L(spec["lede"], lang))}</p>', page, count=1, flags=re.S)
        note = re.search(r'<div class="calc-note">(.*?)</div>', page, flags=re.S)
        note = note.group(1) if note else ""
        a = page.index('<div class="calc-shell">')
        b = page.index("</aside>", a) + len("</aside>")
        b = page.index("</div>", b) + len("</div>")
        page = page[:a] + calc_block(lang, spec["form"](lang), esc(L(spec["hero"], lang)), note, False) + page[b:]
        write(path, page)
    print("upgraded", spec["slug"])


def tile(lang, slug, icon, title, desc, tags, href=None, group=""):
    href = href or f"{prefix(lang)}/calculators/{slug}/"
    tg = "".join(f'<span class="tag {k}">{L(TAG_TXT[k], lang)}</span>' for k in tags)
    keys = esc((title + " " + desc).lower())
    return (f'<a href="{href}" class="calc-mini" data-k="{keys}"><span class="ci g-{group}">{svg(icon)}</span>'
            f'<span class="ct">{esc(title)}</span><span class="cd">{esc(desc)}</span>'
            f'<span class="tags">{tg}</span></a>')


def build_index():
    new_by_slug = {s["slug"]: s for s in NEW}
    up_by_slug = {s["slug"]: s for s in UPGRADE}
    count = sum(1 for c in CATALOG if c[2] != "tools")
    for lang in LANGS:
        path = f"{'nl/' if lang == 'nl' else ''}calculators/index.html"
        page = read(path)
        groups = []
        for gid, gname in GROUPS:
            tiles = []
            for slug, icon, group, title, desc, tags in CATALOG:
                if group != gid:
                    continue
                if slug in new_by_slug:
                    t = new_by_slug[slug][lang]
                    title_s, desc_s = t["nav"], t["card"]
                else:
                    title_s = L(title, lang)
                    desc_s = L(up_by_slug[slug]["card"], lang) if slug in up_by_slug else L(desc, lang)
                tg = list(tags)
                if "free" not in tg:
                    tg.insert(0, "credit")
                tiles.append(tile(lang, slug, slug, title_s, desc_s, tg, group=group))
            if gid == "tools":
                for icon, title, desc in APP_TOOLS:
                    tiles.append(tile(lang, "", icon, L(title, lang), L(desc, lang), ["app", "new"], href=PLAY, group="tools"))
            groups.append(f'<div class="calc-group"><h2>{L(gname, lang)}</h2><div class="calc-grid">{"".join(tiles)}</div></div>')
        if lang == "nl":
            head = f'''<div class="section-head">
      <span class="eyebrow">Zelfde engine als de app</span>
      <h1>{count} bouwcalculators</h1>
      <p class="lede">Browserversies van de BuildExact calculators, met dezelfde formules als de app. Plus gratis eenheden omrekenen. <a href="{PLAY}">Installeer de app</a> voor opslaan in projecten, PDF-offertes, de waterpas en de liniaal.</p>
    </div>
    <div class="calc-search"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input type="search" id="calcSearch" placeholder="Zoek een calculator, bijv. beton, stuc, tank…" aria-label="Zoek een calculator"></div>'''
            foot = f'<p class="calc-empty" id="calcEmpty">Geen calculator gevonden.</p>\n    <p class="muted" style="margin-top:20px;text-align:center;font-size:.88rem;">Elke calculator kun je 3 keer gratis gebruiken, zonder inloggen; de gratis calculators zelfs onbeperkt. Daarna kost een berekening 1 credit: log in voor 5 gratis credits, daarna 50 credits voor € 2,99 — <a href="/nl/credits/">bekijk prijzen</a>. Liever onbeperkt? <a href="{PLAY}">Installeer de app</a>.</p>'
        else:
            head = f'''<div class="section-head">
      <span class="eyebrow">Same engine as the app</span>
      <h1>{count} construction calculators</h1>
      <p class="lede">Browser versions of the BuildExact calculators, with the same formulas as the app. Plus a free unit converter. <a href="{PLAY}">Install the app</a> for saving to projects, PDF quotes, the spirit level and the ruler.</p>
    </div>
    <div class="calc-search"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input type="search" id="calcSearch" placeholder="Search a calculator, e.g. concrete, plaster, tank…" aria-label="Search a calculator"></div>'''
            foot = f'<p class="calc-empty" id="calcEmpty">No calculator found.</p>\n    <p class="muted" style="margin-top:20px;text-align:center;font-size:.88rem;">Every calculator can be used 3 times for free without logging in, and the free ones without limit. After that a calculation costs 1 credit: log in for 5 free credits, then 50 credits for € 2.99 — <a href="/credits/">see pricing</a>. Prefer unlimited? <a href="{PLAY}">Install the app</a>.</p>'
        search_js = '''<script>
(function () {
  var input = document.getElementById('calcSearch');
  if (!input) return;
  input.addEventListener('input', function () {
    var q = input.value.trim().toLowerCase(), any = false;
    document.querySelectorAll('.calc-group').forEach(function (g) {
      var shown = 0;
      g.querySelectorAll('.calc-mini').forEach(function (a) {
        var hit = !q || a.dataset.k.indexOf(q) !== -1;
        a.style.display = hit ? '' : 'none';
        if (hit) shown++;
      });
      g.style.display = shown ? '' : 'none';
      if (shown) any = true;
    });
    document.getElementById('calcEmpty').style.display = any ? 'none' : 'block';
  });
})();
</script>'''
        # Drop the search script(s) of earlier runs; one copy is added below.
        page = re.sub(r"<script>\s*\(function \(\) \{\s*var input = document\.getElementById\('calcSearch'\);.*?</script>\n?",
                      "", page, flags=re.S)
        a = page.index('<section class="section">')
        b = page.index("</section>", a) + len("</section>")
        section_html = f'''<section class="section">
  <div class="container">
    {head}
    {"".join(groups)}
    {foot}
  </div>
</section>
{search_js}'''
        page = page[:a] + section_html + page[b:]
        page = re.sub(r"<title>[^<]*</title>", f"<title>{count} {'bouwcalculators' if lang == 'nl' else 'construction calculators'} | BuildExact</title>", page)
        write(path, page)
    print("index", count)


def update_sitemap():
    path = "sitemap.xml"
    sm = read(path)
    added = 0
    for spec in NEW:
        for lang in LANGS:
            url = f"{SITE}{prefix(lang)}/calculators/{spec['slug']}/"
            if f"<loc>{url}</loc>" in sm:
                continue
            sm = sm.replace("</urlset>", f"  <url><loc>{url}</loc><priority>0.8</priority></url>\n</urlset>")
            added += 1
    write(path, sm)
    print("sitemap +", added)


def update_home_icons():
    """The hand-written home pages show a selection of tiles: same icons."""
    groups = {c[0]: c[2] for c in CATALOG}
    for path in ("index.html", "nl/index.html"):
        page = read(path)
        page, n = re.subn(
            r'(<a href="(?:/nl)?/calculators/([a-z-]+)/" class="calc-mini">)<span class="ci[^"]*">.*?</span>',
            lambda m: f'{m.group(1)}<span class="ci g-{groups[m.group(2)]}">{svg(m.group(2))}</span>', page, flags=re.S)
        write(path, page)
        print("home icons", path, n)


if __name__ == "__main__":
    for s in NEW:
        build_new(s)
    for s in UPGRADE:
        build_upgrade(s)
    build_index()
    update_home_icons()
    update_sitemap()
    import seo
    seo.apply_all()
