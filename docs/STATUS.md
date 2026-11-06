# STATUS — rezumatul echipei

**Acest fișier îl actualizează doar Lead Tehnic / Persoana 1 (Zoltan).** Fiecare culoar își scrie starea, deciziile și problemele în `docs/status/P1.md` … `P4.md`, în propriile PR-uri, ca să nu se calce pe același fișier.

Ultima actualizare: 2026-11-06 (kit v3 — 5 repo-uri; BE Gradle cu `api` = contract, `app` = aplicație; înainte de cod)

## Task-uri
| Task | Stare | Cine | Branch / PR | Note |
|---|---|---|---|---|
| T00 Repo & tooling | IN PROGRESS | P1 Zoltan (kit) | — | 5 repo-uri în HACK4ARAD cu conținutul kitului v3: `AradEx-Plan` (docs, design, CLAUDE.md, STRUCTURE.md, toate skill-urile, setup.sh), `AradEx-Backend` (Gradle `api`/`app`, CI), `AradEx-Frontend` (Vue, CI), `AradEx-Infrastructure` (compose), `AradEx-Ops` (Paperclip) — de făcut: drepturi pentru toți, protecție pe `main`, primul PR (pornește CI-ul) |
| T01 API skeleton | IN PROGRESS | P1 Zoltan (kit) | — | schelet Gradle multi-modul scris în avans (`AradEx-Backend/README.md`, `CLAUDE.md`): `api` (HealthApi, AuthApi + DTO-uri auth/common, 2 teste), `app` (Application, config, security, error, util, health controller, V1–V4 + seed-uri, 4 teste) — **de compilat** (`./gradlew test`) și de rulat o dată |
| T02 APP skeleton | IN PROGRESS | P1 Zoltan (kit) | — | schelet construit și verificat (`npm run build/test` verzi): layout-uri, router cu toate rutele, client API, auth store, componente de bază, i18n, PWA. Lipsesc: MapView, QrCode/QrScanner, AppSheet (vin în task-urile lor) |
| T03 Auth & roluri | TODO | P1 Zoltan | | migrarea V2 + seed-ul V2_1 (conturi demo) există; contractul `AuthApi` + DTO-urile există în `api` |
| T04 Deploy v0 | TODO | P1 Zoltan | | |
| T05 Locuri & ghid | TODO | P2 Lukas | | migrarea V3 + seed-ul V3_1 (12 locuri reale, 33 puncte de ghid) există; de adăugat pozele |
| T06 Evenimente | TODO | P2 Lukas | | migrarea V4 + seed-ul V4_1 (21 evenimente reale + 9 demo) există |
| T07 Bilete | TODO | P2 Lukas | | |
| T08 Hartă | TODO | P3 Octav | | |
| T09 Firme & panou | TODO | P4 Damian | | |
| T10 Oferte & coduri | TODO | P4 Damian | | |
| T11 Comunitate & puncte | TODO | P4 Damian | | |
| T12 Chat AI | TODO | P3 Octav | | |
| T13 Planificator itinerar | TODO | P3 Octav | | |
| T14 Admin | TODO | P1 Zoltan | | |
| T15 i18n / PWA / Android | TODO | P2 Lukas | | |
| T16a Deploy final & seed prod | TODO | P1 Zoltan | | |
| T16b Pitch, slide-uri, video de rezervă | TODO | P3 Octav | | |
| T17 Google rating (opțional) | TODO | P3 Octav | | stretch |
| T18 Rol Voluntar + mesaje (opțional, din prototipul IA) | TODO | P4 Damian | | stretch |
| T19 Transport public / tramvai (opțional, din prototipul IA) | TODO | P3 Octav | | stretch |

Stări: TODO · IN PROGRESS · REVIEW · DONE · BLOCKED (cu motiv).

Culoare și oameni: vezi `docs/TEAM.md` (P1 Zoltan · P2 Lukas · P3 Octav · P4 Damian).

## Următorul număr de migrare Flyway liber
`V5` (V1 baseline, V2 users/businesses, V3 places, V4 events — toate scrise și verificate pe Postgres 16 la 6 nov). Numerele sunt **rezervate dinainte pe task** (mai jos); nu e nevoie să editezi aici. Dacă îți trebuie încă o migrare, folosește următorul număr din rezerva culoarului tău: P1 → V20–V29, P2 → V30–V39, P3 → V40–V49, P4 → V50–V59. V5 = tickets + reviews (T07), V6 = announcements + google_place_id (T09), V7 offers, V8 community/points, V9 itineraries, V10 volunteers + messages (T18, stretch), V11 transport (T19, doar dacă e nevoie de tabele).

## Decizii luate
- 2026-11-06 · Email + parolă în loc de cod pe e-mail (prototip) — fără server de mail de configurat.
- 2026-11-06 · Un singur proiect Vue cu `mobile/` și `web/` + `shared/`; PWA din start, Capacitor opțional la final.
- 2026-11-06 · Plata biletelor e simulată; „Plată demonstrativă” vizibil în UI.
- 2026-11-06 · OpenAI doar prin backend; răspunsuri de fallback pentru demo.
- 2026-11-06 · Hărți: Leaflet + OSM + OSRM public. Fără Google Maps.
- 2026-11-06 · Ghid audio: `speechSynthesis` în browser; OpenAI TTS doar dacă rămâne timp.
- 2026-11-06 · Cetatea Aradului și Turnul de Apă sunt obiective „doar exterior” (`exterior_only`) — interiorul nu se vizitează (unitate militară / închis). Ghidurile sunt scrise din exterior.
- 2026-11-06 · Evenimentele reale sunt `EXTERNAL` cu link spre organizator; cele cu bilete în aplicație sunt fictive și marcate `is_demo`.
- 2026-11-06 · Google: doar citire (rating/recenzii Places, opțional T17) + link „Google Calendar” fără login; fără OAuth/sincronizare inversă.

## Probleme cunoscute / de rezolvat
- (nimic încă)

## Ce a rămas în afara planului (idei pentru „ce urmează” în pitch)
- Notificări push, recenzii la evenimente, plăți reale, limba maghiară, traducere automată a ghidului.
