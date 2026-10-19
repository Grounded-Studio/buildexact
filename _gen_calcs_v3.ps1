# Batch 2 generator: cost, tiles, paint, concrete HTML (EN + NL)
. "$PSScriptRoot\_gen_calcs_v2.ps1"
# (dot-sources the PageHtml and W functions)

# ============ COST ============
$costEN = @"
        <h3>Line items</h3>
        <div id="items"></div>
        <button type="button" id="addItem" class="btn btn-ghost btn-sm" style="margin-top:10px;">+ Add line</button>
        <h3 style="margin-top:28px;">VAT &amp; discount</h3>
        <div class="field-row">
          <div class="field"><label for="discount">Discount (%)</label><input type="number" id="discount" value="0" min="0" step="1"></div>
          <div class="field"><label for="vat">VAT (%)</label><input type="number" id="vat" value="21" min="0" step="1"><p class="hint">21% default, 9% for home renovations &gt; 2 years old.</p></div>
        </div>
"@
$costEnRes = @"
        <div class="result-hero"><div class="label">Grand total</div><div><span class="value" id="heroValue">&euro; 0,00</span></div></div>
        <div class="result-rows" id="resultRows"></div>
"@
$costNL = @"
        <h3>Regels</h3>
        <div id="items"></div>
        <button type="button" id="addItem" class="btn btn-ghost btn-sm" style="margin-top:10px;">+ Regel toevoegen</button>
        <h3 style="margin-top:28px;">BTW &amp; korting</h3>
        <div class="field-row">
          <div class="field"><label for="discount">Korting (%)</label><input type="number" id="discount" value="0" min="0" step="1"></div>
          <div class="field"><label for="vat">BTW (%)</label><input type="number" id="vat" value="21" min="0" step="1"><p class="hint">21% standaard, 9% bij renovatie woning &gt; 2 jaar oud.</p></div>
        </div>
"@
$costNlRes = @"
        <div class="result-hero"><div class="label">Totaal</div><div><span class="value" id="heroValue">&euro; 0,00</span></div></div>
        <div class="result-rows" id="resultRows"></div>
"@
W 'en' 'cost' (PageHtml 'en' 'cost' 'Cost estimator | BuildExact' 'Line-item cost estimator with discount and VAT - same as the BuildExact Android app.' 'Cost estimator' 'Build up a quick cost estimate line by line. For a branded PDF with client details, use the Android app.' $costEN $costEnRes 'For a branded PDF quote with your logo and signature, use the BuildExact Android app.' $true $false $false $false)
W 'nl' 'cost' (PageHtml 'nl' 'cost' 'Kostenraming | BuildExact' 'Kostenraming per regel met korting en BTW - zelfde als in de BuildExact Android app.' 'Kostenraming' 'Bouw snel een kostenraming op per regel. Voor een offerte-PDF met je eigen stijl: gebruik de Android app.' $costNL $costNlRes 'Voor een offerte-PDF met je logo en handtekening: gebruik de BuildExact Android app.' $true $false $false $false)

# ============ TILES ============
$tilesEN = @"
        <h3>Dimensions</h3>
        <div class="field"><label for="area">Area to tile (m&sup2;)</label><input type="number" id="area" value="20" min="0" step="0.1"></div>
        <div class="field-row">
          <div class="field"><label for="tileW">Tile width (cm)</label><input type="number" id="tileW" value="60" min="1" step="1"></div>
          <div class="field"><label for="tileH">Tile height (cm)</label><input type="number" id="tileH" value="60" min="1" step="1"></div>
        </div>
        <div class="field"><label for="groutMm">Grout width (mm)</label><input type="number" id="groutMm" value="3" min="0" step="0.5"></div>

        <h3 style="margin-top:28px;">Laying pattern</h3>
        <div class="chips" id="patternChips">
          <button type="button" class="chip active" data-value="straight" data-waste="10">Straight</button>
          <button type="button" class="chip" data-value="halfbrick" data-waste="10">Half-brick</button>
          <button type="button" class="chip" data-value="diagonal" data-waste="15">Diagonal</button>
          <button type="button" class="chip" data-value="herringbone" data-waste="20">Herringbone</button>
        </div>
        <div class="field"><label for="waste">Cut waste (%)</label><input type="number" id="waste" value="10" min="0" step="1"></div>

        <h3 style="margin-top:28px;">Packaging &amp; adhesive</h3>
        <div class="field"><label for="perBox">Tiles per box</label><input type="number" id="perBox" value="5" min="1" step="1"></div>
        <label class="toggle-row"><span>Order one spare box</span><input type="checkbox" id="spareBox" checked></label>
        <div class="field-row">
          <div class="field"><label for="adhesive">Adhesive (kg/m&sup2;)</label><input type="number" id="adhesive" value="6" min="0" step="0.5"></div>
          <div class="field"><label for="bagKg">Bag content (kg)</label><input type="number" id="bagKg" value="25" min="1" step="1"></div>
        </div>

        <h3 style="margin-top:28px;">Edges &amp; trim (optional)</h3>
        <div class="field"><label for="edgeM">Edge linear meters (m)</label><input type="number" id="edgeM" value="0" min="0" step="0.1"></div>
