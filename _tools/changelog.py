"""App changelog for the Updates page (/updates/ and /nl/updates/).

Newest release first. For a new app version: add an entry at the top and run
    python -I _tools/build_updates.py
`date` is shown as written (leave it "" when unknown).
Each item is (title, text); keep the text to one or two sentences.
"""

RELEASES = [
    dict(version="2.2.6", date_en="November 2026", date_nl="november 2026",
         en=dict(title="New tools in your pocket", items=[
             ("Spirit level", "A bubble level when the phone lies flat and an edge level when it stands on its side. Turns green and vibrates when level; calibrate with one tap."),
             ("Ruler on your screen", "Measure small parts in cm or inches along the edge of your phone. Calibrate it once with a bank card."),
             ("Unit converter", "Length, area, volume, weight and slope (degrees, % and 1:x) with the rise per metre."),
             ("7 new calculators", "Plastering, excavation, round column & concrete pipe, sheet material, steel weight, tank volume and roll flooring."),
             ("Search bar", "Type \"concrete\", \"plaster\" or \"level\" to find any calculator in a second."),
             ("Quote & invoice styles", "Choose the look of your PDFs in My business: Classic for free, or Graphite, Burgundy, Teal or Orange with PRO."),
         ]),
         nl=dict(title="Nieuw gereedschap op zak", items=[
             ("Waterpas", "Een belwaterpas als je telefoon plat ligt en een randwaterpas als hij op zijn kant staat. Wordt groen en trilt als hij waterpas staat; kalibreren met één tik."),
             ("Liniaal op je scherm", "Meet kleine onderdelen in cm of inch langs de rand van je telefoon. Eén keer kalibreren met een bankpas."),
             ("Eenheden omrekenen", "Lengte, oppervlakte, volume, gewicht en helling (graden, % en 1:x) met de stijging per meter."),
             ("7 nieuwe calculators", "Stucwerk, grondwerk, ronde kolom & betonbuis, plaatmateriaal, staalgewicht, tankinhoud en vloerbedekking van de rol."),
             ("Zoekbalk", "Typ \"beton\", \"stuc\" of \"waterpas\" en je vindt elke calculator meteen."),
             ("Stijlen voor offerte & factuur", "Kies de stijl van je PDF's in Mijn bedrijf: Klassiek gratis, of Grafiet, Bordeaux, Petrol of Oranje met PRO."),
         ])),
    dict(version="2.2.5", date_en="October 2026", date_nl="oktober 2026",
         en=dict(title="Save every calculation", items=[
             ("Save to a project", "Tap Save under any result — tiles, stairs, paving, bricks and more — and keep it in a project."),
             ("All calculators in projects", "Add measurement now lists every calculator under \"More calculators\"."),
             ("Try PRO calculators for free", "Every PRO calculator can be used 3 times for free."),
             ("Always start at home", "The app now always opens on the home screen."),
         ]),
         nl=dict(title="Elke berekening bewaren", items=[
             ("Opslaan in een project", "Tik op Opslaan onder elk resultaat — tegels, trap, bestrating, bakstenen en meer — en bewaar het in een project."),
             ("Alle calculators in projecten", "Meting toevoegen toont nu elke calculator onder \"Meer calculators\"."),
             ("PRO-calculators gratis proberen", "Elke PRO-calculator kun je 3 keer gratis gebruiken."),
             ("Altijd naar het startscherm", "De app opent nu altijd op het startscherm."),
         ])),
    dict(version="2.2.4", date_en="October 2026", date_nl="oktober 2026",
         en=dict(title="Faster and more polished", items=[
             ("Faster start", "The app opens straight away, also on a slow connection. Updates ask before restarting, so you never lose a half-typed quote."),
             ("Better dark mode", "Headers, settings and status labels are clearly readable in dark mode."),
             ("Right words, right numbers", "English quotes and invoices use pcs and h, every calculator uses your decimal sign and the stair length is shown correctly."),
         ]),
         nl=dict(title="Sneller en verfijnder", items=[
             ("Snellere start", "De app opent direct, ook bij traag internet. Updates vragen eerst of ze mogen herstarten, zodat je nooit een halve offerte kwijtraakt."),
             ("Betere donkere modus", "Koppen, instellingen en statuslabels zijn in de donkere modus goed leesbaar."),
             ("Juiste woorden en getallen", "Calculators gebruiken overal een komma, datums staan in het Nederlands en de traplengte wordt correct getoond."),
         ])),
    dict(version="2.2.3", date_en="", date_nl="",
         en=dict(title="Sharper quotes & invoices", items=[
             ("Euro sign in every PDF", "Quotes, invoices and project reports show € and dashes correctly on every device."),
             ("Numbers in your language", "English uses 1,234.50 and Dutch 1.234,50 everywhere in the app. Tiles and boxes are always rounded up to whole pieces."),
             ("Share your fence result", "The Share button in the fence calculator creates a neat result card for WhatsApp or as text."),
         ]),
         nl=dict(title="Strakkere offertes & facturen", items=[
             ("Euroteken in elke PDF", "Offertes, facturen en projectrapporten tonen het €-teken en streepjes overal correct."),
             ("Getallen in jouw taal", "Nederlands toont 1.234,50 en Engels 1,234.50, overal in de app. Tegels en dozen worden altijd naar boven afgerond."),
             ("Schuttingresultaat delen", "De Delen-knop bij de schutting maakt een nette resultaatkaart voor WhatsApp of als tekst."),
         ])),
    dict(version="2.2.1", date_en="", date_nl="",
         en=dict(title="Drilling & sawing calculator", items=[
             ("Core-drill batches", "A row per diameter (52 to 250 mm) with depth, count and price per hole. Reinforced concrete adds 40% automatically."),
             ("Wall & floor sawing", "Price by cut length in €/metre, with the same reinforced-concrete uplift and time estimate."),
             ("Save as a project card", "Open it from a project and the drilling job lands on the project with its own card, totals and PDF line."),
         ]),
         nl=dict(title="Boor- en zaagwerk calculator", items=[
             ("Kernboringen per rij", "Een rij per diameter (52 tot 250 mm) met diepte, aantal en prijs per gat. Gewapend beton rekent automatisch 40% extra."),
             ("Wand- en vloerzagen", "Reken per zaaglengte in €/meter, met dezelfde opslag voor gewapend beton en tijdschatting."),
             ("Opslaan als projectkaart", "Open hem vanuit een project en het boorwerk komt als eigen kaart in het project, met totalen en PDF-regel."),
         ])),
    dict(version="2.2.0", date_en="", date_nl="",
         en=dict(title="My Day, Pro & DIY modes", items=[
             ("My Day dashboard", "This week's earnings with the trend against last week, a bar per weekday and a list of overdue invoices and quotes without reply."),
             ("Pro mode or DIY mode", "Pros get the full business suite; DIY users get a clean screen with calculators and shopping lists. Switch any time in Settings."),
             ("Fence: 2 equal end panels", "A new switch per fence line puts an end panel of equal width at both ends, for the symmetric back line of a U-shape."),
             ("Lengths in metres", "Fence lines and staircase height accept metres (type 8.70 instead of 870); small sizes stay in cm."),
         ]),
         nl=dict(title="Mijn Dag, Pro- & DHZ-modus", items=[
             ("Mijn Dag", "Je omzet van deze week met de trend ten opzichte van vorige week, een balk per weekdag en een lijst met te late facturen en offertes zonder reactie."),
             ("Pro-modus of DHZ-modus", "Vakmensen krijgen de volledige zakelijke app; klussers een rustig scherm met calculators en boodschappenlijsten. Wissel wanneer je wilt in Instellingen."),
             ("Schutting: 2 gelijke pasvakken", "Een nieuwe schakelaar per schuttinglijn zet aan beide kanten een even breed pasvak, voor de symmetrische achterlijn van een U-vorm."),
             ("Lengtes in meters", "Schuttinglijnen en traphoogte accepteren meters (typ 8,70 in plaats van 870); kleine maten blijven in cm."),
         ])),
]
