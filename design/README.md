# design/ — prototipuri, ecrane, poze

## Designul final (sursa de adevăr) → `final/`
- `final/mobile.html` — aplicația (390×844, 36 de ecrane, roluri Vizitator / Localnic / Voluntar / Firmă / Primărie) și `final/web.html` — site public + panourile Primărie / Admin / Firmă (37 de pagini). Vanilla HTML/JS, fără build; `python3 -m http.server` în `final/` pentru hărți și sincronizarea admin ↔ aplicație. Detalii, conturi demo și tabelul mobil/web: `final/README.md`.
- `final/screens/sheet-mobile.png` și `final/screens/sheet-web.png` — planșele cu toate ecranele (capturile individuale se regenerează cu `final/screens/shoot-all.mjs`, Playwright + Chrome).
- Pozele reale ale obiectivelor: `assets/loc-*.jpg` (Wikimedia Commons, CC BY / CC BY-SA; autorii în `assets/CREDITS-foto-obiective.json`; afișați și în aplicație).
- Ce e mai jos (prototipul original, extensiile, web-ul vechi, `screens/`, `sheets/`) rămâne ca istoric și pentru codurile ecranelor S/E/W.

## Fișiere (istoric)
- `AradExperience.html` — **prototipul original** (clickabil, un singur fișier, ~6 MB). Deschide în browser. Cod de login în prototip: `123456`. Panoul din dreapta: fluxuri A–D, „Jump to screen” S0–S12, meniu Debug (roluri, stări, dark mode, RO/EN/HU). Detalii în `CITESTE-MA-prototip-original.txt`.
- `AradExperience-extensii.html` — **ecranele noi** (E1–E7 mobil, W1–W4 web), în același stil „Clean Ink”. Fonturile și CSS-ul sunt locale (`assets/clean-ink.css`, `assets/fonts/`), merge și offline. Referință vizuală.
- `AradExperience-web.html` — **toate paginile web W5–W26** (publice, panou firmă, panou Primărie, admin), referință vizuală.
- `AradExperience-web-prototip.html` — **prototipul web navigabil**: toate paginile într-un singur fișier, cu meniuri/sidebar/carduri funcționale (hash routing), bară „Demo” cu comutator de rol și listă de pagini, toast-uri care spun ce endpoint ar fi apelat. Deschide-l în browser.
- `screens/` — câte un JPG per ecran (2× rezoluție). Numele = codul ecranului din `docs/PLAN.md` / `docs/API.md`.
- `sheets/` — planșe de ansamblu (toate ecranele grupate), bune de pus în slide-uri.
- `assets/` — poze cu licență liberă (jpg, 720×450) + fonturi (Inter, Material Symbols) extrase din prototip. Copiază `assets/*.jpg` în `public/img/` (rădăcina repo-ului FE) când le folosești în seed (T05/T06/T10).

## Harta ecranelor → rute → task-uri
| Cod | Ecran | Rută FE | Task |
|---|---|---|---|
| S0 | Limba | (onboarding) | T15 |
| S12 | Login / cont | `/m/login`, `/w/login` | T03 |
| S1 (+E6) | Acasă: Evenimente / Oferte / Comunitate | `/m` | T06, T10, T11 |
| S2 | Căutare + filtre | `/m/search` | T06 |
| S3 | Detaliu eveniment | `/m/events/:id` | T06 |
| S4, S5, S6 | Bilete, plată simulată, confirmare | `/m/events/:id/tickets`, `/m/checkout`, `/m/confirm/:code` | T07 |
| S7 | Hartă | `/m/map` | T08 |
| S8 | Chat AI | `/m/chat` | T12 |
| S9, S10 | Biletele mele, bilet cu QR | `/m/tickets`, `/m/tickets/:code` | T07 |
| S11 | Profil + rol | `/m/profile` | T03 |
| S1b, S1c, S1g | Oferte, detaliu, cod revendicat | `/m/offers`, `/m/offers/:id` | T10 |
| S1d, S1e, S1f | Comunitate, acțiune, clasament | `/m/community`, `/m/community/actions/:id`, `/m/community/leaderboard` | T11 |
| S11c, S11d, E5 | Panou firmă (mobil), ofertă/eveniment nou | `/m/panel` | T09, T10 |
| S11e, S11f, S11g, E7 | Panou primărie (mobil), validare, scanner, acțiune nouă | `/m/panel` | T11 |
| E1, E2, E4 | Planificator, itinerar, hartă traseu | `/m/plan`, `/m/itinerary/:id`, `/m/itinerary/:id/map` | T13 |
| E3 | Ghid virtual (scris + audio) | `/m/places/:id` | T05 |
| W1 | Landing web | `/w` | T06, T08 |
| W2 | Panou Primărie web | `/w/city` | T11 |
| W3 | Admin web | `/w/admin` | T14 |
| W4 | Panou Firmă web | `/w/business` | T09, T10 |
| W5, W6 | Evenimente, detaliu + bilete | `/w/events`, `/w/events/:id` | T06, T07 |
| W7, W8 | Obiective, ghid virtual | `/w/places`, `/w/places/:id` | T05 |
| W9 | Hartă | `/w/map` | T08 |
| W10 | Planificator | `/w/plan` | T13 |
| W11 | Oferte | `/w/offers` | T10 |
| W12 | Comunitate | `/w/community` | T11 |
| W13 | Chat | `/w/chat` | T12 |
| W14 | Contul meu (bilete, salvate, puncte, oferte, itinerarii, setări) | `/w/account` | T07, T10, T11, T13 |
| W15 | Pagina publică a firmei | `/w/businesses/:id` | T09 |
| W16–W19 | Firmă: oferte, evenimente, anunțuri, validează coduri | `/w/business/*` | T09, T10 |
| W20–W22 | Primărie: panou, acțiuni, clasament | `/w/city/*` | T11 |
| W23–W26 | Admin: firme, conținut, obiective & ghiduri, utilizatori | `/w/admin/*` | T14, T05 |