"@
$tilesEnRes = @"
        <div class="result-hero"><div class="label">Needed</div><div><span class="value" id="heroValue">0 tiles</span></div></div>
        <div class="result-rows" id="resultRows"></div>
"@
$tilesNL = @"
        <h3>Afmetingen</h3>
        <div class="field"><label for="area">Tegeloppervlak (m&sup2;)</label><input type="number" id="area" value="20" min="0" step="0.1"></div>
        <div class="field-row">
          <div class="field"><label for="tileW">Tegel breedte (cm)</label><input type="number" id="tileW" value="60" min="1" step="1"></div>
          <div class="field"><label for="tileH">Tegel hoogte (cm)</label><input type="number" id="tileH" value="60" min="1" step="1"></div>
        </div>
        <div class="field"><label for="groutMm">Voegbreedte (mm)</label><input type="number" id="groutMm" value="3" min="0" step="0.5"></div>

        <h3 style="margin-top:28px;">Legpatroon</h3>
        <div class="chips" id="patternChips">
          <button type="button" class="chip active" data-value="straight" data-waste="10">Recht</button>
          <button type="button" class="chip" data-value="halfbrick" data-waste="10">Halfsteens</button>
          <button type="button" class="chip" data-value="diagonal" data-waste="15">Diagonaal</button>
          <button type="button" class="chip" data-value="herringbone" data-waste="20">Visgraat</button>
        </div>
        <div class="field"><label for="waste">Snijverlies (%)</label><input type="number" id="waste" value="10" min="0" step="1"></div>

        <h3 style="margin-top:28px;">Verpakking &amp; lijm</h3>
        <div class="field"><label for="perBox">Tegels per doos</label><input type="number" id="perBox" value="5" min="1" step="1"></div>
        <label class="toggle-row"><span>Extra reservedoos bijbestellen</span><input type="checkbox" id="spareBox" checked></label>
        <div class="field-row">
          <div class="field"><label for="adhesive">Lijm (kg/m&sup2;)</label><input type="number" id="adhesive" value="6" min="0" step="0.5"></div>
          <div class="field"><label for="bagKg">Zak-inhoud (kg)</label><input type="number" id="bagKg" value="25" min="1" step="1"></div>
        </div>

        <h3 style="margin-top:28px;">Rand &amp; profielen (optioneel)</h3>
        <div class="field"><label for="edgeM">Strekkende meter rand (m)</label><input type="number" id="edgeM" value="0" min="0" step="0.1"></div>
"@
$tilesNlRes = @"
        <div class="result-hero"><div class="label">Benodigd</div><div><span class="value" id="heroValue">0 tegels</span></div></div>
        <div class="result-rows" id="resultRows"></div>
"@
W 'en' 'tiles' (PageHtml 'en' 'tiles' 'Tile calculator | BuildExact' 'Full-feature tile calculator - patterns, grout, adhesive bags, spare box and edge trim. Same engine as the BuildExact Android app.' 'Tile calculator' 'Pattern-aware waste, grout, adhesive bags and optional edge trim.' $tilesEN $tilesEnRes 'Estimates only - verify tile dimensions and pattern with your supplier.' $false $true $true $false)
W 'nl' 'tiles' (PageHtml 'nl' 'tiles' 'Tegel calculator | BuildExact' 'Volledige tegel calculator - patronen, voegsel, lijmzakken, reservedoos en randprofiel. Zelfde engine als de BuildExact Android app.' 'Tegel calculator' 'Patroon-afhankelijk snijverlies, voegsel, lijmzakken en optioneel randprofiel.' $tilesNL $tilesNlRes 'Alleen schattingen - controleer tegelmaten en patroon bij je leverancier.' $false $true $true $false)

