# Cum lucrăm cu Paperclip — ghidul complet HACK4ARAD

Pentru toți patru: Zoltan (P1), Lukas (P2), Octav (P3), Damian (P4). Explică cum se leagă totul: GitHub, Paperclip, agenții, zip-urile, task-urile, review-ul și merge-ul.
Pașii de instalare, comandă cu comandă, sunt în `docs/SETUP-ECHIPA.md`. Aici e „de ce” și „cum curge munca”.

---

## 1. Pe scurt

- Fiecare om are pe **laptopul lui** un **Paperclip** (orchestratorul de agenți, la http://127.0.0.1:3100). În el rulează **un agent AI** (Claude), pe **abonamentul Claude al omului respectiv**.
- Agentul primește **task-uri** (T05, T06…). Lucrează în cele 5 repo-uri de pe laptop și deschide **PR-uri pe GitHub**.
- Paperclip-urile **nu vorbesc între ele**. Singurul loc comun e **GitHub**:
  - PR-urile;
  - `main`;
  - `docs/status/Px.md` (starea fiecărui culoar).
- Pe laptopul lui Zoltan mai rulează doi agenți pentru toată echipa:
  - **Lead Tehnic** urmărește PR-urile tuturor și ține `docs/STATUS.md`;
  - **QA & Demo** face review la fiecare PR și îl pune în `main`.
- **Omul decide când pornește ceva.** Task-urile stau în *backlog* până le muți tu în *todo*. Agentul se oprește și te întreabă înainte de orice e riscant: conturi, deploy, instalări, bani, mesaje, librării noi.

```
   Laptop Lukas (P2)        Laptop Octav (P3)        Laptop Damian (P4)          Laptop Zoltan (P1)
 ┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐   ┌──────────────────────────────┐
 │ Paperclip         │   │ Paperclip         │   │ Paperclip         │   │ Paperclip                    │
 │  agent P2         │   │  agent P3         │   │  agent P4         │   │  agent P1   Lead   QA & Demo │
 │  (Claude Lukas)   │   │  (Claude Octav)   │   │  (Claude Damian)  │   │  (Claude Zoltan)             │
 │ ~/HACK4ARAD/ (5)  │   │ ~/HACK4ARAD/ (5)  │   │ ~/HACK4ARAD/ (5)  │   │ ~/Desktop/HACK4ARAD/ (5)     │
 └─────────┬─────────┘   └─────────┬─────────┘   └─────────┬─────────┘   └──────────────┬───────────────┘
           │ push branch + PR      │                       │                            │ review + merge
           └───────────────────────┴───────────┬───────────┴────────────────────────────┘
                                               ▼
                         GitHub · organizația HACK4ARAD (5 repo-uri, `main` = adevărul)
```

---

## 2. Piesele

### 2.1 Cele 5 repo-uri (GitHub, organizația [HACK4ARAD](https://github.com/HACK4ARAD))
Stau toate **unul lângă altul** în același folder (`~/HACK4ARAD/`):

| Repo | Ce e în el | Cine scrie în el |
|---|---|---|
| `AradEx-Plan` | planul comun: `docs/` (PLAN, API, TEAM, STATUS, `status/Px.md`…), `design/`, `CLAUDE.md`, `STRUCTURE.md`, cele 5 skill-uri, `setup.sh` | toți: fiecare doar `docs/status/Px.md` și secțiunea lui din `API.md` |
| `AradEx-Backend` | Spring Boot (Gradle: `api` = contractul, `app` = aplicația) | fiecare în feature-urile lui |
| `AradEx-Frontend` | Vue PWA (`/m` mobil, `/w` web) | fiecare în fișierele lui |
| `AradEx-Infrastructure` | Postgres local (`docker compose`), deploy | doar Zoltan |
| `AradEx-Ops` | Paperclip: `setup-lane.mjs`, instrucțiunile agenților, `tasks.json` | doar Zoltan |

Cine ce fișiere are voie să atingă: `docs/TEAM.md` §„Cine ce atinge”. **Regula de bază: editezi doar fișierele culoarului tău.**

### 2.2 Paperclip (pe fiecare laptop)
În Paperclip-ul fiecăruia există:
- **compania `HACK4ARAD`**;
- **proiectul `AradExperience`**, cu folderul de lucru (*workspace*) `AradEx-Plan` (de acolo pornește agentul și ajunge la celelalte repo-uri prin `../AradEx-...`);
- **agentul culoarului**, cu instrucțiunile din `AradEx-Ops/agents/` și cele 5 skill-uri din `AradEx-Plan/.claude/skills/`;
- **task-urile culoarului** (`Txx: …`) și un task `SETUP` pentru om;
- etichete (`P1 · Platformă`, `linia de demo`, `stretch`…) și obiectivul „Demo de 6 minute…”.

Le creează scriptul `AradEx-Ops/setup-lane.mjs`. Nu se fac de mână.

### 2.3 Agenții

| Agent | Unde rulează | Model | Ce face | Task-uri |
|---|---|---|---|---|
| **P1 · Platformă & Livrare** | laptop Zoltan | Sonnet 5.5, effort high | platformă, auth, deploy | T00–T04, T14, T16a |
| **P2 · Experiența Vizitatorului** | laptop Lukas | Sonnet 5.5, effort medium | locuri, evenimente, bilete, i18n/PWA | T05, T06, T07, T15 |
| **P3 · Hărți & AI** | laptop Octav | Sonnet 5.5, effort high | hartă, chat AI, itinerar, pitch | T08, T12, T13, T16b (+ T17, T19) |
| **P4 · Firme & Comunitate** | laptop Damian | Sonnet 5.5, effort high | firme, oferte, puncte | T09, T10, T11 (+ T18) |
| **Lead Tehnic** | laptop Zoltan | Opus 5.5 | coordonare: PR-uri, oglinzi, `STATUS.md`, propuneri de tăieri | HAC-23 „Coordonare” |
| **QA & Demo** | laptop Zoltan | Opus 5.5 | review + merge la fiecare PR, rulează demo-ul | `Review: Txx …` |

Setări comune (puse de script):
- un singur run odată per agent;
- maximum 400 de pași / 90 de minute per run la agenții de culoar (Lead și QA: 300 / 60 de minute);
- **heartbeat oprit**: agentul nu se trezește singur periodic, ci doar când primește un task în *todo* sau un comentariu, ca să nu consume abonamentul degeaba.

### 2.4 Abonamentele Claude
- Conexiunile AI în Paperclip sunt **per companie și per laptop**. Fiecare își conectează **propriul** abonament în compania HACK4ARAD din Paperclip-ul lui (Settings → Connections → Claude, „subscription”, bifat default).
- Fără conexiune, agentul rămâne „paused / verifying” și nu pornește.
- Tot ce rulează agentul tău consumă din abonamentul tău. Zoltan plătește pentru P1 + Lead + QA.

### 2.5 Skill-urile (în `AradEx-Plan/.claude/skills/`)

| Skill | Când |
|---|---|
| `task-workflow` | la începutul și la sfârșitul fiecărui task (worktree-uri, branch, plan, verificare, PR) |
| `be-module` | orice endpoint/tabel nou în backend |
| `fe-feature` | orice ecran nou în frontend |
| `seed-data` | date demo |
| `review-pr` | review înainte de merge (îl folosește QA; îl poți folosi și tu) |

Paperclip pornește Claude doar cu setările „user”, așa că skill-urile din proiect nu s-ar încărca singure. De asta scriptul le importă ca **skill-uri ale companiei** și le atașează agentului. Le vezi în UI → Skills.

---

## 3. Zip-urile (ce primesc Lukas, Octav, Damian)

Zoltan trimite fiecăruia `HACK4ARAD-<Nume>.zip` (~95 MB). Înăuntru e un folder `HACK4ARAD/`:
```
HACK4ARAD/
├─ SETUP-ECHIPA.md        pașii de instalare
├─ PAPERCLIP.md           acest ghid
├─ <Nume>-Px.md           fișa personală: culoarul, task-urile, orele, fișierele tale, ce dai / ce aștepți
├─ AradEx-Plan/           clone git complete, deja legate de GitHub (origin = github.com/HACK4ARAD/...)
├─ AradEx-Backend/
├─ AradEx-Frontend/
├─ AradEx-Infrastructure/
└─ AradEx-Ops/            (clonă scurtă, doar ultima versiune; ajunge)
```
- Fără `.env`, fără chei, fără setări git personale. Cheile (`OPENAI_API_KEY`, `JWT_SECRET`) le primești de la Zoltan pe un canal privat.
- Fiecare are drept de **admin** pe toate 5 repo-urile, deci poate împinge branch-uri și deschide PR-uri cu contul lui de GitHub (`gh auth login`).
- După dezarhivare, `./setup.sh` din `AradEx-Plan` face `git pull` în toate și activează hook-ul care scoate `Co-Authored-By:` din commit-uri.

**Zoltan, când refaci zip-urile** (după schimbări mari în plan): clone proaspete ale celor 5 repo-uri (pentru `AradEx-Ops` merge `--depth 1`), cu `origin` pe URL-urile de GitHub și **fără** config local (user, credential, hooks). Lângă ele pui `SETUP-ECHIPA.md`, `PAPERCLIP.md` și fișa omului (`~/Desktop/HACK4ARAD/zips/<Nume>-Px.md`). Zip-urile vechi nu se mai trimit. Dacă colegii au deja proiectul, nu le mai trebuie zip: `./setup.sh` aduce tot.

---

## 4. Pregătirea laptopului (rezumat; detaliile în `SETUP-ECHIPA.md`)

| # | Pas | Comandă / unde |
|---|---|---|
| 1 | Unelte | Git, `gh` (`gh auth login`), Node 20+, Java 21, Docker Desktop, Claude Code (`claude`, login cu abonamentul tău) |
| 2 | Proiectul | dezarhivezi în `~/HACK4ARAD`, apoi `cd ~/HACK4ARAD/AradEx-Plan && ./setup.sh` |
| 3 | `.env` | `cp ../AradEx-Backend/.env.example ../AradEx-Backend/.env` (la fel în Frontend); cheile de la Zoltan |
| 4 | Paperclip | `npx --yes paperclipai@latest install --yes`, apoi `paperclipai onboard --yes` (data viitoare: `paperclipai run`); lași terminalul deschis |
| 5 | Culoarul tău | `cd ~/HACK4ARAD/AradEx-Ops && node setup-lane.mjs --lane P2` (P3 Octav, P4 Damian) → prima rulare creează compania și se oprește cu un link |
| 6 | Claude în Paperclip | deschizi link-ul, conectezi **abonamentul tău**, îl bifezi default |
| 7 | Din nou scriptul | aceeași comandă → agent, proiect, 5 skill-uri, task-urile tale, `SETUP` |
| 8 | Verificare | UI → Agents: agentul tău e **idle** (verde). Task-ul `SETUP` → `done` când ai bifat tot |

Scriptul se poate rula de oricâte ori: nu dublează nimic, aduce la zi instrucțiunile și skill-urile, mută workspace-ul dacă ai mutat folderul.

---

## 5. Ce vezi în Paperclip

**Lukas / Octav / Damian:** doar task-urile culoarului tău (4, 6 sau 4 + stretch) și `SETUP`. Toate stau în *backlog* și sunt atribuite agentului tău.

**Zoltan:** 23 de task-uri în compania HACK4ARAD:

| Ce | Task-uri | Atribuit |
|---|---|---|
| SETUP (de făcut de om) | HAC-1 | Zoltan (board) |
| culoarul P1 | HAC-2…6 (T00–T04), HAC-16 (T14), HAC-18 (T16a) | agentul P1 |
| coordonare | HAC-23 | Lead Tehnic |
| **oglinzi** P2–P4 | T05–T13, T15, T16b, T17–T19 | **nimeni**: sunt doar ca să vezi progresul echipei; Lead le actualizează după GitHub. **Nu le atribui niciodată unui agent** (ai rula munca altcuiva pe abonamentul tău) |
| review-uri | `Review: Txx …` (le creează Lead) | QA & Demo |

Filtru util: Tasks → assignee = agentul tău.

Stările task-urilor:

| Stare | Ce înseamnă |
|---|---|
| `backlog` | există, nu pornește |
| `todo` | agentul se trezește și îl ia |
| `in_progress` | lucrează |
| `blocked` | te așteaptă pe tine sau pe alt culoar (citește comentariul) |
| `in_review` | PR-urile sunt deschise |
| `done` | PR-urile sunt în `main` |

---

## 6. Viața unui task, pas cu pas

Exemplu: **T06 Evenimente (Lukas)**, care depinde de T02 și T03 (Zoltan) și de T05 (Lukas).

1. **Verifici dependențele.** În descrierea task-ului scrie de cine depinde. Pe GitHub (sau în `docs/status/`) vezi dacă T02/T03 sunt în `main`. Dependențele din același culoar sunt legate în Paperclip (T05 → T06).
2. **Pornești:** muți T06 din *backlog* în **todo**. Agentul se trezește.
3. **Agentul începe** (skill `task-workflow`):
   - `git fetch` în repo-urile atinse;
   - creează **worktree-uri** separate, cu același branch în fiecare: `~/HACK4ARAD/_wt/AradEx-Backend-T06`, `…/AradEx-Frontend-T06`, `…/AradEx-Plan-T06`, branch `feat/T06-events`;
   - creează baza lui de date `aradexperience_t06` (ca migrările diferite să nu se calce);
   - scrie un plan scurt în task și marchează `IN PROGRESS` în `docs/status/P2.md`.

   Folderele tale principale (`~/HACK4ARAD/AradEx-*`) rămân libere pentru tine.
4. **Implementează:**
   - BE cu `be-module` (migrare din numerele rezervate culoarului → entity → … → controller + teste);
   - FE cu `fe-feature` (tipuri → api → componente → view mobil → view web → i18n);
   - seed cu `seed-data`.

   Doar în fișierele culoarului.
5. **Verifică:** `./gradlew test`, `npm run build && npm run test`, checklist-ul „Verificare” al task-ului pe mobil (390×844) și web (≥1280).
6. **Livrează:** push pe branch și **câte un PR în fiecare repo atins**, cu titlul `T06: …`. Descrierea spune ce a testat și are link-uri spre PR-urile pereche. Pune link-urile în task și îl mută în `in_review`.
   - Fără `Co-Authored-By:` și fără „Generated with Claude Code”.
7. **Tu verifici** pe telefonul tău și pe web. Review-ul uman se face în perechi: **Zoltan ↔ Lukas**, **Octav ↔ Damian**.
8. **Lead (la Zoltan)** vede PR-urile pe GitHub și creează `Review: T06 (Lukas)` pentru QA.
9. **QA & Demo** face review cu `review-pr`:
   - pune toate PR-urile task-ului împreună în worktree-uri;
   - rulează testele, aplicația, cazurile 400/401/403/404/409 și fluxul din `DEMO.md`;
   - verifică dacă s-au atins fișiere ale altui culoar.

   Verdictul îl dă pe GitHub (`gh pr review`):
   - **cere modificări** → tu muți T06 înapoi în `todo` cu un comentariu („repară ce a cerut QA”), agentul repară pe același branch, apoi QA reia review-ul;
   - **aprobă** → QA face merge (squash) în ordinea **Backend → Frontend → Plan**, șterge branch-urile, anunță Lead-ul.
10. **Închizi:** T06 → `done` în Paperclip-ul tău. Agentul șterge worktree-urile. Lead închide oglinda T06 la Zoltan și actualizează `STATUS.md`.
11. Toată lumea face `./setup.sh` (sau `git pull`) ca să aibă noul `main`. Următorul task poate porni.

> Regula de aur: **`main` rulează mereu.** Nimeni nu împinge direct în `main` și nimeni nu face `push --force`.

---

## 7. Cum lucrează Zoltan cu Lead și QA

- **Lead se trezește doar când îi scrii.** Heartbeat-ul e oprit, ca să nu consume. Prima dată muți **HAC-23** în `todo`. Apoi, ori de câte ori vrei o tură de coordonare (cineva a deschis PR-uri, a terminat ceva), scrii un comentariu în HAC-23: „verifică PR-urile”. La fiecare tură, Lead:
  - face `git fetch` în toate 5 repo-urile și grupează PR-urile pe task (după numele branch-ului);
  - creează `Review: Txx` pentru QA (în `todo`, deci QA pornește imediat);
  - actualizează oglinzile P2–P4 (`in_progress` / `in_review` / `done`);
  - promovează task-urile P1 cu dependențele gata (maximum 2 agenți simultan pe Mac);
  - ține `docs/STATUS.md` prin PR-uri mici;
  - îți scrie un rezumat scurt: ce e în `main`, ce PR-uri sunt deschise, cine e blocat și pe cine.
- În timpul hackathonului poți porni heartbeat-ul Lead-ului (de exemplu la 30 de minute) din setările agentului, dacă nu vrei să-l tot pornești de mână. Consumă din abonamentul tău.
- **QA** pornește singur pe fiecare `Review: Txx` primit. Nu își face review la propriul cod și nu scrie feature-uri. Duminică dimineață rulează demo-ul complet de două ori pe URL-urile de producție.
- **Agentul P1** primește T00–T04 pe rând. T00–T03 sunt prioritatea zero: toată echipa depinde de ele, mai ales de **T02** (structura anti-conflict) și **T03** (login + `SecurityConfig` pentru toate rutele).

---

## 8. Dependențe și ordine

- Linia de demo: **T00–T13 + T16a/T16b**. T14, T15 și stretch-urile (T17–T19) doar dacă linia de demo e verde.
- Toți așteaptă **T01, T02, T03** (Zoltan) înainte de cod serios. Până atunci fiecare pregătește ce nu atinge fișierele altora: seed-uri, texte de ghid, `MapView`, `OpenAiClient`, slide-uri. Calendarul pe ore e în `docs/TEAM.md`.
- Punctele de contact dintre culoare sunt fixate dinainte în `docs/TEAM.md`, de exemplu:
  - P4 folosește `EventService.createForOrganizer` al lui P2;
  - P2 importă `MapView` al lui P3;
  - entitatea `Business` o creează P1 în T03, apoi e a lui P4.
- **Dacă îți trebuie o schimbare într-un fișier al altcuiva:** nu o faci. O ceri în task-ul sau PR-ul lui, ori pe grup. Agentul procedează la fel: pune task-ul pe `blocked` și scrie ce îi lipsește.

---

## 9. Ce face agentul singur și ce nu

**Face singur:**
- citește planul;
- creează worktree-uri și branch-uri;
- scrie cod și teste;
- rulează aplicația local;
- face commit și push pe branch-ul lui;
- deschide PR-uri;
- comentează în task.

**Se oprește și te întreabă** (task → `blocked`, cu ce îi trebuie) înainte să:
- creeze conturi sau proiecte pe servicii externe;
- facă deploy;
- instaleze programe pe laptop;
- cheltuie bani;
- trimită email, SMS sau mesaje;
- adauge o librărie care nu e pe lista aprobată;
- schimbe fluxul din `DEMO.md`;
- atingă fișierele altui culoar.

Îi răspunzi cu un comentariu în task și îl muți înapoi în `todo`.

**Nu face niciodată:**
- push în `main` sau `push --force`;
- să citească sau să afișeze chei din `.env`;
- linii `Co-Authored-By:` în commit-uri;
- merge la propriile PR-uri (merge-ul îl face QA).

---

## 10. Comunicare

| Ce | Unde |
|---|---|
| Codul și review-ul | PR-urile pe GitHub (link între PR-urile aceluiași task) |
| Starea culoarului tău, deciziile, problemele | `docs/status/Px.md` în `AradEx-Plan`, în PR-ul task-ului |
| Rezumatul echipei | `docs/STATUS.md` (doar Lead / Zoltan) |
| „Am deschis PR-ul”, „sunt blocat pe X”, cereri urgente | grupul echipei + comentariu în HAC-23 (Zoltan) |
| Cheile | privat, de la Zoltan; niciodată în git, task-uri sau chat-uri publice |

---

## 11. Când se schimbă planul sau agenții

1. Zoltan schimbă `AradEx-Plan` (docs, skill-uri) sau `AradEx-Ops` (instrucțiuni, task-uri, script) prin PR.
2. Fiecare face `cd ~/HACK4ARAD/AradEx-Plan && ./setup.sh`, apoi `cd ../AradEx-Ops && node setup-lane.mjs --lane Px`.
   - Scriptul aduce la zi instrucțiunile agentului și skill-urile.
   - Task-urile deja create **nu** se rescriu. Dacă textul unui task s-a schimbat mult, Zoltan o spune pe grup.

---

## 12. Probleme frecvente

| Problemă | Ce faci |
|---|---|
| `Paperclip is not reachable` | pornește `paperclipai run` într-un terminal și lasă-l deschis |
| Agentul stă „paused / verifying” | Claude nu e conectat sau nu e default în compania HACK4ARAD → Settings → Connections, apoi rulezi scriptul din nou |
| Agentul nu pornește | task-ul e în *backlog*, nu în *todo*; sau mai rulează alt task (un singur run odată) |
| `AradEx-Plan not found` / `Expected the repo skills…` | toate 5 repo-urile trebuie să fie în același folder; altfel `--plan <cale spre AradEx-Plan>` |
| Ai mutat folderul `HACK4ARAD` | rulezi scriptul din nou din noul `AradEx-Ops` (mută singur workspace-ul) |
| `git push` → 403 / „permission denied” | `gh auth login` cu contul tău de GitHub, apoi `gh auth setup-git` |
| Agentul spune că o dependență nu e în `main` | e corect: aștepți PR-ul colegului (vezi `docs/status/`) |
| QA a cerut modificări | muți task-ul în `todo` cu comentariul „repară review-ul”; agentul lucrează pe același branch |
| Conflict de merge | agentul face rebase pe `origin/main` în worktree; dacă e într-un fișier al altui culoar, e semn că cineva a ieșit din fișierele lui → spune pe grup |
| Laptop lent | un singur task odată; oprește `npm run dev` / API-ul când nu le folosești |
| Ai terminat abonamentul / limita Claude | agentul se oprește cu eroare; reiei task-ul (`todo`) după ce se resetează limita; anunță pe grup dacă te blochează |

---

## 13. Listă de verificare înainte de hackathon

**Fiecare (Lukas, Octav, Damian):**
- [ ] zip dezarhivat în `~/HACK4ARAD`, `./setup.sh` rulat, `.env` puse
- [ ] `gh auth login` cu contul tău, poți face `git push` pe un branch de test
- [ ] Paperclip pornit, Claude (abonamentul tău) conectat în HACK4ARAD, agentul **idle**
- [ ] task-urile tale în *backlog*, `SETUP` → `done`
- [ ] ai citit fișa ta, `docs/TEAM.md` (fișierele tale) și task-urile tale din `docs/PLAN.md`

**Zoltan:**
- [ ] Claude conectat în compania HACK4ARAD; Lead, P1 și QA trec din „paused” în idle
- [ ] HAC-1: Java 21 + Docker pe Mac
- [ ] T00 → T01 → T02 → T03 pornite cât mai devreme (toți depind de ele)
- [ ] HAC-23 în `todo` (pornește Lead-ul)
- [ ] protecție pe `main` în repo-uri după ce CI-ul a rulat o dată
- [ ] cheile trimise colegilor pe canal privat
