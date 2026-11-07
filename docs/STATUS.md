# STATUS — memoria proiectului

Starea reală a story-urilor din `docs/PLAN.md`, deciziile luate pe parcurs și ce a rămas. **Fiecare PR din `AradEx-Plan` își actualizează rândul lui aici** (skill-ul `task-workflow`, pasul 5). Adevărul final e pe GitHub (PR-uri merge-uite în `main`); fișierul ăsta e rezumatul pentru oameni și pentru Claude.

Ultima actualizare: 2026-11-07 (T03 + T15/Android).

## Story-uri
Legendă: ✅ gata (merge-uit sau PR deschis, verificat) · 🟡 parțial · ⬜ neînceput

| Story | Stare | PR-uri | Ce e / ce lipsește |
|---|---|---|---|
| T00 Repo & tooling | 🟡 | — | 5 repo-uri, `setup.sh`, `.env.example`, hook fără co-autori; **nou:** `docs/SETUP.md` + `setup-windows.ps1`. Lipsesc: drepturi de scriere pentru toți, protecție pe `main` (de verificat pe GitHub). |
| T01 API skeleton | ✅ | — | Gradle `api`/`app`, Flyway V1–V4.1 (+seed), ProblemDetail, Swagger, `/health`, `AppSmokeTest` (Testcontainers). |
| T02 APP skeleton | 🟡 | — | Merge: `/` → `/m` sau `/w`, `?ui=`, tab bar, sidebar, PWA (manifest, SW), toate rutele cu placeholder. **Lipsește pregătirea anti-conflict:** un fișier de view per rută în `views/<feature>/`, i18n/types/api pe module (`i18n/ro/<modul>.json`, `types/<modul>.ts`, `api/<modul>.ts`), `AppSheet`, `QrCode`, `useGeo`, tab-urile din Home. De făcut înainte ca 4 oameni să lucreze în paralel pe FE. |
| T03 Auth & roluri | ✅ | BE · FE · Plan (`feat/T03-auth`) | JWT + roluri + `SecurityConfig` pentru toate rutele din API.md; login/înregistrare S12 (mobil), W0 (web, tab „Panouri”, „Înregistrează-ți firma”), Profil S11 (limbă RO/EN, deconectare). 124 de teste BE, 16 FE. |
| T04 Deploy v0 | ⬜ | — | Cere conturi Render + Netlify (+ Neon). `Dockerfile` BE neverificat local (TLS interceptat în containere pe laptopul pe care s-a lucrat). |
| T05 Locuri & ghid | ⬜ | — | Migrările + seed-ul V3/V3_1 există (+ pozele în V4_2). Editarea obiectivelor e la Primărie: `/city/places/**`. |
| T06 Evenimente | ⬜ | — | Migrările + seed-ul V4/V4_1/V4_2 (poze) există. |
| T07–T14, T16–T19 | ⬜ | — | — |
| T15 i18n, PWA, Android | 🟡 | FE (`feat/T15-android`) | **Android gata:** Capacitor 6, `AradEx-Frontend/android/`, aplicația „AradExperience” (`ro.aradexperience.app`) rulează pe emulator, login verificat. Rămân: iconița și splash-ul aplicației, iOS (doar pe macOS), EN complet pe module, verificarea „Add to Home Screen”. |

## Decizii luate (de ce e așa)
- **T03 — rolul `VOLUNTEER`** e deja în `Role` (BE + FE) și are regulile `/vol/**` (VOLUNTEER) și `POST /auth/volunteer` (public) în `SecurityConfig`, ca T18 să nu mai atingă fișierele T03. Coloana `users.role` îl acceptă abia după migrarea V10 (T18); până atunci nu se pot crea voluntari.
- **T03 — emailurile se stochează normalizate** (trim + lowercase); căutarea e exactă (`findByEmail`, indexul UNIQUE). Orice cod/seed care creează utilizatori scrie emailul cu litere mici.
- **T03 — login:** același 401 „Invalid email or password” pentru email inexistent și parolă greșită, cu BCrypt rulat în ambele cazuri (fără enumerare de conturi prin timp). Formularul cere la login doar parolă nevidă (ca `LoginRequest`), la cont nou minimum 8.
- **T03 — înregistrare:** doar VISITOR/LOCAL/BUSINESS; `business` obligatoriu la BUSINESS și refuzat la celelalte; firma nouă e `verified=false`. Pe mobil se aleg doar Vizitator/Localnic (firmele se înregistrează pe web, ca în design).
- **T03 — după login:** fiecare rol ajunge acasă la el (Firmă → `/w/business` sau `/m/panel`, Primărie → `/w/city` sau `/m/panel`, Admin → `/w/admin`); `?next=` e folosit doar dacă e o rută internă la care rolul are acces.
- **T03 — `/w/login` e pagină întreagă**, în afara `WebLayout` (ca în `design/final/web.html`). Butoanele „Conturi demo” și cardurile din tab-ul „Panouri” apar doar în dev sau cu `VITE_DEMO=true`.
- **T03 — limba:** selectorul RO/EN e în Profil (mobil) și în bara web; pentru utilizatorul logat se salvează în cont (`PATCH /me`) și se aplică la login. Un cont nou păstrează limba aleasă înainte de înregistrare.
- **T15 — Capacitor 6** (nu 7/8): folosește SDK Android 34, deja instalat; build-ul rulează pe JDK 21 (wrapper-ul Gradle din `android/` urcat la 8.14.3). Aplicația nativă: origine `http://localhost` (trebuie în `CORS_ORIGINS`), pornește mereu pe `/m`, fără service worker. `@capacitor/cli` aduce o vulnerabilitate în `tar` (doar unealta de build, nu ajunge în APK; fix doar în Capacitor 8).

## Probleme cunoscute / de făcut mai târziu
- T02: pregătirea anti-conflict (vezi tabelul) — fără ea, story-urile FE paralele vor avea conflicte în `router/index.ts`, `ro.json`, `types/api.ts`.
- `AradEx-Ops/agents/*.md` trimit încă la `docs/TEAM.md` și `docs/status/Px.md` (șterse); de aliniat la acest fișier (P1).
- `GlobalExceptionHandler` are încă un handler pentru `BadCredentialsException` care nu mai e folosit (login-ul aruncă `UnauthorizedException`); inofensiv.
- Iconița aplicației Android e cea implicită Capacitor.

## Mediul local (pe scurt)
Instalare și probleme întâlnite: `docs/SETUP.md`. Pe laptopul pe care s-a lucrat la T03: TLS interceptat (Git cu `schannel`, Java cu `JAVA_TOOL_OPTIONS=-Djavax.net.ssl.trustStoreType=Windows-ROOT`), porturile 5432/8080 ocupate de alt proiect → Postgres pe 5433 și API pe 8081 prin `.env` (vezi SETUP §5).
