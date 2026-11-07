# AradEx-Plan — Hack4Arad 2026

Planul comun al **AradExperience**: evenimente, obiective cu ghid virtual, oferte locale, acțiuni comunitare cu puncte, chat AI și planificator de itinerar pentru Arad. **Aplicație mobilă (Android + iOS, Capacitor)** pentru vizitatori și localnici; pe web doar site-ul de prezentare și panourile Primăriei, firmelor și Adminului — din același cod Vue; backend Spring Boot + PostgreSQL.

Acesta e repo-ul cu tot ce e comun (umbrela din kitul v3): documentația (`docs/`), designul (`design/`), modul de lucru (`CLAUDE.md`, `STRUCTURE.md`) și toate skill-urile Claude (`.claude/skills/`). Codul stă în repo-uri surori, în același folder (ex. `~/HACK4ARAD/`), în organizația [HACK4ARAD](https://github.com/HACK4ARAD):

| Repo | Ce conține |
|---|---|
| **AradEx-Plan** (acesta) | plan, contract API, docs, design, skill-uri Claude, `setup.sh` |
| [AradEx-Backend](https://github.com/HACK4ARAD/AradEx-Backend) | Spring Boot 3 / Java 21, Gradle multi-modul: `api` = contractul REST, `app` = aplicația + migrări Flyway |
| [AradEx-Frontend](https://github.com/HACK4ARAD/AradEx-Frontend) | Vue 3 + Capacitor: aplicația mobilă (Android + iOS) + web (prezentare + panouri), fără prefix în URL |
| [AradEx-Infrastructure](https://github.com/HACK4ARAD/AradEx-Infrastructure) | Postgres local (docker compose), producția pe AWS (Terraform) |
| [AradEx-Ops](https://github.com/HACK4ARAD/AradEx-Ops) | agenții Paperclip (instrucțiuni, task-uri, `setup-lane.mjs`) |

**Producție:** https://aradexperience.site — merge pe `main` în `AradEx-Backend` / `AradEx-Frontend` = deploy automat (`docs/DEPLOY.md`).

## Pornire rapidă
Întâi uneltele: `docs/SETUP.md` (JDK 21, Node 20+, Docker Desktop, Android Studio, gh) — pe Windows `powershell -ExecutionPolicy Bypass -File .\setup-windows.ps1` verifică și instalează ce lipsește.
```
mkdir -p ~/HACK4ARAD && cd ~/HACK4ARAD && git clone https://github.com/HACK4ARAD/AradEx-Plan.git
cd AradEx-Plan && ./setup.sh                                          # clonează celelalte 4 lângă el, activează hook-ul de commit
(cd ../AradEx-Infrastructure && docker compose up -d)                 # Postgres
(cd ../AradEx-Backend && cp .env.example .env && ./gradlew :app:bootRun)   # http://localhost:8080/swagger-ui.html
(cd ../AradEx-Frontend && cp .env.example .env && npm install && npm run dev)   # http://localhost:5173 (/m aplicația, /w prezentare + panouri)
(cd ../AradEx-Frontend && npm run android:run)                         # aplicația Android pe emulator (Capacitor)
claude                                                                # Claude Code, din AradEx-Plan
```
Conturi demo: `visitor@demo.ro`, `local@demo.ro`, `firma@demo.ro`, `primaria@demo.ro`, `admin@demo.ro` / `demo1234`.

## Unde e ce
- `docs/STATUS.md` — **memoria proiectului**: ce e gata, decizii, probleme cunoscute · `docs/SETUP.md` — instalare + probleme de mediu
- `docs/PLAN.md` — task-urile T00–T19 · `docs/API.md` — contractul de API · `docs/DATA-MODEL.md` — tabele și migrări · `docs/FEATURES.md` — funcționalitățile pe roluri · `docs/ARAD-DATA.md` — datele reale din seed
- `docs/DEMO.md` — demo + pitch (orientativ, se clarifică la final) · `docs/DEPLOY.md`
- `STRUCTURE.md` — fiecare repo, folder și fișier, la ce folosește, ce conțin skill-urile
- `CLAUDE.md` (+ `CLAUDE.md` din fiecare repo) — reguli pentru Claude Code · `.claude/skills/` — `task-workflow`, `review-pr`, `be-module`, `seed-data`, `fe-feature`
- `design/` — designul final în `design/final/` (prototip mobil + web, planșele în `design/final/screens/`), poze în `design/assets/`; restul e istoric

## Cum lucrăm
Un task din PLAN = un branch `feat/Txx-...` cu același nume în fiecare repo atins = câte un PR; merge în ordinea BE → FE → Plan (îl face QA & Demo). Începe cu `/task-workflow`, termină cu checklist-ul, `/review-pr` și descrierea PR-ului.
Fără `Co-Authored-By` în commit-uri. `main` rulează mereu; fiecare PR lasă feature-ul lui funcțional.
