/* Ecrane A: limbă, login, acasă (Evenimente · Oferte · Comunitate), căutare + filtre, eveniment, bilete (S4–S6, S9, S10), hartă, chat, profil, salvate */

/* ---------- S0 Limba ---------- */
route('/lang', () => ({ nav: false, body: `
  <div style="padding-top:26px" class="row"><span style="width:10px;height:10px;border-radius:50%;background:var(--acc)"></span><b>AradExperience</b></div>
  <div style="margin-top:56px"><h1 style="font-size:36px">Bun venit<br>Welcome<br>Üdvözöljük</h1><p class="mut" style="margin-top:16px;font-size:16px">Alege limba aplicației. O poți schimba oricând din Profil.</p></div>
  <div class="col" style="gap:10px;margin-top:28px">
    <button class="opt on"><span><b style="font-size:17px">Română</b><br><span class="mut" style="font-size:13px">Limba telefonului</span></span><span class="radio"></span></button>
    <button class="opt" data-act="toast" data-arg="Prototipul final e în română; EN și HU vin odată cu i18n."><span><b style="font-size:17px">English</b></span><span class="radio"></span></button>
    <button class="opt" data-act="toast" data-arg="Prototipul final e în română; EN și HU vin odată cu i18n."><span><b style="font-size:17px">Magyar</b></span><span class="radio"></span></button>
  </div>
  <div style="position:absolute;left:20px;right:20px;bottom:40px"><button class="btn" data-act="langGo">Continuă</button></div>` }));
ACT.langGo = () => { S.onboarded = true; save(); go('/home', true); };

/* ---------- S12 Login / cont ---------- */
route('/login', (p, q) => {
  const reg = UI.tmp.loginMode === 'register';
  return { nav: false, body: `
  <div class="hd back" style="margin-top:4px">${backBtn()}</div>
  <div class="row" style="margin-top:4px"><span style="width:10px;height:10px;border-radius:50%;background:var(--acc)"></span><b>AradExperience</b></div>
  <h1 style="margin-top:18px">${reg ? 'Creează un cont' : 'Conectează-te'}</h1>
  <p class="mut" style="margin-top:10px;font-size:15px">${reg ? 'Alege cum folosești aplicația. Firmele își fac cont pe web, iar conturile de Primărie și voluntar le creează Primăria.' : 'Cu un cont îți vezi biletele pe orice telefon, strângi puncte și păstrezi evenimentele salvate.'}</p>
  <div class="col" style="gap:14px;margin-top:22px">
    ${reg ? `<div><label class="lab">Nume</label><input class="field" placeholder="Prenume și nume" data-bind="name" value="${esc(UI.tmp.name || '')}"></div>` : ''}
    <div><label class="lab">Adresa de e-mail</label><input class="field" type="email" placeholder="nume@exemplu.ro" data-bind="email" value="${esc(UI.tmp.email || '')}"></div>
    <div><label class="lab">Parola</label><input class="field" type="password" placeholder="minimum 8 caractere" data-bind="pass" value="${esc(UI.tmp.pass || '')}"></div>
    ${reg ? `<div><label class="lab">Folosești aplicația ca</label><div class="row" style="gap:8px">${[['visitor', 'Vizitator', 'În trecere prin Arad'], ['local', 'Localnic', 'Strângi puncte în comunitate']].map(([k, l, s]) => `<button class="tile ${(UI.tmp.regRole || 'visitor') === k ? 'on' : ''}" data-act="regRole" data-arg="${k}"><b>${l}</b><span>${s}</span></button>`).join('')}</div></div>` : ''}
    ${UI.tmp.loginErr ? `<div class="note err">${ms('error', 's')}<span>${esc(UI.tmp.loginErr)}</span></div>` : ''}
    <button class="btn" data-act="login">${reg ? 'Creează contul' : 'Intră în cont'}</button>
    <button class="link" style="text-align:center;padding:4px" data-act="loginMode">${reg ? 'Ai deja cont? Conectează-te' : 'Nu ai cont? Creează unul'}</button>
  </div>
  <div class="divider"></div>
  <div class="mut" style="font-size:13px;margin-bottom:8px">Conturi demo (atinge ca să completezi)</div>
  <div class="chips">${[['visitor@demo.ro', 'Vizitator'], ['local@demo.ro', 'Localnic'], ['firma@demo.ro', 'Firmă'], ['primaria@demo.ro', 'Primărie']].map(([e, l]) => `<button class="chip sm" data-act="demoAcc" data-arg="${e}">${l}</button>`).join('')}</div>
  <p class="mut" style="font-size:12.5px;margin-top:18px;text-align:center">Voluntarii intră cu codul primit prin SMS: <button class="link" data-go="/vol/login">Conectare voluntar</button></p>
  <div style="height:30px"></div>` };
});
ACT.loginMode = () => { UI.tmp.loginMode = UI.tmp.loginMode === 'register' ? 'login' : 'register'; UI.tmp.loginErr = ''; render(); };
ACT.regRole = a => { UI.tmp.regRole = a; render(); };
ACT.demoAcc = e => { UI.tmp.email = e; UI.tmp.pass = 'demo1234'; UI.tmp.loginErr = ''; render(); };
ACT.login = () => {
  const email = (UI.tmp.email || '').trim().toLowerCase(), pass = UI.tmp.pass || '';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { UI.tmp.loginErr = 'Introdu o adresă de e-mail validă, de ex. nume@exemplu.ro'; render(); return; }
  if (pass.length < 8) { UI.tmp.loginErr = 'Parola are minimum 8 caractere (demo1234).'; render(); return; }
  const map = { 'visitor@demo.ro': ['visitor', 'John S.'], 'local@demo.ro': ['local', 'Ana P.'], 'firma@demo.ro': ['business', 'Cafeneaua din Pasaj'], 'primaria@demo.ro': ['city', 'Ioana Marin'] };
  const reg = UI.tmp.loginMode === 'register';
  const [role, name] = map[email] || [reg ? (UI.tmp.regRole || 'visitor') : 'visitor', reg ? (UI.tmp.name || 'Cont nou') : email.split('@')[0]];
  S.role = role; S.user = { name, email }; S.onboarded = true; save(); UI.tmp.loginErr = '';
  toast(`Bun venit, ${name.split(' ')[0]}!`, 'check_circle');
  if (role === 'business' || role === 'city') go('/panel', true); else go('/home', true);
};

