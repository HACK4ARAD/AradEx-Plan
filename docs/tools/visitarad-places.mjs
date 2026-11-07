// Folosire (din AradEx-Plan): curl -o /tmp/locations.json https://baditaflorin.github.io/hack4arad-turism-arad/data/locations.json
//   node docs/tools/visitarad-places.mjs /tmp/locations.json ../AradEx-Backend/app/src/main/resources/db/migration/V3_2__places_visitarad.sql /tmp/anexa-a.md
// V3_2 e deja pe main după merge: pentru schimbări NU o rescrieți, faceți o migrare nouă (ex. un V3_3 cu cazarea).
// Generează V3_2__places_visitarad.sql din exportul visitarad.ro (Hack4Arad) + un rezumat pentru ARAD-DATA.md.
// node gen.mjs <locations.json> <out.sql> <summary.md>
import fs from 'fs';

const [, , inFile, outSql, outMd] = process.argv;
const all = JSON.parse(fs.readFileSync(inFile, 'utf8'));

const fixCedilla = (s) => s && s.replace(/ş/g, 'ș').replace(/Ş/g, 'Ș').replace(/ţ/g, 'ț').replace(/Ţ/g, 'Ț');
const deburr = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const norm = (s) => deburr(fixCedilla(s)).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const slugify = (s) => norm(s).replace(/ /g, '-').slice(0, 150);
const q = (s) => (s == null ? 'NULL' : `'${String(s).replace(/'/g, "''")}'`);
const dollar = (s) => { if (s.includes('$$')) throw new Error('$$ in text'); return `$$${s}$$`; };

