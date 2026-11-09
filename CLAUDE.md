# AradExperience — context pentru Claude Code (repo-ul `AradEx-Plan`)

Aplicație pentru Hack4Arad 2026 (7–8 nov): evenimente, obiective turistice cu ghid virtual (text + audio), oferte de la firme locale, acțiuni comunitare ale Primăriei cu puncte și clasament, chat AI și planificator de itinerar. Roluri: Vizitator, Localnic, Firmă locală, Primărie (+ Admin). Echipă de 4 oameni, 2 zile. **Obiectiv: demo fără bug-uri majore, nu cod perfect.**

Acesta e **planul comun** (de aici se deschide Claude Code și aici e workspace-ul agenților Paperclip): documentația, designul, modul de lucru și toate skill-urile. Codul e în repo-urile surori din același folder (ex. `~/HACK4ARAD/`), organizația GitHub [HACK4ARAD](https://github.com/HACK4ARAD):

| Repo | Ce conține | Cine îl modifică |
|---|---|---|
| [AradEx-Plan](https://github.com/HACK4ARAD/AradEx-Plan) | **acesta**: `docs/` (STATUS, SETUP, PLAN, API, DATA-MODEL, FEATURES, DEMO, DEPLOY, ARAD-DATA), `design/` (prototipul final în `design/final/`), `CLAUDE.md`, `STRUCTURE.md`, `setup.sh`, `.claude/skills/` | toți, fiecare secțiunea lui din `API.md`; restul prin PR |
| [AradEx-Backend](https://github.com/HACK4ARAD/AradEx-Backend) | Spring Boot 3 · Java 21 · Gradle (Groovy) · Postgres · Flyway · JWT — modulele `api` (contractul) și `app` (aplicația) | fiecare doar feature-urile story-ului lui |
| [AradEx-Frontend](https://github.com/HACK4ARAD/AradEx-Frontend) | Vue 3 + Vite + TS · Pinia · Router · Tailwind 4 · vue-i18n · Leaflet · Capacitor — **aplicația mobilă** (Android + iOS) și **web-ul** (site de prezentare + panouri), două routere fără prefix în URL | fiecare doar fișierele story-ului lui |
| [AradEx-Infrastructure](https://github.com/HACK4ARAD/AradEx-Infrastructure) | Postgres local (`docker-compose.yml`) și producția pe AWS în Terraform (`terraform/`, runbook în `README.md`) | doar P1 (Zoltan) |
| [AradEx-Ops](https://github.com/HACK4ARAD/AradEx-Ops) | agenții Paperclip: instrucțiuni, task-uri, `setup-lane.mjs` | doar P1 (Zoltan) |

Descrierea fiecărui folder și fișier: `STRUCTURE.md`. Căile din documente de forma `AradEx-Backend/...` sunt relative la folderul comun; comenzile `cd ../AradEx-...` se dau din `AradEx-Plan`.

## Citește înainte de orice task
1. `docs/PLAN.md` — story-urile, dependențele și ordinea în care se fac; story-ul pe care lucrezi (scop, BE, FE, seed, verificare). Nu lucra în afara story-ului curent. Cine ia ce story se decide în echipă, în ziua respectivă.
2. `docs/API.md` — contractul exact al endpoint-urilor și DTO-urilor. BE îl implementează (modulul `api` din `AradEx-Backend`), FE îl consumă (`shared/types/`). Dacă trebuie schimbat, schimbă-l în același task (doar secțiunea modulului tău) și spune explicit ce ai schimbat.
3. `docs/DATA-MODEL.md` — tabele, enum-uri, convenții de migrări. `docs/FEATURES.md` — regulile pe roluri, mobil vs web.
4. `docs/DEMO.md` — fluxul de demo, orientativ (se clarifică la final; la un PR verifici doar feature-ul lui). `docs/ARAD-DATA.md` — datele reale din seed și ce e FICTIV.
5. `docs/STATUS.md` — **memoria proiectului**: ce story-uri sunt gata, deciziile luate (de ce e așa), problemele cunoscute. Citește-l înaintea oricărui story; fiecare PR din `AradEx-Plan` îl actualizează. `docs/SETUP.md` — ce instalezi și problemele de mediu cunoscute.
**Produsul e aplicația mobilă** (Android APK/AAB + iOS, prin Capacitor); web-ul are doar site-ul de prezentare și panourile Primărie / Firmă / Admin — paginile publice web (W5–W15) nu se fac (decizia din `docs/PLAN.md`, sus). **Din T23** un cont personal conectat (Vizitator / Localnic, telefon + cod) vede pe web și evenimentele + biletele, harta cu transport, ofertele, comunitatea și Contul meu; obiectivele, chat-ul și planificatorul rămân doar în aplicație.
**Designul final** (sursa de adevăr pentru ecrane): `design/final/` — prototip funcțional mobil (`mobile.html`, 36 de ecrane) + web (`web.html`: site public și panourile Primărie / Admin / Firmă, 37 de pagini), planșele cu toate ecranele în `design/final/screens/`, descrierea în `design/final/README.md`. Prototipurile vechi (`design/AradExperience*.html`, `design/screens/`) rămân doar ca istoric. Stil „Clean Ink”: fundal `#FAFAF7`, ink `#111`, accent `#FF5A36`, verde comunitate `#1F3A12`/`#3B6D11`, galben oferte `#FFC244`, carduri albe radius 16–20, butoane negre radius 14–16, Inter + Material Symbols.

## Skill-uri (toate aici, în `.claude/skills/`, un singur loc)
- `task-workflow` — cum se ia, se face, se verifică și se închide un task (la început și la sfârșit de task).
- `review-pr` — review de 10–15 min înainte de merge.
- `be-module` — feature nou în BE (api → app). `seed-data` — date demo. `fe-feature` — ecran/feature nou în FE.
Agenții Paperclip le au atașate ca skill-uri ale companiei; dacă un skill nu apare, citește direct `SKILL.md`-ul lui de aici.

## Comenzi (din `AradEx-Plan`)
```
./setup.sh                                                    # clonează repo-urile surori care lipsesc / git pull în toate 5
(cd ../AradEx-Infrastructure && docker compose up -d)         # Postgres local (arad/arad, db aradexperience, :5432)
cd ../AradEx-Backend && ./gradlew :app:bootRun                # API :8080 · Swagger /swagger-ui.html · health /api/v1/health (încarcă .env)
cd ../AradEx-Backend && ./gradlew test                        # teste BE (api + app)
cd ../AradEx-Frontend && npm run dev                          # web :5173 (prezentare + panouri); aplicația: npm run dev:mobile (:5174)
cd ../AradEx-Frontend && npm run build && npm run test
cd ../AradEx-Frontend && npm run android:run                 # aplicația Android pe emulator (Capacitor; docs/SETUP.md)
powershell -ExecutionPolicy Bypass -File .\setup-windows.ps1  # Windows: verifică/instalează uneltele
cp ../AradEx-Backend/.env.example ../AradEx-Backend/.env      # secretele BE (ANTHROPIC_API_KEY, JWT_SECRET) — nu intră în git
cp ../AradEx-Frontend/.env.example ../AradEx-Frontend/.env    # VITE_API_URL, VITE_DEMO
```

## Mod de lucru (obligatoriu)
- Un story din PLAN = un branch `feat/T07-tickets` cu **același nume în fiecare repo atins** (BE, FE și `AradEx-Plan` dacă se schimbă API/docs) = câte un PR spre `main`; în descrierea PR-urilor pui link spre perechile lor. Ordinea de merge: BE → FE → Plan. `main` trebuie să ruleze mereu în toate repo-urile.
- Folosește skill-ul `task-workflow` la început și la sfârșit de story (plan scurt → implementare → checklist de verificare). Review cu `review-pr`.
- La închiderea unui story, PR-ul din `AradEx-Plan` actualizează `docs/STATUS.md` (rândul story-ului, PR-urile, deciziile, problemele cunoscute) și, dacă s-a schimbat modul de lucru, skill-ul afectat din `.claude/skills/`.
- Feature nou în BE → skill `be-module`. Ecran/feature nou în FE → skill `fe-feature`. Date demo → skill `seed-data`.
- Rulează testele înainte de a declara ceva gata. Nu dezactiva teste ca să treacă.
- Commit-uri mici, mesaje scurte în engleză (`feat(events): list + filters`, `fix(auth): 401 on expired token`).
- **Niciodată `Co-Authored-By:` sau alte linii de atribuire în commit-uri** (nici pentru Claude, nici pentru altcineva) și niciodată „🤖 Generated with Claude Code” în PR-uri. Autorul commit-ului e doar omul al cărui cont face commit-ul. Hook-ul din `.githooks/commit-msg` le șterge oricum (`git config core.hooksPath .githooks`, o dată pe clonă, în fiecare din cele 5 repo-uri — `setup.sh` o face).
- Când ceva din PLAN/API nu se poate face exact așa, alege varianta cea mai simplă care ține feature-ul funcțional, notează decizia în descrierea PR-ului și mergi mai departe. Nu reproiecta.

## Reguli
- **Niciodată** secrete în cod, în FE sau în git: cheia Claude API e doar în BE (`AradEx-Backend/.env`, `ANTHROPIC_API_KEY`; în producție în Secrets Manager). `.env` e ignorat de git peste tot.
- Schema DB se schimbă **doar** prin migrări Flyway noi (`AradEx-Backend/app/src/main/resources/db/migration`), cu numerele rezervate culoarului tău; nu se editează migrări deja pe `main`.
- BE: contractul (interfețe + DTO-uri) în modulul `api`, logica în `service`, controllerele fără logică, mapper-ele clase utilitare adnotate cu `@UtilityClass` (Lombok), folosite prin import static. `app` depinde de `api`, niciodată invers.
- FE: tot ce e refolosit stă în `src/shared` (componente în `components/ui` sau `components/<feature>`); `mobile/` și `web/` au doar layout-uri și view-uri pe feature. Nu duplica logică între ele.
- Punctele se scriu doar prin `PointsService`. Codurile QR conțin doar codul text (`AX-...`), nu URL-uri, nu date personale.
- Textele din UI sunt în română cu diacritice corecte (ă â î ș ț) și trec prin i18n, chiar dacă EN vine mai târziu.
- Erorile API sunt ProblemDetail; FE afișează `detail` în toast, nu „Something went wrong”.
- Fără librării noi fără motiv: lista aprobată e în `AradEx-Backend/CLAUDE.md` și `AradEx-Frontend/CLAUDE.md`. Dacă chiar trebuie una, scrie de ce în descrierea PR-ului.
- Date demo = date reale din Arad (locuri, adrese, coordonate, program); firmele pot fi fictive, dar plauzibile și marcate `is_demo`. Pozele doar cu licență (vezi `design/README.md`).
- Nu șterge și nu rescrie fișiere mari „ca să fie curat”. Nu rulezi `git push --force`.
- **CI/CD:** singurul workflow din repo-urile de cod e `.github/workflows/deploy.yml` (în `AradEx-Backend` și `AradEx-Frontend`, al lui P1); nu se adaugă alte workflow-uri. **Un merge pe `main` face deploy în producție** (https://aradexperience.site) în ~5–8 minute, după ce trec testele; infrastructura (Terraform) stă în `AradEx-Infrastructure` și o schimbă doar P1. Detalii: `docs/DEPLOY.md`.

## Fără conflicte între story-uri (4 oameni în paralel)
- Fiecare story editează doar fișierele feature-ului lui. Dacă îți trebuie o schimbare într-un fișier al altui story, o ceri în PR-ul lui; nu o faci tu. Poți importa și apela codul altuia.
- BE: fiecare story lucrează în subfolderele feature-urilor lui, în fiecare layer (`api/<F>Api`, `dto/<f>/`, `controller|service|repository|entity|mapper/<f>/`, teste). `config/` (inclusiv `SecurityConfig`), `security/`, `util/`, `exceptions/`, `enums/Role`, `*.gradle` țin de T01/T03 și nu se mai ating după.
- FE: rutele, navigația, layout-urile, `client.ts`, `components/ui/` și `stores/auth.ts` țin de T02/T03 (`android/` și `capacitor.config.ts` de T15) și nu se mai ating după — fiecare rută are atunci fișierul ei de view în `views/<feature>/`, iar ceilalți doar completează view-urile lor. i18n, tipuri și API pe fișiere de modul (`shared/i18n/ro/<modul>.json`, `shared/types/<modul>.ts`, `shared/api/<modul>.ts`); importă direct din fișierul modulului, nu adăuga linii în fișiere `index.ts` comune. Ecranele cu mai multe story-uri (Acasă, `/panel`, landing, Contul meu) sunt cochilii care randează câte o componentă sau un view per story; tabelul complet „fișierele tale” e în `AradEx-Frontend/CLAUDE.md` §Culoare.
- `docs/API.md`: modifici doar secțiunea modulului tău.

## Definiția lui „gata”
Build + teste verzi în BE și FE · criteriile din „Verificare” ale story-ului bifate în aplicație (browser 390×844 + emulator/simulator) și, pentru panouri, pe web · web-ul (prezentare, Comunitate, panouri) e **adaptiv**: se folosește pe telefon la 390px fără scroll orizontal pe pagină (sub `lg` sidebar-ul panourilor e meniu ☰, sub `md` tabelele devin carduri; detalii în `AradEx-Frontend/CLAUDE.md` §Reguli, „Web adaptiv”) și se verifică la 390×844 și la ≥1280 · feature-ul din PR e funcțional cap-coadă (nu se verifică tot fluxul de demo la fiecare PR; fluxul complet se verifică la final) · `docs/API.md` actualizat dacă s-a schimbat.

## Conturi demo
Toate conturile intră cu e-mail + parolă (din 9 nov, în locul telefonului + SMS din T21): `visitor@demo.ro`, `local@demo.ro`, `firma@demo.ro`, `primaria@demo.ro`, `admin@demo.ro` — parola `demo1234`. „Am uitat parola” = codul de recuperare primit la crearea contului; dacă l-a pierdut, Adminul îi pune o parolă temporară.
