/**
 * Generates placeholder visuals (SVG) for the sample projects.
 * Royalty-free by construction. Run: node scripts/generate-samples.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs'

const OUT = new URL('../public/samples/', import.meta.url)
mkdirSync(OUT, { recursive: true })

const C = {
  bg: '#0B0D12',
  surface: '#12151C',
  line: '#1F2430',
  text: '#E4E4E7',
  muted: '#71717A',
  accent: '#38BDF8',
  accent2: '#7DD3FC',
  deep: '#0C4A6E',
}

function rng(seed) {
  let s = seed
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

const grid = (w, h) => `
  <defs>
    <pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="${C.line}" stroke-width="1" opacity=".55"/>
    </pattern>
    <linearGradient id="glow" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.deep}" stop-opacity=".55"/>
      <stop offset="1" stop-color="${C.bg}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.accent}" stop-opacity=".35"/>
      <stop offset="1" stop-color="${C.accent}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="${C.bg}"/>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>`

const badge = (x, y) => `
  <g transform="translate(${x} ${y})">
    <rect width="132" height="30" rx="15" fill="${C.surface}" stroke="${C.accent}" stroke-opacity=".6"/>
    <text x="66" y="20" text-anchor="middle" font-family="monospace" font-size="13" fill="${C.accent2}" letter-spacing="2">EXEMPLE</text>
  </g>`

function linePath(values, x, y, w, h) {
  const max = Math.max(...values),
    min = Math.min(...values)
  return values
    .map((v, i) => {
      const px = x + (i / (values.length - 1)) * w
      const py = y + h - ((v - min) / (max - min || 1)) * h
      return `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`
    })
    .join(' ')
}

function series(seed, n, base = 40) {
  const r = rng(seed)
  let v = base
  return Array.from({ length: n }, () => (v = Math.max(5, v + (r() - 0.38) * 18)))
}

function card(x, y, w, h, inner = '') {
  return `<g transform="translate(${x} ${y})"><rect width="${w}" height="${h}" rx="14" fill="${C.surface}" stroke="${C.line}"/>${inner}</g>`
}

function kpi(x, y, label, value, seed) {
  const s = series(seed, 12, 30)
  return card(
    x,
    y,
    250,
    120,
    `
    <text x="20" y="34" font-family="sans-serif" font-size="13" fill="${C.muted}">${label}</text>
    <text x="20" y="76" font-family="sans-serif" font-size="32" font-weight="700" fill="${C.text}">${value}</text>
    <path d="${linePath(s, 140, 50, 90, 40)}" fill="none" stroke="${C.accent}" stroke-width="2"/>`,
  )
}

function dashboard(seed, title) {
  const W = 1600,
    H = 1000
  const r = rng(seed)
  const s1 = series(seed, 24, 50),
    s2 = series(seed + 7, 24, 35)
  const bars = Array.from({ length: 8 }, () => 30 + r() * 150)
  const lineArea = `${linePath(s1, 60, 470, 860, 260)} L920 730 L60 730 Z`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${grid(W, H)}
  <text x="60" y="80" font-family="sans-serif" font-size="30" font-weight="700" fill="${C.text}">${title}</text>
  <text x="60" y="112" font-family="monospace" font-size="14" fill="${C.muted}">Données fictives · Fictional data</text>
  ${badge(W - 192, 58)}
  ${kpi(60, 160, 'Total', (12000 + r() * 9000).toFixed(0), seed + 1)}
  ${kpi(330, 160, 'Croissance', '+' + (5 + r() * 20).toFixed(1) + '%', seed + 2)}
  ${kpi(600, 160, 'Taux', (40 + r() * 50).toFixed(0) + '%', seed + 3)}
  ${kpi(870, 160, 'Moyenne', (100 + r() * 400).toFixed(0), seed + 4)}
  ${card(
    1140,
    160,
    400,
    290,
    `
    <text x="24" y="40" font-family="sans-serif" font-size="15" fill="${C.text}">Répartition</text>
    <circle cx="200" cy="165" r="80" fill="none" stroke="${C.line}" stroke-width="30"/>
    <circle cx="200" cy="165" r="80" fill="none" stroke="${C.accent}" stroke-width="30" stroke-dasharray="${(0.35 + r() * 0.3) * 502} 502" transform="rotate(-90 200 165)"/>
    <circle cx="200" cy="165" r="80" fill="none" stroke="${C.accent2}" stroke-opacity=".5" stroke-width="30" stroke-dasharray="${0.2 * 502} 502" stroke-dashoffset="-${0.68 * 502}" transform="rotate(-90 200 165)"/>`,
  )}
  ${card(60, 310, 1050, 450, `<text x="24" y="40" font-family="sans-serif" font-size="15" fill="${C.text}">Évolution mensuelle</text>`)}
  <path d="${lineArea}" transform="translate(60 0)" fill="url(#area)"/>
  <path d="${linePath(s1, 60, 470, 860, 260)}" transform="translate(60 0)" fill="none" stroke="${C.accent}" stroke-width="3"/>
  <path d="${linePath(s2, 60, 470, 860, 260)}" transform="translate(60 0)" fill="none" stroke="${C.muted}" stroke-width="2" stroke-dasharray="6 6"/>
  ${card(
    1140,
    480,
    400,
    280,
    `<text x="24" y="40" font-family="sans-serif" font-size="15" fill="${C.text}">Top catégories</text>
    ${bars
      .slice(0, 5)
      .map(
        (b, i) =>
          `<rect x="24" y="${66 + i * 40}" width="${b * 2}" height="18" rx="4" fill="${i === 0 ? C.accent : C.line}"/>`,
      )
      .join('')}`,
  )}
  ${card(
    60,
    790,
    1480,
    160,
    `<text x="24" y="40" font-family="sans-serif" font-size="15" fill="${C.text}">Par région</text>
    ${bars.map((b, i) => `<rect x="${40 + i * 180}" y="${140 - b * 0.55}" width="90" height="${b * 0.55}" rx="4" fill="${C.accent}" fill-opacity="${0.35 + i * 0.08}"/>`).join('')}`,
  )}
</svg>`
}

function webApp(seed, title, subtitle) {
  const W = 1600,
    H = 1000
  const r = rng(seed)
  const rows = Array.from(
    { length: 7 },
    (_, i) => `
    <g transform="translate(0 ${i * 58})">
      <rect x="0" y="0" width="1040" height="46" rx="8" fill="${i % 2 ? C.surface : C.bg}"/>
      <circle cx="28" cy="23" r="12" fill="${C.line}"/>
      <rect x="56" y="16" width="${140 + r() * 120}" height="14" rx="4" fill="${C.text}" fill-opacity=".75"/>
      <rect x="420" y="16" width="${80 + r() * 100}" height="14" rx="4" fill="${C.muted}" fill-opacity=".6"/>
      <rect x="880" y="12" width="110" height="22" rx="11" fill="${r() > 0.5 ? C.accent : C.line}" fill-opacity="${r() > 0.5 ? 0.25 : 1}"/>
    </g>`,
  ).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${grid(W, H)}
  <rect x="40" y="40" width="1520" height="920" rx="18" fill="${C.bg}" stroke="${C.line}"/>
  <rect x="40" y="40" width="1520" height="56" rx="18" fill="${C.surface}"/>
  <circle cx="76" cy="68" r="7" fill="${C.line}"/><circle cx="100" cy="68" r="7" fill="${C.line}"/><circle cx="124" cy="68" r="7" fill="${C.line}"/>
  <rect x="560" y="54" width="480" height="28" rx="14" fill="${C.bg}"/>
  <rect x="40" y="96" width="260" height="864" fill="${C.surface}"/>
  <rect x="72" y="130" width="40" height="40" rx="10" fill="${C.accent}"/>
  ${Array.from({ length: 6 }, (_, i) => `<rect x="72" y="${210 + i * 52}" width="${120 + r() * 60}" height="14" rx="4" fill="${i === 1 ? C.accent : C.muted}" fill-opacity="${i === 1 ? 1 : 0.5}"/>`).join('')}
  <text x="350" y="160" font-family="sans-serif" font-size="32" font-weight="700" fill="${C.text}">${title}</text>
  <text x="350" y="196" font-family="sans-serif" font-size="16" fill="${C.muted}">${subtitle}</text>
  ${badge(1380, 136)}
  ${[0, 1, 2]
    .map((i) =>
      card(
        350 + i * 360,
        230,
        330,
        130,
        `
    <text x="22" y="38" font-family="sans-serif" font-size="14" fill="${C.muted}">Indicateur ${i + 1}</text>
    <text x="22" y="88" font-family="sans-serif" font-size="36" font-weight="700" fill="${i === 0 ? C.accent : C.text}">${(r() * 900 + 100).toFixed(0)}</text>`,
      ),
    )
    .join('')}
  <g transform="translate(350 400)">${rows}</g>
  <rect x="1430" y="400" width="100" height="40" rx="10" fill="${C.accent}"/>
</svg>`
}

function mobile(seed, title) {
  const W = 1600,
    H = 1000
  const r = rng(seed)
  const phone = (x, screen) => `
    <g transform="translate(${x} 90)">
      <rect width="380" height="800" rx="56" fill="#05060A" stroke="${C.line}" stroke-width="3"/>
      <rect x="16" y="16" width="348" height="768" rx="44" fill="${C.surface}"/>
      <rect x="140" y="30" width="100" height="26" rx="13" fill="#05060A"/>
      ${screen}
    </g>`
  const list = Array.from(
    { length: 6 },
    (_, i) => `
      <rect x="40" y="${250 + i * 78}" width="300" height="64" rx="14" fill="${C.bg}"/>
      <circle cx="76" cy="${282 + i * 78}" r="16" fill="${i === 0 ? C.accent : C.line}"/>
      <rect x="104" y="${270 + i * 78}" width="${120 + r() * 80}" height="10" rx="4" fill="${C.text}" fill-opacity=".8"/>
      <rect x="104" y="${288 + i * 78}" width="${80 + r() * 60}" height="8" rx="4" fill="${C.muted}" fill-opacity=".6"/>`,
  ).join('')
  const form = Array.from(
    { length: 4 },
    (_, i) => `
      <rect x="40" y="${200 + i * 100}" width="80" height="10" rx="4" fill="${C.muted}"/>
      <rect x="40" y="${220 + i * 100}" width="300" height="50" rx="12" fill="${C.bg}" stroke="${i === 1 ? C.accent : C.line}"/>`,
  ).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${grid(W, H)}
  <text x="80" y="120" font-family="sans-serif" font-size="32" font-weight="700" fill="${C.text}">${title}</text>
  ${badge(80, 150)}
  ${phone(
    560,
    `<text x="40" y="130" font-family="sans-serif" font-size="24" font-weight="700" fill="${C.text}">Collectes</text>
      <rect x="40" y="160" width="300" height="60" rx="14" fill="${C.accent}" fill-opacity=".15" stroke="${C.accent}" stroke-opacity=".5"/>
      <text x="60" y="197" font-family="sans-serif" font-size="15" fill="${C.accent2}">Synchronisé · hors ligne OK</text>${list}`,
  )}
  ${phone(
    1000,
    `<text x="40" y="130" font-family="sans-serif" font-size="24" font-weight="700" fill="${C.text}">Nouveau formulaire</text>${form}
      <rect x="40" y="660" width="300" height="56" rx="16" fill="${C.accent}"/>`,
  )}
</svg>`
}

function rChart(seed, title) {
  const W = 1600,
    H = 1000
  const r = rng(seed)
  const pts = Array.from({ length: 140 }, () => {
    const x = r()
    return [x, Math.min(1, Math.max(0, 0.15 + x * 0.65 + (r() - 0.5) * 0.3))]
  })
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${grid(W, H)}
  <text x="80" y="100" font-family="sans-serif" font-size="30" font-weight="700" fill="${C.text}">${title}</text>
  <text x="80" y="134" font-family="monospace" font-size="14" fill="${C.muted}">ggplot2 · données simulées · simulated data</text>
  ${badge(1390, 76)}
  ${card(80, 180, 900, 740, '')}
  <g transform="translate(140 240)">
    <line x1="0" y1="620" x2="800" y2="620" stroke="${C.muted}"/><line x1="0" y1="0" x2="0" y2="620" stroke="${C.muted}"/>
    ${pts.map(([x, y]) => `<circle cx="${(x * 780).toFixed(1)}" cy="${(620 - y * 600).toFixed(1)}" r="5" fill="${C.accent}" fill-opacity=".55"/>`).join('')}
    <line x1="0" y1="${620 - 0.15 * 600}" x2="780" y2="${620 - 0.8 * 600}" stroke="${C.text}" stroke-width="3"/>
  </g>
  ${card(1020, 180, 500, 740, '')}
  <g transform="translate(1060 240)">
    ${Array.from({ length: 12 }, (_, i) => {
      const h = Math.exp(-((i - 5.5) ** 2) / 8) * 520 + r() * 30
      return `<rect x="${i * 36}" y="${620 - h}" width="30" height="${h}" fill="${C.accent}" fill-opacity="${0.3 + (h / 600) * 0.7}"/>`
    }).join('')}
    <line x1="0" y1="620" x2="430" y2="620" stroke="${C.muted}"/>
  </g>
</svg>`
}

function api(seed, title) {
  const W = 1600,
    H = 1000
  const lines = [
    ['GET', '/v1/orders?status=paid', '200', '38 ms'],
    ['POST', '/v1/payments', '201', '112 ms'],
    ['GET', '/v1/customers/42', '200', '21 ms'],
    ['PATCH', '/v1/orders/981', '200', '45 ms'],
    ['POST', '/v1/webhooks/provider', '202', '9 ms'],
    ['GET', '/v1/reports/daily', '200', '64 ms'],
    ['DELETE', '/v1/sessions/current', '204', '12 ms'],
  ]
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${grid(W, H)}
  <text x="80" y="110" font-family="sans-serif" font-size="32" font-weight="700" fill="${C.text}">${title}</text>
  ${badge(1390, 84)}
  ${card(
    80,
    170,
    860,
    760,
    `
    <rect width="860" height="54" rx="14" fill="${C.bg}"/>
    <text x="26" y="34" font-family="monospace" font-size="15" fill="${C.muted}">api-gateway · logs</text>
    ${lines
      .map(
        ([m, p, s, t], i) => `
      <text x="26" y="${110 + i * 82}" font-family="monospace" font-size="18" fill="${m === 'GET' ? C.accent : C.accent2}">${m}</text>
      <text x="130" y="${110 + i * 82}" font-family="monospace" font-size="18" fill="${C.text}">${p}</text>
      <text x="660" y="${110 + i * 82}" font-family="monospace" font-size="18" fill="${s.startsWith('2') ? '#4ADE80' : '#F87171'}">${s}</text>
      <text x="740" y="${110 + i * 82}" font-family="monospace" font-size="18" fill="${C.muted}">${t}</text>`,
      )
      .join('')}`,
  )}
  ${card(
    980,
    170,
    540,
    360,
    `
    <text x="26" y="44" font-family="sans-serif" font-size="16" fill="${C.text}">Latence p95 (ms)</text>
    <path d="${linePath(series(seed, 30, 60), 26, 80, 488, 240)}" fill="none" stroke="${C.accent}" stroke-width="3"/>`,
  )}
  ${card(
    980,
    560,
    540,
    370,
    `
    <text x="26" y="44" font-family="monospace" font-size="15" fill="${C.muted}">openapi.yaml</text>
    ${['paths:', '  /v1/orders:', '    get:', '      summary: List orders', '      security: [bearer]', '      responses:', "        '200': OrderList"].map((l, i) => `<text x="26" y="${96 + i * 36}" font-family="monospace" font-size="17" fill="${i % 3 === 0 ? C.accent2 : C.text}">${l}</text>`).join('')}`,
  )}
</svg>`
}

const files = {
  'ngo-platform-cover.svg': webApp(
    11,
    'Gestion de programmes',
    'Bénéficiaires, activités et rapports',
  ),
  'ngo-platform-dashboard.svg': dashboard(12, 'Suivi des programmes'),
  'field-app-cover.svg': mobile(21, 'Collecte terrain hors ligne'),
  'sales-dashboard-cover.svg': dashboard(31, 'Ventes &amp; performance commerciale'),
  'sales-dashboard-2.svg': dashboard(32, 'Analyse par région'),
  'survey-analysis-cover.svg': rChart(41, 'Analyse d’enquête — régression'),
  'survey-analysis-2.svg': rChart(42, 'Distribution des réponses'),
  'payments-api-cover.svg': api(51, 'API de commandes &amp; paiements'),
  'payments-api-admin.svg': webApp(52, 'Back-office', 'Commandes, clients et remboursements'),
}

for (const [name, svg] of Object.entries(files)) {
  writeFileSync(new URL(name, OUT), svg.replace(/\n\s+/g, '\n'))
}
console.log(`✓ ${Object.keys(files).length} sample visuals written to public/samples/`)
