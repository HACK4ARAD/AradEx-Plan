---
name: seed-data
description: Cum se adaugă date demo (locuri reale din Arad, evenimente, firme, oferte, acțiuni comunitare, conturi) prin migrări Flyway de seed în modulul app și poze cu licență. Folosește-l când un task cere „seed”, „date de exemplu”, „date demo”, sau când demo-ul arată gol.
---

# Date demo (seed)

**Există deja** (verificate pe Postgres 16): `V2_1__seed_users.sql` (conturi demo + localnici + firme fictive), `V3_1__seed_places.sql` (12 locuri reale cu 33 puncte de ghid), `V4_1__seed_events.sql` (21 evenimente reale nov–dec 2026 + 9 demo). Sursele și corecțiile (Cetatea = doar exterior, Turnul de Apă închis) sunt în `AradEx-Plan/docs/ARAD-DATA.md`. `V4_2__seed_images.sql` leagă pozele obiectivelor și ale evenimentelor din aceleași săli. `V5_1__seed_tickets.sql` (T07) pune un bilet demo trecut pentru `local@demo.ro`. Rămân de scris: V7_1 (oferte), V8_1 (acțiuni comunitare + puncte), V10_1 (2 voluntari: Andrei Popa `482913`, Maria Ionescu `731508`) — după modelul celor existente.

Regula de aur: **date reale din Arad** (nume, adrese, coordonate, program), firme plauzibile, zero „lorem ipsum”. Demo-ul e pe 7–8 nov 2026 — evenimentele trebuie să cadă pe 7–30 nov 2026 ca listele „Azi / Weekend / 7 zile” să fie pline. Ce e inventat se marchează `is_demo = true` (și „FICTIV” în `AradEx-Plan/docs/ARAD-DATA.md`).

## Unde
- Fișier: `AradEx-Backend/app/src/main/resources/db/migration/V{n}_1__seed_{modul}.sql` (modulul Gradle `app`; numărul următor liber, în ordinea story-urilor), imediat după migrarea de schemă a modulului. SQL pur, `INSERT ... ON CONFLICT DO NOTHING` unde există chei unice, id-uri explicite pentru rândurile la care fac referință alte seed-uri (ex. `places.id = 1` pentru Cetate) și `SELECT setval(...)` la final ca secvența să continue după id-urile fixate.
- Poze: fișiere în `AradEx-Frontend/public/img/nume.jpg` (copiate din `AradEx-Plan/design/assets/`, licențe în `AradEx-Plan/design/README.md` și `design/assets/CREDITS-foto-obiective.json`), în DB doar calea relativă `/img/oferta-cafea.jpg`. Pozele obiectivelor (`loc-*.jpg`) sunt deja în FE și legate în `V4_2__seed_images.sql`.
- Texte de ghid (T05): generează-le cu modelul (60–120 de cuvinte per punct, ton de ghid prietenos, fără cifre inventate; dacă nu ești sigur de un an sau nume, formulează general) și pune-le direct în SQL cu `$$ ... $$` ca să nu scapi apostrofurile.

## Lista de locuri reale (T05) — exact ce e în `V3_1__seed_places.sql`
| id | Nume | Tip | Lat, Lng | Vizită | Poză (`/img/…`) |
|---|---|---|---|---|---|
| 1 | Cetatea Aradului (doar exterior) | ATTRACTION | 46.1711, 21.3319 | 60 min | loc-ca.jpg |
| 2 | Palatul Cultural (Filarmonica + Muzeul) | MUSEUM | 46.1757, 21.3171 | 75 min | loc-pc.jpg |
| 3 | Teatrul Clasic „Ioan Slavici” | VENUE | 46.1726, 21.3153 | 20 min | loc-tc.jpg |
| 4 | Palatul Administrativ (Primăria) | ATTRACTION | 46.1768, 21.3145 | 15 min | loc-pa.jpg |
| 5 | Biserica Roșie (evanghelică-luterană) | ATTRACTION | 46.1740, 21.3160 | 15 min | loc-br.jpg |
| 6 | Catedrala Ortodoxă „Sfânta Treime” | ATTRACTION | 46.1692, 21.3182 | 20 min | loc-cs.jpg |
| 7 | Catedrala Romano-Catolică „Sf. Anton de Padova” | ATTRACTION | 46.1752, 21.3151 | 15 min | loc-cc.jpg |
| 8 | Turnul de Apă (doar exterior, închis) | ATTRACTION | 46.1792, 21.3118 | 15 min | loc-ta.jpg |
| 9 | Faleza Mureșului | PARK | 46.1745, 21.3215 | 45 min | loc-fm.jpg |
| 10 | Lunca Mureșului – Pădurea Ceala | NATURE | 46.1900, 21.2650 | 120 min | loc-ce.jpg |
| 11 | Podgoria Miniș–Măderat + Muzeul Viei și Vinului | WINERY | 46.1370, 21.6050 | 150 min | — (fără poză liberă) |
| 12 | Castelul Macea + Grădina Botanică | ATTRACTION | 46.3860, 21.3167 | 90 min | loc-mc.jpg |

