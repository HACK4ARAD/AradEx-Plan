/* AradExperience · web (mock) · nucleu: stare, router, două layout-uri (site public / panou), componente, hartă, bară demo */
const A = window.AX;
let S = A.get();
const UI = { toast: null, toastT: null, drawer: null, maps: [], tmp: {}, form: {} };
const ROUTES = [];
const esc = A.esc;
const ms = (name, cls) => `<span class="ms ${cls || ''}" aria-hidden="true">${name}</span>`;
function route(pattern, fn, opts) { ROUTES.push({ pattern, fn, opts: opts || {}, parts: pattern.split('/') }); }
function parseHash() { const h = location.hash.replace(/^#/, '') || '/'; const [path, qs] = h.split('?'); const q = {}; (qs || '').split('&').filter(Boolean).forEach(kv => { const [k, v] = kv.split('='); q[decodeURIComponent(k)] = decodeURIComponent(v || ''); }); return { path: path.startsWith('/') ? path : '/' + path, q }; }
function match(path) { const seg = path.split('/'); for (const r of ROUTES) { if (r.parts.length !== seg.length) continue; const params = {}; let ok = true; for (let i = 0; i < seg.length; i++) { if (r.parts[i].startsWith(':')) params[r.parts[i].slice(1)] = decodeURIComponent(seg[i]); else if (r.parts[i] !== seg[i]) { ok = false; break; } } if (ok) return { r, params }; } return null; }
function go(path) { UI.drawer = null; location.hash = '#' + path; }
function toast(msg, icon) { UI.toast = { msg, icon }; clearTimeout(UI.toastT); UI.toastT = setTimeout(() => { UI.toast = null; renderOverlay(); }, 2800); renderOverlay(); }
function drawer(html) { UI.drawer = html; renderOverlay(); }
function closeDrawer() { UI.drawer = null; renderOverlay(); }
function save() { A.save(); }
const isPanel = p => /^\/(city|admin|business)(\/|$)/.test(p);
const PANEL_LABEL = { city: 'Primăria Arad', admin: 'Administrare', business: 'Firmă parteneră' };
function firm() { return A.allBiz().find(b => b.id === S.firmId) || A.BIZ[0]; }
function userName() { return S.user ? S.user.name : null; }

/* ---------- randare ---------- */
function render() {
  const { path, q } = parseHash();
  if (q.role) { if (['city', 'admin', 'business'].includes(q.role)) S.adminRole = q.role; if (q.role === 'local') { S.user = { name: 'Ana P.', email: 'local@demo.ro' }; S.role = 'local'; } if (q.role === 'visitor') { S.user = null; S.role = 'visitor'; } save(); }
  if (q.firm) { S.firmId = q.firm; save(); }
  if (q.shot) document.body.classList.add('shot');
  UI.maps.forEach(m => { try { m.remove(); } catch (e) { } }); UI.maps = [];
  const m = match(path); const app = document.getElementById('app');
  const out = m ? (m.r.fn(m.params, q) || {}) : { title: 'Pagină lipsă', body: `<div class="empty">${ms('error')}Nu există pagina ${esc(path)}.</div>` };
  const html = typeof out === 'string' ? { body: out } : out;
  document.body.className = isPanel(path) ? 'panel' : (path === '/login' ? 'panel login-page' : '');
  if (q.shot) document.body.classList.add('shot');
  if (isPanel(path)) app.innerHTML = panelLayout(path, html); else if (path === '/login') app.innerHTML = html.body; else app.innerHTML = publicLayout(path, html);
  document.title = (html.title ? html.title + ' · ' : '') + 'AradExperience';
  renderOverlay(); renderDemo(path);
  if (html.after) setTimeout(html.after, 0);
  window.scrollTo(0, 0);
}
function renderOverlay() { document.getElementById('overlay').innerHTML = (UI.drawer ? `<div class="drawer-scrim" data-act="closeDrawer"></div><div class="drawer">${UI.drawer}</div>` : '') + (UI.toast ? `<div class="toast">${UI.toast.icon ? ms(UI.toast.icon) : ''}<span>${esc(UI.toast.msg)}</span></div>` : ''); }
window.addEventListener('hashchange', render);
window.addEventListener('storage', e => { if (e.key === A.KEY) { S = A.load(); render(); } });
document.addEventListener('click', e => { const el = e.target.closest('[data-go],[data-act]'); if (!el) return; if (el.dataset.go !== undefined) { e.preventDefault(); go(el.dataset.go); return; } const fn = ACT[el.dataset.act]; if (fn) { e.preventDefault(); fn(el.dataset.arg, el); } });
document.addEventListener('input', e => { const el = e.target.closest('[data-bind]'); if (el) { const k = el.dataset.bind; if (k.startsWith('form.')) UI.form[k.slice(5)] = el.type === 'checkbox' ? el.checked : el.value; else UI.tmp[k] = el.value; const h = ACT['on_' + k.replace('.', '_')]; if (h) h(el.value, el); if (k.startsWith('form.')) { const pv = document.getElementById('preview'); if (pv && UI.previewFn) pv.innerHTML = UI.previewFn(); } } });
document.addEventListener('change', e => { const el = e.target.closest('select[data-bind]'); if (el) { const k = el.dataset.bind; if (k.startsWith('form.')) UI.form[k.slice(5)] = el.value; else UI.tmp[k] = el.value; const pv = document.getElementById('preview'); if (pv && UI.previewFn) pv.innerHTML = UI.previewFn(); } });
document.addEventListener('keydown', e => { if (e.key === 'Enter') { const el = e.target.closest('[data-enter]'); if (el) { const fn = ACT[el.dataset.enter]; if (fn) fn(el.value, el); } } if (e.key === 'Escape' && UI.drawer) closeDrawer(); });

const ACT = {
  closeDrawer() { closeDrawer(); },
  toast(a) { toast(a); },
  na() { toast('Nu este inclus în prototip.'); },
  cal() { toast('Fișier .ics descărcat. Link și pentru Google Calendar.', 'event_available'); },
  share() { toast('Link copiat.', 'link'); },
  gmaps() { toast('Se deschide Google Maps cu destinația.', 'open_in_new'); },
  reset() { A.reset(); S = A.get(); toast('Prototip resetat.'); render(); },
  switchRole(a) { if (a === 'public') { go('/'); return; } S.adminRole = a; save(); go(a === 'business' ? '/business' : a === 'admin' ? '/admin' : '/city'); },
  loginAs(a) { const map = { visitor: ['visitor', 'John S.', 'visitor@demo.ro'], local: ['local', 'Ana P.', 'local@demo.ro'] }; const [role, name, email] = map[a]; S.role = role; S.user = { name, email }; save(); toast(`Bun venit, ${name}!`, 'check_circle'); go('/'); },
  logout() { S.user = null; S.role = 'visitor'; save(); toast('Te-ai deconectat.'); go('/'); }
};

/* ---------- layout site public ---------- */
const PUB_NAV = [['/events', 'Evenimente'], ['/map', 'Hartă'], ['/offers', 'Oferte'], ['/community', 'Comunitate'], ['/places', 'Obiective']];
function publicLayout(path, html) {
  const u = S.user;
  return `<header class="topnav"><a class="brand" href="#/"><i></i>AradExperience</a><nav>${PUB_NAV.map(([p, l]) => `<a href="#${p}" class="${path.startsWith(p) ? 'on' : ''}">${l}</a>`).join('')}</nav><span class="sp"></span>
    <button class="chip sm" data-act="na">${ms('language', 'xs')} RO</button>
    ${u ? `<a class="chip sm" href="#/account" style="text-decoration:none"><span class="avatar dark" style="width:22px;height:22px;font-size:10px">${A.initials(u.name)}</span>${esc(u.name)}${S.role === 'local' ? ` <span class="badge pts" style="font-size:11px">${S.points} p</span>` : ''}</a>` : `<a class="chip sm" href="#/login" style="text-decoration:none">Conectare</a>`}
    <a class="btn sm" href="#/plan">${ms('auto_awesome', 'xs')} Planifică-ți vizita</a></header>
    <main class="pub">${html.body}</main>`;
}

/* ---------- layout panou ---------- */
function panelNav(path) {
  const role = S.adminRole || 'city';
  const regsPending = A.allRegs().filter(r => r.status === 'PENDING').length; const toVerify = A.allBiz().filter(b => !b.verified).length; const unread = Object.values(S.msgs).reduce((s, arr) => s + arr.filter(m => m.from === 'vol').length, 0);
  let groups;
  if (role === 'business') groups = [['', [['/business', 'Panou', 'space_dashboard'], ['/business/offers', 'Oferte', 'sell'], ['/business/events', 'Evenimente', 'calendar_month'], ['/business/announcements', 'Anunțuri', 'campaign'], ['/business/codes', 'Validează coduri', 'qr_code_scanner'], ['/business/reviews', 'Recenzii', 'reviews'], ['/business/profile', 'Profilul firmei', 'storefront']]]];
  else {
    groups = [['General', [[role === 'admin' ? '/admin' : '/city', role === 'admin' ? 'Dashboard' : 'Panou', 'space_dashboard'], ['/city/events', 'Evenimente', 'calendar_month'], ['/city/places', 'Obiective & ghiduri', 'headphones']]],
      ['Comunitate', [['/city/actions', 'Acțiuni comunitare', 'volunteer_activism'], ['/city/validate', 'Validare', 'fact_check', regsPending], ['/city/volunteers', 'Voluntari', 'badge'], ['/city/messages', 'Mesaje', 'forum', unread], ['/city/leaderboard', 'Clasament', 'emoji_events']]],
      ['Parteneri', [['/city/partners', 'Firme partenere', 'storefront', toVerify]]]];
    if (role === 'admin') groups.push(['Administrare', [['/admin/content', 'Conținut & moderare', 'rule_folder'], ['/admin/users', 'Utilizatori', 'group'], ['/admin/settings', 'Setări', 'settings']]]);
  }
  return groups.map(([g, items]) => (g ? `<div class="grp">${g}</div>` : '') + items.map(([p, l, ic, cnt]) => `<a class="nav-i ${path === p || (p !== '/city' && p !== '/admin' && p !== '/business' && path.startsWith(p)) ? 'on' : ''}" href="#${p}">${ms(ic)}${l}${cnt ? `<span class="cnt">${cnt}</span>` : ''}</a>`).join('')).join('');
}
function panelLayout(path, html) {
  const role = S.adminRole || 'city'; const f = firm();
  const org = role === 'business' ? { av: `<span class="av" style="background:${f.color}">${ms('storefront', 's')}</span>`, name: f.name, sub: f.verified ? 'Cont de firmă verificat' : 'În așteptarea verificării' } : role === 'admin' ? { av: `<span class="av" style="background:#2A2A30">${ms('shield_person', 's')}</span>`, name: 'Administrare', sub: 'admin@demo.ro · platformă' } : { av: `<span class="av" style="background:#2A2A30">${ms('account_balance', 's')}</span>`, name: 'Primăria Arad', sub: 'Administrator complet' };
  const me = role === 'business' ? [f.contact, 'Administrator firmă'] : role === 'admin' ? ['Zoltán K.', 'Lead tehnic'] : ['Ioana Marin', 'Coordonator'];
  const crumbs = (html.crumbs || [org.name, html.title || 'Panou']).map((c, i, arr) => i === arr.length - 1 ? `<b>${esc(c)}</b>` : `<span>${esc(c)}</span>${ms('chevron_right', 'xs')}`).join('');
  return `<div class="layout"><aside class="side"><a class="brand" href="#/"><span class="logo">${ms('location_city', 's')}</span><span><b>AradExperience</b><small>${role === 'business' ? 'Panou firmă' : 'Admin'}</small></span></a>
      <button class="orgsw" data-go="/login">${org.av}<span class="grow"><b>${esc(org.name)}</b><span>${org.sub}</span></span>${ms('unfold_more', 's')}</button>
      ${panelNav(path)}<div class="grow"></div>
      <a class="nav-i" href="#/" >${ms('public')}Site public ${ms('arrow_outward', 'xs')}</a><a class="nav-i" href="mobile.html" target="_blank">${ms('smartphone')}Deschide aplicația ${ms('arrow_outward', 'xs')}</a>
      <div class="me"><span class="av">${A.initials(me[0])}</span><span class="grow"><b>${me[0]}</b><span>${me[1]}</span></span><button data-go="/login" title="Schimbă contul">${ms('logout', 's')}</button></div></aside>
    <div class="main"><div class="topbar"><div class="crumbs">${crumbs}</div><div class="asearch">${ms('search', 's')}<input placeholder="Caută în pagina asta…"><kbd>/</kbd></div><button class="iconbtn" data-act="na">${ms('notifications', 's')}<i></i></button></div><div class="content">${html.body}</div></div></div>`;
}

/* ---------- componente ---------- */
function tone(e) { return `background:radial-gradient(120% 90% at 18% 8%, rgba(255,255,255,.22), transparent 55%), ${e.tone || '#777'}`; }
function imgStyle(e) { return e.img ? `background-image:url('${e.img}')` : tone(e); }
function thumbW(e) { return `<div class="thumb" style="${imgStyle(e)}">${e.img ? '' : (e.emoji || '')}</div>`; }
function evCardW(e, small) {
  const live = e.date === A.TODAY && e.time <= A.NOW && (e.end || '23:59') >= A.NOW;
  return `<a class="evc" href="#/events/${e.id}"><div class="img" style="${imgStyle(e)};${small ? 'height:120px' : ''}">${e.img ? '' : (e.emoji || '')}<div class="tl">${live ? `<span class="badge" style="background:#fff">● Acum · până la ${e.end}</span>` : A.isHot(e) ? `<span class="badge hot">🔥 ${A.nf(e.participants || e.saves)} ${e.participants >= 50 ? 'participă' : 'au salvat'}</span>` : e.ticket === 'FREE' ? '<span class="badge free">Gratuit</span>' : e.ticket === 'EXTERNAL' ? '<span class="badge" style="background:#fff">Extern</span>' : ''}${e.local ? '<span class="badge local">Făcut în Arad</span>' : ''}</div></div><div class="body"><b>${esc(e.title)}</b><span>${A.whenLabel(e)} · ${esc(e.venue)}${e.ticket !== 'FREE' ? ' · ' + A.priceLabel(e) : ''}</span></div></a>`;
}
function offerCardW(o) { const b = A.allBiz().find(x => x.id === o.biz) || {}; const claim = S.claims.find(c => c.offerId === o.id); return `<div class="evc"><div class="img" style="background-image:url('${o.img}');height:130px"><div class="tl"><span class="badge ${o.kind === 'event' ? 'acc' : o.kind === 'points' ? 'pts' : ''}" style="${o.kind === 'offer' ? 'background:#FFC244' : ''}">${o.kind === 'event' ? 'Eveniment' : o.kind === 'points' ? o.pointsPrice + ' p' : esc(o.tag)}</span>${b.local ? '<span class="badge local">Făcut în Arad</span>' : ''}</div></div><div class="body"><b>${esc(o.title)}</b><span>${esc(b.name)} · ★ ${b.rating} · ${A.km(b.dist || .3)}</span><div style="margin-top:10px" class="row">${o.kind === 'event' ? `<a class="btn sm" href="#/events/${o.eventId}">Rezervă</a>` : claim ? `<button class="btn sm soft" data-act="offerCode" data-arg="${o.id}">${ms('qr_code_2', 'xs')} Codul meu</button>` : o.onlyPoints ? `<button class="btn sm green" data-act="claim" data-arg="${o.id}:pts" ${S.role === 'local' && S.points >= o.pointsPrice ? '' : 'disabled'}>Plătește ${o.pointsPrice} p</button>` : `<button class="btn sm" data-act="claim" data-arg="${o.id}">Revendică</button>`}${o.pointsPrice && !o.onlyPoints && o.kind !== 'event' ? `<span class="badge pts">sau ${o.pointsPrice} p</span>` : ''}</div></div></div>`; }
function pill(status) { const m = { PUBLISHED: ['p-ok', 'Publicat'], DRAFT: ['p-mut', 'Ciornă'], HIDDEN: ['p-warn', 'Ascuns'], SCHEDULED: ['p-warn', 'Programată'], ACTIVE: ['p-ok', 'Activ'], SUSPENDED: ['p-bad', 'Suspendat'], CONFIRMED: ['p-ok', 'Confirmat'], PENDING: ['p-warn', 'În așteptare'], NO_SHOW: ['p-bad', 'Respins'], USED: ['p-mut', 'Folosit'], ISSUED: ['p-ok', 'Activ'], EXPIRED: ['p-mut', 'Expirată'] }; const [c, l] = m[status] || ['p-mut', status]; return `<span class="pill ${c}"><i></i>${l}</span>`; }
function spark(vals, color) { const w = 100, h = 34, max = Math.max(...vals), min = Math.min(...vals); const pts = vals.map((v, i) => `${(i / (vals.length - 1) * w).toFixed(1)},${(h - 4 - (max === min ? h / 2 : (v - min) / (max - min) * (h - 8))).toFixed(1)}`); return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polyline points="${pts.join(' ')} ${w},${h} 0,${h}" fill="${color}" opacity=".12" stroke="none"/><polyline points="${pts.join(' ')}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/></svg>`; }
function kpi(icon, label, value, delta, vals, color) { return `<div class="kpi"><div class="l">${ms(icon)} ${label}</div><div class="v">${value}${delta ? `<span class="delta">${delta}</span>` : ''}</div>${vals ? spark(vals, color || '#2F7D32') : ''}</div>`; }
function empty(icon, title, sub) { return `<div class="empty">${ms(icon)}<b>${title}</b><div style="margin-top:4px;font-size:13px">${sub || ''}</div></div>`; }
function stars(n) { return '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n)); }
function avatarW(name, dark) { return `<span class="avatar ${dark ? 'dark' : ''}">${A.initials(name)}</span>`; }
function qrW(code, size) { return `<div class="qr" style="width:${size || 140}px">${A.qrSvg(code, size || 140)}</div>`; }

/* ---------- hartă ---------- */
function mkMap(id, opts) { const el = document.getElementById(id); if (!el || !window.L) return null; const o = Object.assign({ center: [A.CENTER.lat, A.CENTER.lng], zoom: 15 }, opts || {}); const map = L.map(el, { zoomControl: o.zoomControl !== false, attributionControl: true }).setView(o.center, o.zoom); L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', { maxZoom: 16, attribution: 'Esri, HERE, Garmin, © OpenStreetMap contributors' }).addTo(map); UI.maps.push(map); if (o.me !== false) L.marker([A.CENTER.lat, A.CENTER.lng], { icon: L.divIcon({ className: '', html: '<div class="me-dot"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }), interactive: false }).addTo(map); return map; }
function pinIcon(kind, label, sel) { return L.divIcon({ className: '', html: `<div class="pin ${kind} ${sel ? 'sel' : ''}">${label || ''}</div>`, iconSize: [24, 24], iconAnchor: [12, 12] }); }
function addPins(map, items, onSel, selKey) { items.forEach(it => { L.marker([it.lat, it.lng], { icon: pinIcon(it.pin, it.label, selKey === it.key) }).addTo(map).on('click', () => onSel && onSel(it)); }); }

