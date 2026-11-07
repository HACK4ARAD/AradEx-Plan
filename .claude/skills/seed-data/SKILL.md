---
name: seed-data
description: Cum se adaugă date demo (locuri reale din Arad, evenimente, firme, oferte, acțiuni comunitare, conturi) prin migrări Flyway de seed în modulul app și poze cu licență. Folosește-l când un task cere „seed”, „date de exemplu”, „date demo”, sau când demo-ul arată gol.
---

# Date demo (seed)

**Există deja** (verificate pe Postgres 16): `V2_1__seed_users.sql` (conturi demo + localnici + firme fictive), `V3_1__seed_places.sql` (12 locuri reale cu 33 puncte de ghid), `V4_1__seed_events.sql` (21 evenimente reale nov–dec 2026 + 9 demo). Sursele și corecțiile (Cetatea = doar exterior, Turnul de Apă închis) sunt în `AradEx-Plan/docs/ARAD-DATA.md`. `V4_2__seed_images.sql` leagă pozele obiectivelor și ale evenimentelor din aceleași săli. `V5_1__seed_tickets.sql` (T07) pune un bilet demo trecut pentru `local@demo.ro`. **`V3_2__places_visitarad.sql`** (7 nov): coordonatele celor 12 corectate (verificate pe OpenStreetMap) + **223 de locuri reale** din exportul visitarad.ro (vezi mai jos); **`V5_2__seed_event_venues.sql`**: evenimentele din seed (inclusiv cel din V5_1) pe coordonatele corecte ale sălilor. `V7_1__seed_offers.sql` (T10): ofertele firmelor demo. `V8_1__seed_community.sql` (T11): acțiunile din design + istoric, localnici fictivi cu **id 101+** (id-uri mari ca să nu se ciocnească de seed-urile altor culoare — fă la fel pentru utilizatori noi), tranzacții de puncte și soldurile recalculate din ele. Rămân de scris: V10_1 (2 voluntari: Andrei Popa `482913`, Maria Ionescu `731508`) — după modelul celor existente.

Regula de aur: **date reale din Arad** (nume, adrese, coordonate, program), firme plauzibile, zero „lorem ipsum”. Demo-ul e pe 7–8 nov 2026 — evenimentele trebuie să cadă pe 7–30 nov 2026 ca listele „Azi / Weekend / 7 zile” să fie pline. Ce e inventat se marchează `is_demo = true` (și „FICTIV” în `AradEx-Plan/docs/ARAD-DATA.md`).

## Unde
- Fișier: `AradEx-Backend/app/src/main/resources/db/migration/V{n}_1__seed_{modul}.sql` (modulul Gradle `app`; numărul următor liber, în ordinea story-urilor), imediat după migrarea de schemă a modulului. SQL pur, `INSERT ... ON CONFLICT DO NOTHING` unde există chei unice, id-uri explicite pentru rândurile la care fac referință alte seed-uri (ex. `places.id = 1` pentru Cetate) și `SELECT setval(...)` la final ca secvența să continue după id-urile fixate.
- Poze: fișiere în `AradEx-Frontend/public/img/nume.jpg` (copiate din `AradEx-Plan/design/assets/`, licențe în `AradEx-Plan/design/README.md` și `design/assets/CREDITS-foto-obiective.json`), în DB doar calea relativă `/img/oferta-cafea.jpg`. Pozele obiectivelor (`loc-*.jpg`) sunt deja în FE și legate în `V4_2__seed_images.sql`.
- Texte de ghid (T05): generează-le cu modelul (60–120 de cuvinte per punct, ton de ghid prietenos, fără cifre inventate; dacă nu ești sigur de un an sau nume, formulează general) și pune-le direct în SQL cu `$$ ... $$` ca să nu scapi apostrofurile.