function cleanName(n) {
  n = fixCedilla(n).trim().replace(/\s+/g, ' ');
  n = n.replace(/,,/g, '„').replace(/[“"]/g, (m, i, str) => (str.slice(0, i).includes('„') ? '”' : '„'));
  n = n.replace(/”(\S)/g, '” $1');
  if (n.includes('„') && !n.includes('”')) n += '”';
  if (/^Despre stațiunea Moneasa$/i.test(n)) n = 'Stațiunea Moneasa';
  if (/^Despre Drumul Vinului$/i.test(n)) n = 'Drumul Vinului Miniș–Măderat';
  if (/^Despre plaja Ghioroc$/i.test(n)) n = 'Plaja Ghioroc';
  return n;
}
function cleanText(t) {
  if (!t) return null;
  t = fixCedilla(t).replace(/\r/g, '').replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  // sursa a scos telefoanele: „[telefon pe fișa sursă]” → scoatem fraza
  t = t.split(/(?<=[.!?])\s+/).filter((s) => !s.includes('[telefon pe fișa sursă]') && !/\[email/.test(s)).join(' ');
  t = t.replace(/ ,/g, ',').replace(/ \./g, '.').trim();
  return t || null;
}
function cleanAddress(a) {
  if (!a) return null;
  a = fixCedilla(a).replace(/\s+/g, ' ').replace(/,,/g, ',').replace(/, *$/, '').trim();
  // „..., Arad, Arad” / „Arad, Romania, Arad”
  a = a.replace(/, Romania(?=,)/i, '').replace(/(, ([^,]+)), \2$/, '$1');
  return a;
}

// ---- cele 12 obiective existente (V3_1) ← fișele visitarad care le descriu (nu se mai inserează separat)
const MERGED = {
  43: 1, 22: 2, 60: 2, 180: 3, 7: 4, 19: 5, 11: 6, 27: 7, 62: 8, 137: 10, 184: 11, 331: 11, 329: 11, 21: 12,
};
const SKIP = new Set([328]); // „Despre plaja Ghioroc” = același loc cu Lacul Ghioroc

const TYPE_BY_CAT = {
  'Muzee și Case memoriale': 'MUSEUM',
  'Biserici': 'ATTRACTION', 'Clădiri reprezentative': 'ATTRACTION', 'Monumente': 'ATTRACTION',
  'Cetăți și castele': 'ATTRACTION', 'Vestigii arheologice': 'ATTRACTION',
  'Formațiuni naturale': 'NATURE', 'Lacul Ghioroc': 'NATURE', 'Parcul Natural Lunca Mureșului': 'NATURE',
  'Ștranduri': 'PARK', 'Băile Lipova': 'PARK', 'Agrement și relaxare': 'PARK',
  'Teatru': 'VENUE', 'Cinema': 'VENUE', 'Clubbing': 'VENUE',
  'Restaurant': 'RESTAURANT', 'Bistro': 'RESTAURANT', 'Pizzerie': 'RESTAURANT', 'Pub': 'RESTAURANT', 'Fast food': 'RESTAURANT',
  'Cafenea': 'CAFE', 'Cofetărie': 'CAFE',
  'Crama': 'WINERY',
};
function typeOf(x) {
  const n = x.name.toLowerCase();
  if (TYPE_BY_CAT[x.category]) {
    if (x.category === 'Agrement și relaxare' && /lac/.test(n)) return 'NATURE';
    return TYPE_BY_CAT[x.category];
  }
  // categorii „zonă”: Drumul Vinului, Moneasa, Săgeata Verde, Obiective turistice
  if (/muzeu|casa memorial|colec/.test(n)) return 'MUSEUM';
  if (/cram|pivni/.test(n)) return 'WINERY';
  if (/ștrand|strand|băile|baile/.test(n)) return 'PARK';
  if (/lac|parc|arbor|peșter|belvedere|via ferrata|stațiunea|drumul vinului|plaja/.test(n)) return 'NATURE';
  return 'ATTRACTION';
}
const VISIT = { ATTRACTION: 20, MUSEUM: 60, VENUE: 90, WINERY: 90, NATURE: 90, PARK: 60, RESTAURANT: 60, CAFE: 30 };
function visitOf(x, type) {
  const c = x.category;
  if (c === 'Monumente' || c === 'Clădiri reprezentative') return 10;
  if (c === 'Biserici') return 20;
  if (c === 'Cetăți și castele') return 45;
  if (c === 'Vestigii arheologice') return 30;
  if (/stațiunea|drumul vinului|via ferrata/i.test(x.name)) return 180;
  return VISIT[type];
}
function tagsOf(x, type) {
  const c = x.category; const n = x.name.toLowerCase(); const t = new Set();
  const add = (...a) => a.forEach((v) => t.add(v));
  if (c === 'Biserici' || /biseric|mănăstir|catedral|schit|basilic|sinagog/.test(n)) add('spiritual', 'arhitectura');
  if (c === 'Clădiri reprezentative') add('arhitectura', 'istorie', 'foto');
  if (c === 'Monumente') add('istorie', 'foto');
  if (c === 'Cetăți și castele' || /cetat|castel/.test(n)) add('istorie', 'arhitectura', 'foto');
  if (c === 'Vestigii arheologice' || /ruin|sit/.test(n)) add('istorie');
  if (type === 'MUSEUM') add('muzee', 'istorie');
  if (/artă|arta|caricatur|pian|sculptur/.test(n)) add('arta');
  if (/etnograf|satului|moșu/.test(n)) add('traditii');
  if (type === 'WINERY' || /vin/.test(n) || c === 'Obiective turistice de pe Drumul Vinului') add('vin');
  if (type === 'WINERY') add('gastronomie');
  if (type === 'NATURE') add('natura', 'in-aer-liber');
  if (c === 'Stațiunea Moneasa' || x.area?.startsWith('Munții')) add('munte');
  if (c === 'Săgeata Verde' || /tramvai/.test(n)) add('transport', 'istorie');
  if (type === 'PARK') add('relaxare', 'familie');
  if (/zoo|pony/.test(n)) add('familie', 'animale');
  if (type === 'VENUE') add(c === 'Clubbing' ? 'viata-de-noapte' : 'cultura');
  if (type === 'RESTAURANT') add('gastronomie');
  if (c === 'Pub') add('viata-de-noapte');
  if (c === 'Cafenea') add('cafea');
  if (c === 'Cofetărie') add('dulciuri', 'cafea');
  if (x.locality !== 'Arad') add('judet');
  return [...t].join(',');
}
const SINGULAR = {
  Restaurant: 'Restaurant', Bistro: 'Bistro', Pizzerie: 'Pizzerie', Pub: 'Pub', 'Fast food': 'Fast-food',
  Cafenea: 'Cafenea', Cofetărie: 'Cofetărie', Crama: 'Cramă', Clubbing: 'Club', Cinema: 'Cinematograf',
  Ștranduri: 'Ștrand', 'Agrement și relaxare': 'Loc de agrement',
};
function descOf(x, addr) {
  const d = cleanText(x.description);
  if (d) return d;
  const what = SINGULAR[x.category] || 'Obiectiv';
  return `${what} în ${x.locality === 'Arad' ? 'Arad' : `${x.locality}, județul Arad`}${addr ? `, ${addr.replace(/, ?Arad$/, '')}` : ''}. Program și detalii pe fișa visitarad.ro.`;
}

// ---- selecție + deduplicare (același nume normalizat = aceeași fișă dublată pe site)
const candidates = all.filter((x) => x.type !== 'Cazare' && !MERGED[x.id] && !SKIP.has(x.id));
const groups = new Map();
for (const x of candidates) {
  const k = norm(cleanName(x.name)).replace(/^(muzeul|biserica|crama) /, '$1 ');
  const key = `${k}`;
  const prev = groups.get(key);
  const score = (y) => (y.category === 'Obiective turistice de pe Drumul Vinului' ? 0 : 1000) + (y.description?.length || 0);
  if (!prev || score(x) > score(prev)) groups.set(key, x);
}
let rows = [...groups.values()];
const dropped = candidates.length - rows.length;

// ordinea din listă (fără `near` = după id): orașul întâi, apoi județul; în fiecare: obiective, agrement, gastronomie
const ORDER = ['ATTRACTION', 'MUSEUM', 'NATURE', 'PARK', 'VENUE', 'WINERY', 'CAFE', 'RESTAURANT'];
const CAT_ORDER = ['Cetăți și castele', 'Muzee și Case memoriale', 'Clădiri reprezentative', 'Biserici', 'Monumente'];
rows = rows.map((x) => ({ x, type: typeOf(x) }));
rows.sort((a, b) =>
  (a.x.locality === 'Arad' ? 0 : 1) - (b.x.locality === 'Arad' ? 0 : 1)
  || ORDER.indexOf(a.type) - ORDER.indexOf(b.type)
  || ((CAT_ORDER.indexOf(a.x.category) + 99) % 99) - ((CAT_ORDER.indexOf(b.x.category) + 99) % 99)
  || a.x.id - b.x.id);

const EXISTING_SLUGS = new Set(['cetatea-aradului', 'palatul-cultural', 'teatrul-clasic-ioan-slavici', 'palatul-administrativ', 'biserica-rosie', 'catedrala-sfanta-treime', 'catedrala-sf-anton', 'turnul-de-apa', 'faleza-muresului', 'lunca-muresului-ceala', 'podgoria-minis', 'castelul-macea']);
const used = new Set(EXISTING_SLUGS);
const CREDIT = 'Foto și date: CNIPT Arad / visitarad.ro';

const values = rows.map(({ x, type }) => {
  const name = cleanName(x.name);
  let slug = slugify(name);
  if (used.has(slug)) slug = slugify(`${name} ${x.locality}`);
  if (used.has(slug)) slug = `${slug}-${x.id}`;
  used.add(slug);
  const addr = cleanAddress(x.address);
  const r = { id: x.id, name, slug, type, addr, desc: descOf(x, addr), lat: x.latitude, lng: x.longitude, img: x.photos?.[0] || null, visit: visitOf(x, type), tags: tagsOf(x, type), src: x.source_url, cat: x.category, loc: x.locality };
  if (r.img && r.img.length > 500) r.img = null;
  return r;
});

const byType = {}; for (const v of values) byType[v.type] = (byType[v.type] || 0) + 1;

// ---- SQL
const sql = [];
sql.push(`-- V3_2 (T05, date reale): obiectivele, agrementul și gastronomia din județul Arad, din exportul visitarad.ro
-- făcut pentru Hack4Arad (https://baditaflorin.github.io/hack4arad-turism-arad/, colectat 2026-11-03).
-- Atribuire obligatorie: „Date: CNIPT Arad / visitarad.ro” (în image_credit) + source_url pe fiecare rând.
-- CNIPT (3 nov 2026): informațiile de pe site sunt publice și pot fi preluate; fără licență formală — pozele rămân ale CNIPT,
-- le legăm direct de pe visitarad.ro (nu le copiem în repo). Detalii și limitări: AradEx-Plan/docs/ARAD-DATA.md.
--
-- 1) coloana source_url (fișa sursă);
-- 2) corecții la cele 12 obiective din V3_1: coordonatele verificate pe OpenStreetMap + visitarad (erau deplasate
--    150 m – 4 km), o frază greșită din ghid (Parcul Reconcilierii nu e în spatele Primăriei) și poza pentru Podgoria Miniș.
--    Fiecare UPDATE se aplică doar dacă rândul are încă valoarea din seed (nu suprascrie editările Primăriei);
-- 3) ${values.length} locuri noi (fără cazare: nu avem tip pentru ea; ${dropped} fișe dublate pe site au fost unite). Id-urile vin
--    din secvență (după cele 12), idempotent prin slug.
`);
sql.push(`ALTER TABLE places ADD COLUMN IF NOT EXISTS source_url VARCHAR(300);  -- fișa sursă (visitarad.ro), pentru atribuire\n`);

// corecțiile pentru cele 12
const FIX = [
  // id, slug, oldLat, oldLng, newLat, newLng, source_url
  [1, 'cetatea-aradului', 46.1711, 21.3319, 46.1709, 21.3326, 'https://www.visitarad.ro/ro/harta-locatie/43-cetatea-aradului'],
  [2, 'palatul-cultural', 46.1757, 21.3171, 46.1742, 21.3207, 'https://www.visitarad.ro/ro/harta-locatie/22-palatul-cultural'],
  [3, 'teatrul-clasic-ioan-slavici', 46.1726, 21.3153, 46.1711, 21.3158, 'https://www.visitarad.ro/ro/harta-locatie/180-teatru-de-stat-ioan-slavici'],
  [4, 'palatul-administrativ', 46.1768, 21.3145, 46.1754, 21.3193, 'https://www.visitarad.ro/ro/harta-locatie/7-palatul-administrativ'],
  [5, 'biserica-rosie', 46.1740, 21.3160, 46.1774, 21.3202, 'https://www.visitarad.ro/ro/harta-locatie/19-biserica-lutherana'],
  [6, 'catedrala-sfanta-treime', 46.1692, 21.3182, 46.1836, 21.3247, 'https://www.visitarad.ro/ro/harta-locatie/11-catedrala-ortodoxa-noua-podgoria'],
  [7, 'catedrala-sf-anton', 46.1752, 21.3151, 46.1726, 21.3154, 'https://www.visitarad.ro/ro/harta-locatie/27-biserica-sfantul-anton-de-padova'],
  [8, 'turnul-de-apa', 46.1792, 21.3118, 46.1697, 21.3080, 'https://www.visitarad.ro/ro/harta-locatie/62-galeriile-turnul-de-apa'],
  [9, 'faleza-muresului', 46.1745, 21.3215, 46.1745, 21.3215, null],
  [10, 'lunca-muresului-ceala', 46.1900, 21.2650, 46.1579, 21.2734, 'https://www.visitarad.ro/ro/harta-locatie/137-parcul-natural-lunca-muresului'],
  [11, 'podgoria-minis', 46.1370, 21.6050, 46.1378, 21.6048, 'https://www.visitarad.ro/ro/harta-locatie/329-despre-drumul-vinului'],
  [12, 'castelul-macea', 46.3860, 21.3167, 46.3844, 21.3104, 'https://www.visitarad.ro/ro/harta-locatie/21-castelul-cernovici'],
];
// verificăm că URL-urile sursă sunt chiar cele din export
for (const f of FIX) if (f[6]) {
  const vid = +f[6].match(/locatie\/(\d+)-/)[1];
  const rec = all.find((y) => y.id === vid);
  if (!rec || rec.source_url !== f[6]) throw new Error(`source_url greșit pentru ${f[1]}: ${rec?.source_url}`);
}
sql.push(`-- 2) cele 12 obiective din V3_1`);
sql.push(`UPDATE places p SET lat = v.new_lat, lng = v.new_lng
FROM (VALUES
${FIX.filter((f) => f[2] !== f[4] || f[3] !== f[5]).map((f) => `  (${f[0]}, '${f[1]}', ${f[2].toFixed(4)}, ${f[3].toFixed(4)}, ${f[4].toFixed(4)}, ${f[5].toFixed(4)})`).join(',\n')}
) AS v(id, slug, old_lat, old_lng, new_lat, new_lng)
WHERE p.id = v.id AND p.slug = v.slug AND p.lat = v.old_lat AND p.lng = v.old_lng;
`);
sql.push(`UPDATE places p SET source_url = v.url
FROM (VALUES
${FIX.filter((f) => f[6]).map((f) => `  (${f[0]}, '${f[1]}', '${f[6]}')`).join(',\n')}
) AS v(id, slug, url)
WHERE p.id = v.id AND p.slug = v.slug AND p.source_url IS NULL;
`);
// punctele de ghid: (place_id, position, old, new)
const GP = [
  [1, 1, 46.1685, 21.3290, 46.1622, 21.3325], // Monumentul celor 13 Generali (Piața 13 Martiri)
  [1, 2, 46.1700, 21.3300, 46.1650, 21.3315], // valul și șanțul, dinspre Subcetate
  [1, 3, 46.1711, 21.3319, 46.1709, 21.3326],
  [1, 4, 46.1711, 21.3319, 46.1709, 21.3326],
  [1, 5, 46.1730, 21.3290, 46.1709, 21.3326],
  ...[1, 2, 3, 4].map((n) => [2, n, 46.1757, 21.3171, 46.1742, 21.3207]),
  [3, 1, 46.1726, 21.3153, 46.1711, 21.3158], [3, 2, 46.1726, 21.3153, 46.1711, 21.3158],
  [3, 3, 46.1722, 21.3158, 46.1701, 21.3162], // Piața Avram Iancu
  [4, 1, 46.1768, 21.3145, 46.1754, 21.3193],
  [4, 2, 46.1760, 21.3150, 46.1753, 21.3180], // în fața Primăriei, spre bulevard (statuia lui Vasile Goldiș)
  [4, 3, 46.1775, 21.3135, 46.1754, 21.3193],
  [5, 1, 46.1740, 21.3160, 46.1774, 21.3202], [5, 2, 46.1740, 21.3160, 46.1774, 21.3202],
  [6, 1, 46.1692, 21.3182, 46.1836, 21.3247],
  [6, 2, 46.1690, 21.3180, 46.1832, 21.3240],
  [7, 1, 46.1752, 21.3151, 46.1726, 21.3154],
  [8, 1, 46.1792, 21.3118, 46.1697, 21.3080], [8, 2, 46.1792, 21.3118, 46.1697, 21.3080],
  [9, 2, 46.1738, 21.3250, 46.1603, 21.3223], // Podul Traian
  [10, 1, 46.1900, 21.2650, 46.1579, 21.2734], [10, 2, 46.1900, 21.2650, 46.1579, 21.2734],
  [11, 1, 46.1370, 21.6050, 46.1378, 21.6048], [11, 2, 46.1370, 21.6050, 46.1378, 21.6048],
  [12, 1, 46.3860, 21.3167, 46.3844, 21.3104],
  [12, 2, 46.3860, 21.3167, 46.3817, 21.3054], // Grădina Botanică
  [12, 3, 46.3860, 21.3167, 46.3844, 21.3104],
];
sql.push(`UPDATE guide_points g SET lat = v.new_lat, lng = v.new_lng
FROM (VALUES
${GP.map((g) => `  (${g[0]}, ${g[1]}, ${g[2].toFixed(4)}, ${g[3].toFixed(4)}, ${g[4].toFixed(4)}, ${g[5].toFixed(4)})`).join(',\n')}
) AS v(place_id, position, old_lat, old_lng, new_lat, new_lng)
WHERE g.place_id = v.place_id AND g.position = v.position AND g.lat = v.old_lat AND g.lng = v.old_lng;
`);
sql.push(`-- Parcul Reconcilierii e la ~900 m spre sud-vest, lângă Turnul de Apă (OSM + visitarad), nu în spatele Primăriei.
UPDATE guide_points
SET text = replace(text, 'În spatele palatului se află Parcul Reconcilierii, iar în apropiere Turnul de Apă.',
                         'La zece minute de mers spre sud-vest ajungeți în Parcul Reconcilierii, cu Statuia Libertății și Arcul de Triumf, iar chiar lângă el se află Turnul de Apă.'),
    title = 'Vitraliile și drumul spre Parcul Reconcilierii'
WHERE place_id = 4 AND position = 3 AND text LIKE '%În spatele palatului se află Parcul Reconcilierii%';

UPDATE places SET parking_hint = 'Parcările cu plată de pe Bd. Revoluției și din străzile din jurul Palatului'
WHERE id = 4 AND parking_hint = 'Parcarea din spatele Palatului / Parcul Reconcilierii';

-- Podgoria Miniș n-avea poză liberă: poza Muzeului Viei și al Vinului de pe visitarad.ro
UPDATE places SET image_url = ${q(all.find((y) => y.id === 184).photos[0])}, image_credit = '${CREDIT}'
WHERE id = 11 AND image_url IS NULL;
`);

sql.push(`-- 3) locurile noi: ${Object.entries(byType).map(([k, v]) => `${k} ${v}`).join(', ')}
INSERT INTO places (name, slug, type, description, address, lat, lng, image_url, image_credit, visit_minutes, tags, source_url) VALUES`);
sql.push(values.map((v) => `(${q(v.name)}, ${q(v.slug)}, '${v.type}',\n ${dollar(v.desc)},\n ${q(v.addr)}, ${v.lat.toFixed(6)}, ${v.lng.toFixed(6)}, ${q(v.img)}, ${v.img ? q(CREDIT) : 'NULL'}, ${v.visit}, ${q(v.tags)}, ${q(v.src)})`).join(',\n'));
sql.push(`ON CONFLICT (slug) DO NOTHING;\n`);
fs.writeFileSync(outSql, sql.join('\n'), 'utf8');

// ---- rezumat pentru docs
const md = [];
md.push(`Total: ${values.length} locuri noi — ${Object.entries(byType).map(([k, v]) => `${k} ${v}`).join(' · ')}; ${values.filter((v) => v.loc === 'Arad').length} în municipiul Arad, ${values.filter((v) => v.loc !== 'Arad').length} în județ.\n`);
md.push('| visitarad id | Nume | Tip | Localitate | Categorie pe site |');
md.push('|---|---|---|---|---|');
for (const v of values) md.push(`| [${v.id}](${v.src}) | ${v.name} | ${v.type} | ${v.loc} | ${v.cat} |`);
fs.writeFileSync(outMd, md.join('\n'), 'utf8');
console.log('rows', values.length, byType, 'dropped dups', dropped, 'noDesc→generated', values.filter((v) => v.desc.endsWith('fișa visitarad.ro.')).length);