/* ---------- formular generic cu previzualizare ---------- */
function field(label, name, type, extra) {
  const v = UI.form[name] != null ? UI.form[name] : (extra && extra.value != null ? extra.value : ''); if (UI.form[name] == null && extra && extra.value != null) UI.form[name] = extra.value;
  const hint = extra && extra.hint ? `<div class="h">${extra.hint}</div>` : '';
  if (type === 'select') return `<div class="f"><label>${label}</label><select class="in" data-bind="form.${name}">${extra.options.map(o => `<option value="${esc(o[0])}" ${String(v) === String(o[0]) ? 'selected' : ''}>${esc(o[1])}</option>`).join('')}</select>${hint}</div>`;
  if (type === 'textarea') return `<div class="f"><label>${label}</label><textarea class="in" data-bind="form.${name}" placeholder="${esc(extra && extra.ph || '')}">${esc(v)}</textarea>${hint}</div>`;
  if (type === 'seg') return `<div class="f"><label>${label}</label><div class="fseg">${extra.options.map(o => `<button type="button" class="${String(v) === String(o[0]) ? 'on' : ''}" data-act="fseg" data-arg="${name}:${o[0]}">${o[1]}</button>`).join('')}</div>${hint}</div>`;
  if (type === 'chips') return `<div class="f"><label>${label}</label><div class="chips">${extra.options.map(o => `<button type="button" class="chip sm ${String(v) === String(o[0]) ? 'on' : ''}" data-act="fseg" data-arg="${name}:${o[0]}">${o[1]}</button>`).join('')}</div>${hint}</div>`;
  if (type === 'toggle') return `<button type="button" class="toggle ${v ? 'on' : ''}" data-act="ftoggle" data-arg="${name}"><span><b style="font-size:13.5px">${label}</b>${hint}</span><span class="sw2"></span></button>`;
  if (type === 'checks') return `<div class="f"><label>${label}</label><div class="checks">${extra.options.map(o => { const on = (UI.form[name] || []).includes(o[0]); return `<button type="button" class="check ${on ? 'on' : ''}" data-act="fcheck" data-arg="${name}:${o[0]}"><span class="bx">${on ? ms('check', 'xs') : ''}</span><span><b style="font-size:13px">${esc(o[1])}</b>${o[2] ? `<br><span class="h">${esc(o[2])}</span>` : ''}</span></button>`; }).join('')}</div></div>`;
  if (type === 'swatches') return `<div class="f"><label>${label}</label><div class="swatches">${extra.options.map(c => `<button type="button" class="sw ${v === c ? 'on' : ''}" style="background:${c}" data-act="fseg" data-arg="${name}:${c}"></button>`).join('')}</div></div>`;
  if (type === 'drop') return `<div class="f"><label>${label}</label><div class="drop"><div class="pv" style="${v ? `background-image:url('${v}')` : ''}">${v ? '' : ms('image')}</div><div class="grow"><b style="font-size:13.5px">${v ? 'Poză aleasă' : 'Adaugă o poză'}</b><div class="h">JPG sau PNG. O decupăm automat la 720×450 pentru card.</div></div><button type="button" class="btn sm sec" data-act="fpick" data-arg="${name}">${ms('upload', 'xs')} Alege fișier</button></div></div>`;
  return `<div class="f"><label>${label}</label><input class="in" type="${type || 'text'}" data-bind="form.${name}" value="${esc(v)}" placeholder="${esc(extra && extra.ph || '')}" ${extra && extra.attrs || ''}>${hint}</div>`;
}
ACT.fseg = a => { const i = a.indexOf(':'); UI.form[a.slice(0, i)] = a.slice(i + 1); render(); };
ACT.ftoggle = a => { UI.form[a] = !UI.form[a]; render(); };
ACT.fcheck = a => { const [k, v] = a.split(':'); const arr = UI.form[k] = UI.form[k] || []; const i = arr.indexOf(v); i >= 0 ? arr.splice(i, 1) : arr.push(v); render(); };
ACT.fpick = a => { const pics = ['shared/img/oferta-cafea.jpg', 'shared/img/oferta-prajitura.jpg', 'shared/img/loc-cappuccino.jpg', 'shared/img/actiune-plantare-copaci.jpg', 'shared/img/loc-gradina-restaurant.jpg']; const cur = pics.indexOf(UI.form[a]); UI.form[a] = pics[(cur + 1) % pics.length]; toast('Prototip: poză din galeria demo (decupată la 720×450).', 'image'); render(); };
function phonePreview(inner, cap) { return `<div class="phone-pv"><div class="scr"><div class="cap">${cap || 'Așa apare în aplicație'}</div><div id="preview">${inner}</div></div></div>`; }