# ============ PAINT ============
$paintEN = @"
        <h3>Dimensions</h3>
        <div class="field"><label for="area">Area to paint (m&sup2;)</label><input type="number" id="area" value="40" min="0" step="0.1"></div>
        <div class="field-row">
          <div class="field"><label for="coats">Coats</label><input type="number" id="coats" value="2" min="1" step="1"></div>
          <div class="field"><label for="coverage">Coverage (m&sup2;/L)</label><input type="number" id="coverage" value="10" min="1" step="0.5"></div>
        </div>

        <h3 style="margin-top:28px;">Primer (optional)</h3>
        <label class="toggle-row"><span>Include primer coat</span><input type="checkbox" id="primer"></label>
        <div class="field" id="primerField" style="display:none;"><label for="primerCov">Primer coverage (m&sup2;/L)</label><input type="number" id="primerCov" value="10" min="1" step="0.5"></div>

        <h3 style="margin-top:28px;">Application method</h3>
        <div class="chips" id="methodChips">
          <button type="button" class="chip active" data-value="brush" data-waste="5">Brush / roller</button>
          <button type="button" class="chip" data-value="spray" data-waste="25">Spray</button>
        </div>
        <div class="field"><label for="waste">Waste (%)</label><input type="number" id="waste" value="5" min="0" step="1"><p class="hint">Auto-set to 5% brush/roller or 25% spray.</p></div>
"@
$paintEnRes = @"
        <div class="result-hero"><div class="label">Paint needed</div><div><span class="value" id="heroValue">0.0 L</span></div></div>
        <div class="result-rows" id="resultRows"></div>
"@
$paintNL = @"
        <h3>Afmetingen</h3>
        <div class="field"><label for="area">Te verven oppervlak (m&sup2;)</label><input type="number" id="area" value="40" min="0" step="0.1"></div>
        <div class="field-row">
          <div class="field"><label for="coats">Lagen</label><input type="number" id="coats" value="2" min="1" step="1"></div>
          <div class="field"><label for="coverage">Dekking (m&sup2;/L)</label><input type="number" id="coverage" value="10" min="1" step="0.5"></div>
        </div>

        <h3 style="margin-top:28px;">Grondverf (optioneel)</h3>
        <label class="toggle-row"><span>Grondlaag meeberekenen</span><input type="checkbox" id="primer"></label>
        <div class="field" id="primerField" style="display:none;"><label for="primerCov">Dekking primer (m&sup2;/L)</label><input type="number" id="primerCov" value="10" min="1" step="0.5"></div>

        <h3 style="margin-top:28px;">Toepassing</h3>
        <div class="chips" id="methodChips">
          <button type="button" class="chip active" data-value="brush" data-waste="5">Kwast / roller</button>
          <button type="button" class="chip" data-value="spray" data-waste="25">Spuiten</button>
        </div>
        <div class="field"><label for="waste">Snijverlies (%)</label><input type="number" id="waste" value="5" min="0" step="1"><p class="hint">Automatisch 5% bij kwast/roller, 25% bij spuiten.</p></div>
"@
$paintNlRes = @"
        <div class="result-hero"><div class="label">Verf nodig</div><div><span class="value" id="heroValue">0,0 L</span></div></div>
        <div class="result-rows" id="resultRows"></div>
"@
W 'en' 'paint' (PageHtml 'en' 'paint' 'Paint calculator | BuildExact' 'Full-feature paint calculator - primer, coats, coverage, can breakdown and spray vs brush waste. Same engine as the BuildExact Android app.' 'Paint calculator' 'Primer, coats, coverage and can-size breakdown.' $paintEN $paintEnRes 'Spray adds ~25% waste; brush and roller stay around 5%.' $false $true $true $false)
W 'nl' 'paint' (PageHtml 'nl' 'paint' 'Verf calculator | BuildExact' 'Volledige verf calculator - grondverf, lagen, dekking, blik-indeling en snijverlies per methode. Zelfde engine als de BuildExact Android app.' 'Verf calculator' 'Grondverf, lagen, dekking en blik-indeling.' $paintNL $paintNlRes 'Spuiten geeft ~25% overspray; kwast en roller blijven rond 5%.' $false $true $true $false)

# ============ CONCRETE ============
$concEN = @"
        <h3>Job type</h3>
        <div class="chips" id="presetChips">
          <button type="button" class="chip active" data-value="custom" data-depth="12" data-waste="10" data-rebar="60">Custom</button>
          <button type="button" class="chip" data-value="floor" data-depth="10" data-waste="10" data-rebar="60">Floor</button>
          <button type="button" class="chip" data-value="foundation" data-depth="40" data-waste="10" data-rebar="100">Foundation</button>
          <button type="button" class="chip" data-value="driveway" data-depth="12" data-waste="10" data-rebar="40">Driveway</button>
        </div>

        <h3 style="margin-top:28px;">Dimensions</h3>
        <div class="field-row">
          <div class="field"><label for="length">Length (m)</label><input type="number" id="length" value="5" min="0" step="0.1"></div>
          <div class="field"><label for="width">Width (m)</label><input type="number" id="width" value="4" min="0" step="0.1"></div>
        </div>
        <div class="field-row">
          <div class="field"><label for="depth">Depth (cm)</label><input type="number" id="depth" value="12" min="1" step="0.5"></div>
          <div class="field"><label for="waste">Waste (%)</label><input type="number" id="waste" value="10" min="0" step="1"></div>
        </div>

        <h3 style="margin-top:28px;">Supply</h3>
        <div class="chips" id="supplyChips">
          <button type="button" class="chip active" data-value="readymix">Ready-mix (truck)</button>
          <button type="button" class="chip" data-value="selfmix">Self-mix (bags)</button>
        </div>

        <h3 style="margin-top:28px;">Reinforcement (optional)</h3>
        <div class="field-row">
          <div class="field"><label for="rebar">Steel (kg/m&sup3;)</label><input type="number" id="rebar" value="60" min="0" step="5"></div>
          <div class="field"><label for="barLen">Bar length (m)</label><input type="number" id="barLen" value="12" min="1" step="0.5"></div>
        </div>

        <h3 style="margin-top:28px;">Formwork</h3>
        <label class="toggle-row"><span>Need formwork around edge</span><input type="checkbox" id="formwork"></label>
