# AradExperience — Plan de implementare (Hack4Arad 2026)

Toate funcționalitățile, împărțite în **story-uri de mărime medie** (câteva ecrane + entități + endpoint-uri), cu dependențele și ordinea în care ar trebui făcute. **Cine ia ce story se decide în echipă, în ziua respectivă**; nu există împărțire fixă pe oameni. Fiecare story se verifică la final cu skill-ul `task-workflow` (secțiunea „Verificare” e checklist-ul feature-ului, nu al întregului demo).

**Designul final** (ecranele pe care le implementăm): `design/final/` — `mobile.html` (aplicația) și `web.html` (din el se folosesc doar panourile și landing-ul ca bază pentru site-ul de prezentare), planșele în `design/final/screens/`, descrierea în `design/final/README.md`.

> **Decizie (7 nov): produsul e aplicația mobilă.** Vizitatorii și localnicii folosesc **doar aplicația de telefon** — **Android (APK/AAB)** și **iOS (bundle din Xcode)**, construite cu Capacitor din același cod Vue (`/m`). **Web-ul** (`/w`) are doar două părți: **site-ul de prezentare** (ce e AradExperience, funcțiile, rolurile, „Descarcă aplicația” Android/iOS, contact) și **panourile** Primăriei, firmelor și Adminului (`/w/city/*`, `/w/business/*`, `/w/admin/*`, cu login-ul lor W0). Paginile publice web din designul final (W5–W15: agendă, obiective, hartă, oferte, comunitate, chat, planificator, Contul meu, pagina publică a firmei) **nu se mai fac**; conținutul lor există doar în aplicație. Story-urile de mai jos se citesc așa: „FE mobil” = aplicația; „FE web” = doar panouri sau site-ul de prezentare.

Convenție: `T05` = story; `S3`, `E2`, `W6` = codurile ecranelor (vezi planșele din `design/final/screens/` și tabelul din `design/README.md`).
Contractul de API este în `docs/API.md`, modelul de date în `docs/DATA-MODEL.md`, povestea de demo în `docs/DEMO.md` (toate în repo-ul `AradEx-Plan`, folderul `docs/`).
Cinci repo-uri git surori (organizația HACK4ARAD, același folder): `AradEx-Plan` (planul comun: `docs/`, `design/`, `CLAUDE.md`, `STRUCTURE.md`, toate skill-urile — de aici se deschide Claude Code), `AradEx-Backend` (Gradle multi-modul: `api` = contractul REST, `app` = aplicația), `AradEx-Frontend` (Vue, web + mobil), `AradEx-Infrastructure` (Postgres local, deploy) și `AradEx-Ops` (agenții Paperclip).
Un story care atinge mai multe repo-uri = un branch cu același nume în fiecare (`feat/T07-tickets`) și câte un PR.


## Ordinea de implementare (story-uri și dependențe)

| # | Story | Depinde de | De ce acum |
|---|---|---|---|
| 1 | T00 Repo & tooling · T01 API skeleton · T02 APP skeleton | — | baza; fără ele nimeni nu poate porni |
| 2 | T03 Auth & roluri | T01, T02 | toate ecranele au nevoie de cont/rol |
| 3 | T04 Deploy v0 | T01, T02 | în paralel cu T03; URL public devreme |
| 4 | T05 Locuri & ghid virtual · T06 Evenimente | T03 | conținutul pe care se construiește tot |
| 5 | T07 Bilete · T08 Hartă & indicații · T09 Firme & panou | T06 (T08: și T05) | trei story-uri independente, pot merge în paralel |
| 6 | T10 Oferte & coduri · T11 Comunitate & puncte · T12 Chat AI | T09 (T10) · T03+T10 (T11) · T06 (T12) | bucla de valoare + diferențiatorul AI |
| 7 | T13 Planificator itinerar · T14 Admin (web) | T05+T08+T12 (T13) · T09+T10+T11 (T14) | ultimele piese mari |
| 8 | T19 Transport în comun · T18 Rol Voluntar | T08 (T19) · T11 (T18) | din designul final; după ce bucla de bază e verde |
| 9 | T15 Aplicația mobilă Android + iOS (obligatoriu), i18n · T20 Web = prezentare + panouri · T17 Google Places (opțional) | ecranele existente | aplicația instalabilă pe ambele platforme e livrabilul; T17 doar dacă rămâne timp |
| 10 | T16 Deploy final, seed, demo (T16a/T16b) | toate | duminică dimineață |

Paralelizare: după T03, patru oameni pot lucra simultan pe T05/T06, apoi T07/T08/T09, apoi T10/T11/T12, apoi T13/T14/T18/T19. Fișierele comune (`SecurityConfig`, router, layout-uri, `client.ts`, `components/ui/`) se închid în T01–T03 și nu se mai ating după.

## Graful de dependențe

```
T00 Repo & tooling
 ├─ T01 API skeleton ──┐
 └─ T02 APP skeleton ──┤
                       ├─ T03 Auth & roluri ──┬─ T05 Locuri & ghid virtual ─┐
                       └─ T04 Deploy v0       │                             ├─ T08 Hartă & indicații ─┐
                                              ├─ T06 Evenimente ───────────┤                         │
                                              │     └─ T07 Bilete           ├─ T12 Chat AI             │
                                              ├─ T09 Firme & panou          │     └─ T13 Planificator itinerar (T05, T08, T12)
                                              │     └─ T10 Oferte & coduri  │
                                              └─ T11 Comunitate & puncte (T03, T10 pentru plata cu puncte)
                                                    └─ T14 Admin (T09, T10, T11)
T15 i18n + PWA/Capacitor (după ce există ecranele) · T17 Google Places rating/recenzii (opțional, după T05 + T09)
T16 Deploy final, seed de producție, demo (toate)
```

Linia de demo (obligatoriu să meargă duminică): T00–T13 + T15 (aplicația pe Android și iOS) + T16 + T20. T14, T18, T19 sunt „dacă mai e timp”.

Reguli de dimensiune: un story = max ~4–6 ore pentru un om cu Claude. Dacă depășește, se taie în `T05a/T05b`, nu se lungește.

---

## Faza 0 — Fundație