## Sursa de date reale: exportul visitarad.ro (Hack4Arad)
325 de locații (obiective, agrement, gastronomie, cazare) + 30 de trasee de pe visitarad.ro (CNIPT Arad), cu coordonate, adresă, descriere, poze și fișa sursă: https://baditaflorin.github.io/hack4arad-turism-arad/ (JSON/CSV în `data/`). Folosește-l **înainte** de a inventa sau de a „ghici” un loc, o adresă sau coordonate.
- **Atribuire obligatorie:** `image_credit = 'Foto și date: CNIPT Arad / visitarad.ro'` și `places.source_url` = fișa sursă. CNIPT a permis preluarea, dar fără licență formală: pozele se leagă de pe visitarad.ro, nu se copiază în repo.
- Ce e deja în DB (`V3_2`) și ce nu (cazarea, traseele), regulile de tip/etichete/deduplicare și lista completă: `docs/ARAD-DATA.md` (secțiunea despre export + anexele A/B). Generatorul: `docs/tools/visitarad-places.mjs`. **Nu rescrie V3_2** după merge — pentru cazare sau alte corecții fă o migrare nouă (ex. `V3_3__places_...sql`), tot idempotentă prin `slug`.
- Cafenelele / restaurantele reale sunt doar `places`, **fără oferte inventate**; ofertele (T10) rămân la firmele FICTIVE.
- **Coordonate:** verifică pe OpenStreetMap (Nominatim / Overpass) — primul seed avea pinuri greșite cu până la 4 km; visitarad e de obicei corect (excepție: Muzeul Viei și al Vinului). Un UPDATE de corecție pe un rând existent se aplică doar dacă rândul are încă valoarea veche (`WHERE id = … AND lat = <vechi>`), ca să nu suprascrie editările Primăriei din producție.

## Lista de locuri cu ghid (T05) — `V3_1__seed_places.sql`, coordonatele corectate în `V3_2`
| id | Nume | Tip | Lat, Lng | Vizită | Poză (`/img/…`) |
|---|---|---|---|---|---|
| 1 | Cetatea Aradului (doar exterior) | ATTRACTION | 46.1709, 21.3326 | 60 min | loc-ca.jpg |
| 2 | Palatul Cultural (Filarmonica + Muzeul) | MUSEUM | 46.1742, 21.3207 | 75 min | loc-pc.jpg |
| 3 | Teatrul Clasic „Ioan Slavici” | VENUE | 46.1711, 21.3158 | 20 min | loc-tc.jpg |
| 4 | Palatul Administrativ (Primăria) | ATTRACTION | 46.1754, 21.3193 | 15 min | loc-pa.jpg |
| 5 | Biserica Roșie (evanghelică-luterană) | ATTRACTION | 46.1774, 21.3202 | 15 min | loc-br.jpg |
| 6 | Catedrala Ortodoxă „Sfânta Treime” | ATTRACTION | 46.1836, 21.3247 | 20 min | loc-cs.jpg |
| 7 | Catedrala Romano-Catolică „Sf. Anton de Padova” | ATTRACTION | 46.1726, 21.3154 | 15 min | loc-cc.jpg |
| 8 | Turnul de Apă (doar exterior, închis) | ATTRACTION | 46.1697, 21.3080 | 15 min | loc-ta.jpg |
| 9 | Faleza Mureșului | PARK | 46.1745, 21.3215 | 45 min | loc-fm.jpg |
| 10 | Lunca Mureșului – Pădurea Ceala | NATURE | 46.1579, 21.2734 | 120 min | loc-ce.jpg |
| 11 | Podgoria Miniș–Măderat + Muzeul Viei și Vinului | WINERY | 46.1378, 21.6048 | 150 min | poza de pe visitarad.ro (V3_2) |
| 12 | Castelul Macea + Grădina Botanică | ATTRACTION | 46.3844, 21.3104 | 90 min | loc-mc.jpg |

Plus 223 de locuri fără ghid (id 13+ din secvență): obiective și muzee din Arad și județ, crame, ștranduri, cinematografe, cafenele, restaurante — lista în `docs/ARAD-DATA.md`, anexa A.

Verifică coordonatele pe OpenStreetMap înainte de commit (cele 12 de mai sus sunt verificate pe OSM, 7 nov); mută pinul dacă e în clădirea greșită. `parking_hint`: „Parcarea Cetății, str. Cetății” / „Parcarea Teatrului, Piața Avram Iancu” etc.