/* ---------- bară demo ---------- */
function renderDemo(path) {
  let d = document.getElementById('demo'); if (!d) { d = document.createElement('div'); d.id = 'demo'; d.className = 'demo'; document.body.appendChild(d); }
  const role = isPanel(path) ? (S.adminRole || 'city') : 'public';
  const pages = role === 'public' ? [['/', 'Landing'], ['/events', 'Evenimente'], ['/events/ev4', 'Detaliu'], ['/places', 'Obiective'], ['/places/ca', 'Ghid'], ['/map', 'Hartă'], ['/plan', 'Planificator'], ['/offers', 'Oferte'], ['/community', 'Comunitate'], ['/chat', 'Chat'], ['/account', 'Contul meu'], ['/businesses/r2', 'Firmă'], ['/login', 'Login']]
    : role === 'business' ? [['/business', 'Panou'], ['/business/offers', 'Oferte'], ['/business/offers/new', 'Ofertă nouă'], ['/business/events', 'Evenimente'], ['/business/announcements', 'Anunțuri'], ['/business/codes', 'Coduri'], ['/business/reviews', 'Recenzii'], ['/business/profile', 'Profil']]
      : [[role === 'admin' ? '/admin' : '/city', 'Panou'], ['/city/events', 'Evenimente'], ['/city/events/new', 'Eveniment nou'], ['/city/actions', 'Acțiuni'], ['/city/actions/new', 'Acțiune nouă'], ['/city/validate', 'Validare'], ['/city/volunteers', 'Voluntari'], ['/city/volunteers/new', 'Voluntar nou'], ['/city/messages', 'Mesaje'], ['/city/leaderboard', 'Clasament'], ['/city/partners', 'Firme'], ['/city/partners/new', 'Firmă nouă'], ['/city/places', 'Obiective']].concat(role === 'admin' ? [['/admin/content', 'Conținut'], ['/admin/users', 'Utilizatori']] : []);
  d.innerHTML = `<b>Demo</b><span class="sep"></span>${[['public', 'Site public'], ['city', 'Primăria'], ['business', 'Firmă'], ['admin', 'Admin']].map(([k, l]) => `<button class="${role === k ? 'on' : ''}" data-act="switchRole" data-arg="${k}">${l}</button>`).join('')}<span class="sep"></span>${pages.map(([p, l]) => `<a href="#${p}" style="${p === path ? 'background:#333;color:#fff' : ''}">${l}</a>`).join('')}<span class="sep"></span>${role === 'public' ? (S.user ? `<button data-act="logout">Deconectare (${esc(S.user.name)})</button>` : `<button data-act="loginAs" data-arg="local">Intră ca Ana P. (localnic)</button>`) : ''}<button data-act="reset">Resetează</button><a href="mobile.html" target="_blank">Aplicația ↗</a>`;
}
function boot() { if (!location.hash) location.replace('#/'); render(); }
