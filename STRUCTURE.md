# STRUCTURE — ce e în kit, unde stă și la ce folosește

Kitul v3 are trei repo-uri (umbrelă + be + fe, cele de cod clonate în umbrelă). La HACK4ARAD sunt **5 repo-uri surori** în același folder (ex. `~/HACK4ARAD/`), organizația GitHub [HACK4ARAD](https://github.com/HACK4ARAD):
`AradEx-Plan` = umbrela din kit (ce e comun: documentație, design, mod de lucru, **toate** skill-urile), `AradEx-Backend` = `aradexperience-be`, `AradEx-Frontend` = `aradexperience-fe`, `AradEx-Infrastructure` (Postgres local + deploy; în kit compose-ul stă în BE) și `AradEx-Ops` (agenții Paperclip). Claude Code (și agenții Paperclip) pornesc din `AradEx-Plan` și ajung la cod prin `../AradEx-Backend`, `../AradEx-Frontend`.

```
AradEx-Plan/                          REPO 1 — planul comun (= umbrela din kit)
├─ CLAUDE.md                          orientarea pentru Claude Code: ce e proiectul, unde e tot, mod de lucru, reguli, „definiția lui gata”
├─ STRUCTURE.md                       acest fișier
├─ README.md                          pornire rapidă (5 repo-uri surori, setup.sh, comenzi)
├─ setup.sh                           clonează lângă el repo-urile surori care lipsesc / git pull în toate 5; activează hook-ul de commit
├─ setup-windows.ps1                  Windows: verifică JDK 21, Node, Docker, Android Studio/SDK 34/emulator, gh; cu -Install le pune cu winget
├─ .gitignore                         .env, fișiere de IDE/OS
├─ .githooks/commit-msg               scoate `Co-Authored-By:` / „Generated with Claude Code” din mesajele de commit (în toate 5 repo-urile)
├─ .claude/skills/
│  ├─ task-workflow/SKILL.md          cum se ia, se face, se verifică și se închide un task Txx (peste repo-uri, cu worktree-uri)
│  ├─ review-pr/SKILL.md              review de 10–15 min înainte de merge: rulează, caută ce strică demo-ul, verdict
│  ├─ be-module/SKILL.md              feature cap-coadă în AradEx-Backend (api → app), șabloane de cod și teste
│  ├─ seed-data/SKILL.md              datele demo (migrări de seed, locurile reale, conturi, poze)
│  └─ fe-feature/SKILL.md             ecran/feature în AradEx-Frontend (tipuri → api → composable → componente → view-uri → i18n → test)
├─ docs/                              documentația echipei (se schimbă prin PR în AradEx-Plan)
│  ├─ STATUS.md                       memoria proiectului: starea fiecărui story, PR-uri, decizii luate, probleme cunoscute (actualizat de fiecare PR din Plan)
│  ├─ SETUP.md                        ce instalezi (JDK 21, Node, Docker, Android Studio…), prima pornire, probleme de mediu și rezolvări
│  ├─ PLAN.md                         T00–T19: task-uri medii, ordonate pe dependențe; fiecare cu Scop / BE / FE / Seed / Verificare (+ „Stare”)
│  ├─ API.md                          contractul REST (endpoint-uri, DTO-uri, roluri, rute FE) — legea comună BE ↔ FE
│  ├─ DATA-MODEL.md                   tabele, enum-uri, convenții de migrări Flyway, ce seed trebuie să existe
│  ├─ FEATURES.md                     funcționalitățile pe roluri (reguli de business, stări, mobil vs web)
│  ├─ DEMO.md                         fluxul de demo pas cu pas + pitch (orientativ; se clarifică la final)
│  ├─ DEPLOY.md                       local + producție (Render Docker pentru BE, Netlify pentru FE, Neon/Render Postgres)
│  └─ ARAD-DATA.md                    datele reale despre Arad folosite în seed (surse, program, tarife) și ce e FICTIV
└─ design/                            designul (se schimbă aici, prin PR în AradEx-Plan)
   ├─ final/                          DESIGNUL FINAL (sursa de adevăr): mobile.html + web.html funcționale, shared/ (date, tokens, linii de tramvai), screens/ (planșele)
   ├─ AradExperience.html             (istoric) prototipul original mobil (S0–S12), interactiv
   ├─ AradExperience-extensii.html    ecranele noi: E1–E7 (mobil), W1–W4 (web)
   ├─ AradExperience-web.html         toate paginile web W5–W26
   ├─ AradExperience-web-prototip.html web navigabil cu date mock (hash routing, roluri demo)
   ├─ screens/                        o captură per ecran (jpg + png), numele = codul ecranului (S3, E2, W7…)
   ├─ sheets/                         planșe de ansamblu (bune pentru slide-uri)
   ├─ assets/                         poze cu licență (720×450), fonturi, clean-ink.css (tokens); README.md cu licențele
   └─ README.md                       ce e fiecare fișier de design, licențele pozelor

AradEx-Backend/                       REPO 2 — backend (Spring Boot 3, Java 21, Gradle Groovy, Postgres 16)
├─ CLAUDE.md                          regulile BE: cele două module, layerele, convenții, teste obligatorii, „Nu”
├─ README.md                          comenzi + starea scheletului
├─ .githooks/ · .claude/settings.json  hook-ul fără co-autori; atribuirea Claude oprită
├─ settings.gradle                    include 'api', 'app' (+ foojay: descarcă JDK 21 dacă lipsește)
├─ build.gradle                       părinte: plugin-uri Spring Boot / dependency-management, Java 21, BOM, JUnit pentru ambele module
├─ gradle.properties · gradlew · gradle/wrapper/   wrapper Gradle 8.14 (nu trebuie Gradle instalat)
├─ Dockerfile                         build multi-stage (gradle:8.14-jdk21 → :app:bootJar → temurin 21 jre), pentru Render
├─ .env.example                       variabilele BE (POSTGRES_*, JWT_SECRET, OPENAI_API_KEY, CORS_ORIGINS); .env e ignorat de git
├─ api/                               MODULUL `api` = CONTRACTUL REST (bibliotecă Java simplă; app depinde de ea)
│  ├─ build.gradle                    java-library; spring-web (adnotări), jakarta.validation, swagger-annotations; test: JUnit, Jackson, validator
│  └─ src/main/java/aradexperience/
│     ├─ api/                         interfețele controllerelor, una per feature (HealthApi, AuthApi…): rute, verbe, @Valid, @Operation
│     ├─ dto/<feature>/               record-uri cerere/răspuns (dto/auth: RegisterRequest, LoginRequest, UpdateMeRequest, AuthResponse, UserDto, BusinessSummary)
│     ├─ dto/common/                  PageResponse<T>, HealthDto
│     ├─ enums/                       enum-urile din DTO-uri (Role cu VOLUNTEER + selfRegistrable(), BusinessCategory; vin EventCategory, TicketType…)
│     ├─ annotations/                 validări custom (Code: regex pentru AX-T12-7KQ2MZ)
│     └─ exceptions/                  ApiException (status + mesaj) + BadRequest / Unauthorized / NotFound / Conflict / Forbidden — contractul de erori
│     src/test/java/aradexperience/
│     ├─ api/ApiContractTest          gardă: fiecare interfață are @RequestMapping, fiecare metodă o rută, fără rute duplicate
│     ├─ dto/DtoJson                  helper: ObjectMapper ca în Spring + citire JSON din resources
│     ├─ dto/DtoValidationTest        regulile jakarta de pe DTO-urile de cerere
│     └─ dto/auth/UserDtoTest, RegisterRequestTest, AuthResponseTest   serializare: JSON-ul din src/test/resources/dto/auth/*.json e adevărul (deserializare + round-trip strict)
└─ app/                               MODULUL `app` = APLICAȚIA (singurul rulabil)
   ├─ build.gradle                    Spring Boot plugin; project(':api'), starters (web, security, validation, data-jpa, actuator), springdoc, Flyway, Postgres, jjwt, Lombok; bootRun încarcă .env
   └─ src/main/java/aradexperience/
      ├─ Application.java             @SpringBootApplication în pachetul rădăcină (scanare implicită a tot)
      ├─ controller/<feature>/        XController implements XApi — zero logică: AuthContext → service → mapper → DTO (health/HealthController = șablonul; auth/AuthController din T03)
      ├─ controller/handler/          GlobalExceptionHandler: toate erorile ca ProblemDetail RFC 7807 (400 cu errors[], 401, 403, 404, 409, 500)
      ├─ service/<feature>/           logica de business, un service per controller (@Service, @Transactional) — auth/AuthService (register, login, /me) din T03
      ├─ repository/<feature>/        un JpaRepository per entitate (users/UserRepository, business/BusinessRepository din T03)
      ├─ entity/<feature>/            entitățile JPA (Lombok); schema vine doar din Flyway (users/User, business/Business din T03)
      ├─ mapper/<feature>/            entity ↔ DTO — clase utilitare statice (import static), layer separat ca să fie refolosite (users/UserMapper)
      ├─ config/                      AppProps (app.* din yml), SecurityConfig (regulile pentru TOATE rutele din API.md, din T03; CORS; 401/403 ca ProblemDetail), OpenApiConfig (Swagger + Authorize)
      ├─ security/                    JwtService (emite/validează), JwtAuthFilter (Bearer → SecurityContext), CurrentUser, AuthContext (utilizatorul curent pentru controllere)
      └─ util/                        Codes (coduri AX-…), Geo (haversine), Pages (Page → PageResponse) — utilitare statice
      src/main/resources/
      ├─ application.yml              config din variabile de mediu cu valori implicite locale; Flyway, JPA validate, springdoc, actuator
      ├─ application-prod.yml         profilul prod (Render)
      └─ db/migration/                V1 baseline · V2 users+businesses (+V2_1 seed conturi) · V3 places (+V3_1 12 locuri reale, 33 puncte de ghid) · V4 events (+V4_1 30 evenimente) — numerele următoare se iau în ordinea story-urilor din PLAN
      src/test/java/aradexperience/
      ├─ AppSmokeTest                 @SpringBootTest + Testcontainers Postgres: pornește tot, Flyway, /health, 401, login cu toate conturile demo, 409/403 (se sare fără Docker)
      ├─ config/SecurityRulesTest     matricea rute × roluri din API.md pe SecurityConfig-ul real (public / 401 / 403 / trece)
      ├─ controller/ControllerTest    adnotare compusă: @WebMvcTest + SecurityConfig real + AppProps + JwtService mock — un test de controller = @ControllerTest(X.class) + @MockBean XService
      ├─ controller/health/HealthControllerTest   șablonul de test de controller: 200 public / 401 fără token (ProblemDetail) / 403 rol greșit
      ├─ service/<feature>/           unit-teste Mockito pe servicii (auth/AuthServiceTest; restul vin cu task-urile)
      ├─ mock/                        date de test refolosite: AuthMock (utilizator în SecurityContext pentru MockMvc), JsonFixtures (JSON din resources), XMock per service
      ├─ security/JwtServiceTest · util/CodesAndGeoTest
      └─ resources/requests/<feature>/*.json   cererile pentru testele de controller (requests/auth/register.json = exemplu)

AradEx-Frontend/                      REPO 3 — frontend (Vue 3.5, Vite 8, TypeScript, Tailwind 4, PWA)
├─ CLAUDE.md                          regulile FE: structura pe feature, stack aprobat, stări obligatorii, stil Clean Ink, „Nu”
├─ README.md                          comenzi + ce conține scheletul
├─ .githooks/ · .claude/settings.json  hook-ul fără co-autori; atribuirea Claude oprită
├─ package.json · vite.config.ts · tsconfig*.json · index.html · .env.example (VITE_API_URL, VITE_DEMO)
├─ capacitor.config.ts · android/     aplicația Android (Capacitor 6, T15): același build `dist`, pornește pe /m; `npm run android:run`
├─ public/                            manifest + icon-uri PWA, fonturi locale (Inter, Material Symbols), _redirects (Netlify SPA), img/ (pozele din seed, copiate din design/assets)
└─ src/
   ├─ main.ts · App.vue · vite-env.d.ts
   ├─ router/index.ts                 toate rutele /m/* și /w/* (din API.md §Rute FE) cu meta {roles, title, screen, task}; `/` → /m sau /w după lățime; rutele neimplementate → PlaceholderView
   ├─ shared/                         tot ce e comun mobil + web — aici stă logica
   │  ├─ types/api.ts                 DTO-urile din API.md în TypeScript (= modulul api din BE)
   │  ├─ api/                         client.ts (fetch + Bearer + ProblemDetail → ApiError + 401 → logout) și un fișier per interfață BE (auth.ts, health.ts, …)
   │  ├─ stores/                      Pinia: auth.ts (token, user, rol, hasRole), ui.ts (toast)
   │  ├─ composables/                 logica de ecran refolosibilă: useFormat (date/bani/km în ro), useAuthForm (validare, unde ajunge fiecare rol după login), useBack — cu teste; vin useGeo, useTts, useRouteOsrm, useEvents…
   │  ├─ components/ui/               componentele generice Clean Ink (AppButton, AppChip, AppCard, AppInput, AppIcon, AppToast, EmptyState, Skeleton, ApiStatus, PlaceholderScreen)
   │  ├─ components/<feature>/        componente de feature comune mobil + web (auth/LoginForm; vin events/EventCard, map/MapView, qr/QrCode…)
   │  ├─ i18n/                        ro.json (toate textele, cu diacritice), en.json
   │  └─ styles/base.css              tokens (culori, radius) + Tailwind
   ├─ mobile/                         layouts/MobileLayout.vue (tab bar: Evenimente · Chat · Hartă · Bilete/Panou · Salvate) + views/<feature>/ (home/HomeView, auth/LoginView S12, profile/ProfileView S11)
   └─ web/                            layouts/WebLayout.vue (bară sus + sidebar pe panouri, selector RO/EN) + views/<feature>/ (home/LandingView, auth/LoginView W0 — pagină întreagă)
```

```
AradEx-Infrastructure/                REPO 4 — infrastructură (doar P1)
├─ docker-compose.yml                 Postgres 16 local (arad/arad, db aradexperience, :5432, volum)
├─ README.md · CLAUDE.md              comenzi locale; producția (Render, Netlify, Neon) — pașii în AradEx-Plan/docs/DEPLOY.md
└─ .githooks/ · .claude/settings.json

AradEx-Ops/                           REPO 5 — agenții Paperclip (doar P1)
├─ README.md                          cum se configurează Paperclip pe fiecare laptop
├─ setup-lane.mjs                     creează în Paperclip-ul local compania HACK4ARAD, agentul culoarului, proiectul (workspace = ../AradEx-Plan), skill-urile, task-urile
├─ tasks.json                         task-urile pe culoare (T00–T19), cu blocaje
└─ agents/                            instrucțiunile agenților: common.md + P1–P4, LEAD, QA
```

## Cum se leagă layerele BE ↔ FE
| BE (`api` / `app`) | FE (`src/shared`) | Rol |
|---|---|---|
| `api/dto`, `api/enums` | `types/api.ts` | același contract, în Java și în TypeScript; `docs/API.md` e sursa |
| `api/api/XApi` | `api/x.ts` | o interfață = un fișier de client, aceleași rute |
| `controller` | `views/<feature>` | doar „așază” datele; fără logică |
| `service` | `composables`, `stores` | logica; testată unitar |
| `mapper` (static) | `useFormat` & co. | transformări pure, fără stare |

## Skill-urile — ce conțin, pe scurt
| Skill | Unde | Când îl folosești | Ce face |
|---|---|---|---|
| `task-workflow` | AradEx-Plan | „ia task-ul T07”, „verifică/închide task-ul” | 1) citește PLAN/API/FEATURES, worktree + branch cu același nume în repo-urile atinse, plan de 5–10 rânduri, descrierea PR-ului → IN PROGRESS (migrarea din rezerva culoarului) · 2) ordinea de implementare, când să folosești celelalte skill-uri, ce faci la neclarități (decizia simplă) · 3) checklist de verificare: teste verzi, criteriile task-ului pe mobil + web, Swagger cu 4xx, roluri, stări loading/gol/eroare, diacritice, DEMO.md încă merge, fără secrete · 4) review · 5) merge BE → FE → umbrelă, descrierea PR-ului → DONE |
| `review-pr` | AradEx-Plan | „fă review la PR-ul Txx”, „e ok de merge?” | checkout, diff în afara scopului, rulează testele și aplicația, încearcă 400/401/403/404/409, checklist de abateri (logică în controller, adnotări pe controller, mapper injectat, fetch în view, any…), raport de maximum 10 rânduri cu verdict MERGE / după fix / NU |
| `be-module` | AradEx-Plan (pentru AradEx-Backend) | orice endpoint sau tabel nou | ordinea: migrare → entity → repository → DTO + enum → interfață → mapper static → service + test → controller + test → SecurityConfig; șabloane complete (DTO, interfață, mapper, service, controller, Mock, ControllerTest cu JSON din resources, ServiceTest); capcane (adnotări pe interfață, mapper-e statice, idempotență, paginare) |
| `seed-data` | AradEx-Plan (pentru AradEx-Backend) | „seed”, „date demo”, demo-ul arată gol | ce seed există deja (V2_1, V3_1, V4_1), regula „date reale din Arad”, unde stau (migrare de seed idempotentă, poze în FE public/img), tabelul celor 12 locuri reale cu coordonate, evenimente, firme, oferte, acțiuni comunitare, conturi demo, cum verifici |
| `fe-feature` | AradEx-Plan (pentru AradEx-Frontend) | orice ecran sau feature de UI | ordinea: tipuri → api → composable/store → componente de feature → view mobil → view web → rută → i18n → test; stările obligatorii; lista componentelor comune; cheat sheet Clean Ink; capcane (Leaflet, cameră pe HTTPS, TTS pe iOS, date ISO, erasableSyntaxOnly) |

Cum apar: toate cinci sunt în `AradEx-Plan/.claude/skills/` (un singur loc), deci se văd din prima când pornești Claude Code din `AradEx-Plan`; agenții Paperclip le au atașate ca skill-uri ale companiei.

## Fluxul unui task (pe scurt)
1. `/task-workflow` → „ia task-ul T07” — branch `feat/T07-tickets` (worktree `../_wt/<Repo>-T07`) în BE, FE și Plan; plan
2. BE cu `be-module` (+ `seed-data`), FE cu `fe-feature`; teste după fiecare pas.
3. Checklist-ul de verificare din `task-workflow`; `/review-pr`.
4. PR-uri cu link între ele; QA & Demo face merge BE → FE → Plan (API.md dacă s-a schimbat).
