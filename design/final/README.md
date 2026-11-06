# AradExperience · mock final (mobil + web)

Prototip funcțional al variantei finale de design: **aplicația de telefon** (localnici și vizitatori) și **web-ul** (site public + panourile Primăriei, firmelor partenere și administratorului). Un singur set de date, în același browser: ce publici din web apare în telefon, ce fac oamenii în telefon (înscrieri, revendicări, bilete) apare în panouri.

## Cum îl deschizi
- `index.html` → alege Aplicația sau Web. Merge și direct din Finder (fișier), dar hărțile și sincronizarea admin ↔ aplicație sunt sigure cu un server local:
  ```bash
  cd AradEx-Mock && python3 -m http.server 8766
  ```
  apoi `http://localhost:8766/` (aplicația: `mobile.html`, web: `web.html`).
- Conturi demo: `visitor@demo.ro`, `local@demo.ro`, `firma@demo.ro`, `primaria@demo.ro`, `admin@demo.ro` · parola `demo1234`. Cod voluntar: `482913` (Andrei Popa), `731508` (Maria Ionescu).
- În aplicație: panoul din dreapta (pe desktop) schimbă rolul și sare la orice ecran; pe telefon aplicația e pe tot ecranul (poți adăuga `?role=local` etc. în URL). În web: bara „Demo” de jos schimbă fața (Site public · Primăria · Firmă · Admin).
- „Resetează” șterge starea din browser (`localStorage`, cheia `aradx_mock_v2`).

## Capturi de ecran
- `screens/sheet-mobile.png` · toate cele 36 de ecrane ale aplicației, într-o singură planșă.
- `screens/sheet-web.png` · toate cele 37 de pagini web (site public + panouri), într-o singură planșă.
- Individual: `screens/mobile/*.png` (390×844 @2x) și `screens/web/*.png` (1440 px, pagină întreagă). Lista: `screens/index.json`. Se regenerează cu scriptul Playwright din handoff (`tools/shoot-all.mjs`, în scratchpad-ul sesiunii) sau manual.

## Ce am luat din fiecare sursă
**Din designul tău (AradExperience information architecture, rămâne baza):** navbar rotunjit plutitor cu Hartă la mijloc; acasă cu 3 butoane mari Evenimente · Oferte · Comunitate; Oferte în stil Glovo (banner galben, cercuri-categorii); Comunitate în stil Strava/Duolingo (card verde cu puncte, nivel, progres, serie, loc în clasament; acțiunile ca „bilete” cu data în colț); hartă curată Leaflet + tile-uri gri Esri, doar pinii aplicației, „Arată traseul” OSRM; Transport în comun cu liniile reale CTP Arad (OSM), stații lângă tine, plan de drum, călătorie simulată cu banner + insulă dinamică; itinerarii AradBot cu opriri pe linie verticală pe care le bifezi, inel de progres, „Cum ajung” → Transport; rolul Voluntar (cod SMS, acțiuni blocate până în zi, bifă verde la final, scanner, mesaje cu coordonatorul); admin-ul web cu sidebar întunecat, KPI cu mini-grafice, tabele cu filtre, formulare cu previzualizare live a telefonului și încărcare de poză; Primăria = administrator complet; firmele și voluntarii nu își fac singuri conturi (firmele pot cere, Primăria verifică); recenzii + pagina unui loc; poze reale cu licență.

**Din repo-ul de planning (`AradEx-Plan/design` + `docs/FEATURES.md`), adăugate acum:** obiective reale cu **ghid virtual scris + audio** (E3/W8: 12 locuri, puncte de ghid, bară audio TTS, „Ești aici”, exterior-only pentru Cetate și Turnul de Apă); **Planificator de itinerar** E1→E2→E4 / W10 (timp, dată, transport, interese, text liber → program cu ore, mers pe jos, hartă cu pini numerotați, „Pornește ghidul”); badge **🔥 Popular**, „Bilete în aplicație / Doar în AradExperience” vs **Extern** (link spre organizator), **Adaugă în calendar**, **Google Maps**; **Indicații** de oriunde; chat cu **carduri de evenimente + chips de clarificare** și generare de itinerariu; **plata cu puncte** la oferte și categoria „Cu puncte”; **pagina publică a firmei** (oferte, evenimente, anunțuri, program, păreri) și **Anunțuri**; **înregistrare firmă** → cont neverificat → **verificare** (Primărie/Admin) → conținutul devine public; **Admin platformă** (conținut & moderare: publică/ascunde orice; utilizatori: rol, puncte, dezactivare; setări); **Obiective & ghiduri** editabile în panou (+ „Generează cu AI”); site public complet (W1, W5–W15) cu landing, agendă cu filtre, hartă cu listă, oferte, comunitate cu clasament, chat, **Contul meu** ca hub; mobile **Panou pe teren** redus la ce îți trebuie la casă / pe teren (validare cod, scanare QR, lista de azi), restul doar pe web; conturi cu e-mail + parolă și roluri (FEATURES §1), date reale din `ARAD-DATA.md` (evenimente Filarmonica, Teatrul Clasic, Târgul de Crăciun, UTA) marcate față de cele demo.

## Împărțirea funcționalităților (decizia propusă)
| | Mobil (localnic, vizitator) | Web public | Web panouri |
|---|---|---|---|
| Evenimente, detaliu, bilete QR, salvate | ✔ principal | ✔ (grid + detaliu + cutie bilete, Contul meu) | creare/moderare |
| Oferte, revendicare, plata cu puncte | ✔ principal | ✔ | Firmă: creare, pauză; validare coduri |
| Comunitate: acțiuni, înscriere, QR, clasament, recompense | ✔ principal (localnic) | ✔ (listă + clasament public) | Primărie: creare, validare, voluntari, mesaje, clasament |
| Obiective + ghid audio | ✔ | ✔ | Primărie/Admin: editare ghiduri |
| Hartă + indicații | ✔ | ✔ | — |
| Planificator + itinerarii | ✔ (E1–E4, Profil) | ✔ (W10) | — |
| Chat AI | ✔ | ✔ | — |
| Transport în comun | ✔ doar mobil | — | — |
| Voluntar (cod SMS, scanare, mesaje) | ✔ doar mobil | — | Primărie creează conturile |
| Panou firmă / Primărie | doar operațiuni pe teren | — | ✔ complet |
| Verificare firme, utilizatori, moderare | — | înregistrare firmă | ✔ Primărie (firme) + Admin (tot) |

## Structură
`mobile.html` + `mobile/core.js`, `mobile/screens-a.js`, `mobile/screens-b.js` · `web.html` + `web/core.js`, `web/public.js`, `web/panel.js` · `shared/data.js` (datele, starea partajată), `shared/tram.js` (linii CTP din OSM, ODbL; orare de exemplu), `shared/ui.css` (token-urile Clean Ink + admin), `shared/img/` (poze cu licență, creditele în `data.js`).

Vanilla HTML/JS, fără build. Dependențe externe la rulare: Leaflet (unpkg), tile-uri Esri, OSRM (routing.openstreetmap.de), Google Fonts (Inter, Material Symbols). Limba: română (EN/HU planificate prin i18n). Prototipul nu înlocuiește documentația: după validare, `docs/FEATURES.md`, `docs/PLAN.md` și `design/README.md` din `AradEx-Plan` se aliniază la el.
