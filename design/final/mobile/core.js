/* AradExperience · aplicația (mock) · nucleu: stare, router, randare, navbar, sheet, toast, hartă, componente comune */
const A = window.AX;
let S = A.get();
const UI = { sheet: null, toast: null, toastT: null, maps: [], tts: null, tmp: {} };
const ROUTES = [];
function route(pattern, fn, opts) { ROUTES.push({ pattern, fn, opts: opts || {}, parts: pattern.split('/') }); }
const esc = A.esc;
const ms = (name, cls) => `<span class="ms ${cls || ''}" aria-hidden="true">${name}</span>`;

/* ---------- navigare ---------- */
function parseHash() {
  const h = location.hash.replace(/^#/, '') || '/home';
  const [path, qs] = h.split('?');
  const q = {}; (qs || '').split('&').filter(Boolean).forEach(kv => { const [k, v] = kv.split('='); q[decodeURIComponent(k)] = decodeURIComponent(v || ''); });
  return { path: path.startsWith('/') ? path : '/' + path, q };
}
function match(path) {
  const seg = path.split('/');
  for (const r of ROUTES) {
    if (r.parts.length !== seg.length) continue;
    const params = {}; let ok = true;
    for (let i = 0; i < seg.length; i++) { if (r.parts[i].startsWith(':')) params[r.parts[i].slice(1)] = decodeURIComponent(seg[i]); else if (r.parts[i] !== seg[i]) { ok = false; break; } }
    if (ok) return { r, params };
  }
  return null;
}
const HIST = [];
function go(path, replace) { UI.sheet = null; if (!replace) HIST.push(location.hash.replace(/^#/, '') || '/home'); if (replace) location.replace('#' + path); else location.hash = '#' + path; }
function back() { const prev = HIST.pop(); UI.sheet = null; location.hash = '#' + (prev || '/home'); }
function toast(msg, icon) { UI.toast = { msg, icon }; clearTimeout(UI.toastT); UI.toastT = setTimeout(() => { UI.toast = null; render(); }, 2600); render(); }
function sheet(html) { UI.sheet = html; render(); }
function closeSheet() { UI.sheet = null; render(); }
function save() { A.save(); }

/* ---------- roluri și navbar ---------- */
const ROLE_LABEL = { visitor: 'Vizitator', local: 'Localnic', volunteer: 'Voluntar', business: 'Firmă locală', city: 'Primărie' };
function isStaff() { return S.role === 'business' || S.role === 'city'; }
function tabsFor() {
  if (S.role === 'volunteer') return [['/vol/actions', 'Acțiuni', 'event_available'], ['/vol/scan', 'Scanează', 'qr_code_scanner', true], ['/vol/messages', 'Mesaje', 'forum']];
  const t4 = isStaff() ? ['/panel', 'Panou', 'space_dashboard'] : ['/tickets', 'Bilete', 'confirmation_number'];
  return [['/home', 'Evenimente', 'calendar_month'], ['/chat', 'Chat', 'chat_bubble'], ['/map', 'Hartă', 'map', true], t4, ['/transport', 'Transport', 'tram']];
}
const TAB_OF = { '/home': '/home', '/search': '/home', '/event': '/home', '/offer': '/home', '/action': '/home', '/leaderboard': '/home', '/place': '/home', '/business': '/home', '/places': '/home', '/chat': '/chat', '/map': '/map', '/tickets': '/tickets', '/ticket': '/tickets', '/panel': '/panel', '/transport': '/transport', '/vol': null };
function activeTab(path) { const seg = '/' + path.split('/')[1]; if (path.startsWith('/vol/')) return path; return TAB_OF[seg] === undefined ? null : TAB_OF[seg]; }
function navBar(path) {
  const tabs = tabsFor(); const act = activeTab(path);
  const hasNew = S.tickets.some(t => !t.past) || S.claims.length || S.regs.length;
  return `<div class="navshade"></div><nav class="nav ${tabs.length === 3 ? 'three' : ''}" aria-label="Navigare">${tabs.map(([p, l, ic, mid]) => {
    const on = act === p || (p === '/home' && act === '/home');
    return `<button class="${mid ? 'mid' : ''} ${on ? 'on' : ''}" data-go="${p}" aria-current="${on ? 'page' : 'false'}"><span class="bub">${ms(ic)}${p === '/tickets' && hasNew && !on ? '<span class="dot"></span>' : ''}</span><span>${l}</span></button>`;
  }).join('')}</nav>`;
}
function statusBar(onImg) { return `<div class="status ${onImg ? 'onimg' : ''}"><span>${A.NOW}</span><span class="row" style="gap:5px">${ms('signal_cellular_alt')}${ms('wifi')}${ms('battery_full')}</span></div>`; }

/* ---------- randare ---------- */
function render() {
  const { path, q } = parseHash();
  if (q.role && ROLE_LABEL[q.role]) { S.role = q.role; if (q.role === 'volunteer' && !S.volId) S.volId = 'v1'; if (q.role !== 'visitor' && !S.user) S.user = { name: q.role === 'city' ? 'Ioana Marin' : q.role === 'business' ? 'Cafeneaua din Pasaj' : 'Ana P.', email: q.role === 'local' ? 'local@demo.ro' : q.role + '@demo.ro' }; if (q.role === 'visitor') S.user = null; save(); }
  if (q.dark) { S.dark = q.dark === '1'; save(); }
  if (q.mode) { S.homeMode = q.mode; save(); }
  document.documentElement.setAttribute('data-theme', S.dark ? 'dark' : 'light');
  UI.maps.forEach(m => { try { m.remove(); } catch (e) { } }); UI.maps = [];
  const m = match(path);
  const app = document.getElementById('app');
  if (!m) { app.innerHTML = statusBar() + `<div class="view"><div class="hd"><h1>Ecran lipsă</h1></div><p class="mut">${esc(path)}</p><button class="btn" data-go="/home" style="margin-top:16px">Acasă</button></div>`; return; }
  const out = m.r.fn(m.params, q) || {};
  const html = typeof out === 'string' ? { body: out } : out;
  const showNav = html.nav !== false;
  const isl = html.island ? `<div class="island live">${html.island}</div>` : '<div class="island"></div>';
  app.innerHTML = isl + (html.noStatus ? '' : statusBar(html.onImg)) + `<div class="view ${html.flush ? 'flush' : ''} ${showNav ? '' : 'nonav'}" id="view">${html.body}</div>` + (html.fixed || '') + (showNav ? navBar(path) : '') + (UI.sheet ? `<div class="scrim" data-act="closeSheet"></div><div class="sheet"><div class="grab"></div>${UI.sheet}</div>` : '') + (UI.toast ? `<div class="toast">${UI.toast.icon ? ms(UI.toast.icon) : ''}<span>${esc(UI.toast.msg)}</span></div>` : '') + '<div class="homebar"></div>';
  if (html.after) setTimeout(html.after, 0);
  renderDemo(path);
}
window.addEventListener('hashchange', render);
window.addEventListener('storage', e => { if (e.key === A.KEY) { S = A.load(); render(); } });

/* ---------- acțiuni delegate ---------- */
const ACT = {
  closeSheet() { closeSheet(); },
  back() { back(); },
  toast(arg) { toast(arg); },
  na() { toast('Nu este inclus în prototip.'); },
  share() { toast('Prototip: aici s-ar deschide meniul de distribuire.', 'ios_share'); },
  cal() { toast('Adăugat în calendar (.ics).', 'event_available'); },
  gmaps() { toast('Prototip: se deschide Google Maps cu destinația.', 'open_in_new'); },
  dark() { S.dark = !S.dark; save(); render(); },
  role(arg) { S.role = arg; if (arg === 'volunteer') { go('/vol/login'); return; } if (arg === 'visitor') S.user = null; else if (!S.user) S.user = { name: arg === 'city' ? 'Ioana Marin' : arg === 'business' ? 'Cafeneaua din Pasaj' : 'Ana P.', email: arg === 'local' ? 'local@demo.ro' : arg + '@demo.ro' }; save(); toast(`Acum folosești aplicația ca: ${ROLE_LABEL[arg]}.`); if (arg === 'business' || arg === 'city') go('/panel'); else go('/home'); },
  reset() { A.reset(); S = A.get(); HIST.length = 0; go('/lang'); toast('Prototip resetat.'); }
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-go],[data-act]');
  if (!el) return;
  if (el.dataset.go !== undefined) { e.preventDefault(); go(el.dataset.go); return; }
  const fn = ACT[el.dataset.act];
  if (fn) { e.preventDefault(); fn(el.dataset.arg, el); }
});
document.addEventListener('input', e => { const el = e.target.closest('[data-bind]'); if (el) { UI.tmp[el.dataset.bind] = el.value; const h = ACT['on_' + el.dataset.bind]; if (h) h(el.value, el); } });
document.addEventListener('keydown', e => { if (e.key === 'Enter') { const el = e.target.closest('[data-enter]'); if (el) { const fn = ACT[el.dataset.enter]; if (fn) fn(el.value, el); } } });

/* ---------- componente comune ---------- */
function img(src, tone) { return src ? `style="background-image:url('${src}')"` : `style="background:radial-gradient(120% 90% at 18% 8%, rgba(255,255,255,.22), transparent 55%), ${tone || '#777'}"`; }
function thumb(e) { return e.img ? `<div class="th" style="background-image:url('${e.img}')"></div>` : `<div class="th" style="background:${e.tone}">${e.emoji || ''}</div>`; }
function ticketBadge(e) {
  if (e.past) return `<span class="badge">Încheiat</span>`;
  if (e.ticket === 'FREE') return `<span class="badge">${ms('event_available', 'xs')} Gratuit${e.capacity ? ' · înscriere' : ' · fără bilet'}</span>`;
  if (e.ticket === 'EXTERNAL') return `<span class="badge ext">${ms('open_in_new', 'xs')} Pe site-ul organizatorului</span>`;
  const left = e.times ? e.times.reduce((s, t) => s + t.left, 0) : (e.capacity || 0) - (e.participants || 0);
  if (left <= 0) return `<span class="badge ink">Bilete epuizate</span>`;
  return `<span class="badge">${ms('confirmation_number', 'xs')} Bilete în aplicație</span>`;
}
function evCard(e) {
  const saved = S.saved.includes(e.id);
  const live = e.date === A.TODAY && e.time <= A.NOW && (e.end || '23:59') >= A.NOW;
  return `<button class="evcard" data-go="/event/${e.id}">
    <div class="img" ${img(e.img, e.tone)}>${e.img ? '' : (e.emoji || '')}
      <div class="tl">${live ? `<span class="badge live"><i></i>Acum · până la ${e.end}</span>` : ''}${A.isHot(e) && !live ? `<span class="badge hot">🔥 Popular · ${A.nf(e.participants || e.saves)} ${e.participants >= 50 ? 'participă' : 'au salvat'}</span>` : ''}${e.local ? '<span class="badge local">Făcut în Arad</span>' : ''}</div>
      <div class="tr"><span class="iconbtn glass" data-act="save" data-arg="${e.id}" role="button" aria-label="Salvează">${ms(saved ? 'bookmark' : 'bookmark_border', saved ? 'f' : '')}</span></div>
    </div>
    <div class="body"><div class="when">${A.whenLabel(e)}</div><h3>${esc(e.title)}</h3><div class="where">${esc(e.venue)} · ${A.km(e.dist)}</div><div class="foot">${ticketBadge(e)}${e.ticket === 'IN_APP' || (e.ticket === 'EXTERNAL' && e.priceFrom) ? `<span class="mut" style="font-size:14px">${A.priceLabel(e)}</span>` : ''}</div></div></button>`;
}
function evRow(e, extra) { return `<button class="evrow" data-go="/event/${e.id}">${thumb(e)}<div class="grow"><div class="when">${A.whenLabel(e)}</div><h3>${esc(e.title)}</h3><div class="mut" style="font-size:13px">${esc(e.venue)} · ${A.km(e.dist)}</div>${extra || `<div style="margin-top:6px">${ticketBadge(e)}</div>`}</div></button>`; }
function offerCard(o) {
  const b = A.allBiz().find(x => x.id === o.biz) || {};
  const tag = o.kind === 'event' ? `<span class="tag ev">Eveniment</span>` : o.kind === 'points' ? `<span class="tag pt">${o.pointsPrice} p</span>` : `<span class="tag">${esc(o.tag)}</span>`;
  const until = o.kind === 'event' ? (() => { const e = A.allEvents().find(x => x.id === o.eventId); return e ? `${A.dayLabel(e.date)} · ${e.time}` : ''; })() : o.validUntil ? `Valabilă până ${A.dayLabel(o.validUntil).toLowerCase()}` : 'Permanent';
  return `<button class="ofcard" data-go="/offer/${o.id}"><div class="img" style="background-image:url('${o.img}')">${tag}${b.local ? '<span class="local">🧺 Făcut în Arad</span>' : ''}</div>
    <div class="body"><div class="firm"><span>${esc(b.name)}</span><span>${b.rating} ★</span></div><h3>${esc(o.title)}</h3><div class="mut" style="font-size:13.5px">${A.km(b.dist || 0.3)} · ${until}${o.pointsPrice && o.kind !== 'points' ? ` · sau ${o.pointsPrice} de puncte` : ''}</div></div></button>`;
}
function actionCard(a) {
  const d = A.dayParts(a.date); const reg = S.regs.find(r => r.action === a.id);
  const going = (a.going || []); const more = Math.max(0, (a.taken || 0) - going.length);
  return `<button class="actcard" data-go="/action/${a.id}"><div class="img" ${img(a.img, a.tone)}><div class="datechip"><span>${d.dow}</span><b>${d.n}</b><span>${d.mon}</span></div><span class="ptsbadge">+${a.pts} puncte</span></div>
    <div class="body" style="padding:12px 16px 14px"><h3 style="font-size:18px">${esc(a.title)}</h3><div class="mut" style="font-size:13.5px;margin-top:3px">${a.time}–${a.end} · ${esc(a.place)}</div>
    ${reg ? `<div style="margin-top:8px"><span class="badge green">${ms('check_circle', 'xs')} ${reg.status === 'CONFIRMED' ? 'Prezență confirmată · +' + a.pts : 'Ești înscris · așteaptă validarea'}</span></div>` : `<div class="avs">${going.map(g => `<span><i>${g[0]}</i></span>`).join('')}<span style="margin-left:6px">${going.join(', ')}${more ? ` și încă ${more}` : ''} merg</span></div>`}</div></button>`;
}
function placeCard(p) { const n = p.guide ? p.guide.length : 0; return `<button class="pcard" data-go="/place/${p.id}"><div class="img" ${img(p.img, p.tone)}>${n ? `<span class="badge" style="position:absolute;left:8px;top:8px;background:var(--glass);font-size:11.5px;padding:3px 8px">${ms('headphones', 'xs')} Ghid · ${n} puncte</span>` : ''}</div><div class="body"><b>${esc(p.name)}</b><span>${esc(p.type)} · ${A.km(p.dist)}</span></div></button>`; }
function bizCard(b) { return `<button class="pcard" data-go="/business/${b.id}"><div class="img" style="background-image:url('${b.img}')">${b.local ? '<span class="badge local" style="position:absolute;left:8px;top:8px;font-size:11.5px;padding:3px 8px">Făcut în Arad</span>' : ''}</div><div class="body"><b>${esc(b.name)}</b><span>${esc(b.cat)} · ★ ${b.rating} (${b.reviews}) · ${A.km(b.dist)}</span></div></button>`; }
function backBtn(light) { return `<button class="iconbtn ${light ? 'glass' : ''}" data-act="back" aria-label="Înapoi">${ms('arrow_back')}</button>`; }
function pageHead(title, right) { return `<div class="hd back">${backBtn()}<h1 class="grow">${title}</h1>${right || ''}</div>`; }
function avatarBtn() { return S.user ? `<button class="av user" data-go="/profile" aria-label="Profil">${A.initials(S.user.name)}</button>` : `<button class="av" data-go="/profile" aria-label="Profil">${ms('person')}</button>`; }
function stars(n) { return '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n)); }
function qrBlock(code, size) { return `<div class="qr" style="width:${size || 200}px;margin:0 auto">${A.qrSvg(code, size || 200)}</div>`; }
function emptyState(icon, title, body, cta) { return `<div class="card pad" style="text-align:center;padding:36px 20px"><span class="ms" style="font-size:40px;color:var(--mut)">${icon}</span><h3 style="margin:12px 0 6px;font-size:18px">${title}</h3><p class="mut" style="font-size:14px">${body}</p>${cta || ''}</div>`; }

/* ---------- hartă (Leaflet, tile-uri gri Esri) ---------- */
function mkMap(id, opts) {
  const el = document.getElementById(id); if (!el || !window.L) return null;
  const o = Object.assign({ center: [A.CENTER.lat, A.CENTER.lng], zoom: 15, zoomControl: false, attributionControl: true }, opts || {});
  const map = L.map(el, { zoomControl: false, attributionControl: true }).setView(o.center, o.zoom);
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', { maxZoom: 16, attribution: 'Esri, HERE, Garmin, © OpenStreetMap contributors' }).addTo(map);
  UI.maps.push(map);
  if (o.me !== false) L.marker([A.CENTER.lat, A.CENTER.lng], { icon: L.divIcon({ className: '', html: '<div class="me-dot"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }), interactive: false }).addTo(map);
  return map;
}
function pinIcon(kind, label, sel) { return L.divIcon({ className: '', html: `<div class="pin ${kind} ${sel ? 'sel' : ''}">${label || ''}</div>`, iconSize: [26, 26], iconAnchor: [13, 13] }); }
function walkMin(km) { return Math.max(1, Math.round(km / 5 * 60)); }

/* ---------- panoul demo (desktop) ---------- */
function renderDemo(path) {
  const d = document.getElementById('demo'); if (!d) return;
  const roles = Object.entries(ROLE_LABEL);
  const groups = [
    ['Vizitator / Localnic', [['/lang', 'S0 Limba'], ['/login', 'S12 Login'], ['/home?mode=ev', 'S1 Acasă'], ['/home?mode=of', 'Oferte'], ['/home?mode=cm&role=local', 'Comunitate'], ['/search', 'S2 Căutare'], ['/event/ev4', 'S3 Eveniment'], ['/event/ev4/tickets', 'S4 Bilete'], ['/map', 'S7 Hartă'], ['/chat', 'S8 Chat'], ['/tickets', 'S9 Bilete'], ['/profile', 'S11 Profil'], ['/offer/o1', 'Ofertă'], ['/action/c1?role=local', 'Acțiune'], ['/leaderboard?role=local', 'Clasament'], ['/place/ca', 'E3 Ghid'], ['/plan', 'E1 Planificator'], ['/itinerary/it1', 'E2 Itinerar'], ['/itinerary/it1/map', 'E4 Hartă traseu'], ['/business/r2', 'Firmă'], ['/transport', 'Transport']]],
    ['Firmă / Primărie / Voluntar', [['/panel?role=business', 'Panou firmă'], ['/panel?role=city', 'Panou Primărie'], ['/vol/login', 'Voluntar · cod'], ['/vol/actions?role=volunteer', 'Voluntar · acțiuni'], ['/vol/scan?role=volunteer', 'Voluntar · scanner'], ['/vol/messages?role=volunteer', 'Voluntar · mesaje']]]
  ];
  d.innerHTML = `<div class="box"><div class="row" style="gap:8px;margin-bottom:6px"><span style="width:8px;height:8px;border-radius:50%;background:#FF5A36"></span><b>AradExperience</b></div><b style="font-size:16px">Aplicația · mock final</b><p>390 × 844 · Clean Ink · ceas: ${A.TODAY_LABEL}, ${A.NOW}. Ce publici din web (același browser) apare aici.</p></div>
  <div class="box"><h4>Rol</h4><div class="r">${roles.map(([k, l]) => `<button class="${S.role === k ? 'on' : ''}" data-act="role" data-arg="${k}">${l}</button>`).join('')}</div></div>
  ${groups.map(([t, items]) => `<div class="box"><h4>${t}</h4><div class="r">${items.map(([p, l]) => `<button class="${('#' + p).split('?')[0] === '#' + path ? 'on' : ''}" data-go="${p}">${l}</button>`).join('')}</div></div>`).join('')}
  <div class="box"><h4>Prototip</h4><div class="r"><button data-act="dark">${S.dark ? 'Mod luminos' : 'Mod întunecat'}</button><button data-act="reset">Resetează datele</button><a href="web.html" target="_blank" style="font-size:12px;font-weight:600;padding:6px 10px;border-radius:8px;border:1px solid #DDD;text-decoration:none">Deschide web ↗</a></div></div>`;
}

function boot() { if (!location.hash) location.replace(S.onboarded ? '#/home' : '#/lang'); render(); }
