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
    {
        "date": "2026-11-14",
        "minutes": 6,
        "en": {
            "slug": "how-many-fence-posts-and-panels-do-i-need",
            "title": "How Many Fence Posts and Panels?",
            "h1": "How Many Fence Posts and Panels Do I Need? Count Your Fence Exactly",
            "desc": "Work out fence posts, panels and the end panel from the length of your fence, with corners and gates, and a worked example for a 12 m fence.",
            "badge": "🏗️ Calculations",
            "card_badge": "Fences",
            "card_text": "Posts, panels and the cut end panel from the length of your fence.",
            "intro": "Dividing the length of your fence by the panel width gives you the wrong answer. The posts take up room too, the last panel almost never fits and every corner and gate changes the count. Here is how to get it right before you order.",
            "body": """
<h2>Why length ÷ panel width is wrong</h2>
<p>A 12 m fence with 180 cm panels looks like 12 ÷ 1.8 = 6.7 panels. But between every two panels there is a post, and with 10 cm posts those add up to almost a metre over that length. Forget them and you end up with a gap at the end, or with one panel too many.</p>

<h2>The formula for a straight fence</h2>
<p>For a straight run with a post at both ends, each panel needs its own width plus one post:</p>
<ul>
  <li><strong>Panels</strong> = (length − post width) ÷ (panel width + post width), rounded <strong>up</strong></li>
  <li><strong>Posts</strong> = panels + 1</li>
</ul>
<p>The last panel is usually shorter: you cut a full panel to size. That cut piece is called the <strong>end panel</strong>.</p>

<h2>Worked example: 12 m fence</h2>
<div class="table-wrap"><table>
  <tr><th>Input</th><th>Value</th></tr>
  <tr><td>Fence length</td><td>12.00 m</td></tr>
  <tr><td>Panel width</td><td>180 cm</td></tr>
  <tr><td>Post width</td><td>10 cm</td></tr>
</table></div>
<ol>
  <li>(1200 − 10) ÷ (180 + 10) = 6.26, so <strong>7 panels</strong>: 6 full ones and 1 end panel.</li>
  <li>Posts: 7 + 1 = <strong>8 posts</strong>.</li>
  <li>End panel: 1200 − 6 × 180 − 8 × 10 = <strong>40 cm</strong>.</li>
</ol>
<p>Check: 6 × 180 + 40 + 8 × 10 = 1200 cm. It fits exactly.</p>

<div class="tip"><h3>💡 Two equal end panels look better</h3><p>A 40 cm piece at one end catches the eye. You can also split the leftover over both ends. For the same 12 m that gives 5 full panels and two end panels of 110 cm, still with 8 posts. Many people find that tidier, especially along a back line that everyone sees.</p></div>

<h2>Corners and gates</h2>
<ul>
  <li><strong>Corners:</strong> measure every straight line separately. A corner post belongs to both lines, so count it once. An L-shape is 2 lines with 1 corner, a U-shape 3 lines with 2 corners.</li>
  <li><strong>Gates:</strong> a gate takes up its own width plus the beams or frame on both sides. It needs a post on each side. These are often heavier, or posts without a groove for panels.</li>
  <li><strong>Very small gaps:</strong> an end panel of just a few centimetres is not worth cutting. Move a post or use slightly wider panels instead.</li>
</ul>

<h2>How long should the posts be?</h2>
<p>Put at least 60 cm of the post in the ground, and more in soft soil or in a spot that catches a lot of wind. For a 180 cm high fence that means posts of 240 to 270 cm. In concrete, dig a hole about 25 × 25 cm. Work out the volume of the hole, subtract the post, and check on the bag how many litres a bag of postmix or concrete makes.</p>

<h2>Calculate it in seconds</h2>
<p>The <a href="/calculators/fence/">fence calculator</a> does all of the above for you. Enter the length of each line, the number of corners and your gates, and you get the posts, panels and end panel width. You can try it free online, without logging in.</p>
<p>In the BuildExact app you find it under <strong>Instant calculations</strong> &rarr; <strong>Fence</strong>. Share the result as a card via WhatsApp, or save it to a project and turn it into a quote.</p>

<h2>Summary</h2>
<p>Count each panel together with one post, round up, add one post for the end and cut the last panel to size. Measure each line separately, count corner posts once and give gates their own posts. That way you order exactly what you need.</p>
""",
        },
        "nl": {
            "slug": "schutting-berekenen-hoeveel-palen-en-schermen",
            "title": "Schutting berekenen: palen en schermen",
            "h1": "Schutting berekenen: hoeveel palen en schermen heb je nodig?",
            "desc": "Reken uit hoeveel palen, schermen en welk pasvak je nodig hebt voor je schutting, met hoeken en poorten en een rekenvoorbeeld voor 12 meter.",
            "badge": "🏗️ Berekeningen",
            "card_badge": "Schutting",
            "card_text": "Palen, schermen en het pasvak uit de lengte van je schutting.",
            "intro": "De lengte van je schutting delen door de breedte van een scherm geeft het verkeerde antwoord. De palen nemen ook ruimte in, het laatste scherm past bijna nooit precies en elke hoek en poort verandert de telling. Zo reken je het goed uit voordat je bestelt.",
            "body": """
<h2>Waarom lengte ÷ schermbreedte niet klopt</h2>
<p>Een schutting van 12 meter met schermen van 180 cm lijkt 12 ÷ 1,8 = 6,7 schermen. Maar tussen elke twee schermen staat een paal, en met palen van 10 cm tikt dat over die lengte op tot bijna een meter. Vergeet je ze, dan hou je aan het eind een gat over of heb je een scherm te veel.</p>

<h2>De formule voor een rechte schutting</h2>
<p>Voor een rechte lijn met aan beide kanten een paal neemt elk scherm zijn eigen breedte plus één paal in beslag:</p>
<ul>
  <li><strong>Schermen</strong> = (lengte − paalbreedte) ÷ (schermbreedte + paalbreedte), naar <strong>boven</strong> afgerond</li>
  <li><strong>Palen</strong> = schermen + 1</li>
</ul>
<p>Het laatste scherm is meestal korter: dat zaag je op maat uit een heel scherm. Dat stuk heet het <strong>pasvak</strong>.</p>

<h2>Rekenvoorbeeld: schutting van 12 meter</h2>
<div class="table-wrap"><table>
  <tr><th>Invoer</th><th>Waarde</th></tr>
  <tr><td>Lengte schutting</td><td>12,00 m</td></tr>
  <tr><td>Schermbreedte</td><td>180 cm</td></tr>
  <tr><td>Paalbreedte</td><td>10 cm</td></tr>
</table></div>
<ol>
  <li>(1200 − 10) ÷ (180 + 10) = 6,26, dus <strong>7 schermen</strong>: 6 hele en 1 pasvak.</li>
  <li>Palen: 7 + 1 = <strong>8 palen</strong>.</li>
  <li>Pasvak: 1200 − 6 × 180 − 8 × 10 = <strong>40 cm</strong>.</li>
</ol>
<p>Controle: 6 × 180 + 40 + 8 × 10 = 1200 cm. Het past precies.</p>

<div class="tip"><h3>💡 Twee gelijke pasvakken staan mooier</h3><p>Een stukje van 40 cm aan één kant valt op. Je kunt de rest ook over beide uiteinden verdelen. Voor dezelfde 12 meter geeft dat 5 hele schermen en twee pasvakken van 110 cm, nog steeds met 8 palen. Veel mensen vinden dat rustiger, zeker langs een achterlijn waar iedereen tegenaan kijkt.</p></div>

<h2>Hoeken en poorten</h2>
<ul>
  <li><strong>Hoeken:</strong> meet elke rechte lijn apart. Een hoekpaal hoort bij twee lijnen, dus tel je hem maar één keer. Een L-vorm is 2 lijnen met 1 hoek, een U-vorm 3 lijnen met 2 hoeken.</li>
  <li><strong>Poorten:</strong> een poort neemt zijn eigen breedte in plus de balken of het frame aan beide kanten. Aan elke kant komt een paal, vaak een zwaardere of een eindpaal zonder sponning.</li>
  <li><strong>Heel kleine restjes:</strong> een pasvak van een paar centimeter is het zagen niet waard. Verschuif dan liever een paal of kies iets bredere schermen.</li>
</ul>

<h2>Hoe lang moeten de palen zijn?</h2>
<p>Zet minstens 60 cm van de paal in de grond, en meer in slappe grond of op een plek waar veel wind staat. Voor een schutting van 180 cm hoog kom je dan op palen van 240 tot 270 cm. Zet je ze in beton, graaf dan een gat van ongeveer 25 × 25 cm. Reken de inhoud van het gat uit, trek de paal eraf en kijk op de zak hoeveel liter een zak snelbeton of beton oplevert.</p>

<h2>In een paar seconden uitgerekend</h2>
<p>De <a href="/nl/calculators/fence/">schuttingcalculator</a> doet dit allemaal voor je. Vul de lengte van elke lijn in, het aantal hoeken en je poorten, en je krijgt de palen, schermen en de breedte van het pasvak. Je kunt hem gratis online proberen, zonder in te loggen.</p>
<p>In de BuildExact-app vind je hem onder <strong>Direct berekenen</strong> &rarr; <strong>Schutting</strong>. Deel de uitkomst als kaartje via WhatsApp, of bewaar hem in een project en maak er een offerte van.</p>

<h2>Samenvatting</h2>
<p>Tel elk scherm samen met één paal, rond naar boven af, tel één paal extra voor het eind en zaag het laatste scherm op maat. Meet elke lijn apart, tel hoekpalen één keer en geef poorten hun eigen palen. Zo bestel je precies wat je nodig hebt.</p>
""",
        },
    },
    {
        "date": "2026-11-14",
        "minutes": 6,
        "en": {
            "slug": "how-many-bricks-per-m2",
            "title": "How Many Bricks per m²?",
            "h1": "How Many Bricks per m² Do I Need? Bricks and Mortar for Your Wall",
            "desc": "How many bricks per m² for common brick sizes, how to work it out for any brick, and how much mortar, waste, lintels and wall ties to add.",
            "badge": "🏗️ Calculations",
            "card_badge": "Masonry",
            "card_text": "Bricks per m² for common sizes, plus mortar, waste and lintels.",
            "intro": "Order too few bricks and you wait for a second delivery that may not match the colour of the first. Order too many and you are left with pallets in the garden. With the size of your brick and the joint width you can work out exactly how many you need per m².",
            "body": """
<h2>The formula</h2>
<p>Every brick takes up its own size <strong>plus one joint</strong> in length and in height. For a single-leaf wall, one brick thick:</p>
<p><strong>Bricks per m² = 1 ÷ ((length + joint) × (height + joint))</strong>, with all sizes in metres.</p>
<p>Example for a 215 × 102.5 × 65 mm brick with 10 mm joints: 1 ÷ (0.225 × 0.075) = 59.3 bricks per m². That is why you often hear "60 bricks per m²".</p>

<h2>Bricks per m² for common sizes</h2>
<div class="table-wrap"><table>
  <tr><th>Brick size (mm)</th><th>10 mm joint</th><th>12 mm joint</th></tr>
  <tr><td>210 × 100 × 50</td><td>76</td><td>73</td></tr>
  <tr><td>210 × 100 × 65</td><td>61</td><td>59</td></tr>
  <tr><td>215 × 102.5 × 65</td><td>59</td><td>57</td></tr>
  <tr><td>240 × 115 × 71</td><td>49</td><td>48</td></tr>
</table></div>
<p>These numbers are for a wall one brick thick (a half-brick wall), without waste. A wall two bricks thick needs about twice as many.</p>

<h2>Step by step for your wall</h2>
<ol>
  <li><strong>Measure the wall:</strong> length × height = gross area.</li>
  <li><strong>Subtract openings:</strong> width × height of every window and door.</li>
  <li><strong>Multiply</strong> the net area by the bricks per m² for your brick.</li>
  <li><strong>Add waste:</strong> 5% for straightforward work, up to 10% with lots of cutting or reclaimed bricks.</li>
</ol>

<h2>Worked example</h2>
<p>A wall of 6.0 × 2.5 m with a window of 1.2 × 1.0 m and a door of 0.9 × 2.1 m, built with 215 × 102.5 × 65 bricks:</p>
<ul>
  <li>Gross: 6.0 × 2.5 = 15.00 m²</li>
  <li>Openings: 1.20 + 1.89 = 3.09 m²</li>
  <li>Net: 15.00 − 3.09 = 11.91 m²</li>
  <li>Bricks: 11.91 × 60 = 715, plus 5% waste = <strong>751 bricks</strong></li>
</ul>

<h2>How much mortar?</h2>
<p>For a half-brick wall the joints come to about 18 to 20 litres of mortar per m². In dry mix that is roughly 30 to 40 kg per m², depending on the brick, the joints and how much you lose. The <a href="/calculators/bricks/">brick calculator</a> starts at 35 kg per m², which you can change. For the example wall: 11.91 × 35 = 417 kg, or <strong>17 bags of 25 kg</strong>. The bag always says how much mortar it makes, so check it.</p>

<h2>Lintels and wall ties</h2>
<ul>
  <li><strong>Lintels:</strong> every opening needs one, longer than the opening so it rests on the brickwork on both sides. The calculator adds 20 cm per side. A 1.2 m window then needs a 1.6 m lintel.</li>
  <li><strong>Wall ties:</strong> in a cavity wall the two leaves are tied together. The number per m² depends on local rules and the engineer's spec, usually a few per m² plus extra around openings. The calculator starts at 5 per m².</li>
</ul>

<div class="tip"><h3>💡 Order from one batch</h3><p>Bricks from different production runs can differ slightly in colour. Order everything in one go, including the waste, and mix bricks from several pallets as you lay them.</p></div>

<h2>Calculate it in seconds</h2>
<p>With the <a href="/calculators/bricks/">brick calculator</a> you enter the wall, the openings and the bricks per m², and you get the bricks, mortar bags, lintels and wall ties. You can try it free online, without logging in. In the BuildExact app you find it under <strong>Instant calculations</strong> &rarr; <strong>Brick calculator</strong>.</p>

<h2>Summary</h2>
<p>Bricks per m² = 1 ÷ ((length + joint) × (height + joint)). For a 215 × 65 mm brick with 10 mm joints that is about 60 per m². Subtract openings, add 5 to 10% waste, count on about 35 kg of mortar per m² and give every opening a lintel that is 40 cm longer.</p>
""",
        },
        "nl": {
            "slug": "hoeveel-stenen-per-m2-metselwerk",
            "title": "Hoeveel stenen per m²?",
            "h1": "Hoeveel stenen per m² heb je nodig? Bakstenen en mortel voor je muur",
            "desc": "Hoeveel bakstenen per m² voor waalformaat en andere formaten, met de formule, een rekenvoorbeeld en hoeveel mortel, lateien en ankers erbij komen.",
            "badge": "🏗️ Berekeningen",
            "card_badge": "Metselwerk",
            "card_text": "Stenen per m² per formaat, plus mortel, snijverlies en lateien.",
            "intro": "Bestel je te weinig stenen, dan wacht je op een tweede levering die misschien net een andere kleur heeft. Bestel je te veel, dan staan er pallets in de tuin. Met het formaat van je steen en de voegbreedte reken je precies uit hoeveel je er per m² nodig hebt.",
            "body": """
<h2>De formule</h2>
<p>Elke steen neemt zijn eigen maat in <strong>plus één voeg</strong>, in de lengte en in de hoogte. Voor een halfsteens muur:</p>
<p><strong>Stenen per m² = 1 ÷ ((lengte + voeg) × (hoogte + voeg))</strong>, met alle maten in meters.</p>
<p>Voorbeeld voor waalformaat (210 × 100 × 50 mm) met een voeg van 12 mm: 1 ÷ (0,222 × 0,062) = 72,7 stenen per m². Daarom hoor je vaak "73 stenen per m²".</p>

<h2>Stenen per m² per formaat</h2>
<div class="table-wrap"><table>
  <tr><th>Formaat (mm)</th><th>Voeg 10 mm</th><th>Voeg 12 mm</th></tr>
  <tr><td>Waalformaat 210 × 100 × 50</td><td>76</td><td>73</td></tr>
  <tr><td>Waaldikformaat 210 × 100 × 65</td><td>61</td><td>59</td></tr>
  <tr><td>215 × 102,5 × 65</td><td>59</td><td>57</td></tr>
  <tr><td>240 × 115 × 71</td><td>49</td><td>48</td></tr>
</table></div>
<p>Deze aantallen gelden voor een halfsteens muur, zonder snijverlies. Een steens muur heeft ongeveer twee keer zoveel nodig.</p>

<h2>Stap voor stap voor je muur</h2>
<ol>
  <li><strong>Meet de muur:</strong> lengte × hoogte = bruto oppervlak.</li>
  <li><strong>Trek openingen af:</strong> breedte × hoogte van elk raam en elke deur.</li>
  <li><strong>Vermenigvuldig</strong> het netto oppervlak met het aantal stenen per m² van jouw steen.</li>
  <li><strong>Tel snijverlies op:</strong> 5% bij eenvoudig werk, tot 10% bij veel zaagwerk of gebruikte stenen.</li>
</ol>

<h2>Rekenvoorbeeld</h2>
<p>Een muur van 6,0 × 2,5 m met een raam van 1,2 × 1,0 m en een deur van 0,9 × 2,1 m, in waalformaat met een voeg van 12 mm:</p>
<ul>
  <li>Bruto: 6,0 × 2,5 = 15,00 m²</li>
  <li>Openingen: 1,20 + 1,89 = 3,09 m²</li>
  <li>Netto: 15,00 − 3,09 = 11,91 m²</li>
  <li>Stenen: 11,91 × 73 = 870, plus 5% snijverlies = <strong>913 stenen</strong></li>
</ul>

<h2>Hoeveel mortel?</h2>
<p>Bij een halfsteens muur zit er ongeveer 18 tot 20 liter mortel in de voegen per m². In droge mortel is dat ruwweg 30 tot 40 kg per m², afhankelijk van de steen, de voegen en wat je morst. De <a href="/nl/calculators/bricks/">stenencalculator</a> rekent standaard met 35 kg per m², en dat kun je aanpassen. Voor de voorbeeldmuur: 11,91 × 35 = 417 kg, oftewel <strong>17 zakken van 25 kg</strong>. Op de zak staat altijd hoeveel mortel hij oplevert, dus kijk dat even na.</p>

<h2>Lateien en spouwankers</h2>
<ul>
  <li><strong>Lateien:</strong> boven elke opening komt er een, langer dan de opening zelf, zodat hij aan beide kanten op het metselwerk rust. De calculator telt er 20 cm per kant bij op. Een raam van 1,2 m krijgt dan een latei van 1,6 m.</li>
  <li><strong>Spouwankers:</strong> bij een spouwmuur verbind je het binnen- en buitenblad. Hoeveel per m² hangt af van de regels en de opgave van de constructeur, meestal een paar per m² plus extra langs openingen. De calculator rekent standaard met 5 per m².</li>
</ul>

<div class="tip"><h3>💡 Bestel uit één partij</h3><p>Stenen uit verschillende productieruns kunnen net iets van kleur verschillen. Bestel alles in één keer, inclusief het snijverlies, en meng tijdens het metselen stenen van meerdere pallets.</p></div>

<h2>In een paar seconden uitgerekend</h2>
<p>In de <a href="/nl/calculators/bricks/">stenencalculator</a> vul je de muur, de openingen en het aantal stenen per m² in, en je krijgt de stenen, mortelzakken, lateien en spouwankers. Je kunt hem gratis online proberen, zonder in te loggen. In de BuildExact-app vind je hem onder <strong>Direct berekenen</strong> &rarr; <strong>Bakstenen</strong>.</p>

<h2>Samenvatting</h2>
<p>Stenen per m² = 1 ÷ ((lengte + voeg) × (hoogte + voeg)). Voor waalformaat met een voeg van 12 mm is dat ongeveer 73 per m². Trek openingen af, tel 5 tot 10% snijverlies op, reken op ongeveer 35 kg mortel per m² en geef elke opening een latei die 40 cm langer is.</p>
""",
        },
    },
    {
        "date": "2026-11-05",
        "minutes": 6,
        "en": {
            "slug": "digital-work-order-with-customer-signature",
            "title": "Digital Work Order with Signature",
            "h1": "Digital Work Order with Customer Signature: Get Every Job Signed Off on Site",
            "desc": "Why a signed work order saves you arguments about extra work and hours, what belongs on it, and how to make one on your phone in two minutes.",
            "badge": "📋 Work orders",
            "card_badge": "Work orders",
            "card_text": "What belongs on a work order and how to get it signed on your phone.",
            "intro": "The job is done, the client is happy, you drive off. Three weeks later the invoice arrives and suddenly nobody remembers the extra socket, the two hours of waiting for the delivery or the tiles you had to buy twice. A work order signed on the spot prevents exactly that conversation.",
            "body": """
<h2>What is a work order?</h2>
<p>A work order (also called a job sheet or service report) is a short record of what you did on a job: the work carried out, the hours, the materials used and, ideally, the client's signature. It is not a quote and not an invoice. It sits in between: the quote says what you <em>will</em> do, the work order says what you <em>did</em>, and the invoice asks to be paid for it.</p>

<h2>Why a signature makes the difference</h2>
<ul>
  <li><strong>Extra work is agreed in writing.</strong> "While you're here, can you also..." is the most common source of payment disputes. If it is on the signed work order, it was agreed.</li>
  <li><strong>Hours are no longer a discussion.</strong> The client saw and signed the hours on the day, not three weeks later on an invoice.</li>
  <li><strong>Faster payment.</strong> A client who signed off the work has already said yes to the content of your invoice.</li>
  <li><strong>Proof for yourself.</strong> Photos plus a signature show the state you left the job in, useful if a problem shows up months later.</li>
</ul>

<h2>What belongs on a work order</h2>
<div class="table-wrap"><table>
  <tr><th>Field</th><th>Why</th></tr>
  <tr><td>Project, client and date</td><td>So it is clear which job and which day it covers</td></tr>
  <tr><td>Work carried out</td><td>Short lines, one per task; include extra work separately</td></tr>
  <tr><td>Hours</td><td>Total per day, ideally from a timer rather than from memory</td></tr>
  <tr><td>Materials used</td><td>Quantities, so the invoice matches what went into the job</td></tr>
  <tr><td>Photos</td><td>Before and after, or anything that was hidden behind finishing</td></tr>
  <tr><td>Name and signature of the client</td><td>The actual sign-off</td></tr>
</table></div>

<div class="tip"><h3>💡 Paper works too, but...</h3><p>A paper job sheet gets wet, gets lost in the van and has to be typed into your invoice later. A digital work order is a PDF you can share straight away and keep with the project.</p></div>

<h2>How to do it in BuildExact</h2>
<figure><img src="/assets/blog/work-order-en.webp" alt="BuildExact work order with tracked hours and work carried out" width="280" loading="lazy"></figure>
<ol>
  <li><strong>Open the project</strong> and tap <strong>Work order &amp; hours</strong> at the top.</li>
  <li><strong>Check what is filled in.</strong> The work carried out and the materials come from the calculations in your project, and the hours from the project timer. Change anything you like.</li>
  <li><strong>Add photos</strong> of the finished work if you want them on the PDF.</li>
  <li><strong>Hand over your phone.</strong> The client types their name and signs on the screen with a finger.</li>
  <li><strong>Share the PDF</strong> via WhatsApp or email. With the <strong>Invoice</strong> button you turn the same job into an invoice, with the open hours as a labour line.</li>
</ol>
<p>Work orders are part of BuildExact PRO, a one-time purchase without a subscription.</p>

<h2>Summary</h2>
<p>A signed work order costs two minutes on site and saves you the discussion about extra work, hours and materials afterwards. Write down what you did, let the client sign, share the PDF and invoice from the same data.</p>
""",
        },
        "nl": {
            "slug": "digitale-werkbon-met-handtekening-klant",
            "title": "Digitale werkbon met handtekening",
            "h1": "Digitale werkbon met handtekening van de klant: elke klus afgetekend op locatie",
            "desc": "Waarom een getekende werkbon discussies over meerwerk en uren voorkomt, wat erop moet en hoe je hem in twee minuten op je telefoon maakt.",
            "badge": "📋 Werkbonnen",
            "card_badge": "Werkbon",
            "card_text": "Wat er op een werkbon hoort en hoe de klant hem op je telefoon tekent.",
            "intro": "De klus is klaar, de klant is tevreden, je rijdt weg. Drie weken later komt de factuur en weet niemand meer van dat extra stopcontact, de twee uur wachten op de levering of de tegels die opnieuw moesten. Een werkbon die ter plekke getekend is, voorkomt precies dat gesprek.",
            "body": """
<h2>Wat is een werkbon?</h2>
<p>Een werkbon is een kort verslag van wat je op een klus hebt gedaan: het uitgevoerde werk, de uren, het gebruikte materiaal en het liefst de handtekening van de klant. Het is geen offerte en geen factuur, maar zit ertussen: de offerte zegt wat je <em>gaat</em> doen, de werkbon wat je <em>gedaan hebt</em>, en de factuur vraagt om betaling.</p>

<h2>Waarom die handtekening het verschil maakt</h2>
<ul>
  <li><strong>Meerwerk staat zwart op wit.</strong> "Als je toch bezig bent, kun je ook..." is de bekendste bron van betalingsgedoe. Staat het op de getekende werkbon, dan is het afgesproken.</li>
  <li><strong>Uren zijn geen discussie meer.</strong> De klant heeft de uren op de dag zelf gezien en getekend, niet drie weken later op een factuur.</li>
  <li><strong>Sneller betaald.</strong> Een klant die het werk heeft afgetekend, heeft al ja gezegd tegen de inhoud van je factuur.</li>
  <li><strong>Bewijs voor jezelf.</strong> Foto's plus een handtekening laten zien hoe je de klus hebt achtergelaten. Handig als er maanden later iets opduikt.</li>
</ul>

<h2>Wat hoort er op een werkbon</h2>
<div class="table-wrap"><table>
  <tr><th>Onderdeel</th><th>Waarom</th></tr>
  <tr><td>Project, klant en datum</td><td>Zodat duidelijk is om welke klus en welke dag het gaat</td></tr>
  <tr><td>Uitgevoerd werk</td><td>Korte regels, één per taak; meerwerk apart vermelden</td></tr>
  <tr><td>Uren</td><td>Totaal per dag, liefst uit een timer en niet uit je hoofd</td></tr>
  <tr><td>Gebruikt materiaal</td><td>Aantallen, zodat de factuur klopt met wat er in de klus zit</td></tr>
  <tr><td>Foto's</td><td>Voor en na, of wat achter de afwerking verdwijnt</td></tr>
  <tr><td>Naam en handtekening klant</td><td>De eigenlijke aftekening</td></tr>
</table></div>

<div class="tip"><h3>💡 Papier kan ook, maar...</h3><p>Een papieren werkbon wordt nat, raakt kwijt in de bus en moet je later overtypen in je factuur. Een digitale werkbon is een PDF die je meteen deelt en die bij het project bewaard blijft.</p></div>

<h2>Zo doe je het in BuildExact</h2>
<figure><img src="/assets/blog/work-order-nl.webp" alt="BuildExact werkbon met geregistreerde uren en uitgevoerd werk" width="280" loading="lazy"></figure>
<ol>
  <li><strong>Open het project</strong> en tik bovenaan op <strong>Werkbon &amp; uren</strong>.</li>
  <li><strong>Controleer wat er al staat.</strong> Het uitgevoerde werk en het materiaal komen uit de berekeningen in je project, de uren uit de projecttimer. Pas aan wat je wilt.</li>
  <li><strong>Voeg foto's toe</strong> van het opgeleverde werk als je die op de PDF wilt.</li>
  <li><strong>Geef je telefoon aan de klant.</strong> Die vult de naam in en tekent met een vinger op het scherm.</li>
  <li><strong>Deel de PDF</strong> via WhatsApp of e-mail. Met de knop <strong>Factuur</strong> maak je van dezelfde klus een factuur, met de open uren als arbeidsregel.</li>
</ol>
<p>Werkbonnen horen bij BuildExact PRO: eenmalig betalen, geen abonnement.</p>

<h2>Samenvatting</h2>
<p>Een getekende werkbon kost je twee minuten op de bouw en bespaart je achteraf de discussie over meerwerk, uren en materiaal. Schrijf op wat je gedaan hebt, laat de klant tekenen, deel de PDF en factureer vanuit dezelfde gegevens.</p>
""",
        },
    },
    {
        "date": "2026-11-05",
        "minutes": 6,
        "en": {
            "slug": "track-hours-per-job-and-invoice",
            "title": "Track Hours per Job and Invoice Them",
            "h1": "Track Hours per Job and Invoice Them Without Losing a Quarter Hour",
            "desc": "Tradespeople lose paid time by guessing their hours afterwards. How to track hours per job with a timer, round them fairly and put them on the invoice.",
            "badge": "⏱️ Hours",
            "card_badge": "Hours",
            "card_text": "A timer per job, fair rounding and open hours straight onto the invoice.",
            "intro": "Ask a tradesperson on Friday how many hours they spent on Tuesday's job and you get a guess. And guesses are almost always too low: the drive to the supplier, the half hour of waiting, the extra trip for one missing fitting. Over a year that is easily a few weeks of work you did but never invoiced.",
            "body": """
<h2>Why hours from memory cost you money</h2>
<p>Hours you write down afterwards are rounded in the client's favour without you noticing. Fifteen minutes here, half an hour there. At €50 an hour, fifteen forgotten minutes a day is about €2,500 a year for a full-time tradesperson. The fix is not working harder, it is recording time while it happens.</p>

<h2>Three ways to track hours</h2>
<div class="table-wrap"><table>
  <tr><th>Method</th><th>Pros</th><th>Cons</th></tr>
  <tr><td>Notebook or notes app</td><td>Simple, always there</td><td>Done afterwards, easy to forget, has to be typed over</td></tr>
  <tr><td>Spreadsheet</td><td>Totals per client</td><td>Only at the end of the day or week</td></tr>
  <tr><td>Timer per job</td><td>Exact, no extra work</td><td>You have to press start and stop</td></tr>
</table></div>

<h2>Rounding: fair for both sides</h2>
<p>Most tradespeople bill per quarter hour. Round to the <strong>nearest</strong> quarter, not always up: 3 hours and 5 minutes becomes 3.00, 3 hours and 10 minutes becomes 3.25. Clients accept that much more easily than a bill where every number is suspiciously round, and you still never give away a full quarter.</p>

<div class="tip"><h3>💡 Start the timer when you leave, not when you arrive</h3><p>If travel time and buying materials for the job are part of your agreement, start the timer when you set off. Agree beforehand with the client whether travel time is billed; then it is never a discussion.</p></div>

<h2>How it works in BuildExact</h2>
<ol>
  <li><strong>Open the project</strong> and tap <strong>Work order &amp; hours</strong>.</li>
  <li><strong>Tap Start timer</strong> when you begin and stop it when you are done. Only one timer runs at a time: starting a timer on another project stops the first one. A run of under a minute counts as a mis-tap and is not saved.</li>
  <li><strong>Forgot to start it?</strong> Add hours by hand with the + button and pick the day.</li>
  <li><strong>Make the invoice.</strong> The open hours are added automatically as a labour line at your default hourly rate, rounded to the nearest quarter hour. Once the invoice is saved, those hours are marked as billed, so they never end up on two invoices.</li>
</ol>
<p>The same hours appear on the work order the client signs, so what they signed is exactly what they are billed.</p>

<h2>Summary</h2>
<p>Tracking hours with a timer per job costs you two taps a day and stops the slow leak of unbilled time. Round to the nearest quarter, agree on travel time up front and let the open hours flow straight onto the invoice.</p>
""",
        },
        "nl": {
            "slug": "urenregistratie-zzp-bouw-uren-factureren",
            "title": "Urenregistratie voor zzp'ers in de bouw",
            "h1": "Urenregistratie voor zzp'ers in de bouw: uren per klus bijhouden en factureren",
            "desc": "Vakmensen laten geld liggen door uren achteraf te schatten. Zo houd je uren per klus bij met een timer, rond je eerlijk af en zet je ze op de factuur.",
            "badge": "⏱️ Uren",
            "card_badge": "Uren",
            "card_text": "Timer per klus, eerlijk afronden en open uren direct op de factuur.",
            "intro": "Vraag een vakman op vrijdag hoeveel uur hij dinsdag aan een klus heeft besteed en je krijgt een schatting. En die schatting is bijna altijd te laag: de rit naar de groothandel, het halfuur wachten, de extra rit voor dat ene ontbrekende fitting. Over een jaar is dat al snel een paar weken werk dat je wel deed, maar nooit factureerde.",
            "body": """
<h2>Waarom uren uit je hoofd geld kosten</h2>
<p>Uren die je achteraf opschrijft, rond je ongemerkt af in het voordeel van de klant. Een kwartiertje hier, een halfuur daar. Bij €50 per uur is een vergeten kwartier per dag zo'n €2.500 per jaar voor een fulltime vakman. De oplossing is niet harder werken, maar tijd vastleggen terwijl hij loopt.</p>

<h2>Drie manieren om uren bij te houden</h2>
<div class="table-wrap"><table>
  <tr><th>Methode</th><th>Voordelen</th><th>Nadelen</th></tr>
  <tr><td>Notitieboekje of notitie-app</td><td>Simpel, altijd bij de hand</td><td>Achteraf, snel vergeten, moet je overtypen</td></tr>
  <tr><td>Spreadsheet</td><td>Totalen per klant</td><td>Pas aan het eind van de dag of week</td></tr>
  <tr><td>Timer per klus</td><td>Exact, geen extra werk</td><td>Je moet op start en stop drukken</td></tr>
</table></div>

<h2>Afronden: eerlijk voor allebei</h2>
<p>De meeste vakmensen rekenen per kwartier. Rond af naar het <strong>dichtstbijzijnde</strong> kwartier, niet altijd naar boven: 3 uur en 5 minuten wordt 3,00, 3 uur en 10 minuten wordt 3,25. Dat accepteren klanten veel makkelijker dan een rekening waarop elk getal verdacht rond is, en je geeft nooit een heel kwartier weg.</p>

<div class="tip"><h3>💡 Urencriterium</h3><p>Voor de zelfstandigenaftrek moet je als ondernemer minstens 1.225 uur per jaar aan je bedrijf besteden, en de Belastingdienst kan vragen dat aannemelijk te maken. Een urenregistratie per klus helpt daarbij. Tel ook uren voor offertes, administratie en inkoop mee; die staan niet op een factuur, maar tellen wel voor het criterium.</p></div>

<h2>Zo werkt het in BuildExact</h2>
<ol>
  <li><strong>Open het project</strong> en tik op <strong>Werkbon &amp; uren</strong>.</li>
  <li><strong>Tik op Start timer</strong> als je begint en stop hem als je klaar bent. Er loopt één timer tegelijk: start je er een op een ander project, dan stopt de eerste. Een run korter dan een minuut is een misser en wordt niet bewaard.</li>
  <li><strong>Vergeten te starten?</strong> Voeg uren met de hand toe met de +-knop en kies de dag.</li>
  <li><strong>Maak de factuur.</strong> De open uren komen er automatisch op als arbeidsregel tegen je standaard uurtarief, afgerond op het dichtstbijzijnde kwartier. Zodra de factuur is opgeslagen, staan die uren als gefactureerd, zodat ze nooit op twee facturen komen.</li>
</ol>
<p>Dezelfde uren staan op de werkbon die de klant tekent. Wat de klant tekent, is dus precies wat hij betaalt.</p>

<h2>Samenvatting</h2>
<p>Uren bijhouden met een timer per klus kost je twee tikken per dag en stopt het langzame weglekken van onbetaalde tijd. Rond af naar het dichtstbijzijnde kwartier, spreek reistijd vooraf af en laat de open uren direct op de factuur komen.</p>
""",
        },
    },
    {
        "date": "2026-11-05",
        "minutes": 5,
        "en": {
            "slug": "payment-qr-code-on-invoices",
            "title": "Payment QR Code on Your Invoices",
            "h1": "Payment QR Code on Your Invoices: Get Paid Faster with an EPC QR Code",
            "desc": "An EPC payment QR code on your invoice lets clients pay by scanning: amount, IBAN and reference filled in. How it works and how to add it.",
            "badge": "💶 Invoicing",
            "card_badge": "Invoicing",
            "card_text": "Clients scan, the amount, IBAN and reference are filled in. Fewer typos, faster payment.",
            "intro": "Every invoice that is paid late costs you time: checking your bank, sending a reminder, calling. Part of that delay is simple friction. The client has to open their banking app, type a long IBAN, the amount and the invoice number, and one typo later the payment ends up unmatched. A payment QR code removes that step.",
            "body": """
<h2>What is an EPC QR code?</h2>
<p>The EPC QR code is a European standard from the European Payments Council for SEPA credit transfers. In Germany it is known as GiroCode. The code contains the name of the payee, the IBAN, the amount and the payment reference. The client scans it in their banking app and sees a transfer that is ready to confirm.</p>

<h2>Why it helps</h2>
<ul>
  <li><strong>No typing errors.</strong> A wrong digit in the IBAN or the reference is the most common reason a payment cannot be matched to an invoice.</li>
  <li><strong>Lower threshold.</strong> Paying takes ten seconds instead of a few minutes, so it happens straight away instead of "later".</li>
  <li><strong>Correct reference.</strong> The invoice number is in the code, so you can match the payment instantly.</li>
</ul>

<h2>Which banking apps scan it?</h2>
<p>Support is widespread in Germany, Austria, Belgium and Finland, and growing elsewhere. Not every bank supports it yet, and some only scan it from a photo or PDF. That is why the IBAN, amount and reference should always stay printed in plain text next to the code, so nobody depends on the scan.</p>

<div class="tip"><h3>💡 The code is not a payment link</h3><p>An EPC QR code contains only transfer details. It does not open a website and it cannot take money from anyone. The client still confirms the transfer in their own banking app, which is why clients trust it more than a payment link in a message.</p></div>

<h2>How to add it in BuildExact</h2>
<ol>
  <li><strong>Enter your IBAN</strong> once under <strong>My business</strong>.</li>
  <li><strong>Create the invoice</strong> as usual.</li>
  <li><strong>That's it.</strong> Every unpaid invoice PDF gets a "Scan to pay" QR code in the payment block, with the amount, your IBAN and the invoice number as reference. Once an invoice is marked as paid, the code is left off.</li>
</ol>
<p>Invoices are part of BuildExact PRO, a one-time purchase without a subscription.</p>

<h2>Summary</h2>
<p>A payment QR code turns "I'll pay it this weekend" into paying right away. It prevents typing mistakes, carries the right reference and costs you nothing extra. Keep the bank details in plain text too, for clients whose bank does not scan it yet.</p>
""",
        },
        "nl": {
            "slug": "betaal-qr-code-op-factuur",
            "title": "Betaal-QR-code op je factuur",
            "h1": "Betaal-QR-code op je factuur: sneller betaald met een EPC-QR-code",
            "desc": "Met een EPC-betaal-QR op je factuur betaalt je klant door te scannen: bedrag, IBAN en kenmerk staan al ingevuld. Hoe het werkt en hoe je hem toevoegt.",
            "badge": "💶 Facturen",
            "card_badge": "Facturen",
            "card_text": "Klant scant, bedrag, IBAN en kenmerk staan erin. Minder tikfouten, sneller betaald.",
            "intro": "Elke factuur die te laat betaald wordt, kost je tijd: bank checken, herinnering sturen, bellen. Een deel van die vertraging is gewoon gedoe. De klant moet zijn bank-app openen, een IBAN van 18 tekens, het bedrag en het factuurnummer overtypen, en na één tikfout is de betaling niet meer te koppelen. Een betaal-QR-code haalt die stap weg.",
            "body": """
<h2>Wat is een EPC-QR-code?</h2>
<p>De EPC-QR-code is een Europese standaard van de European Payments Council voor SEPA-overboekingen. In Duitsland heet hij GiroCode. In de code staan de naam van de ontvanger, het IBAN, het bedrag en het betalingskenmerk. De klant scant hem in zijn bank-app en ziet een overboeking die klaarstaat om te bevestigen.</p>

<h2>Waarom het helpt</h2>
<ul>
  <li><strong>Geen tikfouten.</strong> Een verkeerd cijfer in het IBAN of kenmerk is de bekendste reden dat een betaling niet aan een factuur te koppelen is.</li>
  <li><strong>Lagere drempel.</strong> Betalen kost tien seconden in plaats van een paar minuten, dus het gebeurt meteen en niet "straks".</li>
  <li><strong>Juist kenmerk.</strong> Het factuurnummer zit in de code, zodat je de betaling direct herkent.</li>
</ul>

<h2>Welke bank-apps scannen hem?</h2>
<p>In Duitsland, Oostenrijk, België en Finland is ondersteuning breed, en in andere landen groeit die. In Nederland verschilt het per bank, en sommige apps scannen hem alleen vanaf een foto of PDF. Daarom blijven IBAN, bedrag en kenmerk altijd ook gewoon als tekst naast de code staan, zodat niemand van de scan afhankelijk is.</p>

<div class="tip"><h3>💡 Geen betaallink</h3><p>Een EPC-QR-code bevat alleen overboekingsgegevens. Hij opent geen website en kan bij niemand geld afschrijven. De klant bevestigt de overboeking zelf in zijn eigen bank-app. Daarom vertrouwen klanten hem meer dan een betaallink in een berichtje.</p></div>

<h2>Zo voeg je hem toe in BuildExact</h2>
<ol>
  <li><strong>Vul één keer je IBAN in</strong> onder <strong>Mijn bedrijf</strong>.</li>
  <li><strong>Maak de factuur</strong> zoals altijd.</li>
  <li><strong>Klaar.</strong> Elke onbetaalde factuur-PDF krijgt in het betaalblok een QR-code "Scan &amp; betaal", met het bedrag, je IBAN en het factuurnummer als kenmerk. Staat de factuur op betaald, dan valt de code weg.</li>
</ol>
<p>Facturen horen bij BuildExact PRO: eenmalig betalen, geen abonnement.</p>

<h2>Samenvatting</h2>
<p>Een betaal-QR-code maakt van "ik betaal het dit weekend" meteen betalen. Hij voorkomt tikfouten, draagt het juiste kenmerk mee en kost je niets extra. Laat de bankgegevens ook als tekst staan, voor klanten bij wie de bank-app hem nog niet scant.</p>
""",
        },
    },
    {
        "date": "2026-11-05",
        "minutes": 6,
        "en": {
            "slug": "phone-spirit-level-accuracy",
            "title": "How Accurate Is a Phone Spirit Level?",
            "h1": "How Accurate Is a Spirit Level App? When Your Phone Is Good Enough",
            "desc": "A phone level is accurate to about a tenth of a degree after calibration. What that means in mm per metre, when it is good enough and how to calibrate.",
            "badge": "📐 Tools",
            "card_badge": "Tools",
            "card_text": "Degrees, % and mm per metre: when a phone level is enough and how to calibrate it.",
            "intro": "Every tradesperson has a proper spirit level in the van. But for a quick check of a shelf, a picture frame, a window sill or the fall of a terrace, the phone in your pocket is often closer. The question is: how far can you trust it?",
            "body": """
<h2>How a phone level works</h2>
<p>A phone has an accelerometer that measures in which direction gravity pulls. From that the app calculates the angle. Lay the phone <strong>flat</strong> and you get a bubble level for two directions at once; stand it <strong>on its edge</strong> and it works like a traditional spirit level along the long side.</p>

<h2>How accurate is it?</h2>
<p>After calibration, a typical phone is reliable to about <strong>0.1 to 0.2 degrees</strong>. Without calibration it can be off by half a degree or more, because the sensor is never mounted perfectly straight in the phone and the case or camera bump tilts it.</p>
<div class="table-wrap"><table>
  <tr><th>Angle</th><th>Slope</th><th>Height difference per metre</th></tr>
  <tr><td>0.1°</td><td>0.17 %</td><td>1.7 mm</td></tr>
  <tr><td>0.5°</td><td>0.87 %</td><td>8.7 mm</td></tr>
  <tr><td>1°</td><td>1.75 %</td><td>17.5 mm</td></tr>
  <tr><td>2°</td><td>3.5 %</td><td>35 mm</td></tr>
</table></div>
<p>So a well-calibrated phone gets you to within about 2 mm per metre. Fine for a shelf, a picture or checking whether a terrace has fall. For setting out a long kitchen worktop or a door frame, take the 2-metre level: it averages out bumps in the surface over its full length, and the phone only measures where it lies.</p>

<h2>Calibrate in 10 seconds</h2>
<ol>
  <li>Lay the phone on a surface you know is level, or as level as you can find.</li>
  <li>Tap <strong>Calibrate</strong>. From now on that position reads as 0.</li>
  <li><strong>Check:</strong> turn the phone 180° on the same spot. If the reading is the same, the calibration is good. If it shows the opposite value, the surface was not level; calibrate again on a better one.</li>
</ol>
<p>Take the case off, or calibrate with the case on and always measure with it on. A camera bump on the back makes a difference when the phone lies flat.</p>

<div class="tip"><h3>💡 Fall in mm per metre</h3><p>Paving, terraces and shower floors need fall to drain water. A common guideline is 1 to 2 % (10 to 20 mm per metre), but always check the product instructions and local rules. A reading in mm/m saves you converting degrees in your head.</p></div>

<h2>The level and ruler in BuildExact</h2>
<p>The free tools in BuildExact include a spirit level with a <strong>Flat</strong> and an <strong>On its edge</strong> mode that you choose yourself, so it never jumps between the two. It turns green and vibrates when level, can <strong>hold</strong> a reading so you can read it after taking the phone out of an awkward spot, and shows the slope in % and mm per metre. Next to it you'll find an on-screen <strong>ruler</strong> in cm or inch (calibrated once with a bank card, 85.6 mm) and a unit converter for length, area, volume, weight and slope.</p>

<h2>Summary</h2>
<p>A calibrated phone level is accurate to about 2 mm per metre: good enough for quick checks, shelves, frames and fall, not for setting out long, precise work. Calibrate on a level surface, verify by turning 180° and read the fall directly in mm per metre.</p>
""",
        },
        "nl": {
            "slug": "waterpas-app-hoe-nauwkeurig",
            "title": "Waterpas-app: hoe nauwkeurig is het?",
            "h1": "Hoe nauwkeurig is een waterpas-app? Wanneer je telefoon goed genoeg is",
            "desc": "Een telefoonwaterpas is na kalibratie tot ongeveer een tiende graad nauwkeurig. Wat dat is in mm per meter, wanneer het genoeg is en hoe je kalibreert.",
            "badge": "📐 Gereedschap",
            "card_badge": "Gereedschap",
            "card_text": "Graden, % en mm per meter: wanneer een telefoonwaterpas genoeg is en hoe je kalibreert.",
            "intro": "Elke vakman heeft een echte waterpas in de bus. Maar voor een snelle check van een plank, een schilderij, een vensterbank of het afschot van een terras zit je telefoon vaak dichterbij. De vraag is: hoe ver kun je hem vertrouwen?",
            "body": """
<h2>Hoe een telefoonwaterpas werkt</h2>
<p>Een telefoon heeft een versnellingsmeter die meet in welke richting de zwaartekracht trekt. Daaruit berekent de app de hoek. Leg je de telefoon <strong>plat</strong>, dan krijg je een belwaterpas voor twee richtingen tegelijk; zet je hem <strong>op de rand</strong>, dan werkt hij als een gewone waterpas langs de lange kant.</p>

<h2>Hoe nauwkeurig is het?</h2>
<p>Na kalibratie is een gemiddelde telefoon betrouwbaar tot ongeveer <strong>0,1 à 0,2 graden</strong>. Zonder kalibratie kan hij een halve graad of meer afwijken, omdat de sensor nooit perfect recht in de telefoon zit en het hoesje of de camerabult hem scheef zet.</p>
<div class="table-wrap"><table>
  <tr><th>Hoek</th><th>Helling</th><th>Hoogteverschil per meter</th></tr>
  <tr><td>0,1°</td><td>0,17 %</td><td>1,7 mm</td></tr>
  <tr><td>0,5°</td><td>0,87 %</td><td>8,7 mm</td></tr>
  <tr><td>1°</td><td>1,75 %</td><td>17,5 mm</td></tr>
  <tr><td>2°</td><td>3,5 %</td><td>35 mm</td></tr>
</table></div>
<p>Een goed gekalibreerde telefoon zit dus binnen ongeveer 2 mm per meter. Prima voor een plank, een schilderij of om te checken of een terras afschot heeft. Voor het uitzetten van een lang aanrechtblad of een kozijn pak je de waterpas van 2 meter: die middelt oneffenheden over de hele lengte, terwijl de telefoon alleen meet waar hij ligt.</p>

<h2>Kalibreren in 10 seconden</h2>
<ol>
  <li>Leg de telefoon op een vlak waarvan je weet dat het waterpas is, of zo vlak als je kunt vinden.</li>
  <li>Tik op <strong>Kalibreren</strong>. Vanaf nu is die stand 0.</li>
  <li><strong>Controle:</strong> draai de telefoon op dezelfde plek 180°. Geeft hij dezelfde waarde, dan klopt de kalibratie. Geeft hij de tegenovergestelde waarde, dan was het vlak niet waterpas; kalibreer opnieuw op een beter vlak.</li>
</ol>
<p>Haal het hoesje eraf, of kalibreer mét hoesje en meet dan ook altijd mét hoesje. Een camerabult aan de achterkant maakt uit als de telefoon plat ligt.</p>

<div class="tip"><h3>💡 Afschot in mm per meter</h3><p>Bestrating, terrassen en douchevloeren hebben afschot nodig om water af te voeren. Een veelgebruikte richtlijn is 1 à 2 % (10 à 20 mm per meter), maar kijk altijd naar de voorschriften van het product en de lokale regels. Een uitlezing in mm/m scheelt je het omrekenen van graden in je hoofd.</p></div>

<h2>De waterpas en liniaal in BuildExact</h2>
<p>Bij het gratis gereedschap in BuildExact zit een waterpas met de standen <strong>Plat</strong> en <strong>Op de rand</strong> die je zelf kiest, zodat hij nooit tussen de twee verspringt. Hij wordt groen en trilt als hij waterpas staat, kan een meting <strong>vastzetten</strong> zodat je hem afleest nadat je de telefoon uit een lastige hoek haalt, en toont de helling in % en mm per meter. Daarnaast vind je een <strong>liniaal</strong> op je scherm in cm of inch (één keer kalibreren met een bankpas van 85,6 mm) en eenheden omrekenen voor lengte, oppervlakte, volume, gewicht en helling.</p>

<h2>Samenvatting</h2>
<p>Een gekalibreerde telefoonwaterpas is nauwkeurig tot ongeveer 2 mm per meter: goed genoeg voor snelle checks, planken, lijsten en afschot, niet voor het uitzetten van lang, precies werk. Kalibreer op een waterpas vlak, controleer door 180° te draaien en lees het afschot direct af in mm per meter.</p>
""",
        },
    },
]