Verifică coordonatele pe OpenStreetMap înainte de commit dacă ai dubii (sunt aproximative la ±100 m); mută pinul dacă e în clădirea greșită. `parking_hint`: „Parcarea Cetății, str. Cetății” / „Parcarea Teatrului, Piața Avram Iancu” etc.

## Evenimente (T06) — deja în V4_1; de completat doar dacă lipsește ceva
Repetiție deschisă la Filarmonica (gratuit), concert simfonic (bilete), Teatrul Clasic — spectacol pentru copii sâmbătă 11:00 (adult 40 / copil 25), expoziție la Palatul Cultural (10 lei, zilnic), tur ghidat de seară la Cetate (gratuit, 19:30), Târgul producătorilor din județul Arad (piața Avram Iancu, sâmbătă), meci UTA Arad (extern, link), Festivalul Vinului Miniș (sâmbătă 17:00), alergare pe Faleză (sport, gratuit), atelier de ceramică (familie), expoziție foto „Aradul în 1900”, seară de jazz la o cafenea (organizator firmă), cros în Pădurea Ceala.
Setează `participants_count` mare (≥ 50) la 2–3 evenimente ca să existe 🔥 Popular. Categoriile: vezi DATA-MODEL.

## Firme (T03/T09) & oferte (T10)
Cafeneaua din Pasaj (CAFE, verified, owner `firma@demo.ro`), Brutăria Veche (PRODUCER), Crama Dealul Miniș (WINERY), Producători din județul Arad (PRODUCER, „Făcut în Arad”), Bistro La Mureș (RESTAURANT), Grădina Bastion (RESTAURANT). Oferte: cafea -20% (30 puncte), covrigi 2+1, degustare de vinuri (eveniment-ofertă), miere de salcâm „Făcut în Arad”, prăjitura zilei -10%.

## Comunitate (T11)
Acțiuni: „Plantăm copaci pe Faleza Mureșului” (sâm. 7 nov 10:00–13:00, +50, 40 locuri, 18 înscriși), „Curățenie în Pădurea Ceala” (dum. 8 nov 09:00–12:00, +40, 60 locuri), „Donăm sânge pentru spitalele din Arad” (mar. 10 nov, +80, 30 locuri). Înscriși fictivi (Radu M., Elena T., Mihai R., Ioana S. …) + tranzacții de puncte în octombrie/noiembrie ca să existe clasament (Mihai 980, Ioana 910, Andrei 860 …). `local@demo.ro` are 270 de puncte și o înscriere `REGISTERED` la plantare (pentru demo-ul cu QR).

## Conturi (T03)
`visitor@demo.ro` (VISITOR), `local@demo.ro` (LOCAL, 270 puncte), `firma@demo.ro` (BUSINESS → Cafeneaua din Pasaj), `primaria@demo.ro` (CITY_HALL), `admin@demo.ro` (ADMIN); voluntarii (T18) intră doar cu codul de 6 cifre. Parola `demo1234` — hash-ul BCrypt e deja în `V2_1__seed_users.sql`; refolosește-l la conturi noi. **Emailurile în seed doar cu litere mici** (login-ul caută exact emailul normalizat — vezi `docs/STATUS.md`, „Decizii luate”).

## Verificare
După `./gradlew :app:bootRun` pe o bază goală: `GET /events?from=2026-11-07` întoarce ≥ 10, `GET /places` ≥ 10 cu ghid, `GET /offers` ≥ 5, `GET /community/actions` = 3, login cu toate cele 5 conturi merge (acoperit automat de `AppSmokeTest.demoAccounts_canLogIn_andMeReturnsThem`). Rulează și pe o bază existentă fără erori (seed-ul e idempotent). Rapid, fără aplicație: `psql -U arad -d aradexperience -f app/src/main/resources/db/migration/V{n}_1__seed_x.sql` de două ori la rând → zero erori.