/* ---------- S1 Acasă ---------- */
function filtersActive() { const f = UI.filters || {}; return (f.cats && f.cats.length) || f.price || f.org || f.dist; }
function applyFilters(list) {
  const f = UI.filters || {};
  return list.filter(e => (!f.cats || !f.cats.length || f.cats.includes(e.cat)) && (!f.price || (f.price === 'free' ? e.ticket === 'FREE' : f.price === 'app' ? e.ticket === 'IN_APP' : e.ticket === 'EXTERNAL')) && (!f.org || (f.org === 'inst' ? e.org.type === 'INSTITUTION' : f.org === 'biz' ? e.org.type === 'BUSINESS' : e.org.type === 'CITY')) && (!f.dist || (f.dist === 'city' ? e.dist < 10 : e.dist >= 10)));
}
function homeEvents() {
  const p = S.period || 'today';
  let list = A.pubEvents().filter(e => A.inPeriod(e, p === 'near' ? 'week' : p));
  list = applyFilters(list);
  list.sort((a, b) => p === 'near' ? a.dist - b.dist : (a.date + a.time).localeCompare(b.date + b.time));
  return list;
}
route('/home', () => {
  const mode = S.role === 'visitor' && S.homeMode === 'cm' ? 'ev' : (S.homeMode || 'ev');
  const evToday = A.pubEvents().filter(e => A.inPeriod(e, 'today')).length;
  const nOffers = A.pubOffers().length, nActs = A.pubActions().length;
  const modes = `<div class="modes ${S.role === 'visitor' ? 'two' : ''}">
    <button class="mode ${mode === 'ev' ? 'on' : ''}" data-act="mode" data-arg="ev"><span class="e">🎭</span><b>Evenimente</b><span>${evToday} azi</span></button>
    <button class="mode ${mode === 'of' ? 'on' : ''}" data-act="mode" data-arg="of"><span class="e">🏷️</span><b>Oferte</b><span>${nOffers} active</span></button>
    ${S.role === 'visitor' ? '' : `<button class="mode ${mode === 'cm' ? 'on' : ''}" data-act="mode" data-arg="cm"><span class="e">🌳</span><b>Comunitate</b><span>${A.pts(S.points)}</span></button>`}
  </div>`;
  const head = `<div class="hd"><div class="col" style="gap:6px"><div class="eyebrow">${A.TODAY_LABEL}</div><h1>Ce faci în Arad?</h1></div>${avatarBtn()}</div>
    <div class="row"><button class="search grow" data-go="/search">${ms('search')}<span>Caută evenimente și activități</span></button><button class="sq" data-act="filters" aria-label="Filtre">${ms('tune')}${filtersActive() ? '<span class="dot"></span>' : ''}</button></div>${modes}`;
  let body = '';
  if (mode === 'ev') {
    const list = homeEvents(); const p = S.period || 'today';
    const places = A.PLACES.filter(x => ['ca', 'pc', 'tc', 'ta'].includes(x.id)); const bizs = A.allBiz().filter(b => b.verified).slice(0, 3);
    body = `${S.role === 'visitor' ? `<button class="planner" data-go="/plan">${ms('auto_awesome')}<span class="grow"><b>Ești în vizită? Planifică-ți ziua</b><span>Cât timp ai → program cu obiective, ore și traseu</span></span>${ms('chevron_right')}</button>` : ''}
      <div class="chips">${[['near', 'Lângă mine', 'near_me'], ['today', 'Azi'], ['weekend', 'Weekendul acesta'], ['week', 'Următoarele 7 zile']].map(([k, l, ic]) => `<button class="chip ${p === k ? 'on' : ''}" data-act="period" data-arg="${k}">${ic ? ms(ic, 's') : ''}${l}</button>`).join('')}</div>
      <div class="row" style="justify-content:space-between;margin:14px 0 10px"><span class="mut" style="font-size:14px">${list.length === 1 ? '1 eveniment' : list.length + ' evenimente'}${filtersActive() ? ' · filtrate' : ''}</span><span class="mut" style="font-size:12.5px">Date reale + demo</span></div>
      ${list.length ? list.map(evCard).join('') : emptyState('event_busy', 'Nimic programat în această perioadă', 'Încearcă altă perioadă sau scoate un filtru.', `<button class="btn sm" style="margin:14px auto 0" data-act="period" data-arg="week">Vezi următoarele 7 zile</button>`)}
      <div style="margin:10px 0 10px"><h2>Locuri din Arad</h2><p class="mut" style="font-size:14px;margin-top:4px">Obiective cu ghid audio, restaurante și cafenele cu păreri de la oameni.</p></div>
      <div class="hscroll">${places.map(placeCard).join('')}${bizs.map(bizCard).join('')}</div>
      <button class="btn sec" style="margin-top:4px" data-go="/places">Toate obiectivele și localurile</button>`;
  } else if (mode === 'of') {
    const cat = UI.tmp.ofCat || 'all';
    const cats = [['all', 'Toate', '🛍️'], ['cafe', 'Cafenele', '☕'], ['rest', 'Restaurante', '🍽️'], ['local', 'Făcut în Arad', '🧺'], ['event', 'Evenimente', '🎉'], ['points', 'Cu puncte', '⭐']];
    let list = A.pubOffers(); if (cat !== 'all') list = list.filter(o => cat === 'points' ? o.pointsPrice : o.cat === cat || (cat === 'local' && (A.allBiz().find(b => b.id === o.biz) || {}).local));
    body = `<div class="banner"><div class="k">Doar în AradExperience</div><h2>Până la -20% la cafenelele din centru</h2><button class="cta" data-act="ofCat" data-arg="cafe">Vezi cafenelele ${ms('arrow_forward', 'xs')}</button><span class="e">☕</span></div>
      <div class="hscroll" style="padding-bottom:4px">${cats.map(([k, l, e]) => `<button class="catc ${cat === k ? 'on' : ''}" data-act="ofCat" data-arg="${k}"><i>${e}</i>${l}</button>`).join('')}</div>
      ${S.role === 'local' ? `<div class="note green" style="margin:10px 0 14px">${ms('stars', 's')}<span>Ai <b>${A.pts(S.points)}</b>. Ofertele marcate „Cu puncte” le plătești direct din aplicație.</span></div>` : '<div style="height:12px"></div>'}
      ${list.map(offerCard).join('') || emptyState('sell', 'Nicio ofertă aici', 'Alege altă categorie.')}`;
  } else {
    const lv = A.LEVELS; let li = 0; lv.forEach((l, i) => { if (S.points >= l[1]) li = i; }); const next = lv[li + 1]; const prog = next ? Math.round((S.points - lv[li][1]) / (next[1] - lv[li][1]) * 100) : 100;
    const rank = A.BOARD.findIndex(b => b[0] === 'Ana P.') + 1;
    body = `<button class="ptscard" style="width:100%;text-align:left" data-go="/leaderboard"><div class="top"><span>Punctele tale</span><span class="lvl">${lv[li][0]}</span></div><div class="n">${S.points}<small>puncte disponibile</small></div><div class="bar"><i style="width:${prog}%"></i></div><div class="bot"><span>🔥 Activ 2 luni la rând</span><b>Locul ${rank} ${ms('chevron_right', 'xs')}</b></div></button>
      <h2>Acțiuni care urmează</h2><p class="mut" style="font-size:14.5px;margin:4px 0 14px">Organizate de Primăria Arad. Primești puncte pentru fiecare participare, după ce un voluntar al Primăriei îți scanează codul.</p>
      ${A.pubActions().map(actionCard).join('')}
      <div class="card pad" style="margin-top:4px"><div class="row" style="justify-content:space-between"><div><h3>Folosește punctele</h3><p class="mut" style="font-size:13.5px;margin-top:2px">Cafea, cină, bilete la teatru de la partenerii Primăriei.</p></div><button class="btn xs" data-go="/leaderboard">Recompense</button></div></div>`;
  }
  return { body: head + body };
});
ACT.mode = a => { S.homeMode = a; save(); render(); };
ACT.period = a => { S.period = a; save(); render(); };
ACT.ofCat = a => { UI.tmp.ofCat = a; S.homeMode = 'of'; save(); render(); };
ACT.save = id => { const i = S.saved.indexOf(id); if (i >= 0) { S.saved.splice(i, 1); toast('Eliminat din Salvate.'); } else { S.saved.push(id); toast('Salvat. Îl găsești în Profil › Salvate.', 'bookmark'); } save(); };

/* ---------- filtre (sheet) ---------- */
ACT.filters = () => {
  const f = UI.filters = UI.filters || { cats: [], price: '', org: '', dist: '' };
  const chip = (k, v, l) => `<button class="chip sm ${(k === 'cats' ? f.cats.includes(v) : f[k] === v) ? 'on' : ''}" data-act="fset" data-arg="${k}:${v}">${l}</button>`;
  sheet(`<div class="shd"><h2>Filtre</h2><button class="link" data-act="fclear">Șterge tot</button></div>
    <div class="col" style="gap:18px">
      <div><label class="lab">Categorie</label><div class="row" style="flex-wrap:wrap;gap:8px">${Object.entries(A.CATS).map(([k, c]) => chip('cats', k, c.l)).join('')}</div></div>
      <div><label class="lab">Preț</label><div class="row" style="flex-wrap:wrap;gap:8px">${chip('price', 'free', 'Gratuite')}${chip('price', 'app', 'Bilete în aplicație')}${chip('price', 'ext', 'Pe site-ul organizatorului')}</div></div>
      <div><label class="lab">Organizator</label><div class="row" style="flex-wrap:wrap;gap:8px">${chip('org', 'inst', 'Instituții')}${chip('org', 'biz', 'Firme locale')}${chip('org', 'city', 'Primăria Arad')}</div></div>
      <div><label class="lab">Distanță</label><div class="row" style="flex-wrap:wrap;gap:8px">${chip('dist', 'city', 'În oraș')}${chip('dist', 'county', 'Județ (Miniș, Macea)')}</div></div>
      <button class="btn" data-act="closeSheet">Arată ${homeEvents().length} evenimente</button>
    </div>`);
};
ACT.fset = a => { const [k, v] = a.split(':'); const f = UI.filters; if (k === 'cats') { const i = f.cats.indexOf(v); i >= 0 ? f.cats.splice(i, 1) : f.cats.push(v); } else f[k] = f[k] === v ? '' : v; ACT.filters(); };
ACT.fclear = () => { UI.filters = { cats: [], price: '', org: '', dist: '' }; ACT.filters(); };

