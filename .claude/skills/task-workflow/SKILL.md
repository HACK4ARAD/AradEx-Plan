---
name: task-workflow
description: Cum se începe, se implementează, se verifică și se închide un task Txx din docs/PLAN.md, peste repo-urile AradEx-Plan (docs/status), AradEx-Backend, AradEx-Frontend. Folosește-l la orice „ia task-ul T07”, „începe T05”, „termină/verifică task-ul”, „fă review la ce am făcut”.
---

# Task workflow (AradExperience)

Layout: 5 repo-uri surori în același folder (organizația HACK4ARAD): `AradEx-Plan` (acesta: `docs/`, `design/`, `CLAUDE.md`, `STRUCTURE.md`, toate skill-urile), `AradEx-Backend` (Spring: `api` = contract, `app` = aplicație), `AradEx-Frontend` (Vue), `AradEx-Infrastructure` (Postgres local, deploy — doar P1) și `AradEx-Ops` (agenții Paperclip). Fiecare are git-ul lui; comenzile se dau din `AradEx-Plan` cu `../AradEx-Backend`, `../AradEx-Frontend` (sau din worktree-ul task-ului).
Skill-uri (toate aici, în `.claude/skills/`): `be-module`, `seed-data`, `fe-feature`, `review-pr`. Cine ce fișiere atinge:.

## 1. Start
1. Citește task-ul din `docs/PLAN.md`, secțiunile aferente din `docs/API.md`, `docs/DATA-MODEL.md`, `docs/FEATURES.md`.md` (dependențele trebuie să fie deja în `origin/main`). Ecranele: `design/screens/`.
2. În fiecare repo atins (`AradEx-Backend`, `AradEx-Frontend`, `AradEx-Plan` dacă se schimbă API/docs): `git -C ../<Repo> fetch origin && git -C ../<Repo> worktree add ../_wt/<Repo>-Txx -b feat/Txx-nume-scurt origin/main` — **același nume de branch** peste tot (fără worktree: `git switch -c feat/Txx-nume-scurt origin/main`). Baza de date a task-ului: `createdb -h localhost -U arad aradexperience_txx` și `POSTGRES_URL` spre ea în `.env`-ul worktree-ului.
3. Scrie în 5–10 rânduri planul concret: fișiere pe care le creezi/modifici (BE: interfața + DTO-urile în `api/`, layerele în `app/`; FE: tipuri, api, componente, view-uri), migrarea (numărul rezervat culoarului tău în), endpoint-urile, ecranele. Arată-l omului **înainte** de a scrie cod dacă task-ul atinge și BE și FE; altfel mergi direct.
4. Deschide PR-ul din `AradEx-Plan` ca draft.

## 2. Implementare
- BE: skill-ul `be-module` (migrare → entity → repository → DTO + interfață → mapper → service + test → controller + test). FE: `fe-feature` (tipuri → api → store/composable → componente → view mobil → view web → rută → nav).
- Ordinea recomandată într-un task mixt: migrare + entități → service + teste → controller → tipuri FE → api FE → ecran mobil → ecran web → seed. Rulează aplicația după fiecare pas mare, nu la final.
- Seed-ul (`seed-data`) se scrie înainte de ecrane, ca să ai date reale când le construiești.
- Dacă dai de ceva neclar sau API.md trebuie schimbat: alege varianta simplă, notează în descrierea PR-ului „Decizii”, continuă. Nu bloca pe întrebări mici.
- Nu ieși din scopul task-ului. Ce observi în plus → listă „De făcut mai târziu” în descrierea PR-ului.
- Nu edita fișierele altui story. Poți importa și apela codul lui; dacă îți trebuie o schimbare acolo, o ceri în task-ul lui.

## 3. Verificare (înainte de PR) — checklist
Rulează efectiv, nu presupune:
- [ ] `./gradlew test` verde în worktree-ul de BE; `npm run build && npm run test` verde în worktree-ul de FE; fără erori în consola browserului.
- [ ] Fiecare punct din secțiunea „Verificare” a task-ului, executat manual: pe **mobil** (Chrome device toolbar 390×844 + telefon real dacă există) și pe **web** (≥1280px) unde task-ul are ambele.
- [ ] Endpoint-urile noi apar în Swagger și răspund conform `docs/API.md` (status-uri 400/401/403/404/409 incluse — încearcă-le).
- [ ] Rolurile: un cont cu rol greșit primește 403, nu 500. Guest-ul vede doar ce e public.
- [ ] Stări de listă: loading, gol, eroare — nu ecran alb.
- [ ] Texte în română cu diacritice, în `ro.json`. Fără „lorem ipsum”, fără `console.log` rămase, fără `TODO` fără explicație.
- [ ] Feature-ul tău merge cap-coadă pe mobil și web (fluxul complet din `docs/DEMO.md` se verifică doar la final).
- [ ] Nicio cheie/secret în diff (`git diff main --stat` în fiecare repo + caută `sk-`, `secret`, `password` în fișierele noi).
Scrie rezultatul verificării în PR (ce ai testat, ce nu, ce ai observat). PR-ul de FE face trimitere la PR-ul de BE; PR-ul din `AradEx-Plan` la amândouă.

## 4. Review (de preferat de altcineva + Claude)
Cere review cu skill-ul `review-pr` sau: „Fă review la PR-ul pentru Txx: caută bug-uri care strică demo-ul, încălcări ale CLAUDE.md, diferențe față de API.md.” Reviewer-ul rulează aplicația, nu doar citește diff-ul. Se repară doar ce e major/critic; restul → descrierea PR-ului „Probleme cunoscute”. Review-ul tehnic și merge-ul le face agentul QA & Demo (pe GitHub, `gh pr review`); review uman în perechi .

## 5. Închidere
1. În fiecare repo atins: `git push -u origin feat/Txx-...` și `gh pr create` (titlu `Txx: ...`, în descriere ce ai testat + link-urile PR-urilor pereche). **Fără `Co-Authored-By:` în commit-uri și fără „Generated with Claude Code” în PR.** Merge-ul (squash, ordinea BE → FE → Plan) îl face QA & Demo după review, nu tu; după merge: `git worktree remove ../_wt/<Repo>-Txx`.
2. În descrierea PR-ului: ce s-a făcut, decizii, probleme cunoscute.
3. `docs/API.md` actualizat dacă s-a schimbat ceva. Dacă ai adăugat un ecran care nu era în design, pune o captură în `design/screens/`.
4. Spune în chat, în 3 rânduri: ce merge, ce nu, ce urmează.
