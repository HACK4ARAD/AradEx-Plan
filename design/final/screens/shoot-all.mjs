import { chromium } from 'playwright';
import fs from 'fs';
const OUT = '/Users/lukas/Documents/HACK4ARAD/AradEx-Mock/screens';
fs.mkdirSync(OUT + '/mobile', { recursive: true }); fs.mkdirSync(OUT + '/web', { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: true });
const M = [
 ['S0 Limba', '#/lang'], ['S12 Login', '#/login'], ['S1 Acasă · Evenimente (vizitator)', '#/home?mode=ev&role=visitor'], ['S1 Acasă · Evenimente (localnic)', '#/home?mode=ev&role=local'], ['S1b Oferte', '#/home?mode=of'], ['S1d Comunitate', '#/home?mode=cm&role=local'],
 ['S2 Căutare', '#/search'], ['S3 Detaliu eveniment', '#/event/ev4'], ['S4 Alege biletele', '#/event/ev4/tickets'], ['S5 Plată', '#/checkout'], ['S10 Bilet cu QR', '#/ticket/AX-T19-3907M'], ['S9 Biletele mele', '#/tickets'],
 ['S7 Hartă', '#/map'], ['S7b Hartă · traseu', '#/map?to=ev:ev4'], ['S8 Chat', '#/chat'], ['S11 Profil', '#/profile'],
 ['Ofertă · detaliu', '#/offer/o1'], ['Acțiune comunitară', '#/action/c1'], ['Clasament + recompense', '#/leaderboard'], ['Locuri din Arad', '#/places'], ['E3 Ghid virtual', '#/place/ca'], ['Pagina firmei', '#/business/r2'],
 ['E1 Planificator', '#/plan'], ['Itinerariile tale', '#/itineraries'], ['E2 Itinerar', '#/itinerary/it1'], ['E4 Harta traseului', '#/itinerary/it1/map'],
 ['Transport', '#/transport'], ['Transport · plan de drum', '#/transport?to=gara'], ['Transport · linia 1', '#/transport/line/1/0'], ['Transport · călătorie pe hartă', '#/transport/trip/gara'],
 ['Panou firmă (teren)', '#/panel?role=business'], ['Primărie · validare pe teren', '#/panel?role=city'], ['Voluntar · cod', '#/vol/login'], ['Voluntar · acțiuni', '#/vol/actions?role=volunteer'], ['Voluntar · scanner', '#/vol/scan'], ['Voluntar · mesaje', '#/vol/messages']
];
const W = [
 ['W0 Login / conturi', '#/login'], ['W1 Landing', '#/?role=visitor'], ['W5 Evenimente', '#/events'], ['W6 Detaliu eveniment + bilete', '#/events/ev4'], ['W7 Obiective', '#/places'], ['W8 Ghid virtual', '#/places/ca'], ['W9 Hartă', '#/map'], ['W10 Planificator', '#/plan'], ['W11 Oferte', '#/offers?role=local'], ['W12 Comunitate', '#/community'], ['W13 Chat', '#/chat'], ['W14 Contul meu', '#/account'], ['W15 Pagina firmei', '#/businesses/r2'],
 ['Primărie · Panou', '#/city?role=city'], ['Primărie · Evenimente', '#/city/events'], ['Primărie · Eveniment nou', '#/city/events/new'], ['Primărie · Acțiuni comunitare', '#/city/actions'], ['Primărie · Acțiune nouă', '#/city/actions/new'], ['Primărie · Validare participanți', '#/city/validate'], ['Primărie · Voluntari', '#/city/volunteers'], ['Primărie · Voluntar nou', '#/city/volunteers/new'], ['Primărie · Mesaje', '#/city/messages'], ['Primărie · Clasament', '#/city/leaderboard'], ['Primărie · Firme partenere', '#/city/partners'], ['Primărie · Firmă nouă', '#/city/partners/new'], ['Primărie · Obiective & ghiduri', '#/city/places'],
 ['Admin · Dashboard', '#/admin?role=admin'], ['Admin · Conținut & moderare', '#/admin/content'], ['Admin · Utilizatori', '#/admin/users'],
 ['Firmă · Panou', '#/business?role=business'], ['Firmă · Oferte', '#/business/offers'], ['Firmă · Ofertă nouă', '#/business/offers/new'], ['Firmă · Evenimente', '#/business/events'], ['Firmă · Anunțuri', '#/business/announcements'], ['Firmă · Validează coduri', '#/business/codes'], ['Firmă · Recenzii', '#/business/reviews'], ['Firmă · Profilul firmei', '#/business/profile']
];
const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// mobile
let p = await b.newPage({ viewport: { width: 1100, height: 950 }, deviceScaleFactor: 2 });
await p.goto('http://127.0.0.1:8766/mock/mobile.html#/lang'); await p.waitForTimeout(1500);
await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(1200);
const mfiles = [];
for (let i = 0; i < M.length; i++) { const [label, h] = M[i]; await p.evaluate(x => { location.hash = x; }, h); await p.waitForTimeout(/map|trip|transport/.test(h) ? 2600 : 900); if (h === '#/checkout') { await p.evaluate(() => { location.hash = '#/event/ev4/tickets'; }); await p.waitForTimeout(500); await p.evaluate(() => { location.hash = '#/checkout'; }); await p.waitForTimeout(700); } const file = `${String(i + 1).padStart(2, '0')}-${slug(label)}.png`; await (await p.$('.screen')).screenshot({ path: `${OUT}/mobile/${file}` }); mfiles.push([label, file]); }
await p.close();
// web
p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
await p.goto('http://127.0.0.1:8766/mock/web.html#/?shot=1'); await p.waitForTimeout(1500); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(1200);
const wfiles = [];
for (let i = 0; i < W.length; i++) { const [label, h] = W[i]; const hh = h + (h.includes('?') ? '&' : '?') + 'shot=1'; await p.evaluate(x => { location.hash = x; }, hh); await p.waitForTimeout(/map|places|plan|\/\?|events\/ev|businesses|community/.test(h) ? 2600 : 900); const file = `${String(i + 1).padStart(2, '0')}-${slug(label)}.png`; await p.screenshot({ path: `${OUT}/web/${file}`, fullPage: !/map|chat|plan/.test(h) }); wfiles.push([label, file]); }
await p.close();
fs.writeFileSync(OUT + '/index.json', JSON.stringify({ mobile: mfiles, web: wfiles }, null, 1));
// contact sheets
const sheet = (title, items, dir, cols, w) => `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:#E9E9E4;font-family:Inter,system-ui,sans-serif;padding:40px}h1{font-size:34px;margin:0 0 6px;letter-spacing:-.02em}.sub{color:#555;margin-bottom:28px;font-size:15px}.g{display:grid;grid-template-columns:repeat(${cols},${w}px);gap:28px 22px}.it b{display:block;font-size:14px;margin:0 0 8px}.it img{width:${w}px;display:block;border-radius:${cols > 2 ? 28 : 10}px;box-shadow:0 10px 30px rgba(0,0,0,.14);background:#fff}</style></head><body><h1>${title}</h1><div class="sub">AradExperience · mock final · ${items.length} ecrane · ${new Date().toLocaleDateString('ro-RO')}</div><div class="g">${items.map(([l, f], i) => `<div class="it"><b>${i + 1}. ${l}</b><img src="${dir}/${f}"></div>`).join('')}</div></body></html>`;
fs.writeFileSync(OUT + '/sheet-mobile.html', sheet('Aplicația (mobil) · toate ecranele', mfiles, 'mobile', 6, 300));
fs.writeFileSync(OUT + '/sheet-web.html', sheet('Web · site public + panouri (Primărie, Admin, Firmă)', wfiles, 'web', 2, 1180));
for (const [name, ww] of [['sheet-mobile', 2060], ['sheet-web', 2480]]) { const pg = await b.newPage({ viewport: { width: ww, height: 1000 }, deviceScaleFactor: 1 }); await pg.goto(`http://127.0.0.1:8766/mock/screens/${name}.html`); await pg.waitForTimeout(2500); await pg.screenshot({ path: `${OUT}/${name}.png`, fullPage: true }); await pg.close(); }
console.log('done', mfiles.length, wfiles.length);
await b.close();