## Stil „Clean Ink” (tokens)
Fundal `#F7F7F2` · ink `#111111` · text secundar `#5C5C5C` · bordură `#D6D6D0` · accent `#FF5A36` · verde puncte `#1F3A1A` · galben popular `#FFC43D` · piersică ofertă `#FFE8E2` · carduri albe radius 16 · buton primar negru radius 14, h 48–50 · chips radius 999 · font Inter (400–700) · icon-uri Material Symbols Outlined (wght 300).
Mobil: 390×844, tab bar cu 5 intrări și butonul rotund „Hartă” în mijloc. Web: bară sus 64px, sidebar 250px, conținut max ~1200px, tabele albe radius 16.

## Licențe poze
Obiective (`assets/loc-*.jpg`, Wikimedia Commons): Cetatea Aradului – Vasile Topac (CC BY-SA 3.0 RO); Palatul Cultural – Roland Meier (CC BY-SA 2.5); Teatrul Clasic – B. Proksch (CC BY-SA 2.5); Palatul Administrativ – Wikimedia Commons (CC BY-SA 3.0); Biserica Roșie – Roland Meier (CC BY-SA 2.5); Catedrala Ortodoxă – tamba lucian (CC BY-SA 3.0); Catedrala Romano-Catolică – IuliuSturza92 (CC BY-SA 4.0); Turnul de Apă – Fred Romero (CC BY 2.0); Faleza/Podul Mureș – bogdymol (CC BY-SA 4.0); Lunca Mureșului – Oguszt (CC BY-SA 3.0); Castelul Macea – Radufan (CC BY-SA 3.0). Sursele exacte în `assets/CREDITS-foto-obiective.json`.

### Din prototipul original
Oferte, acțiuni, locuri (Wikimedia Commons): cafea – Abdulrohmatt (CC BY-SA 4.0); covrigi – Nicubunu (CC BY-SA 3.0); degustare de vin – Sarah Stierch (CC BY 4.0); miere – Amelia Bartlett (CC0); prăjitură – Daria Yakovleva (CC0); plantare copaci – U.S. Air Force, Christopher Tam (domeniu public); curățenie – David Lally (CC BY-SA 2.0); donare de sânge – Shixart1985 (CC BY 2.0); ciorbă de pește – Sacha47 (CC BY-SA 4.0); cappuccino – Frettie (CC BY 3.0); grădină restaurant – Acabashi (CC BY-SA 4.0).
Pozele cu Cetatea Aradului (Vasile Topac, CC BY-SA 3.0 RO) și Palatul Cultural (Chainwit., CC BY 4.0) se încarcă în prototipul original de pe Wikimedia Commons — descărcați-le de acolo pentru seed și păstrați creditul în `places.image_credit`. Pozele de evenimente din prototip sunt de pe Unsplash (licență Unsplash).
Hartă: © OpenStreetMap contributors; tile-uri Esri/OSM; trasee OSRM (routing.openstreetmap.de).