"@
$concEnRes = @"
        <div class="result-hero"><div class="label">Volume</div><div><span class="value" id="heroValue">0.00 m&sup3;</span></div></div>
        <div class="result-rows" id="resultRows"></div>
"@
$concNL = @"
        <h3>Soort klus</h3>
        <div class="chips" id="presetChips">
          <button type="button" class="chip active" data-value="custom" data-depth="12" data-waste="10" data-rebar="60">Eigen opzet</button>
          <button type="button" class="chip" data-value="floor" data-depth="10" data-waste="10" data-rebar="60">Vloer</button>
          <button type="button" class="chip" data-value="foundation" data-depth="40" data-waste="10" data-rebar="100">Fundering</button>
          <button type="button" class="chip" data-value="driveway" data-depth="12" data-waste="10" data-rebar="40">Oprit</button>
        </div>

        <h3 style="margin-top:28px;">Afmetingen</h3>
        <div class="field-row">
          <div class="field"><label for="length">Lengte (m)</label><input type="number" id="length" value="5" min="0" step="0.1"></div>
          <div class="field"><label for="width">Breedte (m)</label><input type="number" id="width" value="4" min="0" step="0.1"></div>
        </div>
        <div class="field-row">
          <div class="field"><label for="depth">Dikte (cm)</label><input type="number" id="depth" value="12" min="1" step="0.5"></div>
          <div class="field"><label for="waste">Snijverlies (%)</label><input type="number" id="waste" value="10" min="0" step="1"></div>
        </div>

        <h3 style="margin-top:28px;">Levering</h3>
        <div class="chips" id="supplyChips">
          <button type="button" class="chip active" data-value="readymix">Mengwagen</button>
          <button type="button" class="chip" data-value="selfmix">Zelf mengen (zakken)</button>
        </div>

        <h3 style="margin-top:28px;">Wapening (optioneel)</h3>
        <div class="field-row">
          <div class="field"><label for="rebar">Staal (kg/m&sup3;)</label><input type="number" id="rebar" value="60" min="0" step="5"></div>
          <div class="field"><label for="barLen">Staaflengte (m)</label><input type="number" id="barLen" value="12" min="1" step="0.5"></div>
        </div>

        <h3 style="margin-top:28px;">Bekisting</h3>
        <label class="toggle-row"><span>Bekisting rondom nodig</span><input type="checkbox" id="formwork"></label>
"@
$concNlRes = @"
        <div class="result-hero"><div class="label">Volume</div><div><span class="value" id="heroValue">0,00 m&sup3;</span></div></div>
        <div class="result-rows" id="resultRows"></div>
"@
W 'en' 'concrete' (PageHtml 'en' 'concrete' 'Concrete calculator | BuildExact' 'Concrete calculator - job presets, ready-mix vs self-mix bags, rebar, formwork. Same engine as the BuildExact Android app.' 'Concrete calculator' 'Preset job types, ready-mix vs self-mix bags, rebar and formwork.' $concEN $concEnRes 'Standard C25 mix: ~14 cement bags, 0.5 m3 sand, 0.8 m3 gravel per m3 concrete.' $false $true $true $false)
W 'nl' 'concrete' (PageHtml 'nl' 'concrete' 'Beton calculator | BuildExact' 'Beton calculator - preset-klussen, mengwagen vs zelf mengen, wapening en bekisting. Zelfde engine als de BuildExact Android app.' 'Beton calculator' 'Preset-klussen, mengwagen vs zelf mengen, wapening en bekisting.' $concNL $concNlRes 'Standaard C25-mix: ~14 cementzakken, 0,5 m3 zand, 0,8 m3 grind per m3 beton.' $false $true $true $false)

Write-Output "Batch 2 (cost + tiles + paint + concrete) HTML generated."
