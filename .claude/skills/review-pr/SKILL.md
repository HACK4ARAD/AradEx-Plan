---
name: review-pr
description: Review scurt și util al unui PR/branch (BE sau FE) înainte de merge — rulează, caută ce strică demo-ul, abateri de la API.md/CLAUDE.md, secrete. Folosește-l la „fă review la PR-ul Txx”, „verifică branch-ul”, „e ok de merge?”.
---

# Review de PR (AradExperience)

Scopul review-ului e **demo fără bug-uri majore**, nu cod perfect. Durata țintă: 10–15 minute. Nu rescrie codul altcuiva; propune diff-uri mici doar pentru ce e critic.

## 1. Pregătire
- Pentru fiecare repo al task-ului (`AradEx-Backend`, `AradEx-Frontend`; PR-ul din `AradEx-Plan` are doar docs/`docs/status/Px.md` — verifică-l la final că spune adevărul): `git -C ../<Repo> fetch origin && git -C ../<Repo> worktree add ../_wt/review-<Repo>-Txx origin/feat/Txx-...` (sau `gh pr checkout <nr>` într-o clonă curată). Șterge worktree-ul la final. Citește task-ul Txx din `docs/PLAN.md` (secțiunea „Verificare” = ce trebuie să meargă).
- `git diff main --stat` — dacă apar fișiere în afara scopului (migrări vechi modificate, `SecurityConfig`, `.github/`, fișiere mari șterse) sau **fișiere ale altui culoar** (`docs/TEAM.md` §„Cine ce atinge”), semnalează imediat.

## 2. Rulează, nu doar citi
- BE: `./gradlew test`; pornește API-ul (`./gradlew :app:bootRun`) și încearcă în Swagger endpoint-urile noi: cazul bun + 400 (body invalid) + 401 (fără token) + 403 (rol greșit) + 404/409 unde e cazul. Compară numele câmpurilor cu `docs/API.md` literă cu literă.
- FE: `npm run build && npm run test`; `npm run dev`, ecranul nou pe 390×844 și ≥1280: loading / gol / eroare (oprește API-ul ca să vezi eroarea), texte cu diacritice, fără `console.log`.
- Fluxul din `docs/DEMO.md` până la pasul atins de task.

## 3. Checklist de citit în diff
- BE: logică în controllere, entități întoarse din controllere, adnotări de web pe controller în loc de interfața din `api`, mapper cu stare/injectat, JPA sau Security importate în `api`. FE: `fetch` direct în view-uri, `any`, ecran duplicat între `mobile/` și `web/`, view care importă altă view.
- Puncte scrise altfel decât prin `PointsService`; coduri QR cu URL/date personale; migrare fără `ON CONFLICT` la seed; `ddl-auto`.
- Secrete: caută `sk-`, `secret`, `password`, `apiKey` în fișierele adăugate; `.env` în diff.
- Teste: există test pe regula de business nouă (service), test de controller cu cererea din `requests/*.json`, JSON + test de serializare pentru DTO-urile noi? Un test dezactivat/șters?
- `docs/API.md` + `docs/status/Px.md` actualizate dacă s-a schimbat ceva. Commit-uri fără `Co-Authored-By:`, PR fără „Generated with Claude Code”.

## 4. Raport (în PR sau în chat), maximum 10 rânduri
```
Verdict: MERGE / MERGE după fix-urile 1–2 / NU încă
Critic (strică demo-ul): …
Important (de reparat azi): …
Mai târziu (→ `docs/status/Px.md` „Probleme cunoscute”): …
Am rulat: gradlew test ✔, npm build ✔, Swagger 4xx ✔, DEMO pasul 1–4 ✔
```
Se repară în același branch doar „Critic” și, dacă e sub 15 minute, „Important”. Restul se notează și se merge-uiește.