/* ---------- S2 Căutare ---------- */
route('/search', () => {
  const q = (UI.tmp.q || '').trim().toLowerCase();
  const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const nq = norm(q);
  const ev = q ? A.pubEvents().filter(e => !e.past && norm(e.title + ' ' + e.venue + ' ' + A.CATS[e.cat].l).includes(nq)) : A.pubEvents().filter(e => A.inPeriod(e, 'week')).slice(0, 6);
  const pl = q ? A.PLACES.filter(p => norm(p.name + ' ' + p.type).includes(nq)) : [];
  const of = q ? A.pubOffers().filter(o => norm(o.title).includes(nq)) : [];
  return { body: `${pageHead('Caută')}
    <div class="search" style="border-color:var(--ink);box-shadow:0 0 0 3px rgba(17,17,17,.08)">${ms('search')}<input autofocus placeholder="Ex.: jazz, copii, Cetate" data-bind="q" value="${esc(UI.tmp.q || '')}">${q ? `<button class="iconbtn" style="width:32px;height:32px" data-act="qclear">${ms('close', 's')}</button>` : ''}</div>
    <div class="row" style="justify-content:space-between;margin:14px 0 6px"><button class="chip sm" data-act="filters">${ms('tune', 's')} Filtre</button><span class="mut" style="font-size:13.5px">${q ? `${ev.length + pl.length + of.length} rezultate` : 'Sugestii pentru săptămâna asta'}</span></div>
    ${!q ? `<div class="chips" style="margin-bottom:8px">${['jazz', 'copii', 'Cetate', 'gratuit', 'vin', 'teatru'].map(s => `<button class="chip sm" data-act="qset" data-arg="${s}">${s}</button>`).join('')}</div>` : ''}
    ${pl.length ? `<h3 style="margin:10px 0 4px">Locuri</h3>${pl.map(p => `<button class="row-item" data-go="/place/${p.id}"><span class="av" style="border-radius:12px;background:${p.tone};color:#fff;border:none">${ms('location_on')}</span><span class="grow"><b>${esc(p.name)}</b><br><span class="mut" style="font-size:13px">${esc(p.type)} · ${A.km(p.dist)}</span></span>${ms('chevron_right')}</button>`).join('')}` : ''}
    ${of.length ? `<h3 style="margin:10px 0 4px">Oferte</h3>${of.map(o => `<button class="row-item" data-go="/offer/${o.id}"><span class="av" style="border-radius:12px;background:url('${o.img}') center/cover;border:none"></span><span class="grow"><b>${esc(o.title)}</b><br><span class="mut" style="font-size:13px">${esc((A.allBiz().find(b => b.id === o.biz) || {}).name)}</span></span>${ms('chevron_right')}</button>`).join('')}` : ''}
    ${ev.length ? `${q ? '<h3 style="margin:10px 0 4px">Evenimente</h3>' : ''}${ev.map(e => evRow(e)).join('')}` : (q ? emptyState('search_off', `Niciun rezultat pentru „${esc(q)}”`, 'Elimină un filtru sau încearcă alt cuvânt.') : '')}` };
});
ACT.on_q = () => render();
ACT.qset = a => { UI.tmp.q = a; render(); };
ACT.qclear = () => { UI.tmp.q = ''; render(); };

/* ---------- S3 Eveniment ---------- */
route('/event/:id', ({ id }) => {
  const e = A.allEvents().find(x => x.id === id); if (!e) return 'Eveniment inexistent';
  const saved = S.saved.includes(e.id); const biz = e.org.bizId ? A.allBiz().find(b => b.id === e.org.bizId) : null; const place = e.placeId ? A.byId(A.PLACES, e.placeId) : null;
  const tInfo = e.ticket === 'IN_APP' ? ['confirmation_number', 'Bilete în aplicație · Doar în AradExperience', 'Plătești în aplicație (plată demonstrativă). Biletul cu cod QR apare în Biletele mele și merge offline.'] : e.ticket === 'FREE' ? ['event_available', e.capacity ? 'Gratuit · cu înscriere' : 'Gratuit · fără bilet', e.capacity ? `Te înscrii în aplicație și primești un cod QR. ${e.capacity - e.participants} locuri libere.` : 'Intrare liberă, nu ai nevoie de bilet.'] : ['open_in_new', 'Bilete pe site-ul organizatorului', 'Se deschide în browser. Biletele cumpărate acolo nu apar în aplicație; organizatorul ți le trimite pe e-mail.'];
  const left = e.times ? e.times.reduce((s, t) => s + t.left, 0) : 1;
  const cta = e.past ? `<button class="btn soft" data-act="review" data-arg="${e.id}">Lasă o părere</button>` : e.ticket === 'IN_APP' ? (left ? `<button class="btn grow" data-go="/event/${e.id}/tickets">Cumpără bilete</button>` : `<button class="btn" disabled>Bilete epuizate</button>`) : e.ticket === 'FREE' ? (e.capacity ? (S.tickets.some(t => t.eventId === e.id) ? `<button class="btn soft grow" data-go="/tickets">Ești înscris · vezi codul</button>` : `<button class="btn grow" data-act="joinFree" data-arg="${e.id}">Înscrie-te · gratuit</button>`) : `<button class="btn sec grow" data-act="cal">${ms('event_available', 's')} Adaugă în calendar</button>`) : `<button class="btn grow" data-act="extOpen">${ms('open_in_new', 's')} Pe site-ul organizatorului</button>`;
  const price = e.ticket === 'IN_APP' || (e.ticket === 'EXTERNAL' && e.priceFrom) ? `<div class="price"><small>Preț</small><b>${A.priceLabel(e)}</b></div>` : '';
  return { onImg: true, flush: true, body: `
    <div class="hero ${e.img ? '' : 'tone'}" ${img(e.img, e.tone)}>${e.img ? '' : (e.emoji || '')}<div class="top">${backBtn(true)}<div class="row" style="gap:8px"><button class="iconbtn glass" data-act="share">${ms('ios_share')}</button><button class="iconbtn glass" data-act="save" data-arg="${e.id}">${ms(saved ? 'bookmark' : 'bookmark_border', saved ? 'f' : '')}</button></div></div>${e.img && e.credit ? `<span class="credit">${esc(e.credit)}</span>` : ''}</div>
    <div class="pad">
      <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:8px"><span class="eyebrow" style="text-transform:uppercase;letter-spacing:.06em;font-size:12.5px;font-weight:600">${A.CATS[e.cat].l}</span>${A.isHot(e) ? `<span class="badge hot">🔥 Popular · ${A.nf(e.participants || e.saves)} ${e.participants >= 50 ? 'participă' : 'au salvat'}</span>` : ''}${e.demo ? '<span class="badge" style="font-size:11.5px">demo</span>' : ''}</div>
      <h1 style="font-size:28px">${esc(e.title)}</h1>
      <div class="note" style="margin-top:16px;background:var(--surf);border:1px solid var(--line);color:var(--ink)">${ms(tInfo[0])}<span><b>${tInfo[1]}</b><br><span class="mut">${tInfo[2]}</span></span></div>
      <div class="kv">${ms('schedule')}<div class="grow"><div class="t">${A.whenLabel(e)}${e.dur ? ` · ${e.dur} min` : ''}</div>${e.times && e.times.length > 1 ? `<div class="s">Încă ${e.times.length - 1} date</div>` : ''}</div><button class="chip sm" data-act="cal">${ms('event_available', 's')} Calendar</button></div>
      <div class="kv">${ms('location_on')}<div class="grow"><div class="t">${esc(e.venue)}</div><div class="s">${esc(e.addr)} · ${A.km(e.dist)}</div></div><button class="chip sm" data-go="/map?to=ev:${e.id}">${ms('directions', 's')} Indicații</button></div>
      ${biz ? `<button class="kv" style="width:100%;text-align:left" data-go="/business/${biz.id}">${ms('storefront')}<div class="grow"><div class="t">Organizat de ${esc(biz.name)}</div><div class="s">${esc(biz.cat)} · ★ ${biz.rating} (${biz.reviews} păreri)${biz.verified ? ' · cont verificat' : ''}</div></div>${ms('chevron_right')}</button>` : `<div class="kv">${ms(e.org.type === 'CITY' ? 'account_balance' : 'domain')}<div class="grow"><div class="t">Organizat de ${esc(e.org.name)}</div>${e.url ? `<div class="s">${esc(e.url.replace('https://', ''))}</div>` : ''}</div></div>`}
      ${place && place.guide ? `<button class="kv" style="width:100%;text-align:left" data-go="/place/${place.id}">${ms('headphones')}<div class="grow"><div class="t">Ghid virtual: ${esc(place.name)}</div><div class="s">${place.guide.length} puncte · ~${place.guide.reduce((s, g) => s + g.min, 0)} min · citit și audio</div></div>${ms('chevron_right')}</button>` : ''}
      <h3 style="margin:18px 0 6px">Despre eveniment</h3><p style="font-size:15px;color:var(--mut)">${esc(e.desc)}</p>
      ${e.access ? `<div class="row" style="margin-top:10px;font-size:13.5px;color:var(--mut)">${ms('accessible', 's')} Acces fără trepte</div>` : ''}
      ${e.reviews ? `<h3 style="margin:22px 0 8px">Ce spun cei care au fost</h3><div class="card pad"><div class="row" style="gap:12px"><b style="font-size:34px;letter-spacing:-.03em">${e.rating || 4.5}</b><div><div style="color:var(--acc);letter-spacing:1px">${stars(e.rating || 4.5)}</div><div class="mut" style="font-size:13px">${e.reviews.length} păreri · ediții anterioare</div></div></div>${e.reviews.map(r => `<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--line)"><div class="row" style="justify-content:space-between;font-size:13.5px"><b>${esc(r.who)}</b><span style="color:var(--acc)">${stars(r.stars)}</span></div><p class="mut" style="font-size:14px;margin-top:4px">„${esc(r.text)}”</p></div>`).join('')}</div>` : ''}
      <div class="row" style="gap:8px;margin-top:18px"><button class="chip sm" data-act="share">${ms('ios_share', 's')} Trimite</button><button class="chip sm" data-act="toast" data-arg="Mulțumim! Vom verifica informațiile.">${ms('flag', 's')} Raportează o greșeală</button></div>
      <p class="mut" style="font-size:12px;margin-top:14px">${e.demo ? 'Eveniment demonstrativ.' : 'Informații de la organizator; verifică detaliile pe site-ul acestuia.'}</p>
      <div style="height:120px"></div>
    </div>`, fixed: `<div class="bottombar">${price}${cta}</div>` };
});
ACT.extOpen = () => sheet(`<div class="shd"><h2>Pleci spre site-ul organizatorului</h2></div><p class="mut">Biletele cumpărate acolo nu apar în Biletele mele. Organizatorul ți le trimite pe e-mail.</p><div class="col" style="gap:10px;margin-top:18px"><button class="btn" data-act="toast" data-arg="Prototip: aici s-ar deschide browserul.">${ms('open_in_new', 's')} Deschide site-ul</button><button class="btn sec" data-act="closeSheet">Rămân în aplicație</button></div>`);
ACT.joinFree = id => { const e = A.allEvents().find(x => x.id === id); const code = A.genCode(`AX-T${id.replace('ev', '')}`); S.tickets.push({ code, eventId: id, date: e.date, time: e.time, lines: [['Înscriere', 1, 0]], total: 0, email: S.user ? S.user.email : '' }); save(); go(`/confirm/${code}`); };
ACT.review = id => sheet(`<div class="shd"><h2>Cum a fost?</h2></div><p class="mut">Spune-le și altora cum a fost. Atinge o stea ca să începi.</p><div class="row" style="justify-content:center;gap:10px;margin:18px 0;font-size:34px;color:var(--acc)">${[1, 2, 3, 4, 5].map(n => `<button data-act="star" data-arg="${n}">${n <= (UI.tmp.star || 0) ? '★' : '☆'}</button>`).join('')}</div><textarea class="field" placeholder="Ce ți-a plăcut, ce nu (max. 500 de caractere)"></textarea><button class="btn" style="margin-top:14px" data-act="reviewSend">Trimite părerea</button>`);
ACT.star = n => { UI.tmp.star = +n; ACT.review(); };
ACT.reviewSend = () => { closeSheet(); toast('Mulțumim! Părerea ta apare după verificare.', 'check_circle'); };

