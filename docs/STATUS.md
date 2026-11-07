# STATUS — memoria proiectului

Starea reală a story-urilor din `docs/PLAN.md`, deciziile luate pe parcurs și ce a rămas. **Fiecare PR din `AradEx-Plan` își actualizează rândul lui aici** (skill-ul `task-workflow`, pasul 5). Adevărul final e pe GitHub (PR-uri merge-uite în `main`); fișierul ăsta e rezumatul pentru oameni și pentru Claude.

Ultima actualizare: 2026-11-07 — T04: producția pe AWS (https://aradexperience.site), deploy automat din GitHub Actions; T03, T15/Android și T02 merge-uite.

## Story-uri
Legendă: ✅ gata (merge-uit sau PR deschis, verificat) · 🟡 parțial · ⬜ neînceput

| Story | Stare | PR-uri | Ce e / ce lipsește |
|---|---|---|---|
| T00 Repo & tooling | 🟡 | — | 5 repo-uri, `setup.sh`, `.env.example`, hook fără co-autori; **nou:** `docs/SETUP.md` + `setup-windows.ps1`. Lipsesc: drepturi de scriere pentru toți, protecție pe `main` (de verificat pe GitHub). |
| T01 API skeleton | ✅ | — | Gradle `api`/`app`, Flyway V1–V4.1 (+seed), ProblemDetail, Swagger, `/health`, `AppSmokeTest` (Testcontainers). |
| T02 APP skeleton | ✅ (PR deschis) | [FE #8](https://github.com/HACK4ARAD/AradEx-Frontend/pull/8) · [Plan #6](https://github.com/HACK4ARAD/AradEx-Plan/pull/6) | Schelet: `/` → `/m` sau `/w`, `?ui=`, tab bar, sidebar, PWA. **Pregătirea anti-conflict:** câte un view per rută (65 de fișiere noi, cu `meta.task` = story-ul care îl completează); panourile web cu o rută + un view pe secțiune (`business-panel/`, `city/`, `admin/`); Contul meu cu tab-uri, câte un view pe tab; cochilii pentru Acasă (3 tab-uri), `/m/panel` (firmă / Primărie) și landing (evenimente / hartă); i18n, tipuri și API pe module; `AppSheet`, `QrCode`, `QrScanner`, `useGeo` cu teste (21 de teste FE). Tabelul „fișierele tale” pe story: `AradEx-Frontend/CLAUDE.md` §Culoare. |
| T03 Auth & roluri | ✅ merge-uit | [BE #5](https://github.com/HACK4ARAD/AradEx-Backend/pull/5) · [FE #5](https://github.com/HACK4ARAD/AradEx-Frontend/pull/5) · [Plan #4](https://github.com/HACK4ARAD/AradEx-Plan/pull/4) | JWT + roluri + `SecurityConfig` pentru toate rutele din API.md; login/înregistrare S12 (mobil), W0 (web, tab „Panouri”, „Înregistrează-ți firma”), Profil S11 (limbă RO/EN, deconectare). 124 de teste BE, 16 FE. |
| T04 Deploy v0 | ✅ (PR-uri deschise) | [Infra #1](https://github.com/HACK4ARAD/AradEx-Infrastructure/pull/1) · [Infra #2](https://github.com/HACK4ARAD/AradEx-Infrastructure/pull/2) · [BE #6](https://github.com/HACK4ARAD/AradEx-Backend/pull/6) · [FE #9](https://github.com/HACK4ARAD/AradEx-Frontend/pull/9) · Plan (acest PR) | **Producția pe AWS** (`eu-north-1`), nu pe Render/Netlify/Neon: https://aradexperience.site. Terraform în `AradEx-Infrastructure/terraform` (VPC fără NAT, RDS Postgres 16, ALB public cu HTTPS, ECS Fargate pentru API și pentru PWA (nginx), alarme + buget), state în S3. **Deploy automat:** merge pe `main` în BE/FE → `.github/workflows/deploy.yml` (teste → imagine în ECR → ECS cu rollback). Primul deploy BE din Actions a trecut (teste + `Dockerfile`, care nu fusese verificat până acum). Pași rămași: imaginea FE + pornirea containerelor (`*_desired_count = 1`), cheia OpenAI în Secrets Manager. Detalii: `docs/DEPLOY.md`, `AradEx-Infrastructure/README.md`. |
| T05 Locuri & ghid | ⬜ | — | Migrările + seed-ul V3/V3_1 există (+ pozele în V4_2). Editarea obiectivelor e la Primărie: `/city/places/**`. |
| T06 Evenimente | ⬜ | — | Migrările + seed-ul V4/V4_1/V4_2 (poze) există. |
| T07–T14, T16–T19 | ⬜ | — | — |
| T15 i18n, PWA, Android | 🟡 (Android merge-uit) | [FE #7](https://github.com/HACK4ARAD/AradEx-Frontend/pull/7) (#6 a intrat din greșeală doar în `feat/T03-auth`) | **Android gata:** Capacitor 6, `AradEx-Frontend/android/`, aplicația „AradExperience” (`ro.aradexperience.app`) rulează pe emulator, login verificat. Rămân: iconița și splash-ul aplicației, iOS (doar pe macOS), EN complet pe module, verificarea „Add to Home Screen”. |

## Decizii luate (de ce e așa)
- **T03 — rolul `VOLUNTEER`** e deja în `Role` (BE + FE) și are regulile `/vol/**` (VOLUNTEER) și `POST /auth/volunteer` (public) în `SecurityConfig`, ca T18 să nu mai atingă fișierele T03. Coloana `users.role` îl acceptă abia după migrarea V10 (T18); până atunci nu se pot crea voluntari.
- **T03 — emailurile se stochează normalizate** (trim + lowercase); căutarea e exactă (`findByEmail`, indexul UNIQUE). Orice cod/seed care creează utilizatori scrie emailul cu litere mici.
- **T03 — login:** același 401 „Invalid email or password” pentru email inexistent și parolă greșită, cu BCrypt rulat în ambele cazuri (fără enumerare de conturi prin timp). Formularul cere la login doar parolă nevidă (ca `LoginRequest`), la cont nou minimum 8.
- **T03 — înregistrare:** doar VISITOR/LOCAL/BUSINESS; `business` obligatoriu la BUSINESS și refuzat la celelalte; firma nouă e `verified=false`. Pe mobil se aleg doar Vizitator/Localnic (firmele se înregistrează pe web, ca în design).
- **T03 — după login:** fiecare rol ajunge acasă la el (Firmă → `/w/business` sau `/m/panel`, Primărie → `/w/city` sau `/m/panel`, Admin → `/w/admin`); `?next=` e folosit doar dacă e o rută internă la care rolul are acces.
- **T03 — `/w/login` e pagină întreagă**, în afara `WebLayout` (ca în `design/final/web.html`). Butoanele „Conturi demo” și cardurile din tab-ul „Panouri” apar doar în dev sau cu `VITE_DEMO=true`.
- **T03 — limba:** selectorul RO/EN e în Profil (mobil) și în bara web; pentru utilizatorul logat se salvează în cont (`PATCH /me`) și se aplică la login. Un cont nou păstrează limba aleasă înainte de înregistrare.
- **T02 — un view per rută, inclusiv în panouri:** `/w/business/*`, `/w/city/*`, `/w/admin/*` și `/w/account/*` nu mai au o singură rută cu `:section?`, ci câte o rută și un fișier pe secțiune (URL-urile au rămas aceleași; `:sub?` pentru `new` / `:id`). Așa T05, T06, T11, T14 și T18 lucrează în același panou al Primăriei fără să atingă același fișier.
- **T02 — ecranele cu mai multe story-uri sunt cochilii:** `HomeView` randează `HomeEventsTab` (T06) / `HomeOffersTab` (T10) / `HomeCommunityTab` (T11) din `mobile/components/home/`; `/m/panel` randează `BusinessPanel` (T09/T10) sau `CityPanel` (T11) din `mobile/components/panel/`; landing-ul web randează `LandingEvents` (T06) și `LandingMap` (T08). Cochiliile (și `AccountView`) sunt ale lui P1.
- **T02 — i18n pe module cu `import.meta.glob`:** numele fișierului e cheia de top (`ro/events.json` → `t('events.…')`), deci cheile existente (`nav.*`, `auth.*` …) n-au schimbat; un fișier nou se încarcă singur. `types/api.ts` și `api/index.ts` doar re-exportă toate modulele (lista e completă, nu se mai adaugă linii).
- **T02 — `QrScanner` adăugat acum** (nu era în lista T02): îl folosesc T10 (firmă), T11 (Primărie pe teren) și T18 (voluntar). `MapView` rămâne în T08.
- **T02 — voluntarii:** rutele `/m/vol/*` au `roles: ['VOLUNTEER']`, fără cont duc la `/m/vol/login`, iar după login voluntarul ajunge la `/m/vol/actions` — T18 nu mai atinge router-ul sau `useAuthForm`.
- **T15 — Capacitor 6** (nu 7/8): folosește SDK Android 34, deja instalat; build-ul rulează pe JDK 21 (wrapper-ul Gradle din `android/` urcat la 8.14.3). Aplicația nativă: origine `http://localhost` (trebuie în `CORS_ORIGINS`), pornește mereu pe `/m`, fără service worker. `@capacitor/cli` aduce o vulnerabilitate în `tar` (doar unealta de build, nu ajunge în APK; fix doar în Capacitor 8).

- **T04 — AWS în loc de Render/Netlify/Neon**, la decizia lui P1: un singur domeniu cu HTTPS, baza de date gestionată, deploy fără downtime cu revenire automată, alerte pe email. Contul e pe planul gratuit AWS (100 $ credite); costul estimat e ~2,5 $/zi. Totul e în Terraform (`AradEx-Infrastructure/terraform`, testat cu `terraform test`), iar infrastructura o schimbă doar P1 (`plan` + `apply`).
- **T04 — GitHub Actions în loc de CodePipeline:** contul are cota CodeBuild „concurrent builds” = 0. Singurul workflow din repo-urile de cod e `.github/workflows/deploy.yml` (BE și FE), deci regula „repo-urile de cod nu au workflows” are acum această excepție (`CLAUDE.md`).
- **T04 — chei de acces IAM în loc de OIDC:** organizația AWS din care face parte contul (SCP) interzice providerul OIDC. Fiecare repo are un utilizator IAM dedicat (`aradex-gha-backend` / `aradex-gha-frontend`), cu permisiuni doar pentru deploy-ul lui. Cheile stau în secretele repo-urilor, puse și rotite de `AradEx-Infrastructure/scripts/github-keys.sh` (nu trec prin git sau chat), și se șterg la `terraform destroy`. Același SCP permite doar regiunile `eu-north-1` și `us-east-1`.
- **T04 — fără CloudFront:** contul nu poate crea distribuții CloudFront până nu e verificat de AWS Support. HTTPS-ul se termină pe ALB: `/api/*`, `/swagger-ui*`, `/v3/api-docs*` merg la API, restul la PWA, servit de nginx (`AradEx-Frontend/deploy/`: fallback SPA, `index.html`/`sw.js` fără cache, `assets/` imutabile). Erorile API rămân ProblemDetail JSON (nu trec prin nginx).
- **T04 — Fargate pe x86_64:** runner-ele GitHub gratuite sunt x86, deci `Dockerfile`-ul BE se construiește nativ (pe ARM ar fi fost prin emulare, de >10× mai lent).
- **T04 — `CORS_ORIGINS` în producție** = `https://aradexperience.site,http://localhost` (al doilea e originea aplicației Android).
- **T04 — un merge pe `main` în BE/FE e deploy în producție** după ~5–8 minute; testele pică → nu se face deploy; taskul nou nu pornește → ECS rămâne pe versiunea veche. Regula e în `task-workflow` și `review-pr`.

## Probleme cunoscute / de făcut mai târziu
- **Lecție (T15):** un PR stivuit (bază = alt branch de feature) se merge-uiește doar după ce i-ai schimbat baza la `main` (PR → *Edit* → base). FE #6 avea baza `feat/T03-auth`, a fost merge-uit după ce T03 intrase deja în `main`, iar codul a ajuns doar în branch-ul vechi; s-a reparat cu FE #7. Regula e acum în `task-workflow` și `review-pr`.
- Branch-urile `feat/T03-auth` (BE, FE, Plan) și `feat/T15-android` (FE) sunt merge-uite și pot fi șterse pe GitHub.
- `AradEx-Ops/agents/*.md` trimit încă la `docs/TEAM.md` și `docs/status/Px.md` (șterse); de aliniat la acest fișier (P1).
- `GlobalExceptionHandler` are încă un handler pentru `BadCredentialsException` care nu mai e folosit (login-ul aruncă `UnauthorizedException`); inofensiv.
- Iconița aplicației Android e cea implicită Capacitor.

- **T04 — de făcut:**
  - cheia OpenAI în Secrets Manager (`AradEx-Infrastructure/scripts/set-openai-key.sh`), altfel chat-ul și planificatorul răspund cu fallback-ul;
  - pornirea containerelor după prima imagine FE (`api_desired_count = 1`, `web_desired_count = 1`);
  - protecția pe `main` (merge-ul face deploy);
  - ștergerea luni (`scripts/destroy.sh`).
- **T04 — Swagger în producție:** „Try it out” poate încerca `http://`, pentru că Spring nu citește `X-Forwarded-Proto`. Documentația se vede; testați cu `curl` sau din aplicație. Fix (opțional, T01/P1): `server.forward-headers-strategy=framework` în `application-prod.yml`.
- **T04 — fără CDN:** PWA-ul e servit din `eu-north-1` prin ALB; pentru demo e suficient. CloudFront se poate adăuga după verificarea contului.
- **T04 — `AradEx-Ops/agents/*.md`** încă descriu Render/Netlify și CI/CD fără workflows; de aliniat (P1).

## Împărțirea propusă pentru story-urile de features
Discutată în echipă (cine ia ce se decide în ziua respectivă; dependențele sunt în `docs/PLAN.md`):

| Om | Story-uri, în ordine | Ce așteaptă |
|---|---|---|
| A | T05 Locuri & ghid → T08 Hartă & indicații → T13 Planificator | T08 așteaptă T06; T13 așteaptă T08 + T12 |
| B | **T06 Evenimente** (drumul critic) → T07 Bilete → T12 Chat AI → T19 Transport | nimic la start |
| C | T09 Firme & panou → T10 Oferte & coduri → T14 Admin | evenimentele firmei (T09) așteaptă T06; T14 așteaptă T09–T11 |
| D | T11 Comunitate & puncte → T18 Voluntari | doar „plătește cu puncte” așteaptă T10 — se face ultimul, după ce T10 e pe `main` |
| P1 | T04 Deploy v0 în paralel (făcut pe AWS, vezi `docs/DEPLOY.md`) | — |

## Mediul local (pe scurt)
Instalare și probleme întâlnite: `docs/SETUP.md`. Pe laptopul pe care s-a lucrat la T03: TLS interceptat (Git cu `schannel`, Java cu `JAVA_TOOL_OPTIONS=-Djavax.net.ssl.trustStoreType=Windows-ROOT`), porturile 5432/8080 ocupate de alt proiect → Postgres pe 5433 și API pe 8081 prin `.env` (vezi SETUP §5).
