// Generează V12_1__seed_transit.sql (T22) din exportul static al transportului public CTP Arad (Telelink).
// Folosire (din AradEx-Plan), o singură dată; aplicația NU descarcă nimic la pornire:
//   D=https://baditaflorin.github.io/arad-transport-open-data/data; mkdir -p /tmp/ctp
//   for f in stops routes patterns; do curl -sSo /tmp/ctp/$f.json $D/$f.json; done
//   node docs/tools/ctp-transit-seed.mjs /tmp/ctp ../AradEx-Backend/app/src/main/resources/db/migration/V12_1__seed_transit.sql
// V12_1 e pe main după merge: pentru un snapshot nou NU o rescrieți, faceți o migrare nouă.
// Traseele (encodedPolyline, precizie 5) se decodează, se simplifică (Douglas–Peucker, ~5 m) și se recodifică:
// aceeași formă pe hartă, de câteva ori mai puține puncte.
import fs from 'fs';
import path from 'path';

const [, , dir, outSql] = process.argv;
if (!dir || !outSql) throw new Error('node ctp-transit-seed.mjs <dir cu stops.json, routes.json, patterns.json> <out.sql>');
const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
const stops = read('stops.json');
const routes = read('routes.json');
const patterns = read('patterns.json');

const fixCedilla = (s) => s && s.replace(/ş/g, 'ș').replace(/Ş/g, 'Ș').replace(/ţ/g, 'ț').replace(/Ţ/g, 'Ț');
const q = (s) => (s == null || s === '' ? 'NULL' : `'${String(s).replace(/'/g, "''")}'`);
const color = (c) => (c ? q('#' + c.toLowerCase()) : 'NULL');
const num = (x, d) => Number(x.toFixed(d));

// --- polilinie Google (precizie 5) ---
function decode(str) {
  const pts = [];
  let i = 0, lat = 0, lng = 0;
  while (i < str.length) {
    for (const k of [0, 1]) {
      let shift = 0, result = 0, b;
      do { b = str.charCodeAt(i++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      const d = result & 1 ? ~(result >> 1) : result >> 1;
      if (k === 0) lat += d; else lng += d;
    }
    pts.push([lat / 1e5, lng / 1e5]);
  }
  return pts;
}
function encode(pts) {
  let out = '', pLat = 0, pLng = 0;
  const enc = (v) => {
    v = v < 0 ? ~(v << 1) : v << 1;
    let s = '';
    while (v >= 0x20) { s += String.fromCharCode((0x20 | (v & 0x1f)) + 63); v >>= 5; }
    return s + String.fromCharCode(v + 63);
  };
  for (const [la, ln] of pts) {
    const a = Math.round(la * 1e5), b = Math.round(ln * 1e5);
    out += enc(a - pLat) + enc(b - pLng);
    pLat = a; pLng = b;
  }
  return out;
}
// Douglas–Peucker în grade, cu longitudinea scalată (cos 46°): tol 0.00005° ≈ 5,5 m
const K = Math.cos((46.18 * Math.PI) / 180);
function simplify(pts, tol = 0.00005) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [s, e] = stack.pop();
    const [ay, ax0] = pts[s], [by, bx0] = pts[e];
    const ax = ax0 * K, bx = bx0 * K;
    let best = -1, bi = -1;
    for (let i = s + 1; i < e; i++) {
      const py = pts[i][0], px = pts[i][1] * K;
      const dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy;
      let t = len2 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
      t = Math.max(0, Math.min(1, t));
      const d = Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
      if (d > best) { best = d; bi = i; }
    }
    if (best > tol) { keep[bi] = 1; stack.push([s, bi], [bi, e]); }
  }
  return pts.filter((_, i) => keep[i]);
}

// --- verificări de bază ---
const stopIds = new Set(stops.map((s) => s.id));
const routeIds = new Set(routes.map((r) => r.id));
for (const p of patterns) {
  if (!routeIds.has(p.routeId)) throw new Error(`pattern ${p.patternId}: route ${p.routeId} lipsă`);
  for (const s of p.stopIds) if (!stopIds.has(s)) throw new Error(`pattern ${p.patternId}: stop ${s} lipsă`);
}

const sortedRoutes = [...routes].sort((a, b) => a.id - b.id);
const sortedStops = [...stops].sort((a, b) => a.id - b.id);
const sortedPatterns = [...patterns].sort((a, b) => a.routeId - b.routeId || a.index - b.index);

let before = 0, after = 0, stopRows = 0;
const lines = [];
lines.push('-- T22 · transport public CTP Arad: liniile, stațiile și variantele de traseu (snapshot 7 nov 2026).');
lines.push('-- GENERAT cu AradEx-Plan/docs/tools/ctp-transit-seed.mjs din https://baditaflorin.github.io/arad-transport-open-data/');
lines.push('-- (exportul API-ului public Telelink). Date: CTP Arad / Telelink — fără licență explicită, cu atribuire.');
lines.push('-- id-urile sunt cele din Telelink (routeId ≠ numărul afișat: routeId 13 = tramvaiul 3). Idempotent.');
lines.push('');
lines.push('INSERT INTO transit_routes (id, short_name, long_name, mode, color, text_color) VALUES');
lines.push(sortedRoutes.map((r) =>
  `  (${r.id}, ${q(r.shortName)}, ${q(fixCedilla(r.longName))}, ${q(r.mode === 'tram' || r.type === 0 ? 'TRAM' : 'BUS')}, ${color(r.color)}, ${color(r.textColor)})`).join(',\n'));
lines.push('ON CONFLICT (id) DO NOTHING;');
lines.push('');
lines.push('INSERT INTO transit_stops (id, name, code, lat, lng) VALUES');
lines.push(sortedStops.map((s) =>
  `  (${s.id}, ${q(fixCedilla(s.name).trim())}, ${q(s.code)}, ${num(s.latitude, 7)}, ${num(s.longitude, 7)})`).join(',\n'));
lines.push('ON CONFLICT (id) DO NOTHING;');
lines.push('');
lines.push('INSERT INTO transit_patterns (id, route_id, pattern_index, from_stop_id, to_stop_id, path) VALUES');
const pstops = [];
lines.push(sortedPatterns.map((p, i) => {
  const id = i + 1;
  const pts = p.encodedPolyline ? decode(p.encodedPolyline) : [];
  const simple = simplify(pts);
  before += pts.length; after += simple.length;
  p.stopIds.forEach((s, k) => pstops.push(`  (${id}, ${k + 1}, ${s})`));
  stopRows += p.stopIds.length;
  return `  (${id}, ${p.routeId}, ${p.index}, ${p.fromStopId ?? 'NULL'}, ${p.toStopId ?? 'NULL'}, ${q(encode(simple))})`;
}).join(',\n'));
lines.push('ON CONFLICT (route_id, pattern_index) DO NOTHING;');
lines.push('');
lines.push('INSERT INTO transit_pattern_stops (pattern_id, seq, stop_id) VALUES');
lines.push(pstops.join(',\n'));
lines.push('ON CONFLICT (pattern_id, seq) DO NOTHING;');
lines.push('');
lines.push("SELECT setval(pg_get_serial_sequence('transit_patterns', 'id'), (SELECT max(id) FROM transit_patterns));");
lines.push('');

fs.writeFileSync(outSql, lines.join('\n'));
const tram = routes.filter((r) => r.mode === 'tram' || r.type === 0).length;
console.log(`linii ${routes.length} (${tram} tramvai, ${routes.length - tram} autobuz) · stații ${stops.length} · variante ${patterns.length} · opriri ${stopRows} · puncte traseu ${before} → ${after}`);