/* ---------- S4 Alege biletele ---------- */
route('/event/:id/tickets', ({ id }) => {
  const e = A.allEvents().find(x => x.id === id); const o = UI.tmp.order = UI.tmp.order && UI.tmp.order.eventId === id ? UI.tmp.order : { eventId: id, ti: (e.times || []).findIndex(t => t.left > 0), adult: 1, child: 0 };
  const types = [['adult', 'Adult', e.priceAdult]].concat(e.priceChild ? [['child', 'Copil (3–12 ani)', e.priceChild]] : []);
  const total = o.adult * e.priceAdult + o.child * (e.priceChild || 0); const n = o.adult + o.child;
  const cur = e.times ? e.times[o.ti] : null;
  return { body: `${pageHead('Alege biletele')}<p class="mut" style="font-size:15px;margin:-4px 0 18px">${esc(e.title)}<br>${esc(e.venue)}</p>
    ${e.times ? `<label class="lab">Data și ora</label><div class="col" style="gap:10px;margin-bottom:22px">${e.times.map((t, i) => `<button class="opt ${i === o.ti ? 'on' : ''} ${t.left === 0 ? 'dis' : ''}" ${t.left ? `data-act="pickTime" data-arg="${i}"` : ''}><span><b style="font-size:16px">${A.dayLabel(t.d)} · ${t.t}</b>${t.left === 0 ? '<br><span style="font-size:13px">Epuizat</span>' : t.left <= 5 ? `<br><span class="mut" style="font-size:13px">Ultimele ${t.left} bilete</span>` : ''}</span><span class="radio"></span></button>`).join('')}</div>` : ''}
    <label class="lab">Bilete</label>
    ${types.map(([k, l, p]) => `<div class="kv" style="justify-content:space-between"><div><div class="t" style="font-weight:600">${l}</div><div class="s">${A.lei(p)}</div></div><div class="stepper"><button data-act="qty" data-arg="${k}:-1" aria-label="Scade">${ms('remove', 's')}</button><b>${o[k]}</b><button data-act="qty" data-arg="${k}:1" aria-label="Crește">${ms('add', 's')}</button></div></div>`).join('')}
    <div class="note" style="margin-top:14px">${ms('smartphone', 's')}<span>Biletele ajung direct în aplicație. Nu trebuie printate.</span></div>
    ${cur && n > cur.left ? `<div class="note err" style="margin-top:10px">${ms('error', 's')}<span>Mai sunt doar ${cur.left} bilete la această oră. Alege altă oră pentru mai multe locuri.</span></div>` : ''}
    <div style="height:110px"></div>`, fixed: `<div class="bottombar"><div class="price"><small>Total · ${n === 1 ? '1 bilet' : n + ' bilete'}</small><b>${A.lei(total)}</b></div><button class="btn grow" data-go="/checkout" ${n === 0 || (cur && n > cur.left) ? 'disabled' : ''}>Continuă spre plată</button></div>` };
});
ACT.pickTime = i => { UI.tmp.order.ti = +i; render(); };
ACT.qty = a => { const [k, d] = a.split(':'); const o = UI.tmp.order; o[k] = Math.max(0, Math.min(10, o[k] + (+d))); render(); };

