# AradExperience — context pentru Claude Code (repo-ul `AradEx-Plan`)

Aplicație pentru Hack4Arad 2026 (7–8 nov): evenimente, obiective turistice cu ghid virtual (text + audio), oferte de la firme locale, acțiuni comunitare ale Primăriei cu puncte și clasament, chat AI și planificator de itinerar. Roluri: Vizitator, Localnic, Firmă locală, Primărie (+ Admin). Echipă de 4 oameni, 2 zile. **Obiectiv: demo fără bug-uri majore, nu cod perfect.**

Acesta e **planul comun** (de aici se deschide Claude Code și aici e workspace-ul agenților Paperclip): documentația, designul, modul de lucru și toate skill-urile. Codul e în repo-urile surori din același folder (ex. `~/HACK4ARAD/`), organizația GitHub [HACK4ARAD](https://github.com/HACK4ARAD):

| Repo | Ce conține | Cine îl modifică |
|---|---|---|
| [AradEx-Plan](https://github.com/HACK4ARAD/AradEx-Plan) | **acesta**: `docs/` (PLAN, API, DATA-MODEL, FEATURES, TEAM, STATUS + `status/Px.md`, DEMO, DEPLOY, ARAD-DATA, SETUP-ECHIPA), `design/`, `CLAUDE.md`, `STRUCTURE.md`, `setup.sh`, `.claude/skills/` | toți, fiecare doar `docs/status/Px.md` + secțiunea lui din `API.md`; restul Lead/Zoltan |
| [AradEx-Backend](https://github.com/HACK4ARAD/AradEx-Backend) | Spring Boot 3 · Java 21 · Gradle (Groovy) · Postgres · Flyway · JWT — modulele `api` (contractul) și `app` (aplicația) | fiecare doar feature-urile lui (`docs/TEAM.md`) |
| [AradEx-Frontend](https://github.com/HACK4ARAD/AradEx-Frontend) | Vue 3 + Vite + TS · Pinia · Router · Tailwind 4 · vue-i18n · Leaflet · PWA — `/m` mobil, `/w` web | fiecare doar fișierele lui (`docs/TEAM.md`) |
| [AradEx-Infrastructure](https://github.com/HACK4ARAD/AradEx-Infrastructure) | Postgres local (`docker-compose.yml`), config de deploy | doar P1 (Zoltan) |
| [AradEx-Ops](https://github.com/HACK4ARAD/AradEx-Ops) | agenții Paperclip: instrucțiuni, task-uri, `setup-lane.mjs` | doar P1 (Zoltan) |

Descrierea fiecărui folder și fișier: `STRUCTURE.md`. Căile din documente de forma `AradEx-Backend/...` sunt relative la folderul comun; comenzile `cd ../AradEx-...` se dau din `AradEx-Plan`.

## Citește înainte de orice task
1. `docs/PLAN.md` — task-ul pe care lucrezi (scop, BE, FE, seed, verificare). Nu lucra în afara task-ului curent.
2. `docs/API.md` — contractul exact al endpoint-urilor și DTO-urilor. BE îl implementează (modulul `api` din `AradEx-Backend`), FE îl consumă (`shared/types/`). Dacă trebuie schimbat, schimbă-l în același task (doar secțiunea modulului tău) și spune explicit ce ai schimbat.
3. `docs/DATA-MODEL.md` — tabele, enum-uri, convenții de migrări. `docs/FEATURES.md` — regulile pe roluri, mobil vs web.
4. `docs/TEAM.md` — cine ce face și **ce fișiere îi aparțin fiecăruia** (§„Cine ce atinge”), migrările rezervate pe culoar.
5. `docs/STATUS.md` — rezumatul echipei (îl ține Lead Tehnic) și `docs/status/Px.md` — starea culoarului tău, decizii, probleme. **Actualizează-l pe al tău la fiecare task; nu edita `STATUS.md`.**
6. `docs/DEMO.md` — fluxul de demo; nu are voie să se strice. `docs/ARAD-DATA.md` — datele reale din seed și ce e FICTIV.
Ecranele: `design/screens/` (S0–S12 prototipul mobil, E1–E7 extensii, W1–W26 web; web navigabil în `design/AradExperience-web-prototip.html`). Stil „Clean Ink”: fundal `#F7F7F2`, ink `#111`, accent `#FF5A36`, carduri albe radius 16, butoane negre radius 14, Inter + Material Symbols.

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
cd ../AradEx-Frontend && npm run dev                          # APP :5173 ( / → /m pe telefon, /w pe desktop; ?ui=m|w forțează)
cd ../AradEx-Frontend && npm run build && npm run test
cp ../AradEx-Backend/.env.example ../AradEx-Backend/.env      # secretele BE (OPENAI_API_KEY, JWT_SECRET) — nu intră în git
cp ../AradEx-Frontend/.env.example ../AradEx-Frontend/.env    # VITE_API_URL, VITE_DEMO
```

## Mod de lucru (obligatoriu)
- Un task din PLAN = un branch `feat/T07-tickets` cu **același nume în fiecare repo atins** (BE, FE și `AradEx-Plan` pentru `docs/status/Px.md`/API) = câte un PR spre `main`; în descrierea PR-urilor pui link spre perechile lor. Ordinea de merge: BE → FE → Plan. `main` trebuie să ruleze mereu în toate repo-urile.
- Folosește skill-ul `task-workflow` la început și la sfârșit de task (plan scurt → implementare → checklist de verificare → `docs/status/Px.md`). Review cu `review-pr`.
- Feature nou în BE → skill `be-module`. Ecran/feature nou în FE → skill `fe-feature`. Date demo → skill `seed-data`.
- Rulează testele înainte de a declara ceva gata. Nu dezactiva teste ca să treacă.
- Commit-uri mici, mesaje scurte în engleză (`feat(events): list + filters`, `fix(auth): 401 on expired token`).
- **Niciodată `Co-Authored-By:` sau alte linii de atribuire în commit-uri** (nici pentru Claude, nici pentru altcineva) și niciodată „🤖 Generated with Claude Code” în PR-uri. Autorul commit-ului e doar omul al cărui cont face commit-ul. Hook-ul din `.githooks/commit-msg` le șterge oricum (`git config core.hooksPath .githooks`, o dată pe clonă, în fiecare din cele 5 repo-uri — `setup.sh` o face).
- Când ceva din PLAN/API nu se poate face exact așa, alege varianta cea mai simplă care ține demo-ul, notează decizia în `docs/status/Px.md` și mergi mai departe. Nu reproiecta.

## Reguli
- **Niciodată** secrete în cod, în FE sau în git: cheia OpenAI e doar în BE (`AradEx-Backend/.env`, `OPENAI_API_KEY`). `.env` e ignorat de git peste tot.
- Schema DB se schimbă **doar** prin migrări Flyway noi (`AradEx-Backend/app/src/main/resources/db/migration`), cu numerele rezervate culoarului tău; nu se editează migrări deja pe `main`.
- BE: contractul (interfețe + DTO-uri) în modulul `api`, logica în `service`, controllerele fără logică, mapper-ele clase utilitare statice (import static). `app` depinde de `api`, niciodată invers.
- FE: tot ce e refolosit stă în `src/shared` (componente în `components/ui` sau `components/<feature>`); `mobile/` și `web/` au doar layout-uri și view-uri pe feature. Nu duplica logică între ele.
- Punctele se scriu doar prin `PointsService`. Codurile QR conțin doar codul text (`AX-...`), nu URL-uri, nu date personale.
- Textele din UI sunt în română cu diacritice corecte (ă â î ș ț) și trec prin i18n, chiar dacă EN vine mai târziu.
- Erorile API sunt ProblemDetail; FE afișează `detail` în toast, nu „Something went wrong”.
- Fără librării noi fără motiv: lista aprobată e în `AradEx-Backend/CLAUDE.md` și `AradEx-Frontend/CLAUDE.md`. Dacă chiar trebuie una, scrie de ce în `docs/status/Px.md`.
- Date demo = date reale din Arad (locuri, adrese, coordonate, program); firmele pot fi fictive, dar plauzibile și marcate `is_demo`. Pozele doar cu licență (vezi `design/README.md`).
- Nu șterge și nu rescrie fișiere mari „ca să fie curat”. Nu rulezi `git push --force`, nu umbli în `.github/` fără să spui.

## Fără conflicte între culoare (4 oameni în paralel)
- Fiecare culoar editează doar fișierele lui (`docs/TEAM.md` §„Cine ce atinge”). Dacă îți trebuie o schimbare într-un fișier al altui culoar, o ceri în PR-ul/task-ul lui; nu o faci tu. Poți importa și apela codul altui culoar.
- BE: fiecare culoar lucrează în subfolderele feature-urilor lui, în fiecare layer (`api/<F>Api`, `dto/<f>/`, `controller|service|repository|entity|mapper/<f>/`, teste). `config/` (inclusiv `SecurityConfig`), `security/`, `util/`, `exceptions/`, `enums/Role`, `*.gradle` sunt ale lui P1 și sunt gata după T03.
- FE: rutele, navigația, layout-urile, `client.ts` și `components/ui/` sunt ale lui P1 și sunt gata după T02/T03 — fiecare rută are atunci fișierul ei de view în `views/<feature>/`, iar ceilalți doar completează view-urile lor. i18n, tipuri și API pe fișiere de modul (`shared/i18n/ro/<modul>.json`, `shared/types/<modul>.ts`, `shared/api/<modul>.ts`); importă direct din fișierul modulului, nu adăuga linii în fișiere `index.ts` comune.
- `docs/API.md`: modifici doar secțiunea modulului tău. Starea: doar `docs/status/Px.md` al tău.

## Definiția lui „gata”
Build + teste verzi în BE și FE · criteriile din „Verificare” ale task-ului bifate pe mobil și web · `docs/API.md` actualizat dacă s-a schimbat · `docs/status/Px.md` actualizat (PR în `AradEx-Plan`) · fluxul din `docs/DEMO.md` încă merge.

## Conturi demo
`visitor@demo.ro`, `local@demo.ro`, `firma@demo.ro`, `primaria@demo.ro`, `admin@demo.ro` — parola `demo1234`.
