param([Parameter(Mandatory=$true)][string]$BrowserBinary)
$ErrorActionPreference = 'Stop'

function Invoke-EpicBrowser {
  param([string[]]$BrowserArgs)
  $result = & $BrowserBinary --session epico @BrowserArgs
  if ($LASTEXITCODE -ne 0) { throw "agent-browser failed: $BrowserArgs" }
  return ($result -join "`n")
}

function Invoke-EpicEval {
  param([string]$Code)
  $encoded = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($Code))
  return Invoke-EpicBrowser -BrowserArgs @('eval','-b',$encoded)
}

$results = @()
foreach ($width in @(320,360,375,390,414,430,768,1024,1280,1440)) {
  $height = if ($width -ge 768) { 1000 } else { 844 }
  Invoke-EpicBrowser -BrowserArgs @('set','viewport',"$width","$height") | Out-Null
  Invoke-EpicBrowser -BrowserArgs @('scroll','up','20000') | Out-Null
  Invoke-EpicBrowser -BrowserArgs @('wait','--fn','window.scrollY === 0') | Out-Null
  $check = Invoke-EpicEval -Code @'
(() => {
  const root = document.documentElement;
  const cta = document.querySelector('#hero .epic-cta').getBoundingClientRect();
  const bad = [...document.querySelectorAll('main *')].filter(el => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && (r.left < -1 || r.right > root.clientWidth + 1) && getComputedStyle(el).position !== 'fixed';
  }).map(el => ({tag: el.tagName, class: el.className})).slice(0, 8);
  const result = {viewport: innerWidth, contentWidth: root.clientWidth, scrollWidth: root.scrollWidth, overflow: bad, ctaBottom: Math.round(cta.bottom), ctaVisible: cta.bottom <= innerHeight, primaryHref: document.querySelector('#hero .epic-cta').getAttribute('href'), h1Count: document.querySelectorAll('h1').length, lang: root.lang};
  if (root.scrollWidth > root.clientWidth || bad.length || !result.ctaVisible || result.h1Count !== 1 || result.primaryHref !== '/pedido') throw new Error(JSON.stringify(result));
  return result;
})()
'@
  $results += ($check | ConvertFrom-Json)
  Invoke-EpicBrowser -BrowserArgs @('screenshot',"docs/qa/hero-$width.png") | Out-Null
}
$results | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath docs/qa/responsividade.json -Encoding UTF8
$results | ConvertTo-Json -Depth 5