/* ---------- S5 Plată ---------- */
route('/checkout', () => {
  const o = UI.tmp.order; if (!o) return { body: pageHead('Plată') + emptyState('shopping_cart', 'Niciun bilet ales', 'Alege întâi un eveniment.') };
  const e = A.allEvents().find(x => x.id === o.eventId); const t = e.times ? e.times[o.ti] : { d: e.date, t: e.time };
  const lines = [['Adult', o.adult, e.priceAdult], ['Copil', o.child, e.priceChild || 0]].filter(l => l[1] > 0); const total = lines.reduce((s, l) => s + l[1] * l[2], 0);
  const email = UI.tmp.payEmail != null ? UI.tmp.payEmail : (S.user ? S.user.email : '');
  return { body: `${pageHead('Plată')}
    <div class="card pad"><div class="eyebrow" style="font-size:12px;letter-spacing:.07em;text-transform:uppercase;font-weight:700">Comanda ta</div><h3 style="margin:6px 0 4px;font-size:17px">${esc(e.title)}</h3><p class="mut" style="font-size:14px">${A.dayLabel(t.d)} · ${t.t}<br>${esc(e.venue)}</p><div class="divider" style="margin:12px 0"></div>${lines.map(l => `<div class="row" style="justify-content:space-between;font-size:15px;margin-bottom:6px"><span>${l[1]} × ${l[0]}</span><span>${A.lei(l[1] * l[2])}</span></div>`).join('')}<div class="row" style="justify-content:space-between;font-weight:700;font-size:16px"><span>Total</span><span>${A.lei(total)}</span></div></div>
    <label class="lab" style="margin-top:20px">E-mail pentru bilete</label><input class="field" type="email" data-bind="payEmail" value="${esc(email)}" placeholder="nume@exemplu.ro"><p class="mut" style="font-size:13px;margin-top:6px">Îți trimitem aici o copie a biletelor.</p>
    <label class="lab" style="margin-top:18px">Plătești cu</label>
    <div class="col" style="gap:10px"><button class="opt ${(UI.tmp.pay || 'saved') === 'saved' ? 'on' : ''}" data-act="pay" data-arg="saved"><span class="row">${ms('credit_card')} Card salvat •••• 4821</span><span class="radio"></span></button><button class="opt ${UI.tmp.pay === 'new' ? 'on' : ''}" data-act="pay" data-arg="new"><span class="row">${ms('add_card')} Card nou</span><span class="radio"></span></button></div>
    <p class="mut" style="font-size:12.5px;margin-top:16px;line-height:1.5">Plată demonstrativă: nu se procesează bani. Prin plată accepți condițiile organizatorului.</p>
    <div style="height:110px"></div>`, fixed: `<div class="bottombar"><button class="btn grow" data-act="payNow">${ms('lock', 's')} Plătește ${A.lei(total)}</button></div>` };
});
ACT.pay = a => { UI.tmp.pay = a; render(); };
ACT.payNow = () => {
  const o = UI.tmp.order; const e = A.allEvents().find(x => x.id === o.eventId); const t = e.times ? e.times[o.ti] : { d: e.date, t: e.time };
  const email = UI.tmp.payEmail != null ? UI.tmp.payEmail : (S.user ? S.user.email : '');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email || '')) { toast('Introdu o adresă de e-mail validă.'); return; }
  const lines = [['Adult', o.adult, e.priceAdult], ['Copil', o.child, e.priceChild || 0]].filter(l => l[1] > 0);
  const code = A.genCode(`AX-T${o.eventId.replace('ev', '')}`);
  S.tickets.push({ code, eventId: o.eventId, date: t.d, time: t.t, lines, total: lines.reduce((s, l) => s + l[1] * l[2], 0), email });
  if (t.left != null) t.left -= (o.adult + o.child);
  if (!S.user) S.user = { name: email.split('@')[0], email };
  save(); UI.tmp.order = null; go(`/confirm/${code}`, true);
};

/* ---------- S6 Confirmare ---------- */
route('/confirm/:code', ({ code }) => {
  const t = S.tickets.find(x => x.code === code); if (!t) return 'Bilet inexistent'; const e = A.allEvents().find(x => x.id === t.eventId); const n = t.lines.reduce((s, l) => s + l[1], 0);
  return { nav: false, body: `<div class="ok-big">${ms('check', '')}</div>
    <h1 style="text-align:center;font-size:30px">${t.total ? 'Rezervarea e confirmată' : 'Te-ai înscris'}</h1>
    <p style="text-align:center;font-weight:600;margin-top:16px;font-size:16px">${esc(e.title)}</p>
    <p class="mut" style="text-align:center;margin-top:10px;font-size:15px">${n === 1 ? '1 bilet' : n + ' bilete'} pentru ${A.dayLabel(t.date)}, ora ${t.time}. ${t.total ? 'Le' : 'Îl'} găsești în Biletele mele, chiar și offline.</p>
    ${t.email ? `<p class="mut" style="text-align:center;margin-top:8px;font-size:13.5px">Am trimis o copie la ${esc(t.email)}.</p>` : ''}
    <div style="position:absolute;left:20px;right:20px;bottom:40px" class="col"><button class="btn" data-go="/ticket/${code}">Vezi ${t.total ? 'biletul' : 'codul QR'}</button><button class="btn sec" style="margin-top:10px" data-act="cal">Adaugă în calendar</button><button class="link" style="text-align:center;margin-top:16px" data-go="/home">Înapoi la evenimente</button></div>` };
});

/* ---------- S9 Biletele mele ---------- */
route('/tickets', () => {
  const tab = UI.tmp.tkTab || 'up';
  const tk = S.tickets.filter(t => tab === 'up' ? !t.past : t.past);
  const regs = tab === 'up' ? S.regs : [];
  const claims = tab === 'up' ? S.claims : [];
  const any = tk.length || regs.length || claims.length;
  return { body: `<div class="hd" style="align-items:center"><h1>Biletele mele</h1>${avatarBtn()}</div>
    <div class="seg" style="margin-bottom:18px"><button class="${tab === 'up' ? 'on' : ''}" data-act="tkTab" data-arg="up">Viitoare</button><button class="${tab === 'past' ? 'on' : ''}" data-act="tkTab" data-arg="past">Trecute</button></div>
    ${!any ? emptyState('confirmation_number', tab === 'up' ? 'Încă nu ai bilete' : 'Nu ai bilete la evenimente trecute', 'Biletele cumpărate în aplicație apar aici. Pe cele de pe site-ul organizatorului le găsești în e-mail.', tab === 'up' ? `<button class="btn sm" style="margin:16px auto 0" data-go="/home">Caută evenimente</button>` : '') : ''}
    ${tk.length ? `<h3 style="margin:0 0 8px">Bilete și înscrieri</h3>${tk.map(t => { const e = A.allEvents().find(x => x.id === t.eventId); return `<button class="card pad row" style="width:100%;gap:14px;margin-bottom:10px;text-align:left" data-go="/ticket/${t.code}"><div class="qr" style="width:56px;flex:none">${A.qrSvg(t.code, 56)}</div><div class="grow"><b style="font-size:15.5px;line-height:1.25;display:block">${esc(e.title)}</b><span class="mut" style="font-size:13px">${A.dayLabel(t.date)} · ${t.time} · ${esc(e.venue)}</span><div style="margin-top:6px" class="row"><span class="mono" style="font-size:12px">${t.code}</span>${t.status === 'USED' ? '<span class="badge" style="font-size:11.5px">Folosit</span>' : '<span class="badge green" style="font-size:11.5px">Confirmat</span>'}</div></div>${ms('chevron_right')}</button>`; }).join('')}` : ''}
    ${regs.length ? `<h3 style="margin:14px 0 8px">Acțiuni comunitare</h3>${regs.map(r => { const a = A.allActions().find(x => x.id === r.action); const st = (S.validations[r.code] || {}).status || r.status; return `<button class="card pad row" style="width:100%;gap:14px;margin-bottom:10px;text-align:left" data-act="myQr" data-arg="${r.code}"><div class="qr" style="width:56px;flex:none">${A.qrSvg(r.code, 56)}</div><div class="grow"><b style="font-size:15.5px;line-height:1.25;display:block">${esc(a.title)}</b><span class="mut" style="font-size:13px">${A.dayLabel(a.date)} · ${a.time} · +${a.pts} puncte</span><div style="margin-top:6px"><span class="badge ${st === 'CONFIRMED' ? 'green' : ''}" style="font-size:11.5px">${st === 'CONFIRMED' ? `${ms('check_circle', 'xs')} Prezență confirmată · +${a.pts}` : st === 'NO_SHOW' ? 'Respins' : 'Așteaptă validarea pe teren'}</span></div></div>${ms('qr_code_2')}</button>`; }).join('')}` : ''}
    ${claims.length ? `<h3 style="margin:14px 0 8px">Oferte revendicate</h3>${claims.map(c => { const o = A.allOffers().find(x => x.id === c.offerId); const b = A.allBiz().find(x => x.id === o.biz); return `<button class="card pad row" style="width:100%;gap:14px;margin-bottom:10px;text-align:left" data-act="offerCode" data-arg="${c.offerId}"><div class="qr" style="width:56px;flex:none">${A.qrSvg(c.code, 56)}</div><div class="grow"><b style="font-size:15.5px;line-height:1.25;display:block">${esc(o.title)}</b><span class="mut" style="font-size:13px">${esc(b.name)}${c.points ? ` · plătită cu ${c.points} p` : ''}</span><div style="margin-top:6px" class="row"><span class="mono" style="font-size:12px">${c.code}</span><span class="badge ${c.used ? '' : 'green'}" style="font-size:11.5px">${c.used ? 'Folosit' : 'Activ'}</span></div></div>${ms('chevron_right')}</button>`; }).join('')}` : ''}
    ${tab === 'past' && tk.length ? `<div class="card pad" style="margin-top:6px"><h3>Cum a fost?</h3><p class="mut" style="font-size:14px;margin:4px 0 10px">Spune-le și altora. Atinge o stea ca să începi.</p><div style="font-size:30px;color:var(--acc);letter-spacing:4px"><button data-act="review" data-arg="${tk[0].eventId}">☆ ☆ ☆ ☆ ☆</button></div></div>` : ''}
    <p class="mut" style="font-size:12.5px;margin-top:14px;text-align:center">${ms('cloud_off', 'xs')} Biletele funcționează și offline.</p>` };
});
ACT.tkTab = a => { UI.tmp.tkTab = a; render(); };
ACT.myQr = code => { const r = A.allRegs().find(x => x.code === code) || S.regs.find(x => x.code === code); const a = A.allActions().find(x => x.id === r.action); const st = (S.validations[code] || {}).status || r.status; sheet(`<div class="shd"><h2>Codul tău</h2><button class="link" data-act="closeSheet">Închide</button></div><p><b>${esc(a.title)}</b><br><span class="mut">${A.dayLabel(a.date)} · ${a.time}–${a.end} · +${a.pts} puncte</span></p><div class="card pad" style="margin:16px 0">${qrBlock(code, 210)}<div class="mono" style="text-align:center;margin-top:10px;font-size:14px">${code}</div></div><div class="note ${st === 'CONFIRMED' ? 'green' : ''}">${ms(st === 'CONFIRMED' ? 'check_circle' : 'info', 's')}<span>${st === 'CONFIRMED' ? `Prezență confirmată. Ai primit +${a.pts} puncte.` : 'Arată codul voluntarului Primăriei la începutul acțiunii. După scanare primești punctele.'}</span></div>`); };