## Evenimente (T06) — deja în V4_1 + `V4_4__seed_events_more.sql` (cele 5 reale care lipseau); de completat doar dacă lipsește ceva
Înainte de a adăuga un eveniment, verifică în `docs/ARAD-DATA.md` dacă e real și are oră + titlu confirmate; cele fără (UTA – U Cluj, spectacolul din 29 nov) nu intră. Fără recenzii inventate în `reviews` — tabela rămâne goală până vin recenzii reale din aplicație.
Repetiție deschisă la Filarmonica (gratuit), concert simfonic (bilete), Teatrul Clasic — spectacol pentru copii sâmbătă 11:00 (adult 40 / copil 25), expoziție la Palatul Cultural (10 lei, zilnic), tur ghidat de seară la Cetate (gratuit, 19:30), Târgul producătorilor din județul Arad (piața Avram Iancu, sâmbătă), meci UTA Arad (extern, link), Festivalul Vinului Miniș (sâmbătă 17:00), alergare pe Faleză (sport, gratuit), atelier de ceramică (familie), expoziție foto „Aradul în 1900”, seară de jazz la o cafenea (organizator firmă), cros în Pădurea Ceala.
Setează `participants_count` mare (≥ 50) la 2–3 evenimente ca să existe 🔥 Popular. Categoriile: vezi DATA-MODEL.

## Firme (T03/T09) & oferte (T10)
Cafeneaua din Pasaj (CAFE, verified, owner `firma@demo.ro`), Brutăria Veche (PRODUCER), Crama Dealul Miniș (WINERY), Producători din județul Arad (PRODUCER, „Făcut în Arad”), Bistro La Mureș (RESTAURANT), Grădina Bastion (RESTAURANT). Oferte: cafea -20% (30 puncte), covrigi 2+1, degustare de vinuri (eveniment-ofertă), miere de salcâm „Făcut în Arad”, prăjitura zilei -10%.

## Comunitate (T11) — scris în `V8_1` (detalii în `docs/ARAD-DATA.md`)
Acțiuni: „Plantăm copaci pe Faleza Mureșului” (sâm. 7 nov 10:00–13:00, +50, 40 locuri, 18 înscriși), „Curățenie în Pădurea Ceala” (dum. 8 nov 09:00–12:00, +40, 60 locuri), „Donăm sânge pentru spitalele din Arad” (mar. 10 nov, +80, 30 locuri). Înscriși fictivi (Radu M., Elena T., Mihai R., Ioana S. …) + tranzacții de puncte în octombrie/noiembrie ca să existe clasament (Mihai 980, Ioana 910, Andrei 860 …). `local@demo.ro` are 270 de puncte și o înscriere `REGISTERED` la plantare (pentru demo-ul cu QR).

## Conturi (T03)
`visitor@demo.ro` (VISITOR), `local@demo.ro` (LOCAL, 270 puncte), `firma@demo.ro` (BUSINESS → Cafeneaua din Pasaj), `primaria@demo.ro` (CITY_HALL), `admin@demo.ro` (ADMIN); voluntarii (T18) intră doar cu codul de 6 cifre. Parola `demo1234` — hash-ul BCrypt e deja în `V2_1__seed_users.sql`; refolosește-l la conturi noi. **Emailurile în seed doar cu litere mici** (login-ul caută exact emailul normalizat — vezi `docs/STATUS.md`, „Decizii luate”).

## Verificare
După `./gradlew :app:bootRun` pe o bază goală: `GET /events?from=2026-11-07` întoarce ≥ 10, `GET /places` = 235 (12 cu ghid + 223 din visitarad), `GET /offers` ≥ 5, `GET /community/actions` = 3, login cu toate cele 5 conturi merge (acoperit automat de `AppSmokeTest.demoAccounts_canLogIn_andMeReturnsThem`). Rulează și pe o bază existentă fără erori (seed-ul e idempotent). Rapid, fără aplicație: `psql -U arad -d aradexperience -f app/src/main/resources/db/migration/V{n}_1__seed_x.sql` de două ori la rând → zero erori.
