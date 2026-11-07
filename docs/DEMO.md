# Povestea de demo (≤ 6 minute) + pitch

> Orientativ: dă o idee despre cum legăm feature-urile. Se clarifică exact la final. La un PR verificăm doar că feature-ul lui e funcțional, nu tot fluxul.

Dispozitive: **telefon A** (aplicația instalată: vizitator → apoi localnic), **telefon B** (aplicația: primăria, pe teren), **laptop pe proiector** (site-ul de prezentare + panourile web; simulatorul iOS dacă nu avem iPhone).
Conturi: `visitor@demo.ro`, `local@demo.ro`, `firma@demo.ro`, `primaria@demo.ro` / `demo1234`. Toate datele sunt din seed — nu improviza.

## Fluxul (în ordinea în care se construiește și se demonstrează)
1. **Vizitator ajunge în Arad** (telefon A, `/m`): Acasă → vede evenimentele de azi, 🔥 Popular. *(T06)*
2. **Chat**: „Ce pot face cu copiii în weekend?” → întrebare de clarificare → chips „Sâmbătă” → 2–3 evenimente din DB → deschide Teatrul de păpuși. *(T12)*
3. **Bilete**: 1 adult + 1 copil → plată demonstrativă → bilet cu QR în „Biletele mele”. *(T07)*
4. **Planificator**: „Am 4 ore, pe jos, istorie + o cafea” → program cu 4 opriri și ore → harta cu traseul → „Pornește ghidul” la Cetate (ghid **din exterior**: Monumentul celor 13 Generali, zidurile) → ghid scris + audio pe primul punct. *(T13, T08, T05)*
5. **Schimbăm la localnic** (telefon A, `local@demo.ro`): tab Comunitate → 270 puncte, locul 16 → „Plantăm copaci pe Faleză, +50” → Mă înscriu → QR-ul meu. *(T11)*
6. **Primăria pe teren** (telefon B, `/m/panel`): Scanează QR-ul de pe telefonul A → „Confirmat, +50 puncte”. Pe proiector `/w/city`: lista de participanți se actualizează. *(T11)*
7. **Înapoi la localnic**: soldul 320, clasamentul urcă → Oferte → „Cafea -20%, 30 de puncte” → Plătește cu puncte → cod QR. *(T10, T11)*
8. **Firma** (proiector `/w/business`): Validează cod → scanează/introduce codul → „Folosit” → statistica „Plăți cu puncte” crește, activitatea recentă arată tranzacția. *(T09, T10)*
9. **Admin** (proiector, 20 s): firma nouă de verificat → Verifică. *(T14, opțional)*
10. Închidere: slide „ce urmează”.

Plan B: dacă pică internetul la OSRM/Claude API, aplicația arată fallback-urile; dacă pică tot, videoclipul de backup (înregistrat duminică dimineață).

## Pitch (max 8 slide-uri, 3 minute + demo)
1. Problema: evenimentele și ofertele din Arad sunt împrăștiate; turistul nu știe ce să vadă în 4 ore; comunitatea nu e recompensată.
2. Soluția: AradExperience — o aplicație, patru roluri, o buclă: comunitate → puncte → economie locală.
3. Pentru vizitator: chat + itinerar + ghid audio (temele 2 și 4).
4. Pentru firmele locale: oferte, evenimente, anunțuri, clienți care plătesc cu puncte (tema 1).
5. Pentru Primărie: acțiuni comunitare validate cu QR, clasament, Gala Voluntarilor (temele 3 și 5).
6. Demo live.
7. Tehnologie într-un slide: Vue + Spring Boot + Postgres + Claude (Anthropic) + OpenStreetMap; aplicația Android + iOS (Capacitor) și panourile web din același cod.
8. Ce urmează: notificări, plăți reale, transport public, parteneriate cu firme, HU/EN.

## Cronometru de siguranță
Fiecare pas ≤ 40 s. Dacă un pas se blochează > 20 s, spui „în paralel…” și treci la următorul; nu se depanează pe scenă.