/* ---------- S10 Bilet ---------- */
route('/ticket/:code', ({ code }) => {
  const t = S.tickets.find(x => x.code === code); if (!t) return 'Bilet inexistent'; const e = A.allEvents().find(x => x.id === t.eventId);
  return { body: `${pageHead(t.total ? 'Bilet' : 'Înscriere')}
    <h2 style="font-size:22px">${esc(e.title)}</h2><p class="mut" style="margin-top:6px">${A.dayLabel(t.date)} · ${t.time}<br>${esc(e.venue)} · ${esc(e.addr)}</p>
    <div class="ticket" style="margin-top:18px"><div style="padding:18px 18px 14px">${t.lines.map(l => `<div class="row" style="justify-content:space-between;font-size:15px"><span>${l[1]} × ${l[0]}</span><span>${l[2] ? A.lei(l[1] * l[2]) : 'gratuit'}</span></div>`).join('')}</div><div class="cut"></div><div style="padding:22px 18px 18px">${qrBlock(code, 220)}<div class="mono" style="text-align:center;margin-top:12px;font-size:15px;letter-spacing:.04em">${code}</div><p class="mut" style="text-align:center;font-size:13px;margin-top:6px">Arată acest cod la intrare. Funcționează și offline.</p></div></div>
    <div class="row" style="gap:10px;margin-top:16px"><button class="btn sec" data-act="cal">${ms('event_available', 's')} Calendar</button><button class="btn sec" data-go="/map?to=ev:${e.id}">${ms('directions', 's')} Indicații</button></div>
    <button class="link mut" style="display:block;text-align:center;margin:18px auto 0;font-size:14px" data-act="toast" data-arg="Anularea biletelor vine după hackathon.">Gestionează rezervarea</button>` };
});