### T00 · Repo & tooling
**Scop:** repo-urile pe GitHub, cu tot ce trebuie ca oricine să poată rula proiectul în 5 minute (5 repo-uri în organizația HACK4ARAD, vezi „Adăugiri” la final).
**Depinde de:** —
**Stare:** cele 5 repo-uri există în [HACK4ARAD](https://github.com/HACK4ARAD) cu conținutul kitului v3; uneltele de instalat sunt în `docs/SETUP.md` (+ `setup-windows.ps1`). Rămân: drepturi pentru toți, protecție pe `main`. Starea tuturor story-urilor: `docs/STATUS.md`.

- Structură: 5 repo-uri surori în organizația [HACK4ARAD](https://github.com/HACK4ARAD), în același folder (ex. `~/HACK4ARAD/`):
  `AradEx-Plan` = planul comun (`docs/`, `design/`, `CLAUDE.md`, `STRUCTURE.md`, `README.md`, `setup.sh`, toate skill-urile în `.claude/skills/`);
  `AradEx-Backend` (`settings.gradle` + `build.gradle` părinte, wrapper `gradlew`, module `api/` și `app/`, `.env.example`, `Dockerfile`, `CLAUDE.md`, CI);
  `AradEx-Frontend` (proiect Vue la rădăcină, `.env.example`, `CLAUDE.md`, CI); `AradEx-Infrastructure` (`docker-compose.yml`, config de deploy — doar P1);
  `AradEx-Ops` (agenții Paperclip: instrucțiuni, task-uri, `setup-lane.mjs`). Descrierea completă: `STRUCTURE.md`.
- `docker-compose.yml` (în `AradEx-Infrastructure`) cu `postgres:16` (db `aradexperience`, user/parolă `arad`/`arad`, port 5432, volum). Nu băgăm încă API/APP în compose — doar DB.
- `.env.example` în fiecare repo de cod (BE: vezi mai jos; FE: `VITE_API_URL`, `VITE_DEMO`) + `.gitignore` (`.env`, `node_modules`, `build`, `.gradle`, `dist`, `.idea`, `.vscode`, `*.log`).
- CI/CD: nu în repo-urile de cod; pipeline-urile (BE `./gradlew test`, FE `npm ci && npm run build && npm run test`) se definesc în `AradEx-Infrastructure` când e nevoie. **Actualizat la T04:** singura excepție e `.github/workflows/deploy.yml` din `AradEx-Backend` și `AradEx-Frontend` (teste + deploy pe AWS la merge pe `main`); vezi `docs/DEPLOY.md`.
- De făcut în T00: drept de scriere pentru toți pe cele 5 repo-uri, protecție pe `main` (PR obligatoriu).

`AradEx-Backend/.env.example`:
```
POSTGRES_URL=jdbc:postgresql://localhost:5432/aradexperience
POSTGRES_USER=arad
POSTGRES_PASSWORD=arad
JWT_SECRET=schimba-ma-cu-32-caractere-minim-random
JWT_EXPIRATION_HOURS=24
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-haiku-5-5
CORS_ORIGINS=http://localhost:5173
```
`AradEx-Frontend/.env.example`: `VITE_API_URL=http://localhost:8080/api/v1`, `VITE_DEMO=true`.

**Verificare:** `(cd ../AradEx-Infrastructure && docker compose up -d)` pornește DB; `git status` în toate repo-urile nu arată `.env`; README-urile explică cele 3 comenzi (db, be, fe).

### T01 · API skeleton (Spring Boot)
**Scop:** aplicație Spring care pornește pe Postgres, cu migrări, erori standard, OpenAPI, test de fum.
**Depinde de:** T00
**Stare:** schelet scris în `AradEx-Backend/` (vezi `README.md` și `CLAUDE.md` de acolo) — rămâne de compilat, rulat și corectat ce nu trece. Migrările **V1–V4 + seed-urile V2_1, V3_1, V4_1 sunt scrise și verificate pe Postgres 16** (T03, T05, T06 pornesc cu schema și datele gata).

- Java 21, Spring Boot 3.3+, **Gradle multi-modul** (Groovy DSL, wrapper inclus): `settings.gradle` + `build.gradle` părinte (plugin-uri Spring Boot / dependency-management, Java 21 toolchain, BOM) + două module:
  - **`api` = contractul REST** (bibliotecă Java simplă, plugin `java-library`; deps: spring-web, jakarta.validation-api, swagger-annotations): `api/` — o interfață per feature cu `@RequestMapping` + `@GetMapping`/`@PostMapping`, `@Valid`, `@Operation`; `dto/<feature>/` — record-uri cerere/răspuns (+ `dto/common/`: PageResponse, HealthDto); `enums/` (Role…); `annotations/` (validări custom, ex. `@Code`); `exceptions/` (ApiException + BadRequest/NotFound/Conflict/Forbidden). Teste: serializare per DTO din JSON în resources (`dto/auth/UserDtoTest`), `DtoValidationTest`, `ApiContractTest`.
  - **`app` = aplicația Spring Boot** (plugin `org.springframework.boot`; deps: `project(':api')`, web, security, validation, data-jpa, actuator, springdoc, flyway (+ `flyway-database-postgresql`), postgresql, jjwt, lombok; test: starter-test, spring-security-test, testcontainers): `controller/<feature>/XController implements XApi` + `controller/handler/GlobalExceptionHandler`, `service/<feature>/`, `repository/<feature>/`, `entity/<feature>/`, `mapper/<feature>/` (clase utilitare `@UtilityClass`, import static) + transversal `config/` (AppProps, SecurityConfig, OpenApiConfig), `security/` (JwtService, JwtAuthFilter, CurrentUser, AuthContext), `util/` (Codes, Geo, Pages). Teste: `controller/`, `service/`, `mock/` (AuthMock, JsonFixtures, XMock per service), cereri JSON în `src/test/resources/requests/`. `app` depinde de `api`, niciodată invers.
- Pachet rădăcină unic `aradexperience` în ambele module (fără `ro.`), `Application` în rădăcină → scanare implicită, fără `scanBasePackages`/`@EntityScan`. Module funcționale (subfoldere create pe parcurs): `auth`, `users`, `places`, `events`, `tickets`, `business`, `offers`, `community`, `points`, `ai`, `itineraries`, `admin`.
- `app/src/main/resources/application.yml` citește din env (`POSTGRES_URL` etc., cu valori implicite pentru local). Profiluri: `default` (local), `prod`. `./gradlew :app:bootRun` încarcă `.env` automat.
- Flyway activ, migrările în **`app/src/main/resources/db/migration/`**. Convenție: `V{n}__{modul}.sql` pentru schemă, `V{n}_1__seed_{modul}.sql` pentru date de seed (fiecare task își adaugă migrarea proprie, nu modifică migrările vechi).
- `error/GlobalExceptionHandler` → răspunsuri RFC 7807 (`ProblemDetail`): 400 validare (cu lista `errors[]`), 401, 403, 404 (`NotFoundException`), 409 (`ConflictException`), 500.
- CORS din `CORS_ORIGINS`. `GET /api/v1/health` → `{status:"ok", time, version}` (`HealthApi` + `HealthController`, șablonul interfață → controller). Swagger UI pe `/swagger-ui.html`.
- `Dockerfile` la rădăcina repo-ului, multi-stage (`gradle:8.14-jdk21` → `:app:bootJar` → eclipse-temurin:21-jre), `EXPOSE 8080`.
- Teste existente: `api` — `UserDtoTest`, `RegisterRequestTest` (serializare din JSON), `DtoValidationTest`, `ApiContractTest`; `app` — `JwtServiceTest`, `CodesAndGeoTest`, `HealthControllerTest` (șablonul `@ControllerTest` + `AuthMock`), `AppSmokeTest` (`@SpringBootTest` + Testcontainers Postgres: pornește tot, Flyway, `/health`, 401) — se sare automat dacă Docker nu e disponibil.

**Verificare:** `./gradlew test` verde (ambele module); `./gradlew :app:bootRun` pornește, Flyway aplică V1–V4, `/health` răspunde, Swagger se deschide.

### T02 · APP skeleton (Vue 3)
**Scop:** proiectul Vue cu cele două „aplicații” (mobil + web), design tokens Clean Ink, client API, PWA.
**Depinde de:** T00
**Stare:** ✅ schelet + pregătirea anti-conflict (FE #8): view per rută (și per secțiune în panourile web), cochilii pentru Acasă / `/m/panel` / landing / Contul meu, i18n/types/api pe module, `AppSheet`, `QrCode`, `QrScanner`, `useGeo`. Cine ce fișiere are: `AradEx-Frontend/CLAUDE.md` §Culoare; deciziile în `docs/STATUS.md`.

- Proiect Vite + vue-ts la rădăcina repo-ului; adaugi: vue-router, pinia, tailwindcss, vue-i18n, @vueuse/core, leaflet + @types/leaflet, qrcode, html5-qrcode, vite-plugin-pwa; dev: vitest, @vue/test-utils, eslint + prettier.
- Structură:
  ```
  AradEx-Frontend/src/
    shared/      api/ (client.ts, auth.ts, events.ts …)  types/api.ts (oglinda docs/API.md)
                 stores/ (auth, ui)  components/ (Button, Card, Chip, Input, Sheet, Toast, EventCard, OfferCard, MapView, QrCode, QrScanner)
                 composables/ (useGeo, useTts, useFormat)  i18n/ (ro.json, en.json)  styles/tokens.css
    mobile/      layouts/MobileLayout.vue (top bar + bottom tabs)  views/…
    web/         layouts/WebLayout.vue (sidebar + content)         views/…
    router/      index.ts (rute /m/* și /w/*; `/` redirecționează după lățime: <768px → /m, altfel /w; query `?ui=m|w` forțează)
  ```
- Tokens (din `design/final/shared/ui.css`): fundal `#FAFAF7`, ink `#111111`, text secundar `#5C5C5C`, border `#E8E8E3`, soft `#F1F1EC`, accent `#FF5A36`, verde comunitate `#3B6D11` / închis `#1F3A12` / soft `#E4EFDA`, galben oferte `#FFC244`, piersică `#FFE8E2`; panouri web: fundal `#F6F6F3`, sidebar `#0E0E10`; card `#FFFFFF` radius 16, buton primar negru radius 14 h48, chip radius 999. Font Inter (Google Fonts), icon-uri Material Symbols Outlined.
- `shared/api/client.ts`: `fetch` wrapper cu `VITE_API_URL`, header `Authorization: Bearer`, parsare ProblemDetail → `ApiError`, 401 → logout + redirect login.
- Componente de bază + `MobileLayout` cu tab bar: Evenimente · Chat · Hartă (buton rotund central) · Bilete · Transport (pentru firmă/primărie tab-ul Bilete devine Panou; Salvate e în Profil; voluntarul are doar Acțiuni · Scanează · Mesaje). `WebLayout`: sidebar stânga cu meniu în funcție de rol.
- PWA: `vite-plugin-pwa` cu manifest (nume, icon 512, `display: standalone`, culoare `#111111`), service worker implicit.
- Pagini placeholder pentru toate rutele din `docs/API.md` §Rute FE, ca să existe navigația de la început.

- **Pregătire anti-conflict (obligatoriu, ca 4 oameni să lucreze în paralel fără să se calce):**
  - câte un fișier view pentru **fiecare** rută, în folderul feature-ului (`mobile/views/events/SearchView.vue`, `mobile/views/offers/OffersView.vue`, … și echivalentele `web/views/<feature>/`), fiecare cu `PlaceholderScreen`; router-ul (v3: rutele există, cu `PlaceholderView`) le importă pe toate în locul `PlaceholderView` → nimeni nu mai editează `router/index.ts` (lista de fișiere și proprietarii:);
  - navigația completă pe roluri (tab bar mobil, sidebar web) gata acum;
  - i18n pe module: `i18n/ro/<modul>.json` + `i18n/en/<modul>.json` încărcate cu `import.meta.glob` (module: common, auth, places, events, tickets, map, chat, plan, business, offers, community, admin);
  - tipuri pe module: `shared/types/<modul>.ts` (mutate din `types/api.ts`, care doar le re-exportă) și fișiere goale `shared/api/<modul>.ts` pentru toate modulele (`auth.ts`, `health.ts` există);
  - componentele folosite de mai multe culoare: `AppSheet`, `QrCode` (generare), `useGeo` (poziție + fallback centrul Aradului);
  - `mobile/views/home/HomeView.vue` (S1) ca „cochilie” cu 3 tab-uri care randează `HomeEventsTab.vue` (P2), `HomeOffersTab.vue` (P4), `HomeCommunityTab.vue` (P4) — create acum ca placeholdere.

**Verificare:** `npm run dev` → `/` redirecționează corect pe telefon vs desktop; tab bar funcțional; `npm run build` fără erori; Lighthouse arată „installable”; fiecare rută deschide view-ul ei placeholder.

### T03 · Auth & roluri
**Scop:** conturi, login, JWT, roluri și conturile demo.
**Depinde de:** T01, T02
**Stare:** ✅ merge-uit în `main` (BE #5, FE #5, Plan #4); deciziile sunt în `docs/STATUS.md`. Rolul `VOLUNTEER` (T18) și regula `/vol/**` sunt deja în `Role` / `SecurityConfig`.

- BE (`V2__users_businesses.sql`): tabelele `users`, `businesses` (vezi DATA-MODEL). Contractul există deja în `api`: `api/AuthApi` (`POST /auth/register`, `POST /auth/login`, `GET /me`, `PATCH /me`) + `dto/auth/*` (RegisterRequest, LoginRequest, UpdateMeRequest, AuthResponse, UserDto, BusinessSummary) — de implementat în `app`: `entity/users/User`, `entity/business/Business`, `repository/…`, `service/auth/AuthService`, `mapper/users/UserMapper`, `controller/auth/AuthController implements AuthApi`. Roluri: `VISITOR, LOCAL, BUSINESS, CITY_HALL, ADMIN`. Înregistrarea permite doar `VISITOR | LOCAL | BUSINESS` (BUSINESS creează și un rând în `businesses` cu `verified=false`). `CITY_HALL` și `ADMIN` doar din seed.
- Security: regulile pentru **toate** endpoint-urile din `docs/API.md` (coloana „Auth”) se scriu acum în `config/SecurityConfig`, ca celelalte culoare să nu mai atingă fișierul. Selectorul de limbă RO/EN (Profil + `WebLayout`) tot aici.
- Security: `JwtAuthFilter` (Bearer), `SecurityConfig` stateless, BCrypt, reguli: `/auth/**`, `/health`, `/swagger-ui/**`, `/v3/api-docs/**`, `GET /places/**`, `GET /events/**`, `GET /offers/**`, `GET /community/**`, `GET /businesses/**` publice; restul autentificat; `/business/**` → BUSINESS, `/city/**` → CITY_HALL|ADMIN, `/admin/**` → ADMIN. `@AuthenticationPrincipal` → `CurrentUser(id, role)`.
- Seed `V2_1__seed_users.sql`: `visitor@demo.ro`, `local@demo.ro`, `firma@demo.ro` (+ business „Cafeneaua din Pasaj”, verified), `primaria@demo.ro`, `admin@demo.ro`, toate cu parola `demo1234` (hash BCrypt generat o dată și pus în SQL).
- FE: `stores/auth.ts` (token în localStorage, `user`, `login/register/logout/fetchMe`), guard-uri pe rute (`meta.roles`), ecran login/înregistrare mobil (S12 adaptat: email + parolă + alegere rol Vizitator/Localnic/Firmă) și web (`/w/login`). Buton „Conturi demo” care completează rapid fiecare cont (doar în dev/demo).
- Profil (S11): afișează contul, rolul, limba; „Deconectare”.

**Verificare:** register + login din ambele UI; `GET /me` cu token; acces refuzat (403) la `/city/**` cu cont de vizitator; teste: `AuthServiceTest` (register duplicat → 409, parolă greșită → 401), `JwtServiceTest` (emitere/validare/expirare).

### T04 · Deploy v0 („hello world” în producție)

**Stare (7 nov):** făcut pe **AWS în loc de Render/Netlify/Neon**, cu Terraform în `AradEx-Infrastructure/terraform` și deploy din GitHub Actions. Producția: https://aradexperience.site. Ce există și de ce: `docs/DEPLOY.md` și `docs/STATUS.md` (T04); textul de mai jos rămâne ca istoric.
**Scop:** să existe de sâmbătă un URL public pentru API și APP, ca deploy-ul final să fie doar un push.
**Depinde de:** T01, T02 (paralel cu T03)

- DB: Neon sau Render Postgres (free). API: Render Web Service din repo-ul `AradEx-Backend` (Docker, `Dockerfile` la rădăcină), env din `.env.example` (fără valori locale), `CORS_ORIGINS` = URL Netlify. APP: Netlify din repo-ul `AradEx-Frontend`, build `npm run build`, publish `dist`, `public/_redirects` cu `/* /index.html 200`, `VITE_API_URL` = URL Render.
- Documentezi în `docs/DEPLOY.md`: unde e fiecare, cine are acces, cum se face redeploy.

**Verificare:** `https://<api>/api/v1/health` ok; APP publicată apelează `/health` și afișează „API online” pe un ecran de debug/profil.

---

## Faza 1 — Conținut și evenimente

### T05 · Locuri & ghid virtual
**Scop:** obiectivele turistice din Arad cu ghid scris + audio pe puncte de interes (ecranul E3), baza pentru hartă și itinerar.
**Depinde de:** T03 (pentru CRUD-ul de admin), T01/T02

- BE (`V3__places.sql`): `places`, `guide_points`. Endpoint-uri publice: `GET /places?type&q`, `GET /places/{id}` (include `guidePoints[]` ordonate). Editare (Primăria și Adminul, „Obiective & ghiduri”): `POST/PUT/DELETE /city/places`, `POST/PUT/DELETE /city/places/{id}/guide-points`.
- **Gata:** `V3__places.sql` + `V3_1__seed_places.sql` (12 locuri reale, 33 puncte de ghid, coloana `exterior_only` pentru Cetate/Turnul de Apă — vezi `docs/ARAD-DATA.md`). **Pozele** (Wikimedia Commons, cu licență și credit) sunt în `design/assets/loc-*.jpg` și în `AradEx-Frontend/public/img/`, legate de locuri și de evenimentele din aceleași săli prin `V4_2__seed_images.sql` (11 din 12; Podgoria Miniș n-are încă poză liberă). Rămâne eventual EN. Locurile: Cetatea Aradului, Palatul Cultural (Filarmonica + Muzeul), Teatrul Clasic „Ioan Slavici”, Palatul Administrativ (Primăria), Biserica Roșie, Catedrala „Sfânta Treime”, Catedrala „Sf. Anton de Padova”, Turnul de Apă, Faleza Mureșului, Pădurea Ceala, Podgoria Miniș, Castelul Macea. Fiecare: coordonate corecte, program, durată de vizită, 3–6 puncte de ghid de câte 60–120 de cuvinte (generate cu Claude/GPT, verificate sumar). **Date reale (7 nov):** `V3_2__places_visitarad.sql` corectează coordonatele celor 12 (erau deplasate 150 m – 4 km; verificate pe OSM), dă Podgoriei Miniș o poză și adaugă 223 de locuri din exportul visitarad.ro (CNIPT Arad) — fără ghid, cu poza legată de pe visitarad și atribuirea „Foto și date: CNIPT Arad / visitarad.ro”; `V5_2__seed_event_venues.sql` aliniază sălile evenimentelor. Vezi `docs/ARAD-DATA.md`.
- FE mobil `/m/places/:id` (E3): hero, „Ghid virtual · N puncte · M min”, bară audio (play/pauză, punctul curent, viteză), lista punctelor cu text; „Următorul punct”; „Indicații” (→ T08). Web: doar panoul Primăriei „Obiective & ghiduri” (`/w/city/places`, W25); ghidul nu are pagini publice pe web (W7/W8 nu se fac).
- `composables/useTts.ts`: `speechSynthesis` cu `lang = 'ro-RO'` (fallback `en-US`), play/pause/stop, evidențiază punctul curent. Opțional mai târziu: `POST /ai/tts` cu un serviciu TTS (Claude API nu are TTS; cheia AI a proiectului e de Claude) care returnează mp3 (cache pe disc) — doar dacă vocea din browser e slabă pe telefonul de demo.

**Verificare:** detaliul unui loc arată toate punctele; audio pornește/oprește pe Android și iOS (iOS cere tap pe buton — nu autoplay); `PlaceServiceTest` (not found → 404, ordonarea punctelor).

### T06 · Evenimente — listare, căutare, detaliu, salvate
**Scop:** inima aplicației: S1, S2, S3, Salvate, hot events (doar în aplicația mobilă; pe web evenimentele se gestionează din panouri).
**Depinde de:** T03, T05
**Stare:** ✅ PR deschis (BE #9, FE #12, Plan #11) — peste piesele de evenimente din T09; din T05 folosește doar tabela `places` (deja în V3). Detalii și decizii: `docs/STATUS.md`.

- BE (`V4__events.sql`): `events`, `saved_events`. `GET /events` cu filtre `from,to,category,near=lat,lng,radiusKm,organizerBusinessId,organizerType,hot,q,page,size`, sortare după `startAt`; `GET /events/{id}`; `POST/DELETE /events/{id}/save`; `GET /me/saved-events`. `isHot` = `participantsCount >= 50 || savesCount >= 20` (praguri în config). `distanceKm` calculat în DTO când vine `near`.
- Creare evenimente: `POST /events` (CITY_HALL/ADMIN) în T06, cu metode publice în `EventService` (`createForOrganizer`, `updateForOrganizer`, `deleteForOrganizer`) pe care T09 (P4) le apelează din `BusinessController` — P4 nu modifică pachetul `events`.
- **Gata:** `V4__events.sql` + `V4_1__seed_events.sql` (21 evenimente reale din nov–dec 2026 — Filarmonica, Teatrul Clasic, Târgul de Crăciun, UTA — marcate `is_demo=false`, + 9 demo cu `is_demo=true`). Lista orientativă inițială era: 15–20 evenimente reale/plauzibile pe 7–30 nov 2026 (Filarmonica, Teatrul Clasic, expoziții la Palatul Cultural, tur ghidat la Cetate, târg de produse locale, meci UTA, Festivalul vinului Miniș etc.), categorii: `CONCERT, THEATRE, FAMILY, EXHIBITION, SPORT, OUTDOOR, FAIR, FOOD`.
- FE mobil: S1 Acasă (header „Ce faci în Arad?”, căutare, cele 3 carduri Evenimente/Oferte/Comunitate, chips Azi/Weekend/7 zile, lista), S2 Căutare + filtre (sheet), S3 Detaliu (hero, bilete, dată, loc + „Indicații”, preț, descriere, „🔥 Popular · N participă”), Salvate. Web: fără agendă publică (W5/W6 nu se fac); panoul Primăriei „Evenimente” e în T11/T14.
- `EventCard` în `shared/components` folosit de ambele UI.

**Verificare:** filtrele funcționează pe date reale; „near” ordonează după distanță; salvare persistă după refresh; `EventQueryTest` (filtru dată/categorie, hot), `EventServiceTest` (save/unsave idempotent).

### T07 · Bilete & înscriere la evenimente
**Scop:** S4 → S5 → S6 → S9 → S10 cu plată simulată și cod QR.
**Depinde de:** T06
**Stare:** ✅ PR deschis, stivuit pe T06 (BE #10, FE #13, Plan #11). Fără recenzii (partea 2) și fără seed-ul V5_1 cu bilete demo.

- BE (`V5__tickets.sql`): `tickets`. `POST /events/{id}/tickets {qtyAdult, qtyChild, email}` → validează capacitate (`capacity - participantsCount`), calculează totalul din `priceAdult/priceChild`, generează `code = AX-T{eventId}-{6 alfanumerice}`, incrementează `participantsCount`. `GET /me/tickets?upcoming=true|false`, `GET /tickets/{code}` (doar proprietar/organizator/admin), `POST /tickets/{code}/use` (organizator/admin). Evenimente `FREE` → bilet gratuit cu același flux („Înscrie-te”), `EXTERNAL` → doar link.
- „Plata”: FE arată S5 cu card salvat/nou; BE nu procesează nimic — se confirmă direct. În UI scrie „Plată demonstrativă”.
- FE mobil: S4 (date, Adult/Copil, total), S5 (email + metodă), S6 (confirmare), S9 (Viitoare/Trecute), S10 (bilet cu QR generat din `code` cu `qrcode`, „funcționează offline” — cache-uim biletele în localStorage). Biletele există doar în aplicație (fără „Contul meu” pe web).
- **Calendar:** `GET /events/{id}/ics` (fișier .ics) + link „Google Calendar” construit în FE (template URL, fără login) pe S3 și pe bilet.
- **Recenzii (partea 2, dacă e timp în T07 sau la T15):** tabela `reviews` (în V5), `GET/POST/PUT /events/{id}/reviews` doar după ce evenimentul a trecut, 1–5 stele + text, media pe S3 și pe pagina firmei din aplicație. Vezi `docs/FEATURES.md` §9.

**Verificare:** cumpărare → apare în Biletele mele → QR-ul se scanează cu telefonul și conține codul; capacitate epuizată → 409 cu mesaj afișat; `TicketServiceTest` (capacitate, total, cod unic).

### T08 · Hartă & indicații
**Scop:** S7 + „Indicații” de oriunde; componenta de hartă refolosită de itinerar (T13).
**Depinde de:** T05, T06

- `shared/components/MapView.vue` (Leaflet, tile-uri OSM `https://tile.openstreetmap.org/{z}/{x}/{y}.png`, atribuire): props `markers[] {id, lat, lng, kind: event|place|offer|action, label}`, `route?: LatLng[]`, `selectedId`, `userLocation`; emite `select`. Pin-uri numerotate când `numbered=true`.
- `composables/useRoute.ts`: OSRM public `https://routing.openstreetmap.de/routed-{foot|car}/route/v1/driving/{lng,lat};{lng,lat}?overview=full&geometries=geojson` → polilinie + durată + distanță. Fallback: linie dreaptă + estimare 5 km/h / 30 km/h dacă OSRM pică.
- `composables/useGeo.ts`: `navigator.geolocation` cu fallback pe centrul Aradului (46.1866, 21.3123).
- FE mobil S7: hartă full-screen, căutare, chips Azi/Weekend/7 zile, filtre Locuri/Evenimente/Oferte, categorii; tap pe pin → card preview jos → „Arată traseul” (pe jos/mașină) / „Deschide”. „Indicații” din S3/E3/oferte deschide S7 centrat cu traseu. Web: fără hartă publică (W9 nu se face; site-ul de prezentare poate avea o captură).
- Opțional: buton „Deschide în Google Maps” (`https://www.google.com/maps/dir/?api=1&destination=lat,lng`) — util real pe telefon.
- **Opțional, date reale (7 nov): transport public CTP** — stratul „Transport” pe hartă cu cele 299 de stații și tramvaiele / autobuzele **live**, plus „Stația cea mai apropiată · tramvaiul 1 în 4 min” pe E3/S3. Sursa: API-ul public Telelink (fără cheie, CORS ok pentru producție și Android) + exportul static de linii și stații; recomandat prin BE (stațiile seed, live cu cache 20–30 s, rezervă statică). Detalii și reguli de folosire: `docs/ARAD-DATA.md` §Alte date deschise.

**Verificare:** pin-urile corespund filtrelor; traseul se desenează între locația mea și pin; fără internet la OSRM se afișează linia dreaptă fără eroare în consolă.

---

## Faza 2 — Firme, oferte, comunitate

### T09 · Firme: profil, evenimente, anunțuri, panou
**Scop:** rolul Firmă locală: pagina publică a firmei, publicare evenimente și anunțuri, panoul cu statistici (panou complet pe web, E5 cu operațiunile de teren în aplicație).
**Depinde de:** T03, T06

- BE (`V6__business_posts.sql`): `announcements` (+ `events.organizer_business_id` există din V4). `GET /businesses/{id}` (profil + evenimente viitoare + oferte active + anunțuri), `GET /business/me` (firma mea + `stats {views, codesUsed, pointsPayments, upcomingEvents}`), `PUT /business/me`, `POST/PUT/DELETE /business/events`, `GET /business/events`, `POST/DELETE /business/announcements`, `GET /business/activity` (ultimele 20: cod folosit, ofertă salvată, înscriere la eveniment). Firma neverificată poate crea, dar conținutul rămâne `DRAFT` până la verificare (T14) — pentru demo firma din seed e verificată.
- FE web `/w/business`: dashboard (3 statistici), tab-uri **Oferte / Evenimente / Anunțuri / Coduri**, formulare de creare (sheet pe mobil, pagină pe web), activitate recentă. FE mobil `/m/panel` (E5): aceleași tab-uri simplificate + butonul „Validează cod”. Pagina publică a firmei doar în aplicație: `/m/businesses/:id` (W15 nu se mai face; `/w/businesses/:id` dispare în T20).
- Evenimentele firmei apar în S1/S2 ca orice eveniment, cu „Organizat de {firmă}”.

**Verificare:** o firmă creează un eveniment și îl vede în lista publică; anunțul apare pe pagina firmei; firma nu poate edita evenimentul altei firme (403); `BusinessServiceTest`.

### T10 · Oferte & coduri de revendicare
**Scop:** tab-ul Oferte (vizitator/localnic), revendicare cu cod/QR, validare la firmă.
**Depinde de:** T09

- BE (`V7__offers.sql`): `offers`, `offer_redemptions`. Public: `GET /offers?category&localProduct&near`, `GET /offers/{id}` (incrementează `viewsCount`). Autentificat: `POST /offers/{id}/redeem` → `code = AX-O{offerId}-{6}`, status `ISSUED`, o revendicare activă per user per ofertă (409 altfel); `GET /me/redemptions`. Firmă: `POST/PUT/DELETE /business/offers`, `GET /business/offers`, `POST /business/redemptions/use {code}` → `USED` + `usedAt` (409 dacă e deja folosit/nu e al firmei). `pointsPrice` se setează aici, dar debitarea punctelor vine în T11 (până atunci ofertele cu `pointsPrice` se revendică gratuit cu un TODO vizibil).
- Seed `V7_1__seed_offers.sql`: 5–8 oferte (cafea -20%, covrigi 2+1, degustare Miniș, miere „Făcut în Arad”, prăjitură) — pozele sunt în `design/assets/`.
- FE mobil: tab Oferte pe S1 (banner „Doar în AradExperience”, categorii Cafenele/Restaurante/Făcut în Arad/Evenimente, carduri), detaliu ofertă („Revendică” → sheet cu QR + cod + „Arată codul la casă”). Panou firmă (web + mobil): lista ofertelor cu vizualizări/folosite, formular ofertă nouă, ecran „Validează cod” (input + scanner QR cu `html5-qrcode`).

**Verificare:** revendic → cod → firma îl validează → apare în activitatea firmei și `codesUsed` crește; a doua validare dă 409; `OfferRedemptionServiceTest`.

### T11 · Comunitate & puncte (Primărie + Localnic)
**Scop:** bucla principală a demo-ului: acțiune comunitară → înscriere → QR → validare de Primărie → puncte → clasament → plată cu puncte la o firmă.
**Depinde de:** T03, T10

- BE (`V8__community_points.sql`): `community_actions`, `community_registrations`, `points_transactions`; `users.points_balance` ținut sincron de `PointsService` (singurul loc care scrie puncte: `award(userId, amount, refType, refId)`, `spend(...)` cu 409 dacă soldul e insuficient).
- Public: `GET /community/actions?upcoming=true`, `GET /community/actions/{id}` (include `goingPreview[]` — 3 prenume + număr). Localnic: `POST /community/actions/{id}/register` → `code = AX-C{actionId}-{6}`, `DELETE` (anulare), `GET /me/community/registrations`, `GET /me/points` (sold + tranzacții), `GET /community/leaderboard?period=month|year` → top 50 + poziția mea.
- Primărie: `POST/PUT /city/actions`, `GET /city/actions`, `GET /city/actions/{id}/registrations`, `POST /city/registrations/confirm {code}` (din scanner), `POST /city/registrations/{id}/confirm`, `POST /city/registrations/{id}/reject` — confirmarea acordă `pointsReward` o singură dată (idempotent).
- Plata cu puncte: `POST /offers/{id}/redeem` debitează `pointsPrice` prin `PointsService.spend` (completează T10).
- Seed `V8_1__seed_community.sql`: 3 acțiuni (plantare pe Faleză 7 nov +50, curățenie Pădurea Ceala 8 nov +40, donare de sânge 10 nov +80), înscriși fictivi și tranzacții ca să existe un clasament.
- FE mobil (localnic): tab Comunitate pe S1 (card puncte, streak, locul în clasament, acțiuni), detaliu acțiune (+puncte, locuri, pași „cum primești punctele”, „Mă înscriu” → QR-ul meu), clasament (Luna/Anul + premii), în Oferte: „Plătește cu N puncte”. FE web `/w/city` (Primărie): acțiunile mele + înscriși, formular acțiune nouă, **Validare** (listă cu Confirmă/Respinge/Confirmă toți + confirmare manuală a unui cod + cardul „Voluntarii care scanează”; **fără scanner în web**), clasament. Mobil `/m/panel` pentru Primărie: doar Scanează QR + lista de azi (pe teren); scanarea la acțiuni o fac voluntarii (T18).

- Opțional (după demo / dacă rămâne timp): cardul „Ridicarea deșeurilor pe strada ta” pentru localnic în Comunitate, din calendarul RETIM deschis (`docs/ARAD-DATA.md` §Alte date deschise; snapshot din mai 2026, de verificat).

**Verificare:** fluxul D din prototip cap-coadă cu două telefoane (localnic + primărie): QR-ul localnicului scanat de primărie → sold +50 → clasamentul se actualizează → oferta cu puncte se plătește și soldul scade; confirmarea de două ori nu dublează punctele; `PointsServiceTest`, `CommunityServiceTest` (capacitate, dublă înscriere 409, confirmare idempotentă).

---

## Faza 3 — AI (diferențiatorul)

### T12 · Chat AI
**Scop:** S8: asistent care răspunde la „ce fac în weekend cu copiii?” cu evenimente reale din DB.
**Depinde de:** T06

- BE modul `ai`: `ClaudeClient` peste SDK-ul oficial Anthropic pentru Java (`com.anthropic:anthropic-java:3.2.0`; cheia `ANTHROPIC_API_KEY`, modelul `ANTHROPIC_MODEL` = `claude-haiku-5-5`, din `app.anthropic.*`; timeout 20 s, retry 1, `maxTokens` setat explicit). `POST /ai/chat {messages[], locale}` → `{reply, suggestedEventIds[], quickReplies[]}`. Prompt de sistem: rol, limbă, data curentă, **catalogul compact** al evenimentelor din următoarele 14 zile (id, titlu, categorie, dată, loc, preț, maxim ~60 rânduri) și regula: răspunde scurt, pune o întrebare de clarificare dacă lipsesc ziua/compania, returnează JSON `{reply, suggestedEventIds, quickReplies}` (structured outputs: `outputConfig` cu schema JSON). Fără plăți, fără date inventate — doar id-uri din catalog (BE filtrează id-urile inexistente).
- **Plasă de siguranță pentru demo:** dacă API-ul pică/timeout → răspuns pre-scris pentru 3 întrebări tipice (`ai/fallback.json`) + mesaj „răspuns offline”.
- FE mobil S8: istoric mesaje, chips de clarificare (`quickReplies`), carduri de evenimente sub răspuns (`EventCard` compact) → S3. Chat nou. Doar în aplicație (W13 nu se face).

**Verificare:** „Ce pot face cu copiii în weekend?” → întrebare de clarificare → chips → listă cu 2–3 evenimente din DB; cu cheia greșită aplicația nu se blochează; `ChatServiceTest` cu client mock (filtrarea id-urilor, fallback).

### T13 · Planificator de itinerar (E1 → E2 → E4)
**Scop:** vizitatorul spune cât timp are, cum se deplasează și ce îl interesează → program cu obiective, ore, traseu pe hartă, ghid audio la fiecare oprire.
**Depinde de:** T05, T08, T12

- BE (`V9__itineraries.sql`): `itineraries`. `POST /ai/itinerary {date, startTime, hours | days, transport: WALK|CAR|PUBLIC, interests[], freeText, start?{lat,lng}}` → prompt cu **catalogul locurilor** (id, nume, tip, tag-uri, durată de vizită, program, coordonate, distanța față de centru) + oferte/evenimente din ziua respectivă (ca opriri opționale) → JSON `{title, summary, stops:[{order, placeId|eventId|offerId, arriveAt, leaveAt, note, parkingHint?}]}` (structured outputs, ca la T12). BE validează id-urile, recalculează orele dacă se suprapun, estimează deplasarea între opriri (haversine × factor pe mod de transport; pentru `PUBLIC` se pot folosi stațiile și liniile CTP reale — stația cea mai apropiată de fiecare oprire și liniile comune, vezi `docs/ARAD-DATA.md` §Alte date deschise), apoi `POST /itineraries` salvează și întoarce `id` + `shareCode`. `GET /itineraries/{id}`, `GET /me/itineraries`. Fallback: 2 itinerarii pre-generate (pe jos 1 zi, mașină 1 zi) dacă Claude API pică.
- FE mobil: **E1** wizard (timp: 3 h / jumătate de zi / o zi / 2 zile + data; transport: Pe jos / Mașină / Transport public; interese: Istorie, Crame & vin, Muzee, Natură, Familie, Gastronomie; text liber; „Generează programul” cu stare de încărcare 5–15 s), **E2** rezultat (rezumat, timeline cu opriri, durată, „ghid disponibil”, oferta din traseu, butoane Vezi pe hartă / Pornește ghidul / Salvează / Regenerează), **E4** hartă cu pin-uri numerotate + traseu OSRM înlănțuit + sheet „Oprirea 2 din 5 · 8 min pe jos” (+ „Parcare: …” la mașină). „Pornește ghidul” → E3 al locului curent. Doar în aplicație (W10 nu se face; itinerariile mele sunt în Profil).

**Verificare:** 3 combinații (pe jos 3 h istorie / mașină 1 zi crame / familie jumătate de zi) dau programe coerente cu ore plauzibile și toate opririle pe hartă; itinerarul salvat se redeschide după refresh; `ItineraryServiceTest` (id invalid eliminat, ore fără suprapunere).

---

## Faza 4 — Admin, finisaje, livrare

### T14 · Admin (web) — W3
**Scop:** verificarea firmelor, moderarea conținutului, statistici.
**Depinde de:** T09, T10, T11

- BE `admin`: `GET /admin/stats` (users pe roluri, evenimente, bilete, oferte revendicate, puncte acordate), firmele partenere pe `/city/businesses` (Primăria **și** Adminul: listă, `POST /city/businesses` cont nou + invitație, `POST /city/businesses/{id}/verify`, `POST /city/businesses/{id}/reject`), `PATCH /admin/events/{id}/status`, `PATCH /admin/offers/{id}/status`, `PATCH /admin/actions/{id}/status`, `GET /admin/users?role`.
- FE web: Adminul vede tot panoul Primăriei (`/w/city/*`: Evenimente, Obiective & ghiduri, Acțiuni, Validare, Voluntari, Mesaje, Clasament, Firme partenere cu Verifică/Respinge) plus grupul **Administrare**: `/w/admin` (Dashboard cu statistici), `/w/admin/content` (Conținut & moderare: tabele cu filtru + publică/ascunde pentru evenimente, oferte, acțiuni), `/w/admin/users` (rol, puncte, dezactivare), `/w/admin/settings`.

**Verificare:** firma nouă înregistrată apare la verificat → verificată → ofertele ei devin publice; vizitatorul primește 403 pe `/admin/**`.

### T15 · Aplicația mobilă: Android + iOS (obligatoriu), i18n
**Depinde de:** ecranele existente
**Stare:** Android ✅ merge-uit în `main` (FE #7): Capacitor 6, `android/`, `npm run android:run`, rulează pe emulator (vezi `docs/SETUP.md`). Rămân iOS, iconița/splash, build-urile de livrare, EN pe module.

- **Aplicația e produsul** (vezi decizia de sus): același build `dist` pornește pe `/m`, fără service worker în nativ.
- **Android:** iconiță + splash, `versionCode`/`versionName`, APK de debug pentru demo + AAB semnat (cheia de semnare NU intră în git), URL-ul API de producție în build.
- **iOS:** `npx cap add ios` (`ios/` în repo), `cap sync`, rulează pe simulator din Xcode (doar pe macOS), bundle id `ro.aradexperience.app`, iconiță/splash, permisiuni în `Info.plist` (cameră pentru QR, localizare pentru „Lângă mine”), `NSAppTransportSecurity` doar dacă e nevoie de HTTP în dev; build pe telefon cu un cont Apple de dezvoltator (TestFlight dacă există cont plătit).
- **Specific nativ:** verificat pe ambele: TTS-ul ghidului (WebView-ul Android poate să nu aibă `speechSynthesis` → plugin `@capacitor-community/text-to-speech` sau `/ai/tts`), camera pentru QR (`html5-qrcode` sau plugin nativ), geolocația, link-urile externe (Google Maps, site organizator) deschise în browserul sistemului.
- Fiecare culoar își traduce singur modulul (`i18n/en/<modul>.json`); T15 face EN pentru `common` și o listă cu cheile EN lipsă din celelalte module (o trimite culoarelor). HU doar dacă rămâne timp.
- `android/`, `ios/` și `capacitor.config.ts` sunt ale lui T15; ceilalți nu le ating.

**Verificare:** aplicația pornește pe emulatorul Android și pe simulatorul iOS, login cu conturile demo, ghidul audio pornește/oprește, scannerul QR și „Lângă mine” cer permisiunile și merg; APK-ul se instalează pe un telefon Android real.

### T20 · Web = site de prezentare + panouri (P1)
**Depinde de:** T02, T03
- `/` pe web → **site-ul de prezentare** (pornește din landing-ul W1): ce e AradExperience, cele 4 roluri, funcțiile principale cu capturi din aplicație, „Descarcă aplicația” (Android / iOS), „Ești Primărie sau firmă? Intră în panou” → W0, contact.
- Router + `WebLayout` (fișierele lui P1): bara de sus a site-ului doar cu secțiunile prezentării + „Intră în panou”; rutele publice web (`/w/events`, `/w/places`, `/w/map`, `/w/offers`, `/w/community`, `/w/chat`, `/w/plan`, `/w/account`, `/w/businesses/:id`) se scot și redirecționează spre prezentare; panourile și W0 rămân. View-urile web publice deja făcute (T09 W15) se scot în același PR.
- `/m` rămâne codul aplicației (îl încarcă Capacitor); în browser pe telefon, `/` duce tot la prezentare, cu butoanele de descărcare.

**Verificare:** pe desktop și pe telefon `/` arată prezentarea; niciun link din site nu duce într-o pagină publică scoasă; panourile merg ca înainte pentru Primărie, Firmă, Admin.

### T17 · (opțional) Rating & recenzii Google pentru obiective și firme
**Depinde de:** T05, T09 · **Doar dacă rămâne timp și există cheie Google cu billing.**
- Coloana `google_place_id` pe `places` (V3 există deja → se adaugă în V5) și `businesses` (V6). BE: `GET /places/{id}/google`, `GET /businesses/{id}/google` → Places API (New) Place Details (`rating`, `userRatingCount`, `reviews` max 5, `googleMapsUri`), cache 24 h în memorie, cheia doar în BE. FE: bloc „Pe Google · 4,6 ★ (1.240)” cu până la 5 recenzii și „Powered by Google”, pe E3 și pe pagina firmei din aplicație.
- **Cheia:** există deja în producție ca `GOOGLE_PLACES_API_KEY` (secretul `aradex/google-places`, pus de P1 cu `AradEx-Infrastructure/scripts/set-google-places-key.sh`); BE o leagă în `app.google.places-api-key` și o folosește doar din backend. Local: `GOOGLE_PLACES_API_KEY` în `AradEx-Backend/.env`. Harta, traseele și „Deschide în Google Maps” nu au nevoie de cheie.
- Fără scriere/sincronizare spre Google (ar cere OAuth). Evenimentele cu bilete în aplicație rămân doar în aplicație, marcate „Doar în AradExperience”.

### T16 · Deploy final, seed de producție, demo
**Depinde de:** toate

- Rulezi migrările + seed-ul pe DB-ul de producție, verifici conturile demo, pozele, cheile. Un `docs/DEPLOY.md` actualizat.
- Walkthrough complet `docs/DEMO.md` cu aplicația instalată pe două telefoane (un Android, un iPhone sau simulatorul iOS pe proiector) + laptop/proiector pentru panourile web, cronometrat (≤ 6 min). Înregistrezi un video de backup al demo-ului. Slide-uri (max 8): problema, soluția, cele 4 roluri, demo live, tehnologie într-un slide, ce urmează.
- Îngheț de cod duminică 10:00. După: doar date și fix-uri de 5 minute.

---

## Ce e „done” pentru orice task
1. Codul e pe `main` printr-un PR (branch `feat/T05-places`), build + teste verzi.
2. Criteriile din „Verificare” bifate manual în aplicație (browser 390×844 + emulator Android / simulator iOS) și, pentru panouri, pe web (≥1280px).
3. `docs/API.md` actualizat dacă s-a schimbat ceva față de contract; deciziile și ce a rămas sunt în descrierea PR-ului.
4. Feature-ul story-ului e funcțional cap-coadă (fluxul complet de demo se verifică o singură dată, la final).

---


---

## Direcții viitoare (după hackathon) — de pus în pitch la „ce urmează”
- Plăți reale (Stripe/Netopia) și anularea biletelor; notificări push (PWA) pentru mementouri și acțiuni noi.
- Sincronizare bidirecțională cu Google Calendar (OAuth) și import automat al evenimentelor instituțiilor (scraping/API-uri: Filarmonica, Teatrul Clasic, Primăria).
- Rating & recenzii Google (T17), recenzii la obiective, traducere automată RO→EN/HU a ghidului și voce naturală (un serviciu TTS).
- Transport public în itinerar (orare CTP Arad, tramvaiul Arad–Ghioroc), parcări în timp real.
- Parteneriate reale cu firme (program de puncte al orașului), rapoarte pentru Primărie (participare, impact), gamificare pentru vizitatori (badge-uri la obiective).

---

## Story-uri adăugate (6–7 nov)
**Repo-uri separate:** 5 repo-uri surori în organizația GitHub HACK4ARAD: `AradEx-Plan` (planul comun), `AradEx-Backend`, `AradEx-Frontend`, `AradEx-Infrastructure` (Postgres local, producția AWS în Terraform), `AradEx-Ops` (agenți). Căile `AradEx-Backend/...` din plan sunt relative la folderul comun.

### T16a · Deploy final & seed de producție
**Notă (T04):** producția e pe AWS (`docs/DEPLOY.md`); migrările + seed-ul rulează automat la pornirea API-ului, deci T16a = verificarea fluxului din `docs/DEMO.md` pe https://aradexperience.site, cheile (`ANTHROPIC_API_KEY`) și ștergerea de luni (`AradEx-Infrastructure/scripts/destroy.sh`).
Partea tehnică din T16: migrări + seed pe DB-ul de producție, conturi demo verificate, poze, chei, `docs/DEPLOY.md` cu URL-urile reale.
**Verificare:** fluxul din `docs/DEMO.md` merge pe URL-urile publice, de pe două telefoane.

### T16b · Pitch, slide-uri, video de rezervă
Max 8 slide-uri după `docs/DEMO.md` §Pitch; video de rezervă al demo-ului înregistrat duminică dimineață; cronometrare ≤ 6 min, repetat de 2 ori cu toată echipa.
**Verificare:** slide-urile și video-ul sunt pe laptopul de prezentare și într-un link de rezervă.

### T18 · Rol Voluntar + mesaje (din `design/final/`)
Rol `VOLUNTEER` creat doar de Primărie din panoul web (cod de 6 cifre „prin SMS”, simulat; opțional cont de unică folosință), alocat pe acțiuni. În aplicație are doar 3 tab-uri: **Acțiuni** (blocate până în ziua acțiunii, se deschid cu 30 min înainte; bifă verde când toți participanții sunt confirmați), **Scanează** (QR sau cod manual; rezultate: confirmat +puncte / deja scanat / cod necunoscut), **Mesaje** (conversație cu coordonatorul). Primăria vede voluntarii alocați pe fiecare acțiune și cine a scanat pe cine, răspunde la mesaje; **scanarea nu se face din web**, doar din aplicație. Migrarea V10; rolul nou cere schimbare în `Role`/`SecurityConfig` (T03). **Doar după ce bucla T11 e verde.**
**Verificare:** Primăria creează un voluntar și îl alocă la o acțiune → voluntarul intră cu codul, vede doar acțiunea lui, scanează QR-ul unui localnic → localnicul primește punctele → mesajul voluntarului apare în panoul Primăriei.

### T19 · Transport în comun — tramvai (din `design/final/`)
Tab „Transport” în navbar (în locul lui Salvate; Salvate rămâne în Profil). Destinație (căutare sau sugestii: locuri, repere, stații) → **lista traseelor** (variante cu tramvai: linia, stația de urcare/coborâre, durata; plus „pe jos”) → alegi una → **harta cu tot drumul**: mers pe jos până la stație (OSRM), segmentul de tramvai pe șine cu stațiile, mers pe jos până la destinație; „Pornește călătoria” = simulare cu banner „Mai ai N stații · Următoarea: X”. Stații lângă tine cu plecările următoare; pagina liniei. Date: liniile CTP Arad 1, 3, 6, 7, 15, 16 din OpenStreetMap (ODbL; `design/final/shared/tram.js`), orare de exemplu marcate „(exemplu)”; autobuzele lipsesc. **Doar după ce T08 e verde.**
**Verificare:** Primărie → Gara Arad arată cel puțin o variantă cu tramvai și una pe jos; după selecție harta desenează cele trei segmente; fără internet la OSRM se desenează linie dreaptă fără eroare.
