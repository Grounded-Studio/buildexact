# Regenerates HTML for all remaining calculators (not fence/linear/send-whatsapp blog etc)
# Writes EN + NL HTML per calc. JS files are hand-written separately.
# Run from repo root.

$root = $PSScriptRoot

function PageHtml($lang, $slug, $title, $description, $h1, $lede, $formHtml, $resultHtml, $noteText, $noLock, $hasChips, $hasToggles, $hasStepper) {
  $isNl = $lang -eq 'nl'
  if ($isNl) {
    $homeHref = '/nl/'
    $navLinks = '<li><a href="/nl/calculators/">Calculators</a></li><li><a href="/nl/features/">Functies</a></li><li><a href="/nl/pricing/">Prijzen</a></li><li><a href="/nl/blog/">Blog</a></li><li><a href="/nl/support/">Support</a></li>'
    $langSwitch = "<a href=`"/calculators/$slug/`">EN</a><a href=`"/nl/calculators/$slug/`" class=`"active`">NL</a>"
    $cta = 'Gratis'
    $backText = 'Alle calculators'
    $backHref = '/nl/calculators/'
    $formTitle = 'Invoer'
    $resultTitle = 'Resultaat'
    $saveBtn = 'Opslaan &amp; exporteren in de app'
    $footerBrand = 'Offline-first meten, offertes en facturen voor Nederlandse en Belgische bouwers.'
    $footerCols = '<div><h4>Product</h4><a href="/nl/calculators/">Calculators</a><a href="/nl/features/">Functies</a><a href="/nl/pricing/">Prijzen</a><a href="/nl/support/">Support</a></div><div><h4>Bedrijf</h4><a href="/nl/about/">Over ons</a><a href="/nl/blog/">Blog</a><a href="https://grounded-studio.app">Grounded Studio</a></div><div><h4>Juridisch</h4><a href="/nl/privacy/">Privacy</a><a href="/nl/terms/">Voorwaarden</a></div>'
    $madeIn = 'Gemaakt in Nederland 🇳🇱'
    $canonical = "https://buildexact.app/nl/calculators/$slug/"
  } else {
    $homeHref = '/'
    $navLinks = '<li><a href="/calculators/">Calculators</a></li><li><a href="/features/">Features</a></li><li><a href="/pricing/">Pricing</a></li><li><a href="/blog/">Blog</a></li><li><a href="/support/">Support</a></li>'
    $langSwitch = "<a href=`"/calculators/$slug/`" class=`"active`">EN</a><a href=`"/nl/calculators/$slug/`">NL</a>"
    $cta = 'Get it free'
    $backText = 'All calculators'
    $backHref = '/calculators/'
    $formTitle = 'Inputs'
    $resultTitle = 'Result'
    $saveBtn = 'Save &amp; export in the app'
    $footerBrand = 'Offline-first measurement, quoting and invoicing for Dutch and Belgian builders.'
    $footerCols = '<div><h4>Product</h4><a href="/calculators/">Calculators</a><a href="/features/">Features</a><a href="/pricing/">Pricing</a><a href="/support/">Support</a></div><div><h4>Company</h4><a href="/about/">About</a><a href="/blog/">Blog</a><a href="https://grounded-studio.app">Grounded Studio</a></div><div><h4>Legal</h4><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></div>'
    $madeIn = 'Made in the Netherlands 🇳🇱'
    $canonical = "https://buildexact.app/calculators/$slug/"
  }
  $noLockAttr = if ($noLock) { ' data-no-lock="true"' } else { '' }
  $saveBtnHtml = if ($noLock) { '' } else { "<a href=`"https://play.google.com/store/apps/details?id=com.metenweten.bouw`" class=`"btn btn-primary`" style=`"margin-top:16px;width:100%;justify-content:center;`">$saveBtn</a>" }

@"
<!DOCTYPE html>
<html lang="$lang">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>$title</title>
<meta name="description" content="$description">
<link rel="canonical" href="$canonical">
<link rel="alternate" hreflang="en" href="https://buildexact.app/calculators/$slug/">
<link rel="alternate" hreflang="nl" href="https://buildexact.app/nl/calculators/$slug/">
<link rel="icon" type="image/png" sizes="64x64" href="/assets/icons/icon-64.png">
<link rel="apple-touch-icon" sizes="512x512" href="/assets/icons/icon-512.png">
<meta name="theme-color" content="#2563EB">
<link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
<header class="site-header"><div class="container"><nav class="nav">
<a href="$homeHref" class="brand"><img class="brand-mark" src="/assets/icons/icon-64.png" alt="BuildExact"> BuildExact</a>
<ul class="nav-links">$navLinks</ul>
<div class="nav-right"><div class="lang-switch">$langSwitch</div><a href="https://play.google.com/store/apps/details?id=com.metenweten.bouw" class="btn btn-primary btn-sm">$cta</a><button class="nav-toggle" aria-label="Menu"><span></span><span></span><span></span></button></div>
</nav></div></header>

<section class="section" style="padding-top:40px;">
  <div class="container">
    <p><a href="$backHref" class="muted">&larr; $backText</a></p>
    <h1>$h1</h1>
    <p class="lede" style="margin-bottom:32px;">$lede</p>
    <div class="calc-shell">
      <form class="calc-form" novalidate>
$formHtml
      </form>
      <aside class="calc-result"$noLockAttr>
        <h3>$resultTitle</h3>
$resultHtml
        <div class="calc-note">$noteText</div>
        $saveBtnHtml
      </aside>
    </div>
  </div>
</section>

<footer class="site-footer"><div class="container">
<div class="footer-grid">
<div class="footer-brand"><a href="$homeHref" class="brand" style="color:#fff;"><img class="brand-mark" src="/assets/icons/icon-64.png" alt="BuildExact"> BuildExact</a><p>$footerBrand</p><a href="https://play.google.com/store/apps/details?id=com.metenweten.bouw" class="store-badge">&#9654; Google Play</a></div>
$footerCols
</div>
<div class="footer-bottom"><span>&copy; 2026 Grounded Studio</span><span>$madeIn</span></div>
</div></footer>
<script src="/assets/js/main.js"></script>
<script src="/assets/js/calculators/_helpers.js"></script>
<script src="/assets/js/calculators/$slug.js"></script>
</body>
</html>
"@
}

function W($lang, $slug, $html) {
  if ($lang -eq 'nl') { $sub = 'nl/calculators' } else { $sub = 'calculators' }
  $dir = Join-Path $root "$sub/$slug"
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  [System.IO.File]::WriteAllText((Join-Path $dir 'index.html'), $html, (New-Object System.Text.UTF8Encoding $false))
}

# ============ WALL AREA (new) ============
$wallEN = @"
        <h3>Dimensions</h3>
        <div class="field-row">
          <div class="field"><label for="length">Wall length (m)</label><input type="number" id="length" value="5" min="0" step="0.1"></div>
          <div class="field"><label for="height">Wall height (m)</label><input type="number" id="height" value="2.6" min="0" step="0.1"></div>
        </div>
        <h3 style="margin-top:28px;">Openings</h3>
        <div class="field"><label for="openings">Total openings area (m&sup2;)</label><input type="number" id="openings" value="0" min="0" step="0.1"><p class="hint">Add the area of doors, windows and any cut-outs to subtract from the wall.</p></div>
"@
$wallEnRes = @"
        <div class="result-hero"><div class="label">Net wall area</div><div><span class="value" id="heroValue">0.00 m&sup2;</span></div></div>
        <div class="result-rows" id="resultRows"></div>
"@
$wallNL = @"
        <h3>Afmetingen</h3>
        <div class="field-row">
          <div class="field"><label for="length">Wandlengte (m)</label><input type="number" id="length" value="5" min="0" step="0.1"></div>
          <div class="field"><label for="height">Wandhoogte (m)</label><input type="number" id="height" value="2.6" min="0" step="0.1"></div>
        </div>
        <h3 style="margin-top:28px;">Openingen</h3>
        <div class="field"><label for="openings">Totaal openingen (m&sup2;)</label><input type="number" id="openings" value="0" min="0" step="0.1"><p class="hint">Tel het oppervlak van deuren, ramen en uitsparingen op om af te trekken.</p></div>
"@
$wallNlRes = @"
        <div class="result-hero"><div class="label">Netto wandoppervlak</div><div><span class="value" id="heroValue">0,00 m&sup2;</span></div></div>
        <div class="result-rows" id="resultRows"></div>
"@
W 'en' 'wall-area' (PageHtml 'en' 'wall-area' 'Wall area calculator | BuildExact' 'Wall area in m2 minus doors and windows. Same simple tool as the BuildExact Android app.' 'Wall area' 'Length x height minus openings. Handy before you calculate paint, drywall or wallpaper.' $wallEN $wallEnRes 'Save multiple walls into one project in the BuildExact Android app.' $true $false $false $false)
W 'nl' 'wall-area' (PageHtml 'nl' 'wall-area' 'Wandoppervlak calculator | BuildExact' 'Wandoppervlak in m2 min deuren en ramen. Zelfde eenvoudige tool als in de BuildExact Android app.' 'Wandoppervlak' 'Lengte x hoogte min openingen. Handig voordat je verf, gipsplaat of behang berekent.' $wallNL $wallNlRes 'Meerdere wanden bewaar je in &eacute;&eacute;n project in de BuildExact Android app.' $true $false $false $false)

# ============ AREA (simplify to match app) ============
$areaEN = @"
        <h3>Dimensions</h3>
        <div class="field-row">
          <div class="field"><label for="length">Length (m)</label><input type="number" id="length" value="5" min="0" step="0.1"></div>
          <div class="field"><label for="width">Width (m)</label><input type="number" id="width" value="4" min="0" step="0.1"></div>
        </div>
"@
$areaEnRes = @"
        <div class="result-hero"><div class="label">Area</div><div><span class="value" id="heroValue">0.00 m&sup2;</span></div></div>
"@
$areaNL = @"
        <h3>Afmetingen</h3>
        <div class="field-row">
          <div class="field"><label for="length">Lengte (m)</label><input type="number" id="length" value="5" min="0" step="0.1"></div>
          <div class="field"><label for="width">Breedte (m)</label><input type="number" id="width" value="4" min="0" step="0.1"></div>
        </div>
"@
$areaNlRes = @"
        <div class="result-hero"><div class="label">Oppervlak</div><div><span class="value" id="heroValue">0,00 m&sup2;</span></div></div>
"@
W 'en' 'area' (PageHtml 'en' 'area' 'Area calculator | BuildExact' 'Rectangular area in m2 - length times width. Same simple tool as the BuildExact Android app.' 'Area (m&sup2;)' 'Length x width. For L-shapes, triangles or circles, use the Android app and stack them in one project.' $areaEN $areaEnRes 'Save multiple shapes into one project in the BuildExact Android app.' $true $false $false $false)
W 'nl' 'area' (PageHtml 'nl' 'area' 'Oppervlak calculator | BuildExact' 'Rechthoekig oppervlak in m2 - lengte maal breedte. Zelfde eenvoudige tool als in de BuildExact Android app.' 'Oppervlak (m&sup2;)' 'Lengte x breedte. L-vormen, driehoeken of cirkels: gebruik de Android app en stapel ze in &eacute;&eacute;n project.' $areaNL $areaNlRes 'Meerdere vormen bewaar je in &eacute;&eacute;n project in de BuildExact Android app.' $true $false $false $false)

# ============ VOLUME (ex-gravel, strip material chips) ============
$volEN = @"
        <h3>Dimensions</h3>
        <div class="field-row">
          <div class="field"><label for="length">Length (m)</label><input type="number" id="length" value="5" min="0" step="0.1"></div>
          <div class="field"><label for="width">Width (m)</label><input type="number" id="width" value="3" min="0" step="0.1"></div>
        </div>
        <div class="field"><label for="height">Height / depth (m)</label><input type="number" id="height" value="0.3" min="0" step="0.1"></div>
"@
$volEnRes = @"
        <div class="result-hero"><div class="label">Volume</div><div><span class="value" id="heroValue">0.000 m&sup3;</span></div></div>
"@
$volNL = @"
        <h3>Afmetingen</h3>
        <div class="field-row">
          <div class="field"><label for="length">Lengte (m)</label><input type="number" id="length" value="5" min="0" step="0.1"></div>
          <div class="field"><label for="width">Breedte (m)</label><input type="number" id="width" value="3" min="0" step="0.1"></div>
        </div>
        <div class="field"><label for="height">Hoogte / diepte (m)</label><input type="number" id="height" value="0.3" min="0" step="0.1"></div>
"@
$volNlRes = @"
        <div class="result-hero"><div class="label">Volume</div><div><span class="value" id="heroValue">0,000 m&sup3;</span></div></div>
"@
W 'en' 'volume' (PageHtml 'en' 'volume' 'Volume calculator | BuildExact' 'Rectangular volume in m3 - length x width x height. Same simple tool as the BuildExact Android app.' 'Volume (m&sup3;)' 'Length x width x height. Great for ordering gravel, sand or topsoil by the cubic metre.' $volEN $volEnRes 'Save multiple volumes into one project in the BuildExact Android app.' $true $false $false $false)
W 'nl' 'volume' (PageHtml 'nl' 'volume' 'Volume calculator | BuildExact' 'Volume in m3 - lengte x breedte x hoogte. Zelfde eenvoudige tool als in de BuildExact Android app.' 'Volume (m&sup3;)' 'Lengte x breedte x hoogte. Ideaal om grind, zand of tuinaarde per m&sup3; te bestellen.' $volNL $volNlRes 'Meerdere volumes bewaar je in &eacute;&eacute;n project in de BuildExact Android app.' $true $false $false $false)

# ============ PERIMETER (match app simple) ============
$perEN = @"
        <h3>Dimensions</h3>
        <div class="field-row">
          <div class="field"><label for="length">Length (m)</label><input type="number" id="length" value="5" min="0" step="0.1"></div>
          <div class="field"><label for="width">Width (m)</label><input type="number" id="width" value="4" min="0" step="0.1"></div>
        </div>
        <h3 style="margin-top:28px;">Finishing</h3>
        <div class="field"><label for="waste">Cut waste (%)</label><input type="number" id="waste" value="5" min="0" step="1"><p class="hint">5-10% is typical for plinth or trim.</p></div>
"@
$perEnRes = @"
        <div class="result-hero"><div class="label">Needed</div><div><span class="value" id="heroValue">0.00 m</span></div></div>
        <div class="result-rows" id="resultRows"></div>
"@
$perNL = @"
        <h3>Afmetingen</h3>
        <div class="field-row">
          <div class="field"><label for="length">Lengte (m)</label><input type="number" id="length" value="5" min="0" step="0.1"></div>
          <div class="field"><label for="width">Breedte (m)</label><input type="number" id="width" value="4" min="0" step="0.1"></div>
        </div>
        <h3 style="margin-top:28px;">Afwerking</h3>
        <div class="field"><label for="waste">Snijverlies (%)</label><input type="number" id="waste" value="5" min="0" step="1"><p class="hint">5-10% is gebruikelijk bij plint of aflijsting.</p></div>
"@
$perNlRes = @"
        <div class="result-hero"><div class="label">Benodigd</div><div><span class="value" id="heroValue">0,00 m</span></div></div>
        <div class="result-rows" id="resultRows"></div>
"@
W 'en' 'perimeter' (PageHtml 'en' 'perimeter' 'Perimeter + plinth calculator | BuildExact' 'Perimeter of a rectangle plus a cutting waste factor. Same formulas as the BuildExact Android app.' 'Perimeter &amp; plinth' 'Perimeter of a rectangle plus a cut-waste factor for plinth, trim and skirting board runs.' $perEN $perEnRes 'For L- and U-shapes, use the Android app with waste per side.' $true $false $false $false)
W 'nl' 'perimeter' (PageHtml 'nl' 'perimeter' 'Omtrek + plint calculator | BuildExact' 'Omtrek van een rechthoek plus snijverlies. Zelfde formules als in de BuildExact Android app.' 'Omtrek &amp; plint' 'Omtrek van een rechthoek plus snijverlies voor plint, aflijsting en randprofiel.' $perNL $perNlRes 'L- en U-vormen zitten in de Android app met snijverlies per zijde.' $true $false $false $false)

Write-Output "Batch 1 (simple calcs) complete: wall-area, area, volume, perimeter"