/* ---------- S7 Hartă ---------- */
route('/map', (p, q) => {
  const m = UI.map = UI.map || { period: 'today', kind: 'all', cat: null, sel: null, to: null };
  if (q.to) { m.to = q.to; m.sel = q.to; m.kind = 'all'; }
  const kinds = [['all', 'Toate'], ['ev', 'Evenimente'], ['place', 'Obiective'], ['offer', 'Oferte'], ['act', 'Acțiuni']];
  const selItem = m.sel ? mapItem(m.sel) : null;
  const card = selItem ? `<div class="mapcard"><div class="row" style="gap:12px;align-items:flex-start"><div class="th" style="width:64px;height:64px;border-radius:14px;flex:none;background:${selItem.img ? `url('${selItem.img}') center/cover` : selItem.tone};display:flex;align-items:center;justify-content:center;font-size:26px">${selItem.img ? '' : (selItem.emoji || '')}</div><div class="grow"><div class="mut" style="font-size:12.5px;text-transform:uppercase;letter-spacing:.05em;font-weight:600">${selItem.kindLabel}</div><b style="font-size:16px;line-height:1.25;display:block">${esc(selItem.title)}</b><span class="mut" style="font-size:13px">${esc(selItem.sub)}</span>${m.to === m.sel ? `<div style="margin-top:6px"><span class="badge">${ms('directions_walk', 'xs')} ${walkMin(selItem.dist)} min pe jos · ${A.km(selItem.dist)}</span></div>` : ''}</div><button class="iconbtn" data-act="mapSel" data-arg="">${ms('close')}</button></div>
    <div class="row" style="gap:8px;margin-top:12px">${m.to === m.sel ? `<button class="btn sm grow" data-act="gmaps">${ms('open_in_new', 's')} Google Maps</button>` : `<button class="btn sm grow" data-act="mapRoute" data-arg="${m.sel}">${ms('directions_walk', 's')} Arată traseul</button>`}<button class="btn sm sec grow" data-go="${selItem.href}">Deschide</button></div></div>` : '';
  return { noStatus: true, flush: true, body: `<div class="mapwrap"><div class="map" id="map"></div>
      <div class="status" style="position:absolute;left:0;right:0;top:0;z-index:12"><span>${A.NOW}</span><span class="row" style="gap:5px">${ms('signal_cellular_alt')}${ms('wifi')}${ms('battery_full')}</span></div>
      <div class="mapui"><div class="row"><button class="search grow" style="background:var(--glass);box-shadow:0 2px 10px rgba(0,0,0,.12);border:none;height:48px" data-go="/search">${ms('search')}<span>Caută pe hartă</span><span class="grow"></span><span class="sq" style="width:36px;height:36px;border-radius:12px;background:var(--soft);border:none" data-act="filters">${ms('tune', 's')}</span></button><div style="width:48px;height:48px" class="av ${S.user ? 'user' : ''} glass" data-go="/profile">${S.user ? A.initials(S.user.name) : ms('person')}</div></div>
        <div class="seg" style="background:var(--glass);box-shadow:0 2px 10px rgba(0,0,0,.12)">${[['today', 'Azi'], ['weekend', 'Weekend'], ['week', '7 zile']].map(([k, l]) => `<button class="${m.period === k ? 'on' : ''}" style="min-height:40px" data-act="mapPeriod" data-arg="${k}">${l}</button>`).join('')}</div>
        <div class="chips" style="margin:0;padding:0">${kinds.map(([k, l]) => `<button class="chip sm ${m.kind === k ? 'on' : ''}" style="background:${m.kind === k ? 'var(--chipbg)' : 'var(--glass)'};border:none;box-shadow:0 2px 8px rgba(0,0,0,.1)" data-act="mapKind" data-arg="${k}">${l}</button>`).join('')}</div></div>
      <div class="mapctl"><button data-act="mapZoom" data-arg="1">${ms('add')}</button><button data-act="mapZoom" data-arg="-1">${ms('remove')}</button><button data-act="mapMe" style="color:#1D5FD1">${ms('my_location', 'f')}</button></div>${card}</div>`,
    after: () => {
      const map = mkMap('map', { zoom: 15 }); if (!map) return; UI.mapObj = map;
      const items = mapItems(); const b = [];
      items.forEach(it => { const mk = L.marker([it.lat, it.lng], { icon: pinIcon(it.pin, it.pin === 'place' ? '' : '', m.sel === it.key) }).addTo(map); mk.on('click', () => { m.sel = it.key; render(); }); b.push([it.lat, it.lng]); });
      if (m.to && selItem) { L.polyline([[A.CENTER.lat, A.CENTER.lng], [selItem.lat, selItem.lng]], { color: '#111', weight: 4, dashArray: '2 8', lineCap: 'round' }).addTo(map); map.fitBounds([[A.CENTER.lat, A.CENTER.lng], [selItem.lat, selItem.lng]], { padding: [70, 70] }); fetchRoute([A.CENTER.lng, A.CENTER.lat], [selItem.lng, selItem.lat], map); }
      else if (selItem) map.setView([selItem.lat, selItem.lng], 16);
    } };
});
function mapItem(key) { return mapItems(true).find(i => i.key === key); }
function mapItems(all) {
  const m = UI.map || { period: 'today', kind: 'all' }; const out = [];
  const inCity = x => x.dist < 10;
  if (all || m.kind === 'all' || m.kind === 'ev') A.pubEvents().filter(e => (all || A.inPeriod(e, m.period)) && inCity(e)).forEach(e => out.push({ key: 'ev:' + e.id, pin: 'event', lat: e.lat, lng: e.lng, title: e.title, sub: `${A.whenLabel(e)} · ${e.venue}`, kindLabel: A.CATS[e.cat].l, img: e.img, tone: e.tone, emoji: e.emoji, href: '/event/' + e.id, dist: e.dist }));
  if (all || m.kind === 'all' || m.kind === 'place') A.PLACES.filter(inCity).forEach(p => out.push({ key: 'place:' + p.id, pin: 'place', lat: p.lat, lng: p.lng, title: p.name, sub: `${p.type} · ${p.guide ? p.guide.length + ' puncte de ghid' : ''}`, kindLabel: 'Obiectiv', tone: p.tone, emoji: '📍', href: '/place/' + p.id, dist: p.dist }));
  if (all || m.kind === 'all' || m.kind === 'offer') A.allBiz().filter(b => b.verified && inCity(b)).forEach(b => { const n = A.pubOffers().filter(o => o.biz === b.id).length; out.push({ key: 'biz:' + b.id, pin: 'offer', lat: b.lat, lng: b.lng, title: b.name, sub: `${b.cat} · ${n === 1 ? '1 ofertă' : n + ' oferte'} · ★ ${b.rating}`, kindLabel: 'Firmă parteneră', img: b.img, href: '/business/' + b.id, dist: b.dist }); });
  if (all || m.kind === 'all' || m.kind === 'act') A.pubActions().filter(inCity).forEach(a => out.push({ key: 'act:' + a.id, pin: 'action', lat: a.lat, lng: a.lng, title: a.title, sub: `${A.dayLabel(a.date)} · ${a.time} · +${a.pts} puncte`, kindLabel: 'Acțiune comunitară', img: a.img, tone: a.tone, emoji: a.emoji, href: '/action/' + a.id, dist: A.haversine(A.CENTER, a) }));
  return out;
}
function fetchRoute(from, to, map) {
  fetch(`https://routing.openstreetmap.de/routed-foot/route/v1/driving/${from[0]},${from[1]};${to[0]},${to[1]}?overview=full&geometries=geojson`).then(r => r.json()).then(j => { if (!j.routes || !UI.maps.includes(map)) return; const line = j.routes[0].geometry.coordinates.map(c => [c[1], c[0]]); L.polyline(line, { color: '#1D5FD1', weight: 5, opacity: .9 }).addTo(map); }).catch(() => { });
}
ACT.mapSel = a => { UI.map.sel = a || null; if (!a) UI.map.to = null; render(); };
ACT.mapPeriod = a => { UI.map.period = a; render(); };
ACT.mapKind = a => { UI.map.kind = a; render(); };
ACT.mapRoute = a => { UI.map.to = a; render(); };
ACT.mapZoom = a => { if (UI.mapObj) UI.mapObj.zoomIn(+a); };
ACT.mapMe = () => { if (UI.mapObj) UI.mapObj.setView([A.CENTER.lat, A.CENTER.lng], 16); };

/* ---------- S8 Chat ---------- */
function chatInit() { if (!UI.chat) UI.chat = { msgs: [{ from: 'bot', text: 'Bună! Spune-mi ce ai chef să faci, când și cu cine.', chips: ['Ce pot face cu copiii în weekend?', 'Ce concerte sunt săptămâna asta?', 'Cum ajung la Cetate?', 'Fă-mi un itinerariu de sâmbătă'] }] }; return UI.chat; }
route('/chat', () => {
  const c = chatInit();
  const msgHtml = c.msgs.map(m => `<div class="bubble ${m.from}">${esc(m.text)}</div>${m.chips ? `<div class="row" style="flex-wrap:wrap;gap:8px;max-width:88%">${m.chips.map(ch => `<button class="chip sm wrap" data-act="chatSend" data-arg="${esc(ch)}">${m.from === 'bot' && c.msgs.length === 1 ? ms('north_east', 'xs') : ''}${esc(ch)}</button>`).join('')}</div>` : ''}${m.events ? m.events.map(id => { const e = A.allEvents().find(x => x.id === id); return `<button class="evrow" style="border:1px solid var(--line);border-radius:18px;padding:10px;background:var(--surf);max-width:92%" data-go="/event/${id}">${thumb(e)}<div class="grow"><div class="when">${A.whenLabel(e)}</div><h3>${esc(e.title)}</h3><div class="mut" style="font-size:13px">${esc(e.venue)} · ${A.priceLabel(e)}</div></div></button>`; }).join('') : ''}${m.itin ? `<button class="card pad row" style="gap:12px;max-width:92%;text-align:left" data-go="/itinerary/${m.itin}"><span class="av" style="background:var(--green-soft);color:var(--green-deep);border:none">${ms('auto_awesome')}</span><div class="grow"><b>${esc((A.ITINS.concat(S.newItins, [A.GEN_ITIN]).find(i => i.id === m.itin) || {}).title)}</b><br><span class="mut" style="font-size:13px">Plan salvat în Profil › Itinerariile tale</span></div><span class="btn xs">Deschide</span></button>` : ''}`).join('');
  return { body: `<div class="hd" style="align-items:center"><div><h1>Chat</h1><p class="mut" style="font-size:14px;margin-top:4px">Găsesc evenimente și răspund la întrebări despre ele. Nu fac plăți.</p></div><div class="row" style="gap:8px">${c.msgs.length > 1 ? `<button class="chip sm" data-act="chatNew">${ms('edit_square', 's')} Chat nou</button>` : ''}${avatarBtn()}</div></div>
    <div class="col" style="gap:10px;padding-bottom:70px" id="chatlog">${msgHtml}${c.typing ? '<div class="bubble bot typing"><i></i><i></i><i></i></div>' : ''}</div>`,
    fixed: `<div class="composer"><input class="field grow" placeholder="Scrie o întrebare…" data-bind="chatIn" data-enter="chatSendInput" value="${esc(UI.tmp.chatIn || '')}"><button class="send" data-act="chatSendInput" aria-label="Trimite">${ms('arrow_upward')}</button></div>`,
    after: () => { const v = document.getElementById('view'); if (v) v.scrollTop = v.scrollHeight; } };
});
ACT.chatNew = () => { UI.chat = null; render(); };
ACT.chatSendInput = () => { const t = (UI.tmp.chatIn || '').trim(); if (!t) return; UI.tmp.chatIn = ''; ACT.chatSend(t); };
ACT.chatSend = text => {
  const c = chatInit(); c.msgs.push({ from: 'me', text }); c.typing = true; render();
  setTimeout(() => { c.typing = false; c.msgs.push(botReply(text)); render(); }, 900);
};
function botReply(t) {
  const n = t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (/itinerar|plan|planific/.test(n)) { if (!S.newItins.find(i => i.id === 'it3')) S.newItins.push(Object.assign({}, A.GEN_ITIN, { ask: `„${t}”` })); save(); return { from: 'bot', text: 'Ți-am făcut un plan pentru sâmbătă, pe jos, prin centrul istoric: Cetatea cu ghid audio, o cafea la Pasaj, Palatul Cultural și prânz pe Faleză. Îl poți bifa pe parcurs.', itin: 'it3' }; }
  if (/copi/.test(n) && !/samb|dumin|weekend/.test(n)) return { from: 'bot', text: 'Cu plăcere! Pentru ce zi cauți?', chips: ['Sâmbătă, 7 nov.', 'Duminică, 8 nov.', 'Tot weekendul'] };
  if (/samb|tot weekend/.test(n)) return { from: 'bot', text: 'Sâmbătă, 7 nov., am găsit 3 activități bune pentru copii. Teatrul de păpuși e cel mai potrivit pentru cei mici (de la 3 ani); dacă vreți aer liber, plantarea de pe Faleză e gratuită și dă și puncte.', events: ['ev4', 'ev7', 'ev5'], chips: ['Rezervă la teatrul de păpuși', 'Altceva'] };
  if (/dumin/.test(n)) return { from: 'bot', text: 'Duminică spectacolul de păpuși e epuizat. Rămân crosul din Pădurea Ceala (gratuit, înscriere în aplicație) și atelierele… vrei să îți arăt ce e sâmbătă?', events: ['ev8'], chips: ['Arată sâmbătă'] };
  if (/rezerv|bilet/.test(n)) { UI.tmp.order = { eventId: 'ev4', ti: 0, adult: 1, child: 1 }; setTimeout(() => go('/event/ev4/tickets'), 400); return { from: 'bot', text: 'Te duc la bilete: am completat 1 adult + 1 copil pentru sâmbătă la 11:00. Poți modifica oricând.' }; }
  if (/concert/.test(n)) return { from: 'bot', text: 'Săptămâna aceasta sunt 3 concerte: repetiția deschisă de azi e gratuită, iar luni vine Orchestra de Cameră „Franz Liszt” din Budapesta.', events: ['ev2', 'ev10', 'ev12'] };
  if (/cetat/.test(n)) return { from: 'bot', text: 'Cetatea Aradului e peste Mureș, la 1,2 km de tine: cam 20 de minute pe jos, peste Podul Traian. Se vizitează doar din exterior; ghidul audio are 6 puncte, de la Monumentul celor 13 Generali. Sâmbătă seara e și o plimbare ghidată gratuită.', events: ['ev5'], chips: ['Arată traseul pe hartă', 'Deschide ghidul Cetății'] };
  if (/traseu|harta/.test(n)) { setTimeout(() => go('/map?to=place:ca'), 300); return { from: 'bot', text: 'Deschid harta cu traseul pe jos.' }; }
  if (/ghid/.test(n)) { setTimeout(() => go('/place/ca'), 300); return { from: 'bot', text: 'Deschid ghidul virtual al Cetății.' }; }
  if (/gratuit/.test(n)) return { from: 'bot', text: 'Evenimente gratuite în zilele următoare:', events: ['ev2', 'ev5', 'ev8', 'ev14'] };
  if (/azi|ast(a)?zi|diseara/.test(n)) return { from: 'bot', text: 'Iată ce poți face azi:', events: ['ev1', 'ev2', 'ev3'] };
  if (/altceva/.test(n)) return { from: 'bot', text: 'Spune-mi ce îți place: muzică, teatru, sport sau ceva în aer liber. Pot căuta și după zi sau preț.', chips: ['Ce e azi?', 'Evenimente gratuite', 'Concerte'] };
  return { from: 'bot', text: `Nu am găsit evenimente pentru „${t}” în următoarele 14 zile. Răspund doar din evenimentele și locurile din aplicație. Încearcă:`, chips: ['Ce e azi?', 'Evenimente gratuite', 'Fă-mi un itinerariu de sâmbătă'] };
}

