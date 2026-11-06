# Echipa — 4 oameni, 4 culoare (lanes)

| Culoar | Om | Ce face |
|---|---|---|
| **P1** | **Zoltan** | Platformă, auth, livrare + găzduiește Lead Tehnic și QA & Demo |
| **P2** | **Lukas** | Experiența vizitatorului: locuri, evenimente, bilete |
| **P3** | **Octav** | Hărți & AI: hartă, chat, planificator, pitch |
| **P4** | **Damian** | Firme & comunitate: firme, oferte, puncte (bucla de demo) |

Fiecare om are **un agent Paperclip** pereche, care rulează **pe laptopul lui, cu abonamentul lui Claude** (configurare: `docs/SETUP-ECHIPA.md` și repo-ul `AradEx-Ops`). Paperclip-urile nu comunică între ele: **GitHub (PR-uri) și `docs/status/Px.md` sunt sursa comună de adevăr.** Pe laptopul lui Zoltan mai rulează **Lead Tehnic** (urmărește PR-urile tuturor, ține `docs/STATUS.md`) și **QA & Demo** (review + merge la fiecare PR, rulează fluxul din `DEMO.md`).
**Repo-uri** (organizația [HACK4ARAD](https://github.com/HACK4ARAD), 5 repo-uri surori în același folder): `AradEx-Plan` (planul comun: docs, design, CLAUDE.md, STRUCTURE.md, skill-uri), `AradEx-Backend`, `AradEx-Frontend`, `AradEx-Infrastructure` (doar P1), `AradEx-Ops` (agenții Paperclip, doar P1). Un task care atinge mai multe = același nume de branch și câte un PR în fiecare.
**T00 (drepturi pentru toți pe cele 5 repo-uri, protecție pe `main`) e primul: până atunci ceilalți nu pot face PR-uri.**

## Task-uri și ore

| | P1 · Zoltan | P2 · Lukas | P3 · Octav | P4 · Damian |
|---|---|---|---|---|
| Task-uri | T00, T01, T02, T03, T04, T14, T16a | T05, T06, T07, T15 | T08, T12, T13, T16b | T09, T10, T11 |
| Ore (est.) | 1 + 1,5 + 2 + 5 + 2 + 3 + 2 = **16,5** | 3 + 5,5 + 5 + 2,5 = **16** | 4 + 4 + 6 + 2 = **16** | 5 + 4 + 6 = **15** |
| Stretch | — | recenzii la evenimente (T07 partea 2) | T17 Google rating, T19 Transport (tramvai) | T18 Rol Voluntar + mesaje |
| Migrări rezervate | V2 (există); extra V20–V29 | V3, V4 (există), V5; extra V30–V39 | V9; extra V40–V49 | V6, V7, V8, V10; extra V50–V59 |
| Pași din DEMO.md | 9 (admin), deploy | 1, 3 | 2, 4 | 5, 6, 7, 8 |

Review uman în perechi: **Zoltan ↔ Lukas**, **Octav ↔ Damian** (verificare pe telefon real și pe web ≥ 1280 px). QA & Demo face review-ul tehnic și merge-ul.

## Cine ce atinge (ca să nu ne călcăm pe fișiere)
Regula: **editezi doar fișierele culoarului tău.** Dacă îți trebuie o schimbare la altcineva, o ceri în task-ul/PR-ul lui. T02 (P1) creează dinainte toate fișierele de view de mai jos ca placeholdere (router-ul arată spre ele în loc de `PlaceholderView`) și împarte i18n/tipurile/clientul API pe module, deci nimeni nu mai editează router-ul, navigația sau fișierele `index.ts` comune.

| | P1 · Zoltan | P2 · Lukas | P3 · Octav | P4 · Damian |
|---|---|---|---|---|
| **BE** (`AradEx-Backend`, în fiecare layer: `api/<F>Api`, `dto/<f>/`, `controller\|service\|repository\|entity\|mapper/<f>/`, testele, `src/test/resources/{dto,requests}/<f>/`, `mock/<F>Mock`) | feature-urile `auth`, `users`, `admin`, `health`, `common` + transversal: `enums/Role`, `annotations/`, `exceptions/`, `Application`, `config/` (inclusiv `SecurityConfig`), `security/`, `util/`, `controller/handler/`, `application*.yml`, `*.gradle`, `Dockerfile`, `.github/`, migrările V1–V2 | `places`, `events`, `tickets` (+ enum-urile lor) | `ai`, `itineraries` | `business`, `offers`, `community`, `points` (`PointsService`) |
| **Views mobil** (`AradEx-Frontend/src/mobile/views/`) | `auth/`, `profile/`, `home/HomeView` (doar cochilia cu tab-uri), `PlaceholderView` | `home/HomeEventsTab`, `events/` (`SearchView`, `EventDetailView`, `SavedView`), `tickets/` (`EventTicketsView`, `CheckoutView`, `ConfirmView`, `TicketsView`, `TicketView`), `places/PlaceView` | `map/MapPageView`, `chat/ChatView`, `plan/` (`PlanView`, `ItineraryView`, `ItineraryMapView`) | `home/HomeOffersTab`, `home/HomeCommunityTab`, `offers/`, `community/` (`CommunityView`, `ActionDetailView`, `LeaderboardView`), `business/` (`BusinessView`, `PanelView`) |
| **Views web** (`AradEx-Frontend/src/web/views/`) | `auth/`, `admin/`, `PlaceholderView` | `home/LandingView`, `events/`, `places/`, `account/` | `map/`, `plan/`, `chat/` | `offers/`, `community/`, `business/` (`BusinessPublicView`, `BusinessPanelView`), `city/CityPanelView` |
| **Componente** (`AradEx-Frontend/src/shared/components/`) | `ui/` (`App*`, `AppSheet`, `EmptyState`, `Skeleton`, `PlaceholderScreen`, `ApiStatus`), `auth/`, `qr/QrCode`, `index.ts` | `events/` (`EventCard`…), `places/` (`PlaceCard`, `AudioGuideBar`) | `map/MapView` | `offers/`, `community/`, `qr/QrScanner` |
| **Composables / stores** | `useFormat`, `useGeo`, `stores/auth`, `stores/ui` | `useTts` | `useRoute` | — |
| **API + tipuri FE** (`shared/api/`, `shared/types/`) | `client`, `auth`, `admin`, `health` | `places`, `events`, `tickets` | `ai`, `itineraries` | `business`, `offers`, `community` |
| **i18n** (`shared/i18n/ro/` și `en/`) | `common`, `auth`, `admin` | `places`, `events`, `tickets` | `map`, `chat`, `plan` | `business`, `offers`, `community` |
| **Fișiere comune** | `router/index.ts`, layout-uri, navigație, `types/api.ts` și `api/index.ts` (doar re-export), `docs/STATUS.md` (Lead) | — | — | — |
| **Repo-urile `AradEx-Infrastructure` și `AradEx-Ops`** | tot (fiecare om doar rulează `setup-lane.mjs` din Ops) | — | — | — |
| **Docs** (`AradEx-Plan`) | `docs/status/P1.md`, `DEPLOY.md` | `docs/status/P2.md` | `docs/status/P3.md`, slide-uri | `docs/status/P4.md` |

`docs/API.md`: fiecare modifică doar secțiunea modulului lui.

### Punctele de contact între culoare (stabilite dinainte)
- **Entitatea `Business` (T03, P1 → T09, P4):** P1 creează în T03 `entity/business/Business` + `repository/business/BusinessRepository` (cerute de înregistrarea cu rol BUSINESS); din T09 pachetele `business` sunt ale lui P4, care le extinde (V6).
- **Evenimente create de firme (T09, P4):** P4 apelează `EventService.createForOrganizer/updateForOrganizer/deleteForOrganizer`, pe care le scrie P2 în T06. P4 nu atinge pachetul `events`.
- **Home S1:** P1 face cochilia cu 3 tab-uri; P2 completează `HomeEventsTab`, P4 completează `HomeOffersTab` și `HomeCommunityTab`.
- **`EventCard` compact** pentru chat (T12, P3): P2 îl expune în T06 cu prop-ul `compact`.
- **Coloana `google_place_id`** (pentru T17, P3): P2 o adaugă pe `places` în V5, P4 pe `businesses` în V6. P3 doar o citește.
- **Rolul `VOLUNTEER`** (T18, stretch): P4 o cere lui P1 (enum `Role` + `SecurityConfig`).
- **Admin (T14, P1):** schimbă doar `status` prin repository-urile existente ale celorlalți, după ce T09–T11 sunt în `main`.
- **Indicații** din ecranele lui P2/P4: link spre ruta hărții (`/m/map?to=lat,lng`, `/w/map?to=`) a lui P3. Singura excepție: mini-harta de pe landing (`LandingView`, al lui P2) importă `MapView` după T08.
- **`SecurityConfig` și selectorul de limbă:** le face P1 în T03 pentru toate endpoint-urile din `docs/API.md` și pentru Profil/`WebLayout`; ceilalți nu le ating.
- **Chat pe web:** doar pagina `/w/chat` (P3), fără panou în layout-ul lui P1.
- **Import da, editare nu:** poți importa și apela codul altui culoar (servicii, repository-uri, componente, `shared/api/<modul>`), dar nu-l modifici.

## Calendar
| Când | P1 · Zoltan | P2 · Lukas | P3 · Octav | P4 · Damian |
|---|---|---|---|---|
| **Vineri 6 nov, seara** | T00 (drepturi pe repo-uri, CI), T01, T02 (structura anti-conflict) → T03 | T05 (poze + ecrane), pregătește T06 | T12 BE (`OpenAiClient`, `fallback.json`) + `MapView` pentru T08 | seed-uri V6/V7/V8 (firme, oferte, acțiuni) + schelet T09 |
| **Sâmbătă 7 nov, dimineața** | T04 deploy v0 | T06 final | T08 | T09 |
| **Sâmbătă, după-amiaza** | T14 BE + FE | T07 | T12 final | T10 |
| **Sâmbătă, seara/noaptea** | integrare, `main` verde, fluxul de demo | T15 (limbă, PWA) | T13 | T11 (bucla de puncte) |
| **Duminică 8 nov, până la 10:00** | T16a deploy final + seed prod | stabilizare, telefon A în demo | T16b slide-uri + video de rezervă | stabilizare, telefon B în demo |

10:00 îngheț de cod · 12:00 prezentări · la 02:00 noaptea se opresc feature-urile noi (doar stabilizare).

## Linia de demo (obligatoriu)
T00–T13 + T16. T14, T15 și tot ce e „stretch” doar dacă linia de demo e verde.