/* ---------- S11 Profil ---------- */
route('/profile', () => {
  const u = S.user; const lv = A.LEVELS; let li = 0; lv.forEach((l, i) => { if (S.points >= l[1]) li = i; }); const next = lv[li + 1];
  const itins = A.ITINS.concat(S.newItins); const rank = A.BOARD.findIndex(b => b[0] === 'Ana P.') + 1;
  const row = (ic, t, r, go, act) => `<button class="kv" style="width:100%;text-align:left" ${go ? `data-go="${go}"` : ''} ${act ? `data-act="${act}"` : ''}>${ms(ic)}<span class="grow t">${t}</span>${r || ''}${ms('chevron_right')}</button>`;
  return { body: `<div class="hd back" style="margin-bottom:6px">${backBtn()}</div><h1>Profil</h1>
    <div class="card pad row" style="gap:14px;margin-top:16px">${u ? `<span class="av user">${A.initials(u.name)}</span><div class="grow"><span class="mut" style="font-size:13px">Cont conectat · ${ROLE_LABEL[S.role]}</span><br><b style="font-size:16px">${esc(u.name)}</b><br><span class="mut" style="font-size:13px">${esc(u.email)}</span></div>` : `<span class="av">${ms('person')}</span><div class="grow"><b style="font-size:16px">Navighezi ca vizitator</b><br><span class="mut" style="font-size:13.5px">Te conectezi când cumperi bilete sau vrei puncte.</span></div><button class="btn xs" data-go="/login">Conectează-te</button>`}</div>
    <div class="card pad" style="margin-top:12px"><b style="font-size:15px">Folosești aplicația ca</b><div class="row" style="flex-wrap:wrap;gap:8px;margin-top:10px">${Object.entries(ROLE_LABEL).map(([k, l]) => `<button class="chip sm ${S.role === k ? 'on' : ''}" data-act="role" data-arg="${k}">${l}</button>`).join('')}</div><p class="mut" style="font-size:12.5px;margin-top:10px">Prototip: schimbă rolul ca să vezi fiecare perspectivă. În aplicația reală rolul vine de la cont.</p></div>
    ${S.role === 'local' ? `<button class="ptscard" style="width:100%;text-align:left;margin:12px 0 0" data-go="/leaderboard"><div class="top"><span>Punctele tale</span><span class="lvl">${lv[li][0]}</span></div><div class="n" style="font-size:40px">${S.points}<small>puncte disponibile</small></div><div class="bar"><i style="width:${next ? Math.round((S.points - lv[li][1]) / (next[1] - lv[li][1]) * 100) : 100}%"></i></div><div class="bot"><span>${next ? `Încă ${next[1] - S.points} de puncte până la ${next[0]}` : 'Nivel maxim'}</span><b>Locul ${rank}</b></div></button>` : ''}
    <div class="card" style="margin-top:12px;padding:0 16px">
      ${row('auto_awesome', `<b>Itinerariile tale</b><br><span class="mut" style="font-size:13px">${itins.length} planuri făcute de AradBot</span>`, '', '/itineraries')}
      ${row('bookmark', 'Salvate', `<span class="mut">${S.saved.length}</span>`, '/saved')}
      ${row('language', 'Limba aplicației', '<span class="mut">Română</span>', '', 'na')}
      <div class="kv">${ms('dark_mode')}<span class="grow t">Mod întunecat</span><button class="switch ${S.dark ? 'on' : ''}" data-act="dark" aria-label="Mod întunecat"><i></i></button></div>
      ${row('notifications', 'Notificări și mementouri', '<span class="mut">cu o zi înainte</span>', '', 'na')}
      ${row('install_mobile', 'Instalează pe telefon (PWA)', '', '', 'na')}
      ${row('accessibility_new', 'Accesibilitate', '', '', 'na')}
      ${row('help', 'Ajutor și contact', '', '', 'na')}
    </div>
    ${u ? `<button class="link mut" style="display:block;margin:20px auto 0;font-size:14px" data-act="logout">Deconectare</button>` : ''}
    <p class="mut" style="font-size:12px;text-align:center;margin-top:18px">AradExperience · mock final · date de exemplu</p>` };
});
ACT.logout = () => { S.user = null; S.role = 'visitor'; save(); toast('Te-ai deconectat.'); go('/home'); };
route('/saved', () => { const list = A.allEvents().filter(e => S.saved.includes(e.id)); return { body: `${pageHead('Salvate')}${list.length ? list.map(evCard).join('') : emptyState('bookmark', 'Nimic salvat încă', 'Apasă pe semnul de salvare de pe orice eveniment ca să îl păstrezi aici.')}` }; });
