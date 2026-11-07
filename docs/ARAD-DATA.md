# Date reale despre Arad pentru seed (verificate 6 nov 2026, completate 7 nov 2026 cu exportul visitarad.ro)

Scop: datele din aplicație să fie reale și verificabile. Tot ce e marcat **FICTIV** există doar pentru demo (firme, oferte, acțiuni comunitare) și e etichetat așa și în SQL. Coordonatele celor 12 obiective cu ghid și ale sălilor de evenimente sunt **verificate pe OpenStreetMap** (7 nov); celelalte vin din visitarad.ro, neverificate individual.
Surse principale: **visitarad.ro (CNIPT Arad, prin exportul Hack4Arad — vezi mai jos)**, museumarad.ro, filarmonicaarad.ro, teatrulclasic.ro, specialarad.ro, aradon.ro, cjarad.ro, gradinabotanicamacea.ro, lpf.ro, Wikipedia, OpenStreetMap.

## Sursa principală: exportul visitarad.ro pentru Hack4Arad
- **Ce e:** toate cele **325 de locații** (163 obiective turistice, 98 „timp liber și agrement” — restaurante, cafenele, crame, ștranduri, cinematografe —, 64 unități de cazare) și **30 de trasee** de pe [visitarad.ro](https://www.visitarad.ro/), site-ul Centrului Național de Informare și Promovare Turistică al Județului Arad (CNIPT), colectate pe 3 nov 2026 pentru participanții Hack4Arad: https://baditaflorin.github.io/hack4arad-turism-arad/ (hartă, tabel, descărcare) · date: [`locations.json`](https://baditaflorin.github.io/hack4arad-turism-arad/data/locations.json), [`locations.csv`](https://baditaflorin.github.io/hack4arad-turism-arad/data/locations.csv), [`trails.json`](https://baditaflorin.github.io/hack4arad-turism-arad/data/trails.json) · coloanele: [DATA.md](https://github.com/baditaflorin/hack4arad-turism-arad/blob/main/DATA.md).
- **Coloane:** `id` (stabil, din visitarad), `name`, `type`, `category`, `locality`, `area` (zona turistică), `address`, `latitude`/`longitude` (WGS84), `description` (română, necorectată), `website`, `facebook`, `photos[]` (linkuri spre visitarad.ro), `source_url` (fișa sursă).
- **Condiții de folosire:** CNIPT a răspuns (3 nov 2026) că informațiile de pe site sunt publice și pot fi preluate; **nu există o licență formală**. **Atribuirea e obligatorie:** „Date: CNIPT Arad / visitarad.ro” + `source_url` păstrat pe fiecare înregistrare. Textele și pozele rămân ale CNIPT; pentru folosire după hackathon / comercial se confirmă direct cu CNIPT. Telefoanele și emailurile unităților nu sunt în export (intenționat).
- **Cum le folosim (BE, `V3_2__places_visitarad.sql`):**
  - coloana nouă `places.source_url` (fișa sursă), completată pentru toate obiectivele luate din visitarad și pentru 11 din cele 12 obiective cu ghid;
  - **223 de locuri noi** în `places` (124 în municipiul Arad, 99 în județ): ATTRACTION 92 · MUSEUM 20 · NATURE 12 · PARK 10 · VENUE 5 · WINERY 10 · CAFE 29 · RESTAURANT 45 — lista completă e în anexa de la final. **Fără cazare** (`places.type` n-are un tip pentru ea; cele 64 de hoteluri/pensiuni rămân în export pentru mai târziu). 23 de fișe dublate pe site (aceeași cramă / același muzeu în 2–3 categorii) au fost unite; 14 fișe descriu obiectivele noastre cu ghid și au fost unite cu ele (nu apar de două ori);
  - **poze:** prima poză a fiecărei fișe, legată direct de pe visitarad.ro (nu e copiată în repo), cu `image_credit = 'Foto și date: CNIPT Arad / visitarad.ro'` — creditul se vede pe E3, deci atribuirea apare în aplicație. Excepție de la regula „poze doar cu licență” (`CLAUDE.md`), justificată de acordul CNIPT de mai sus și **aprobată pe 7 nov**; dacă se renunță la ea, `UPDATE places SET image_url = NULL, image_credit = NULL WHERE image_credit LIKE 'Foto și date: CNIPT%'` (într-o migrare nouă). Cele 12 obiective cu ghid își păstrează pozele Wikimedia; Podgoria Miniș (care n-avea poză) primește poza Muzeului Viei și al Vinului;
  - **tip, durată, etichete** derivate din categoria de pe site (Biserici / Clădiri / Monumente / Cetăți → ATTRACTION, Muzee → MUSEUM, Crame → WINERY, Cafenea / Cofetărie → CAFE, Restaurant / Pizzerie / Bistro / Pub / Fast food → RESTAURANT, Ștranduri / Agrement → PARK, lacuri / peșteri / Moneasa → NATURE, Cinema / Teatru / Club → VENUE); etichetele (`spiritual`, `arhitectura`, `istorie`, `muzee`, `vin`, `natura`, `munte`, `gastronomie`, `cafea`, `dulciuri`, `familie`, `judet` = în afara municipiului …) ajută filtrul `tags` și itinerariile (T13). `rating`, `opening_hours`, `parking_hint` rămân goale — nu le inventăm;
  - **descrieri:** textul de pe site (cu ș/ț corectate, fără frazele cu `[telefon pe fișa sursă]`); cele 59 de unități fără descriere (mai ales gastronomie) primesc o frază generică „Cafenea în Arad, Bd. Revoluției nr. 63. Program și detalii pe fișa visitarad.ro.”;
  - ordinea din listă (fără `near` = după id): cele 12 cu ghid, apoi obiectivele din Arad, agrementul, cafenelele, restaurantele, apoi județul în aceeași ordine.
- **Gastronomia reală NU e „firmă”:** cafenelele și restaurantele din visitarad sunt doar `places` (profil + hartă), **fără oferte, anunțuri sau cont**. Firmele cu oferte rămân cele FICTIVE de mai jos.
- **Limitări (din sursă):** 90 de fișe fără descriere; unele texte fără diacritice sau cu greșeli; coordonatele neverificate individual (exemplu: Muzeul Viei și al Vinului e pe site la Ghioroc, cu 2 km greșit — l-am pus după OSM); unele unități pot fi închise între timp; doar română (site-ul are și EN/DE). Traseele n-au coordonate, doar o imagine cu harta → nu intră în DB (anexa B, pentru T08 / T13).

## Patru corecții față de prototip
1. **Cetatea Aradului NU se vizitează în interior** — este unitate militară (Batalionul 191 Infanterie / fostul Batalion Mixt Româno-Ungar). Ghidul virtual se face **din exterior**: Monumentul celor 13 Generali (Piața 13 Martiri, Subcetate), valul și șanțul de apărare, Podul Traian/Faleza cu vedere spre ziduri. Porți deschise doar ocazional (Crosul Cetăților, mai). Turul „de seară la Cetate” din prototip devine „Cetatea văzută de pe Faleză” (FICTIV, exterior).
2. **Turnul de Apă este închis publicului din 2024** (proprietate privată, fără perspectivă de redeschidere — Agerpres, iul. 2026). Rămâne obiectiv de exterior, cu ghid despre istorie.
3. **Muzeul de Artă (Str. Popa de Teiuș 2-4) este închis pentru renovare** (PNRR). Secțiile deschise sunt în Palatul Cultural.
4. **Coordonatele din primul seed erau greșite** (7 nov, verificat pe OpenStreetMap și visitarad.ro): pinurile erau deplasate 150 m – 4 km — Catedrala „Sfânta Treime” e la capătul de nord al Bd. Revoluției (Podgoria), nu lângă Teatru; Turnul de Apă și **Parcul Reconcilierii** sunt la ~900 m sud-vest de Primărie (Parcul Reconcilierii **nu** e în spatele Primăriei, cum spunea ghidul); Centrul de vizitare Ceala e la sud-vest de oraș; Podul Traian e la 1,5 km sud de Palatul Cultural. Corectate în `V3_2__places_visitarad.sql` (obiective, puncte de ghid, fraza din ghid, parcarea Primăriei) și `V4_3__seed_event_venues.sql` (sălile evenimentelor). Tabelul de mai jos are coordonatele noi.

## Obiective (T05) — ce intră în `places` + `guide_points`
| # | Loc | Adresă / coordonate | Program & tarife (nov 2026) | Ghid: puncte |
|---|---|---|---|---|
| 1 | **Cetatea Aradului** (exterior) | Cartier Subcetate · 46.1709, 21.3326 (obeliscul celor 13 Generali: 46.1622, 21.3325) | Nu se vizitează; exteriorul oricând | 1763–1783, Maria Terezia, arh. Ferdinand Philipp von Harsch, stil Vauban „tenaille”, stea cu 6 bastioane, ziduri 3.180 m, 296 guri de foc, ~3 mil. florini; închisoare militară: Horea, Cloșca și Crișan (1784), Eftimie Murgu; cei 13 generali executați la 6 oct. 1849 lângă ziduri; obeliscul din 1881 (Piața 13 Martiri); Biserica Franciscană din incintă |
| 2 | **Palatul Cultural** — Filarmonica + Complexul Muzeal | Piața George Enescu 1 (intrare muzeu dinspre Bd. Dragalina / Parcul Copiilor) · 46.1742, 21.3207 | Muzeu: marți–duminică 09:00–17:00 (ultima intrare 16:30), închis luni și 30 nov.; 13,5 lei/secție adult, 7,5 pensionari, 3 elevi; Pinacoteca 16,5; expoziții temporare 21; toate expozițiile 47 lei; abonament familie 220 lei | 1911–1913, arh. Ludovic Szántay; Sala Filarmonicii; Muzeul de Istorie și Arheologie (sala imersivă Sântana–Cetatea Veche, „Tezaur 1848–1849”); Muzeul de Științe ale Naturii; Pinacoteca |
| 3 | **Teatrul Clasic „Ioan Slavici”** | Bd. Revoluției 103 · 46.1711, 21.3158 (Piața Avram Iancu: 46.1701, 21.3162) | Agenția de bilete: marți, miercuri, vineri 12–14; joi 12–14 și 17–19; online eventim.ro | 1874, neoclasic, Piața Avram Iancu; Sala Mare + Sala Studio; FITN (Festivalul Internațional de Teatru Nou, ed. XI, 1–5 nov 2026) |
| 4 | **Palatul Administrativ (Primăria)** | Bd. Revoluției 75 · 46.1754, 21.3193 | Exterior oricând; tururi ocazionale | 1872–1874, neorenascentist, plan Ödön Lechner modificat de Ferenc Pekár; turn 54 m cu orologiu elvețian care cântă Oda Bucuriei; vitralii Sever Frențiu (1960) |
| 5 | **Biserica Roșie** (evanghelică-luterană) | Bd. Revoluției 61 (în spate, str. Blajului) · 46.1774, 21.3202 | Vizitabilă; concerte de orgă cu Filarmonica | 1905–1906, neogotic, arh. Ludovic Szántay, constructor Iosef Frick, cărămidă roșie șlefuită, turn 46 m |
| 6 | **Catedrala Ortodoxă „Sfânta Treime”** | Piața Catedralei, capătul de nord al Bd. Revoluției (Podgoria) · 46.1836, 21.3247 | Deschisă zilnic | Început 24 nov 1991, sfințită 2008, pictura finalizată 2018 (Cezar Băluț), arh. Ioan Hăprian, 63×36 m, cea mai mare din vestul României; Târgul de Crăciun în piață |
| 7 | **Catedrala Romano-Catolică „Sf. Anton de Padova”** | Bd. Revoluției 96A · 46.1726, 21.3154 | Deschisă | 1902–1904, arh. Emil Tabacovici, copie în marmură a Pietà de Michelangelo deasupra intrării |
| 8 | **Turnul de Apă** (exterior) | Str. Piotr Ilici Ceaikovski 11, lângă Parcul Reconcilierii (Statuia Libertății, Arcul de Triumf) · 46.1697, 21.3080 | Închis publicului (2024–) | 1896, firma engleză Shone & Ault, 35 m, rezervor 300 mc, în funcțiune până în 1956; aspect de donjon medieval; a găzduit galerie de artă și muzeul apei |
| 9 | **Faleza Mureșului** (Parcul Copiilor, Parcul Eminescu, Ștrandul Neptun) | malul drept al Mureșului · 46.1745, 21.3215 (Podul Traian: 46.1603, 21.3223; Ștrandul Neptun: 46.1739, 21.3267) | Oricând | Promenadă de câțiva km, parcuri, terenuri, locuri de joacă; vedere spre Cetate; plantări și acțiuni comunitare |
| 10 | **Parcul Natural Lunca Mureșului / Pădurea Ceala** | sud-vest de oraș, Centrul de vizitare Ceala · 46.1579, 21.2734 | Oricând; Centrul de vizitare Ceala | Arie protejată, trasee, observare păsări |
| 11 | **Muzeul Viei și Vinului Miniș** + Podgoria Miniș–Măderat | Ghioroc/Miniș, în Stațiunea de Cercetare Vitivinicolă · 46.1378, 21.6048 (~25 km) | Marți–duminică 09:00–17:00 (Complexul Muzeal) | Înființat 1988; soiuri: Cadarcă, Mustoasă de Măderat, Fetească regală, Riesling italian, Muscat Ottonel; crame cu degustare pe bază de rezervare: MaxiMarc (L–V 9–17, weekend doar cu rezervare, ~125 lei/pers), Rab, Daiconi (Miniș), Feredeu (Șiria), Cramele Pâncota; Muzeul Tramvaiului Electric Ghioroc; tramvaiul „Săgeata Verde” Arad–Ghioroc |
| 12 | **Castelul Macea & Grădina Botanică „Pavel Covaci”** (UVVG) | comuna Macea, Castelul Cernovici · 46.3844, 21.3104 (grădina: 46.3817, 21.3054) (~25 km, 20–30 min) | L–V 08:00–16:00, S–D 09:00–19:00 (mar–nov), închis dec–feb; tel 0771 179 772 | 21,5 ha, >3.800 taxoni, alpinariu, rozariu, colecție dendrologică; castel baroc târziu cu elemente gotice; Muzeul Botanic, Etnografic, Cinegetic |
| 13 | **Moneasa** (opțional) | Codru-Moma, ~100 km | — | Stațiune balneară, ape termale, trasee montane |

Nu includeți: interiorul Cetății, interiorul Turnului de Apă, Muzeul de Artă (închis).

## Evenimente reale noiembrie–decembrie 2026 (T06) — `ticket_type = EXTERNAL`, link spre organizator
**Filarmonica Arad** — Sala Palatului Cultural, ora 19:00, casa de bilete în zi de concert 09–13 / 17–18:45, filarmonicaarad.ro
- Lu 9 nov · Orchestra de Cameră „Franz Liszt” din Budapesta (Bartók, Dohnányi, Weiner, Liszt) — Festivalul „Toamna Muzicală Arădeană”
- Jo 12 nov · Concert simfonic (Bruch, Dvořák) — închiderea festivalului
- Du 15 nov · „Invitație la vals” — stagiunea Musical Extravaganza
- Jo 19 nov · SEMPER MOZART — concert vocal-simfonic (dirijor Robert Daniel Rădoiaș)
- Lu 23 nov · „Poveste în două instrumente” (Bach, Vivaldi, Beethoven, Paganini, Kreisler, Liszt)
- Ma 1 dec · Concert coral extraordinar de Ziua Națională
- Jo 3 dec · „Antonio Vivaldi: un Crăciun baroc”; Jo 10 dec · Crăciunul la Filarmonică; Jo 17 dec · „Colindăm, colindăm iarna” (Q Band)

**Teatrul Clasic „Ioan Slavici”** — Bd. Revoluției 103, bilete eventim.ro
- Jo 12 nov 19:00 · „Năpasta” de I.L. Caragiale — Sala Studio, 1h10
- Ma 17 nov 19:00 · „Cocoșatul de la Notre Dame” (musical, turneu) — de la 100 lei
- Sâ 21 nov 19:00 · „Ce mai faci, omule?” — Sala Studio, 1h
- Du 22 nov 19:00 · „Cerere în căsătorie” după A.P. Cehov — Sala Studio, 60 min
- Lu 23 nov 19:00 · „Femeile nu sunt îngeri” (Teatrul Metronom, turneu)
- Jo 26 nov 19:00 · „Ai mei erau super!” — Sala Studio; Du 29 nov 19:00 · spectacol din repertoriu

**Târgul de Crăciun Arad 2026** — Primăria Arad + Centrul Municipal de Cultură; **14 nov 2026 – 10 ian 2027**, zilnic 14:00–22:00; Piața Catedralei (23 căsuțe, 17 standuri, food-truck-uri), Parcul Reconcilierii, platoul Palatului Administrativ; ~40 de comercianți din municipiu și județ; ateliere pentru copii zilnic 14 nov–27 dec
- Sâ 14 nov 19:00 · Deschidere: French, Vali Ivănescu Band, Spitalul de Urgență
- Du 15 nov 19:00 · Daniel Julean & Nicoleta Brola, Monica Cojocaru, Florian Jianu
- Sâ 21 nov · Dana Florian · Du 29 nov · Alesis · Lu 30 nov · Vița de Vie (Ziua Națională) · Ma 1 dec · muzică populară
- în fiecare weekend 18:00–20:00 concerte de colinde

**UTA Arad** — Arena „Francisc Neuman” (11.500 locuri · 46.1925, 21.3119 — corect, verificat pe OSM), bilete uta-arad.ro
- Vi 6 nov 17:30 · UTA – Petrolul Ploiești (etapa 15)
- Du 22 nov 17:30 · UTA – Universitatea Craiova (etapa 16)
- Du 20 dec · UTA – Universitatea Cluj

**Muzee** — Complexul Muzeal Arad (Palatul Cultural): expoziții permanente „Tezaur 1848–1849”, Pinacoteca, Științele Naturii, sala imersivă; marți–duminică 09–17.

**Piața Producătorilor Arădeni** (CMC Arad, Piața Avram Iancu) — ultima ediție 26–27 sept 2026, 21 de producători; nu are ediție anunțată în noiembrie → în seed apare ca **FICTIV** („ediție de toamnă”) sau se înlocuiește cu standurile producătorilor de la Târgul de Crăciun.

## Firme, oferte, acțiuni comunitare — FICTIVE (pentru demo)
Firme: Cafeneaua din Pasaj, Brutăria Veche, Crama Dealul Miniș, Producători din județul Arad, Bistro La Mureș, Grădina Bastion — nume inventate, adrese plauzibile în centru. Anunțurile lor (T09, `V6_1__seed_announcements.sql`: program prelungit, angajări, degustări, miere nouă) sunt tot **FICTIVE** și marcate „(FICTIV)” în text. **Nu puneți firme reale cu oferte inventate** (ar fi înșelător în demo); dacă vreți firme reale, cereți-le acordul sau afișați doar profil fără oferte.
Acțiuni: plantare pe Faleza Mureșului (sâm. 7 nov), curățenie în Pădurea Ceala (dum. 8 nov), donare de sânge la Centrul de Transfuzie Sanguină Arad (mar. 10 nov) — organizator „Primăria Arad” (rol demo).

## Transport (pentru itinerar)
- Pe jos: centrul (Bd. Revoluției, de la Palatul Administrativ la Palatul Cultural) ≈ 1,2 km; Palatul Cultural → Cetate (peste Podul Traian) ≈ 1,5 km.
- Mașină: parcări — Piața Avram Iancu / Teatru, zona Palatului Cultural (Bd. Dragalina), Subcetate (Piața 13 Martiri); Macea 25 km, Miniș 25 km, Moneasa 100 km.
- Transport public: CTP Arad (tramvaie pe Bd. Revoluției/Calea Aurel Vlaicu); tramvaiul Arad–Ghioroc („Săgeata Verde”) pentru Podgorie; tren Arad–Curtici (15 min) pentru Macea.

## Surse
- Cetate: en.wikipedia.org/wiki/Fortress_of_Arad · aradcityguide.ro · prourbe.ro · planiada.ro (nu se vizitează)
- Muzeu: museumarad.ro/program-de-vizitare · noapteamuzeelor.org
- Filarmonica: filarmonicaarad.ro · criticarad.ro · aradculture.ro
- Locații, poze, trasee: visitarad.ro (CNIPT Arad) prin baditaflorin.github.io/hack4arad-turism-arad · coordonate verificate: openstreetmap.org (Nominatim / Overpass, 7 nov 2026)
- Teatru: specialarad.ro/noiembrie-la-teatrul-clasic-ioan-slavici-fitn · teatrulclasic.ro · iabilet.ro · ticketstore.ro
- Târgul de Crăciun: specialarad.ro/targul-de-craciun-2026-program-complet · aradon.ro (5 nov 2026)
- Turnul de Apă: agerpres.ro (23 iul 2026) · ro.wikipedia.org/wiki/Turnul_de_apă_din_Arad
- Miniș: revino.ro · cjarad.ro · maximarc.ro · opisicaneagra.ro
- Macea: gradinabotanicamacea.ro/contact · expressdebanat.ro
- UTA: lpf.ro/cluburi/uta-arad/22/calendar · superliga.ro · thesportsdb.com
- Producători: cmcarad.ro/ro/eveniment/1005 · aradon.ro

## Anexa A — cele 223 de locuri din visitarad.ro puse în `places` (`V3_2__places_visitarad.sql`)
Id-ul e cel de pe visitarad.ro (linkul = fișa sursă = `places.source_url`); în DB id-urile vin din secvență, după cele 12 obiective cu ghid. Generat cu `docs/tools/visitarad-places.mjs` (citește `locations.json`; regulile de tip / etichete / deduplicare sunt în script).

<details><summary>Lista completă (223)</summary>

Total: 223 locuri noi — ATTRACTION 92 · MUSEUM 20 · PARK 10 · VENUE 5 · CAFE 29 · RESTAURANT 45 · NATURE 12 · WINERY 10; 124 în municipiul Arad, 99 în județ.

| visitarad id | Nume | Tip | Localitate | Categorie pe site |
|---|---|---|---|---|
| [9](https://www.visitarad.ro/ro/harta-locatie/9-palatul-justitiei) | Palatul Justiției | ATTRACTION | Arad | Clădiri reprezentative |
| [23](https://www.visitarad.ro/ro/harta-locatie/23-palatul-neuman) | Palatul Neuman | ATTRACTION | Arad | Clădiri reprezentative |
| [24](https://www.visitarad.ro/ro/harta-locatie/24-palatul-szantay) | Palatul Szantay | ATTRACTION | Arad | Clădiri reprezentative |
| [25](https://www.visitarad.ro/ro/harta-locatie/25-palatul-sarbesc) | Palatul Sârbesc | ATTRACTION | Arad | Clădiri reprezentative |
| [48](https://www.visitarad.ro/ro/harta-locatie/48-biblioteca-judeteana-ad-xenopol) | Biblioteca Județeană „A.D. Xenopol” | ATTRACTION | Arad | Clădiri reprezentative |
| [49](https://www.visitarad.ro/ro/harta-locatie/49-casa-beller) | Casa Beller | ATTRACTION | Arad | Clădiri reprezentative |
| [50](https://www.visitarad.ro/ro/harta-locatie/50-casa-cu-lacat) | Casa cu lacăt | ATTRACTION | Arad | Clădiri reprezentative |
| [51](https://www.visitarad.ro/ro/harta-locatie/51-casa-comitatului) | Casa Comitatului | ATTRACTION | Arad | Clădiri reprezentative |
| [53](https://www.visitarad.ro/ro/harta-locatie/53-palatul-marii-uniri) | Palatul Marii Uniri | ATTRACTION | Arad | Clădiri reprezentative |
| [54](https://www.visitarad.ro/ro/harta-locatie/54-gara) | Gara | ATTRACTION | Arad | Clădiri reprezentative |
| [179](https://www.visitarad.ro/ro/harta-locatie/179-palatul-bohus) | Palatul Bohuș | ATTRACTION | Arad | Clădiri reprezentative |
| [205](https://www.visitarad.ro/ro/harta-locatie/205-academia-teologica) | Academia Teologică | ATTRACTION | Arad | Clădiri reprezentative |
| [214](https://www.visitarad.ro/ro/harta-locatie/214-colegiul-national-elena-ghiba-birta) | Colegiul Național Elena Ghiba-Birta | ATTRACTION | Arad | Clădiri reprezentative |
| [215](https://www.visitarad.ro/ro/harta-locatie/215-colegiul-national-moise-nicoara) | Colegiul Național „Moise Nicoară” | ATTRACTION | Arad | Clădiri reprezentative |
| [216](https://www.visitarad.ro/ro/harta-locatie/216-liceul-pedagogic-dimitrie-tichindeal) | Liceul Pedagogic „Dimitrie Țichindeal” | ATTRACTION | Arad | Clădiri reprezentative |
| [217](https://www.visitarad.ro/ro/harta-locatie/217-preparandia) | Preparandia | ATTRACTION | Arad | Clădiri reprezentative |
| [218](https://www.visitarad.ro/ro/harta-locatie/218-palatul-andrenyi) | Palatul Andrenyi | ATTRACTION | Arad | Clădiri reprezentative |
| [219](https://www.visitarad.ro/ro/harta-locatie/219-palatul-bancii-nationale) | Palatul Băncii Naționale | ATTRACTION | Arad | Clădiri reprezentative |
| [221](https://www.visitarad.ro/ro/harta-locatie/221-palatul-cenad) | Palatul Cenad | ATTRACTION | Arad | Clădiri reprezentative |
| [222](https://www.visitarad.ro/ro/harta-locatie/222-palatul-oncu) | Palatul Oncu | ATTRACTION | Arad | Clădiri reprezentative |
| [229](https://www.visitarad.ro/ro/harta-locatie/229-teatrul-de-marionete) | Teatrul de marionete | ATTRACTION | Arad | Clădiri reprezentative |
| [238](https://www.visitarad.ro/ro/harta-locatie/238-palatul-foldes) | Palatul Földes | ATTRACTION | Arad | Clădiri reprezentative |
| [358](https://www.visitarad.ro/ro/harta-locatie/358-palatul-rozsnyay) | Palatul Rozsnyay | ATTRACTION | Arad | Clădiri reprezentative |
| [359](https://www.visitarad.ro/ro/harta-locatie/359-templul-masonic) | Templul Masonic | ATTRACTION | Arad | Clădiri reprezentative |
| [446](https://www.visitarad.ro/ro/harta-locatie/446-palatul-reinhardt) | Palatul Reinhardt | ATTRACTION | Arad | Clădiri reprezentative |
| [18](https://www.visitarad.ro/ro/harta-locatie/18-sinagoga-neologa) | Sinagoga neologă | ATTRACTION | Arad | Biserici |
| [26](https://www.visitarad.ro/ro/harta-locatie/26-biserica-sarbeasca-sfantul-petru-si-pavel) | Biserica Sârbească „Sfântul Petru și Pavel” | ATTRACTION | Arad | Biserici |
| [28](https://www.visitarad.ro/ro/harta-locatie/28-catedrala-sfantul-ioan-botezatorul) | Catedrală „Sfântul Ioan Botezătorul” | ATTRACTION | Arad | Biserici |
| [30](https://www.visitarad.ro/ro/harta-locatie/30-manastirea-gai) | Mănăstirea Gai | ATTRACTION | Arad | Biserici |
| [66](https://www.visitarad.ro/ro/harta-locatie/66-statuia-lui-vasile-goldis) | Statuia lui Vasile Goldiș | ATTRACTION | Arad | Monumente |
| [67](https://www.visitarad.ro/ro/harta-locatie/67-statuia-sfantului-ioan-de-nepomuk) | Statuia Sfântului Ioan de Nepomuk | ATTRACTION | Arad | Monumente |
| [68](https://www.visitarad.ro/ro/harta-locatie/68-parcul-reconcilierii) | Parcul Reconcilierii | ATTRACTION | Arad | Monumente |
| [69](https://www.visitarad.ro/ro/harta-locatie/69-bustul-lui-ioan-slavici) | Bustul lui Ioan Slavici | ATTRACTION | Arad | Monumente |
| [70](https://www.visitarad.ro/ro/harta-locatie/70-statuia-fotbalistului) | Statuia Fotbalistului | ATTRACTION | Arad | Monumente |
| [71](https://www.visitarad.ro/ro/harta-locatie/71-statuia-sfantului-florian) | Statuia Sfântului Florian | ATTRACTION | Arad | Monumente |
| [134](https://www.visitarad.ro/ro/harta-locatie/134-arcul-de-triumf) | Arcul de Triumf | ATTRACTION | Arad | Monumente |
| [135](https://www.visitarad.ro/ro/harta-locatie/135-statuia-libertatii) | Statuia Libertății | ATTRACTION | Arad | Monumente |
| [197](https://www.visitarad.ro/ro/harta-locatie/197-podul-traian) | Podul Traian | ATTRACTION | Arad | Monumente |
| [220](https://www.visitarad.ro/ro/harta-locatie/220-monumentul-ostasilor-romani) | Monumentul Ostașilor Români | ATTRACTION | Arad | Monumente |
| [228](https://www.visitarad.ro/ro/harta-locatie/228-mormintele-lui-v-goldis-st-cicio-pop-iustin-marseu-p-pipos-si-moise-riscutia) | Mormintele lui V. Goldiș, Șt. Cicio Pop, Iustin Marșeu, P. Pipoș și Moise Rișcuția | ATTRACTION | Arad | Monumente |
| [231](https://www.visitarad.ro/ro/harta-locatie/231-obeliscul-celor-13-generali) | Obeliscul celor 13 generali | ATTRACTION | Arad | Monumente |
| [233](https://www.visitarad.ro/ro/harta-locatie/233-tabara-de-sculptura-monumentala-de-pe-malul-muresului) | Tabăra de sculptură monumentală de pe Malul Mureșului | ATTRACTION | Arad | Monumente |
| [235](https://www.visitarad.ro/ro/harta-locatie/235-ansamblul-monumental-din-parcul-liceului-sabin-dragoi) | Ansamblul monumental din parcul Liceului „Sabin Drăgoi” | ATTRACTION | Arad | Monumente |
| [42](https://www.visitarad.ro/ro/harta-locatie/42-casa-memoriala-stefan-cicio-pop) | Casa memorială „Ștefan Cicio-Pop” | MUSEUM | Arad | Muzee și Case memoriale |
| [223](https://www.visitarad.ro/ro/harta-locatie/223-muzeul-memorial-vasile-goldis) | Muzeul Memorial „Vasile Goldiș” | MUSEUM | Arad | Muzee și Case memoriale |
| [382](https://www.visitarad.ro/ro/harta-locatie/382-casa-pianului-jacques-faix) | Casa Pianului - Jacques Faix | MUSEUM | Arad | Muzee și Case memoriale |
| [177](https://www.visitarad.ro/ro/harta-locatie/177-strandul-neptun) | Ștrandul Neptun | PARK | Arad | Ștranduri |
| [316](https://www.visitarad.ro/ro/harta-locatie/316-pony-club) | Pony Club | PARK | Arad | Agrement și relaxare |
| [321](https://www.visitarad.ro/ro/harta-locatie/321-amefa-amc) | Amefa AMC | PARK | Arad | Ștranduri |
| [96](https://www.visitarad.ro/ro/harta-locatie/96-wings) | Wings | VENUE | Arad | Clubbing |
| [152](https://www.visitarad.ro/ro/harta-locatie/152-cinema-arta) | Cinema „Arta” | VENUE | Arad | Cinema |
| [154](https://www.visitarad.ro/ro/harta-locatie/154-cinematograf-gradiste) | Cinematograf Grădiște | VENUE | Arad | Cinema |
| [155](https://www.visitarad.ro/ro/harta-locatie/155-cinema-city) | Cinema City | VENUE | Arad | Cinema |
| [428](https://www.visitarad.ro/ro/harta-locatie/428-celalalt-teatru) | Celălalt Teatru | VENUE | Arad | Teatru |
| [127](https://www.visitarad.ro/ro/harta-locatie/127-art-cafe) | Art Cafe | CAFE | Arad | Cafenea |
| [130](https://www.visitarad.ro/ro/harta-locatie/130-soft-coffee) | Soft Coffee | CAFE | Arad | Cafenea |
| [244](https://www.visitarad.ro/ro/harta-locatie/244-cofetaria-venetia) | Cofetăria Veneția | CAFE | Arad | Cofetărie |
| [254](https://www.visitarad.ro/ro/harta-locatie/254-cofetaria-caprice) | Cofetăria Caprice | CAFE | Arad | Cofetărie |
| [258](https://www.visitarad.ro/ro/harta-locatie/258-dolci-pensieri) | Dolci Pensieri | CAFE | Arad | Cofetărie |
| [279](https://www.visitarad.ro/ro/harta-locatie/279-cofetaria-delice) | Cofetăria Delice | CAFE | Arad | Cofetărie |
| [280](https://www.visitarad.ro/ro/harta-locatie/280-cafe-clasic-1890) | Cafe Clasic 1890 | CAFE | Arad | Cafenea |
| [286](https://www.visitarad.ro/ro/harta-locatie/286-cofetaria-libelula) | Cofetăria Libelula | CAFE | Arad | Cofetărie |
| [368](https://www.visitarad.ro/ro/harta-locatie/368-crazy-bubble-arad) | Crazy Bubble Arad | CAFE | Arad | Cofetărie |
| [370](https://www.visitarad.ro/ro/harta-locatie/370-cafein) | Cafein | CAFE | Arad | Cafenea |
| [372](https://www.visitarad.ro/ro/harta-locatie/372-brutaria-bontalenti) | Brutăria Bontalenti | CAFE | Arad | Cofetărie |
| [376](https://www.visitarad.ro/ro/harta-locatie/376-kaffeine) | Kaffeine | CAFE | Arad | Cafenea |
| [378](https://www.visitarad.ro/ro/harta-locatie/378-lento-cafe-bistro) | Lento Cafe & Bistro | CAFE | Arad | Cafenea |
| [380](https://www.visitarad.ro/ro/harta-locatie/380-5-to-go) | 5 to go | CAFE | Arad | Cafenea |
| [384](https://www.visitarad.ro/ro/harta-locatie/384-vatra-calda) | Vatra Caldă | CAFE | Arad | Cofetărie |
| [430](https://www.visitarad.ro/ro/harta-locatie/430-ceva-buuun) | Ceva Buuun | CAFE | Arad | Cofetărie |
| [431](https://www.visitarad.ro/ro/harta-locatie/431-over-dose-cafe) | Over Dose Cafe | CAFE | Arad | Cafenea |
| [432](https://www.visitarad.ro/ro/harta-locatie/432-cofetaria-la-creme) | Cofetăria La Crème | CAFE | Arad | Cofetărie |
| [433](https://www.visitarad.ro/ro/harta-locatie/433-ancorat) | Ancorat | CAFE | Arad | Cafenea |
| [434](https://www.visitarad.ro/ro/harta-locatie/434-just-blvck-coffee) | Just Blvck Coffee | CAFE | Arad | Cafenea |
| [437](https://www.visitarad.ro/ro/harta-locatie/437-camino-social-place) | Camino Social Place | CAFE | Arad | Cafenea |
| [445](https://www.visitarad.ro/ro/harta-locatie/445-alternativ-speciality-coffee) | Alternativ Speciality Coffee | CAFE | Arad | Cafenea |
| [458](https://www.visitarad.ro/ro/harta-locatie/458-snooze-coffee) | Snooze Coffee | CAFE | Arad | Cafenea |
| [459](https://www.visitarad.ro/ro/harta-locatie/459-cafecito) | Cafecito | CAFE | Arad | Cafenea |
| [460](https://www.visitarad.ro/ro/harta-locatie/460-tazze-pazze) | Tazze Pazze | CAFE | Arad | Cafenea |
| [461](https://www.visitarad.ro/ro/harta-locatie/461-moo-coffee) | MOO Coffee | CAFE | Arad | Cafenea |
| [462](https://www.visitarad.ro/ro/harta-locatie/462-zoz-coffee) | ZOZ Coffee | CAFE | Arad | Cafenea |
| [463](https://www.visitarad.ro/ro/harta-locatie/463-noor) | Noor | CAFE | Arad | Cofetărie |
| [465](https://www.visitarad.ro/ro/harta-locatie/465-mocsa-speciality-coffee) | Mocsa Speciality Coffee | CAFE | Arad | Cafenea |
| [81](https://www.visitarad.ro/ro/harta-locatie/81-euphoria-biergarten) | Euphoria Biergarten | RESTAURANT | Arad | Restaurant |
| [86](https://www.visitarad.ro/ro/harta-locatie/86-restaurant-ratio) | Restaurant Rațio | RESTAURANT | Arad | Restaurant |
| [87](https://www.visitarad.ro/ro/harta-locatie/87-cocosul-de-aur) | Cocoșul de Aur | RESTAURANT | Arad | Restaurant |
| [89](https://www.visitarad.ro/ro/harta-locatie/89-restaurantul-bucatarul-meserias) | Restaurantul „Bucătarul meseriaș” | RESTAURANT | Arad | Fast food |
| [98](https://www.visitarad.ro/ro/harta-locatie/98-joys-pub) | Joy's Pub | RESTAURANT | Arad | Pub |
| [153](https://www.visitarad.ro/ro/harta-locatie/153-pizzeria-ornella) | Pizzeria Ornella | RESTAURANT | Arad | Pizzerie |
| [157](https://www.visitarad.ro/ro/harta-locatie/157-cuibul-cocorilor) | Cuibul Cocorilor | RESTAURANT | Arad | Pizzerie |
| [158](https://www.visitarad.ro/ro/harta-locatie/158-piccolo-bistro) | Piccolo Bistro | RESTAURANT | Arad | Fast food |
| [159](https://www.visitarad.ro/ro/harta-locatie/159-fast-food-express) | Fast Food Express | RESTAURANT | Arad | Fast food |
| [165](https://www.visitarad.ro/ro/harta-locatie/165-big-chicken) | Big Chicken | RESTAURANT | Arad | Fast food |
| [171](https://www.visitarad.ro/ro/harta-locatie/171-irish-pub) | Irish Pub | RESTAURANT | Arad | Pub |
| [240](https://www.visitarad.ro/ro/harta-locatie/240-hang-zhou) | Hang Zhou | RESTAURANT | Arad | Restaurant |
| [241](https://www.visitarad.ro/ro/harta-locatie/241-pizzeria-la-strada) | Pizzeria La Strada | RESTAURANT | Arad | Pizzerie |
| [242](https://www.visitarad.ro/ro/harta-locatie/242-casa-jelen) | Casa Jelen | RESTAURANT | Arad | Restaurant |
| [246](https://www.visitarad.ro/ro/harta-locatie/246-restaurant-orizont) | Restaurant Orizont | RESTAURANT | Arad | Restaurant |
| [247](https://www.visitarad.ro/ro/harta-locatie/247-pizzeria-boccaccio) | Pizzeria Boccaccio | RESTAURANT | Arad | Pizzerie |
| [262](https://www.visitarad.ro/ro/harta-locatie/262-pizza-drive) | Pizza Drive | RESTAURANT | Arad | Pizzerie |
| [263](https://www.visitarad.ro/ro/harta-locatie/263-angelis-food) | Angeli's Food | RESTAURANT | Arad | Fast food |
| [264](https://www.visitarad.ro/ro/harta-locatie/264-restaurant-orhideea) | Restaurant Orhideea | RESTAURANT | Arad | Restaurant |
| [266](https://www.visitarad.ro/ro/harta-locatie/266-mondo-pizza) | Mondo Pizza | RESTAURANT | Arad | Pizzerie |
| [267](https://www.visitarad.ro/ro/harta-locatie/267-pizzeria-milano) | Pizzeria Milano | RESTAURANT | Arad | Pizzerie |
| [269](https://www.visitarad.ro/ro/harta-locatie/269-apetit-bistro) | Apetit Bistro | RESTAURANT | Arad | Restaurant |
| [271](https://www.visitarad.ro/ro/harta-locatie/271-bunatati-de-halmagiu) | Bunătăți de Hălmagiu | RESTAURANT | Arad | Fast food |
| [274](https://www.visitarad.ro/ro/harta-locatie/274-cinecitta) | Cinecitta | RESTAURANT | Arad | Restaurant |
| [275](https://www.visitarad.ro/ro/harta-locatie/275-michelangelo) | Michelangelo | RESTAURANT | Arad | Pizzerie |
| [277](https://www.visitarad.ro/ro/harta-locatie/277-restaurant-bucegi) | Restaurant Bucegi | RESTAURANT | Arad | Restaurant |
| [281](https://www.visitarad.ro/ro/harta-locatie/281-restaurant-km-0) | Restaurant Km 0 | RESTAURANT | Arad | Restaurant |
| [282](https://www.visitarad.ro/ro/harta-locatie/282-papa-bun) | Papa Bun | RESTAURANT | Arad | Fast food |
| [289](https://www.visitarad.ro/ro/harta-locatie/289-corso-caffe-cuisine) | CORSO caffe & cuisine | RESTAURANT | Arad | Restaurant |
| [294](https://www.visitarad.ro/ro/harta-locatie/294-restaurant-ema-del-mar) | Restaurant Ema del Mar | RESTAURANT | Arad | Restaurant |
| [300](https://www.visitarad.ro/ro/harta-locatie/300-vintage-pub-caffe) | Vintage Pub-Caffe | RESTAURANT | Arad | Pub |
| [301](https://www.visitarad.ro/ro/harta-locatie/301-restaurant-carolina) | Restaurant Carolina | RESTAURANT | Arad | Restaurant |
| [306](https://www.visitarad.ro/ro/harta-locatie/306-eclipse) | Eclipse | RESTAURANT | Arad | Pub |
| [360](https://www.visitarad.ro/ro/harta-locatie/360-the-premiere) | The Premiere | RESTAURANT | Arad | Restaurant |
| [367](https://www.visitarad.ro/ro/harta-locatie/367-restaurant-damici) | Restaurant D'Amici | RESTAURANT | Arad | Restaurant |
| [373](https://www.visitarad.ro/ro/harta-locatie/373-la-bottega-beergrill) | La Bottega Beer&Grill | RESTAURANT | Arad | Restaurant |
| [377](https://www.visitarad.ro/ro/harta-locatie/377-nissaras) | Nissara's | RESTAURANT | Arad | Restaurant |
| [379](https://www.visitarad.ro/ro/harta-locatie/379-pizza-ruby) | Pizza Ruby | RESTAURANT | Arad | Pizzerie |
| [381](https://www.visitarad.ro/ro/harta-locatie/381-pizza-vero-amore) | Pizza Vero Amore | RESTAURANT | Arad | Pizzerie |
| [429](https://www.visitarad.ro/ro/harta-locatie/429-spark-bistro) | Spark Bistro | RESTAURANT | Arad | Bistro |
| [464](https://www.visitarad.ro/ro/harta-locatie/464-focaccia-romana) | Focaccia Romana | RESTAURANT | Arad | Bistro |
| [13](https://www.visitarad.ro/ro/harta-locatie/13-ansamblul-castelului-solymosy) | Ansamblul Castelului Solymosy | ATTRACTION | Ineu | Cetăți și castele |
| [47](https://www.visitarad.ro/ro/harta-locatie/47-cetatea-deznei) | Cetatea Deznei | ATTRACTION | Dezna | Cetăți și castele |
| [194](https://www.visitarad.ro/ro/harta-locatie/194-castelul-regal) | Castelul Regal | ATTRACTION | Săvârșin | Cetăți și castele |
| [236](https://www.visitarad.ro/ro/harta-locatie/236-castelul-konopi) | Castelul Konopi | ATTRACTION | Odvoș | Cetăți și castele |
| [237](https://www.visitarad.ro/ro/harta-locatie/237-castelul-conop) | Castelul Conop | ATTRACTION | Conop | Cetăți și castele |
| [330](https://www.visitarad.ro/ro/harta-locatie/330-cetatea-de-la-soimos) | Cetatea de la Șoimoș | ATTRACTION | Lipova | Cetăți și castele |
| [335](https://www.visitarad.ro/ro/harta-locatie/335-cetatea-siriei) | Cetatea Șiriei | ATTRACTION | Șiria | Cetăți și castele |
| [338](https://www.visitarad.ro/ro/harta-locatie/338-cetatea-ineului) | Cetatea Ineului | ATTRACTION | Ineu | Cetăți și castele |
| [52](https://www.visitarad.ro/ro/harta-locatie/52-cladirea-convict-ului) | Clădirea Convict-ului | ATTRACTION | Sântana | Clădiri reprezentative |
| [424](https://www.visitarad.ro/ro/harta-locatie/424-casa-urbariala) | Casa Urbarială | ATTRACTION | Sântana | Clădiri reprezentative |
| [8](https://www.visitarad.ro/ro/harta-locatie/8-biserica-din-lemn-troas) | Biserica din lemn Troaș | ATTRACTION | Troaș | Biserici |
| [31](https://www.visitarad.ro/ro/harta-locatie/31-manastirea-feredeu) | Mănăstirea Feredeu | ATTRACTION | Șiria | Biserici |
| [32](https://www.visitarad.ro/ro/harta-locatie/32-ansamblul-manastirii-adormirea-maicii-domnului-bodrogul-nou) | Ansamblul Mănăstirii „Adormirea Maicii Domnului” Bodrogul Nou | ATTRACTION | Zădăreni | Biserici |
| [33](https://www.visitarad.ro/ro/harta-locatie/33-manastirea-bezdin) | Mănăstirea Bezdin | ATTRACTION | Secusigiu | Biserici |
| [34](https://www.visitarad.ro/ro/harta-locatie/34-biserica-romano-catolica-duminica-sfintei-treimi) | Biserica Romano-Catolică ” Duminica Sfintei Treimi” | ATTRACTION | Pecica | Biserici |
| [38](https://www.visitarad.ro/ro/harta-locatie/38-biserica-de-lemn-din-julita) | Biserica de lemn din Julița | ATTRACTION | Julița | Biserici |
| [204](https://www.visitarad.ro/ro/harta-locatie/204-biserica-romano-catolica) | Biserica Romano-Catolică | ATTRACTION | Vinga | Biserici |
| [206](https://www.visitarad.ro/ro/harta-locatie/206-biserica-de-lemn-din-corbesti) | Biserica de lemn din Corbești | ATTRACTION | Corbești | Biserici |
| [207](https://www.visitarad.ro/ro/harta-locatie/207-biserica-de-lemn-din-bodesti) | Biserica de lemn din Bodești | ATTRACTION | Bodești | Biserici |
| [208](https://www.visitarad.ro/ro/harta-locatie/208-biserica-de-lemn-de-la-luncsoara) | Biserica de lemn de la Luncșoara | ATTRACTION | Luncșoara | Biserici |
| [209](https://www.visitarad.ro/ro/harta-locatie/209-biserica-de-lemn-din-cristesti) | Biserica de lemn din Cristești | ATTRACTION | Cristești | Biserici |
| [210](https://www.visitarad.ro/ro/harta-locatie/210-biserica-de-lemn-din-tisa) | Biserica de lemn din Tisa | ATTRACTION | Tisa | Biserici |
| [211](https://www.visitarad.ro/ro/harta-locatie/211-biserica-de-lemn-din-ionesti) | Biserica de lemn din Ionești | ATTRACTION | Ionești | Biserici |
| [212](https://www.visitarad.ro/ro/harta-locatie/212-biserica-de-lemn-din-tarmure) | Biserica de lemn din Țărmure | ATTRACTION | Țărmure | Biserici |
| [309](https://www.visitarad.ro/ro/harta-locatie/309-biserica-de-lemn-din-grosii-noi) | Biserica de lemn din Groșii Noi | ATTRACTION | Bârzava | Biserici |
| [326](https://www.visitarad.ro/ro/harta-locatie/326-biserica-de-lemn-din-rosia-noua) | Biserica de lemn din Roșia Nouă | ATTRACTION | Roșia Nouă | Biserici |
| [336](https://www.visitarad.ro/ro/harta-locatie/336-basilica-maria-radna) | Basilica Maria Radna | ATTRACTION | Lipova | Biserici |
| [343](https://www.visitarad.ro/ro/harta-locatie/343-biserica-de-lemn-din-budesti) | Biserica de lemn din Budești | ATTRACTION | Budești | Biserici |
| [413](https://www.visitarad.ro/ro/harta-locatie/413-biserica-de-lemn-izvorul-tamaduirii-ineu) | Biserica de lemn „Izvorul Tămăduirii” Ineu | ATTRACTION | Ineu | Biserici |
| [415](https://www.visitarad.ro/ro/harta-locatie/415-biserica-de-lemn-din-iercoseni) | Biserica de lemn din Iercoșeni | ATTRACTION | Șilindia | Biserici |
| [436](https://www.visitarad.ro/ro/harta-locatie/436-biserica-ortodoxa-adormirea-maicii-domnului) | Biserica Ortodoxă „Adormirea Maicii Domnului” | ATTRACTION | Lipova | Biserici |
| [453](https://www.visitarad.ro/ro/harta-locatie/453-biserica-evanghelica-luterana-slovaca) | Biserica evanghelică luterană slovacă | ATTRACTION | Nădlac | Biserici |
| [72](https://www.visitarad.ro/ro/harta-locatie/72-ansamblul-sculptural-din-siria) | Ansamblul sculptural din Șiria | ATTRACTION | Șiria | Monumente |
| [195](https://www.visitarad.ro/ro/harta-locatie/195-monumentul-sfintei-treimi) | Monumentul Sfintei Treimi | ATTRACTION | Vinga | Monumente |
| [196](https://www.visitarad.ro/ro/harta-locatie/196-tabara-de-sculptura) | Tabăra de sculptură | ATTRACTION | Căsoaia | Monumente |
| [202](https://www.visitarad.ro/ro/harta-locatie/202-fantana-cu-apa-buna) | Fântâna cu apă bună | ATTRACTION | Zăbrani | Monumente |
| [203](https://www.visitarad.ro/ro/harta-locatie/203-monumentul-eroilor-pro-patria) | Monumentul Eroilor „Pro Patria” | ATTRACTION | Almaș | Monumente |
| [226](https://www.visitarad.ro/ro/harta-locatie/226-monumentul-lui-ioan-buteanu) | Monumentul lui Ioan Buteanu | ATTRACTION | Gurahonț | Monumente |
| [227](https://www.visitarad.ro/ro/harta-locatie/227-bustul-lui-sever-bocu) | Bustul lui Sever Bocu | ATTRACTION | Lipova | Monumente |
| [232](https://www.visitarad.ro/ro/harta-locatie/232-monumentul-lui-gelu-glad-si-menumorut) | Monumentul lui Gelu, Glad și Menumorut | ATTRACTION | Macea | Monumente |
| [234](https://www.visitarad.ro/ro/harta-locatie/234-ansamblul-monumental-pavel-mercea) | Ansamblul monumental „Pavel Mercea” | ATTRACTION | Macea | Monumente |
| [333](https://www.visitarad.ro/ro/harta-locatie/333-monumentul-eroilor-de-la-paulis) | Monumentul eroilor de la Păuliș | ATTRACTION | Păuliș | Monumente |
| [29](https://www.visitarad.ro/ro/harta-locatie/29-schitul-sfintii-apostoli-petru-si-pavel) | Schitul „Sfinții Apostoli Petru și Pavel” | ATTRACTION | Moneasa | Stațiunea Moneasa |
| [65](https://www.visitarad.ro/ro/harta-locatie/65-ruinele-cuptorului-de-topit-fier) | Ruinele cuptorului de topit fier | ATTRACTION | Moneasa | Stațiunea Moneasa |
| [80](https://www.visitarad.ro/ro/harta-locatie/80-situl-arheologic-manastirea-bizere) | Situl arheologic „Mănăstirea Bizere” | ATTRACTION | Frumușeni | Vestigii arheologice |
| [225](https://www.visitarad.ro/ro/harta-locatie/225-ruinele-unei-bazilici-romanice) | Ruinele unei bazilici romanice | ATTRACTION | Vladimirescu | Vestigii arheologice |
| [361](https://www.visitarad.ro/ro/harta-locatie/361-sageata-verde) | Săgeata Verde | ATTRACTION | Ghioroc | Săgeata Verde |
| [422](https://www.visitarad.ro/ro/harta-locatie/422-bazarul-turcesc-din-lipova) | Bazarul Turcesc din Lipova | ATTRACTION | Lipova | Obiective turistice de pe Drumul Vinului |
| [441](https://www.visitarad.ro/ro/harta-locatie/441-monumentul-lui-czaran-gyula) | Monumentul lui Czárán Gyula | ATTRACTION | Moneasa | Stațiunea Moneasa |
| [39](https://www.visitarad.ro/ro/harta-locatie/39-casa-memoriala-si-colectia-de-arta-eugenia-si-eugen-popa) | Casa memorială și colecția de artă „Eugenia și Eugen Popa” | MUSEUM | Săvârșin | Muzee și Case memoriale |
| [40](https://www.visitarad.ro/ro/harta-locatie/40-casa-memoriala-iosif-conta) | Casa memorială „Iosif Conta” | MUSEUM | Bârzava | Muzee și Case memoriale |
| [61](https://www.visitarad.ro/ro/harta-locatie/61-expozitia-de-caricaturi-stefan-popa-popas) | Expoziția de caricaturi „Ștefan Popa Popa's” | MUSEUM | Macea | Muzee și Case memoriale |
| [63](https://www.visitarad.ro/ro/harta-locatie/63-muzeul-adam-muller-guttenbrunn) | Muzeul „Adam Müller Guttenbrunn” | MUSEUM | Zăbrani | Muzee și Case memoriale |
| [187](https://www.visitarad.ro/ro/harta-locatie/187-muzeul-crisului-alb) | Muzeul „Crișului Alb” | MUSEUM | Sebiș | Muzee și Case memoriale |
| [198](https://www.visitarad.ro/ro/harta-locatie/198-muzeul-etnografic-zestrea-satului) | Muzeul etnografic „Zestrea Satului” | MUSEUM | Covăsinț | Muzee și Case memoriale |
| [200](https://www.visitarad.ro/ro/harta-locatie/200-casa-memoriala-ioan-t-florea) | Casa memorială „Ioan T. Florea” | MUSEUM | Covăsinț | Muzee și Case memoriale |
| [332](https://www.visitarad.ro/ro/harta-locatie/332-muzeul-tramvaiului-electric) | Muzeul Tramvaiului Electric | MUSEUM | Ghioroc | Muzee și Case memoriale |
| [337](https://www.visitarad.ro/ro/harta-locatie/337-muzeul-orasenesc-lipova) | Muzeul Orășenesc Lipova | MUSEUM | Lipova | Muzee și Case memoriale |
| [390](https://www.visitarad.ro/ro/harta-locatie/390-muzeul-maria-radna) | Muzeul „Maria Radna” | MUSEUM | Lipova | Muzee și Case memoriale |
| [392](https://www.visitarad.ro/ro/harta-locatie/392-muzeul-viei-si-al-vinului) | Muzeul Viei și al Vinului | MUSEUM | Pâncota | Muzee și Case memoriale |
| [393](https://www.visitarad.ro/ro/harta-locatie/393-muzeul-etnografic-la-mosu-si-maica) | Muzeul etnografic „La Moșu și Maica” | MUSEUM | Măderat | Muzee și Case memoriale |
| [394](https://www.visitarad.ro/ro/harta-locatie/394-muzeul-almasi-bela) | Muzeul „Almási Béla” | MUSEUM | Dorobanți | Muzee și Case memoriale |
| [417](https://www.visitarad.ro/ro/harta-locatie/417-muzeul-etnografic-din-dud) | Muzeul etnografic din Dud | MUSEUM | Dud | Muzee și Case memoriale |
| [181](https://www.visitarad.ro/ro/harta-locatie/181-muzeul-memorial-ioan-slavici-si-emil-montia) | Muzeul Memorial „Ioan Slavici și Emil Monția” | MUSEUM | Șiria | Obiective turistice de pe Drumul Vinului |
| [421](https://www.visitarad.ro/ro/harta-locatie/421-muzeul-scolii-sabin-manuila-sambateni) | Muzeul Școlii Sabin Manuilă Sâmbăteni | MUSEUM | Sâmbăteni | Obiective turistice de pe Drumul Vinului |
| [442](https://www.visitarad.ro/ro/harta-locatie/442-muzeul-satului) | Muzeul Satului | MUSEUM | Moneasa | Stațiunea Moneasa |
| [10](https://www.visitarad.ro/ro/harta-locatie/10-pestera-sinesie) | Peștera Sinesie | NATURE | Săvârșin | Formațiuni naturale |
| [55](https://www.visitarad.ro/ro/harta-locatie/55-lacul-ghioroc) | Lacul Ghioroc | NATURE | Ghioroc | Lacul Ghioroc |
| [57](https://www.visitarad.ro/ro/harta-locatie/57-balta-soimos) | Balta Șoimoș | NATURE | Șoimoș | Formațiuni naturale |
| [327](https://www.visitarad.ro/ro/harta-locatie/327-despre-statiunea-moneasa) | Stațiunea Moneasa | NATURE | Moneasa | Stațiunea Moneasa |
| [362](https://www.visitarad.ro/ro/harta-locatie/362-parcul-eutopia) | Parcul Eutopia | NATURE | Vladimirescu | Formațiuni naturale |
| [363](https://www.visitarad.ro/ro/harta-locatie/363-punctul-de-belvedere) | Punctul de Belvedere | NATURE | Moneasa | Stațiunea Moneasa |
| [364](https://www.visitarad.ro/ro/harta-locatie/364-pestera-grota-ursului) | Peștera „Grota Ursului” | NATURE | Moneasa | Stațiunea Moneasa |
| [366](https://www.visitarad.ro/ro/harta-locatie/366-via-ferrata) | Via Ferrata | NATURE | Dezna | Stațiunea Moneasa |
| [409](https://www.visitarad.ro/ro/harta-locatie/409-parcul-de-sculptura-monumentala-din-casoaia) | Parcul de sculptură monumentală din Căsoaia | NATURE | Căsoaia | Obiective turistice de pe Drumul Vinului |
| [418](https://www.visitarad.ro/ro/harta-locatie/418-arborele-sequoia) | Arborele Sequoia | NATURE | Măderat | Obiective turistice de pe Drumul Vinului |
| [419](https://www.visitarad.ro/ro/harta-locatie/419-parcul-dendrologic-din-ineu) | Parcul dendrologic din Ineu | NATURE | Ineu | Obiective turistice de pe Drumul Vinului |
| [426](https://www.visitarad.ro/ro/harta-locatie/426-lacul-taut) | Lacul Tauț | NATURE | Tauț | Agrement și relaxare |
| [133](https://www.visitarad.ro/ro/harta-locatie/133-gradina-termala-dorobanti) | Grădina termală Dorobanți | PARK | Dorobanți | Ștranduri |
| [174](https://www.visitarad.ro/ro/harta-locatie/174-aqua-strand-moneasa) | Aqua Ștrand Moneasa | PARK | Moneasa | Stațiunea Moneasa |
| [175](https://www.visitarad.ro/ro/harta-locatie/175-strand-curtici) | Ștrand Curtici | PARK | Curtici | Ștranduri |
| [356](https://www.visitarad.ro/ro/harta-locatie/356-baile-lipova) | Băile Lipova | PARK | Lipova | Ștranduri |
| [385](https://www.visitarad.ro/ro/harta-locatie/385-zoo-land-arad) | Zoo Land Arad | PARK | Sâmbăteni | Agrement și relaxare |
| [391](https://www.visitarad.ro/ro/harta-locatie/391-tabara-ortodoxa) | Tabăra Ortodoxă | PARK | Covăsinț | Agrement și relaxare |
| [451](https://www.visitarad.ro/ro/harta-locatie/451-punctul-turistic-de-la-capruta) | Punctul turistic de la Căpruța | PARK | Căpruța | Agrement și relaxare |
| [395](https://www.visitarad.ro/ro/harta-locatie/395-crama-daiconi) | Crama Daiconi | WINERY | Miniș | Crama |
| [396](https://www.visitarad.ro/ro/harta-locatie/396-crama-dorvena) | Crama Dorvena | WINERY | Pâncota | Crama |
| [397](https://www.visitarad.ro/ro/harta-locatie/397-crama-villa-veche) | Crama Villa Veche | WINERY | Șiria | Crama |
| [403](https://www.visitarad.ro/ro/harta-locatie/403-crama-podrumu-lu-gurban) | Crama Podrumu' lu' Gurban | WINERY | Șiria | Crama |
| [404](https://www.visitarad.ro/ro/harta-locatie/404-crama-dradara) | Crama Dradara | WINERY | Mocrea | Crama |
| [405](https://www.visitarad.ro/ro/harta-locatie/405-crama-milo) | Crama Milo | WINERY | Cuvin | Crama |
| [410](https://www.visitarad.ro/ro/harta-locatie/410-pivnitele-birauas) | Pivnițele Birăuaș | WINERY | Ghioroc | Crama |
| [411](https://www.visitarad.ro/ro/harta-locatie/411-crama-halta-lupilor) | Crama „Halta Lupilor” | WINERY | Șiria | Crama |
| [423](https://www.visitarad.ro/ro/harta-locatie/423-crama-rab-wine) | Crama Rab Wine | WINERY | Miniș | Crama |
| [457](https://www.visitarad.ro/ro/harta-locatie/457-crama-elite-wine) | Crama Elite Wine | WINERY | Mâsca | Crama |
| [319](https://www.visitarad.ro/ro/harta-locatie/319-roca-bruna) | Roca Brună | RESTAURANT | Păuliș | Restaurant |
| [383](https://www.visitarad.ro/ro/harta-locatie/383-casa-pitoreasca) | Casa Pitorească | RESTAURANT | Vladimirescu | Restaurant |
| [435](https://www.visitarad.ro/ro/harta-locatie/435-conacul-sf-sava-brancovici) | Conacul Sf. Sava Brancovici | RESTAURANT | Ineu | Restaurant |
| [452](https://www.visitarad.ro/ro/harta-locatie/452-boulevard-cafe) | Boulevard Cafe | RESTAURANT | Lipova | Restaurant |

</details>

## Anexa B — trasee turistice (30, doar în export, nu în DB)
Fără coordonate (fiecare are o imagine cu harta pe fișă). Utile pentru T08 (strat „Trasee” pe hartă, desenat manual) sau T13 (sugestii în itinerar).

<details><summary>Lista traseelor (30)</summary>

| id | Traseu | Categorie | Pe scurt (marcaj, durată, distanță, dificultate) |
|---|---|---|---|
| [6](https://www.visitarad.ro/ro/traseu-turistic/6-ghioroc-valea-cladovei) | Ghioroc - valea Cladovei | Trasee montane - Munții Zărandului, zona de vest | Marcaj bandă albastră, durată 2h 30 minute, distanță 6,8 km, nivel scăzut de dificultate, accesibil pe întreg parcursul anului, nivel mediu … |
| [20](https://www.visitarad.ro/ro/traseu-turistic/20-covasant-creasta-principala) | Covăsânț - creasta principală | Trasee montane - Munții Zărandului, zona de vest | Marcaj bandă albastră, durată 1 oră și 30 de minute, distanță 4,4 km, nivel redus de dificultate, accesibil pe întreg parcursul anului |
| [136](https://www.visitarad.ro/ro/traseu-turistic/136-gara-halmagiu-muntele-gaina-creasta-principala) | Gara Hălmagiu - Muntele Găina (Creasta Principală) | Trasee Montane - Muntele Găina | Gara Hălmagiu – Hălmăgel – Culmea Găinii – Muntele Găina (Creasta Principală), marcaj bandă albastră, durată 7 ore, distanța de 22,9km, grad… |
| [138](https://www.visitarad.ro/ro/traseu-turistic/138-traseul-cicloturistic-arad-pecica) | Traseul cicloturistic „Arad-Pecica” | Trasee cicloturistice | Traseul pornește de la Centrul de Vizitare Ceala, unde se află administrația Parcului Natural Lunca Mureșului, în apropierea municipiului Ar… |
| [139](https://www.visitarad.ro/ro/traseu-turistic/139-arad-pecica) | Arad-Pecica | Plimbări cu barca | „Arad-Pecica”, pe Râul Mureș pentru eco-tururile în canoe sau caiac. Are o lungime de 25 km și poate fi parcurs în 3-4 ore. |
| [141](https://www.visitarad.ro/ro/traseu-turistic/141-traseul-de-biciclete-ceala-cetatea-turceasca) | Traseul de biciclete „Ceala - Cetatea Turcească” | Trasee cicloturistice | Are o lungime de 13,4 km și străbate Pădurea Ceala, având o formă relativ circulară și atinge principalele atracții turistice din această zonă (arboretul de chiparos, Râul Mureș, Cetatea turcească, cel mai gros arbore din pădure). |
| [192](https://www.visitarad.ro/ro/traseu-turistic/192-traseul-tematic-c-albastru-tuni-lastun) | Traseul tematic ”C” albastru (Tuni Lăstun’) | Trasee tematice | Traseu realizat împreună cu Asociația Rangerilor din România, este de dificultate scăzută, putând fi parcus cu ușurință și de către copii. Î… |
| [193](https://www.visitarad.ro/ro/traseu-turistic/193-traseu-ecvestru) | Traseu ecvestru | Trasee tematice | Se parcurge o porțiune extrem de frumoasă din Pădurea Ceala, în care vizitatorii (în special copiii) se pot relaxa și, cu puțin noroc, putân… |
| [310](https://www.visitarad.ro/ro/traseu-turistic/310-traseul-turistic-gara-halmagiu-halmagel-culmea-gainii-muntele-gaina-marcaj-banda-albastra-cu-o-lungime-de-circa-229-km) | Traseul turistic Gara Hălmagiu - Hălmăgel - Culmea Găinii - Muntele Găina (marcaj bandă albastră), cu o lungime de circa 22,9 km | Trasee Montane - Muntele Găina | Traseul turistic Gara Hălmagiu - Hălmăgel - Culmea Găinii - Muntele Găina Cruce (marcaj bandă albastră), cu o lungime de circa 22,9 km, pornește din gara CFR Hălmagiu, de lângă drumul E79/DN76 și continuă pe acesta circa 3,1 km spre centrul localității Hălmagiu, până la intersecția cu drumul DJ792F spre Hălmăgel. |
| [311](https://www.visitarad.ro/ro/traseu-turistic/311-dn7e68-petris-corbesti-rosia-noua-obarsia-creasta-principala-a-muntilor-zarand-km-0) | DN7/E68 – Petriș – Corbești – Roșia Nouă – Obârșia – Creasta Principală a Munților Zărand (km 0) | Trasee montane - Munții Zărandului, zona de est | Acest traseu este unul de dificultate medie, ce necesită un nivel de pregătire moderată, având o lungime de 22,3km pentru care sunt necesare cca. |
| [313](https://www.visitarad.ro/ro/traseu-turistic/313-rosia-noua-creasta-principala-a-muntilor-zarand-vf-tufari-662m) | Roșia Nouă – Creasta Principală a Munților Zărand (Vf. Tufari 662m) | — | Traseu montan de dificultate mică, care necesită o pregătire fizică moderată, accesibil pe toată durata anului, fiind necesar un echipament … |
| [314](https://www.visitarad.ro/ro/traseu-turistic/314-monumentul-turistilor-feredeu-creasta-principala-casoaia) | Monumentul Turiștilor – Feredeu – Creasta Principală – Căsoaia | Trasee montane - Munții Zărandului, zona de vest | Traseu montan de dificultate medie ce necesită un echipament de complexitate medie - marcaj bandă galbenă, lungime - 12,2 km, durată 4h 30 d… |
| [315](https://www.visitarad.ro/ro/traseu-turistic/315-saua-cazan-schitul-feredeu-creasta-principala) | Șaua Cazan – Schitul Feredeu – Creasta Principală | Trasee montane - Munții Zărandului, zona de vest | Traseu montan de dificultate mică care necesită un echipament de drumeție de complexitate medie, accesibil pe tot timpul anului - marcaj punct albastru, lungime cca, 1,2 km, durată 30 de minute. |
| [317](https://www.visitarad.ro/ro/traseu-turistic/317-hasmas-valea-hasmas-vf-plesu-creasta-principala) | Hășmaș – Valea Hășmaș – Vf. Pleșu (Creasta Principală) | Trasee Montane - munții Codru Moma | Traseu montan cu marcaj bandă galbenă, pe o distanță de 12,4 km, cu o durată de 4h 30 minute, pentru care este necesar un nivel mediu de echipare, fiind accesibil pe tot parcursul anului. |
| [318](https://www.visitarad.ro/ro/traseu-turistic/318-siria-cetatea-siria-saua-cazan) | Șiria – Cetatea Șiria – Șaua Cazan | Trasee montane - Munții Zărandului, zona de vest | Traseu montan cu un marcaj cruce albastră, pe o distanță de 7,5 km și o durată de 3 ore, cu un nivel mic de dificultate, pentru care este ne… |
| [324](https://www.visitarad.ro/ro/traseu-turistic/324-circuitul-cladirilor-masonice) | Circuitul Clădirilor Masonice | Trasee urbane | Palatul Iosif Steiner - Templul Masonic - Casa „Familei Tabacovici” - Școala cu clasele I-VIII Dimitrie Țichindeal - Palatul Fenyves - Palat… |
| [344](https://www.visitarad.ro/ro/traseu-turistic/344-circuitul-secesion) | Circuitul Secesion | Trasee urbane | Palatul Szantay - Palatul Cultural - Palatul Reinhard - Palatul Bohuș - Palatul Földes - Palatul Sârbesc 1. Palatul Szantay Impozantul imobi… |
| [345](https://www.visitarad.ro/ro/traseu-turistic/345-turul-neuman) | Turul Neuman | Trasee urbane | Palatul Neuman-Casa Neuman-Palatul Administrativ-Palatul Cultural-Sinagoga Neologă-Liceul Tehnologic „Francisc Neuman”-Stadionul Francisc Ne… |
| [346](https://www.visitarad.ro/ro/traseu-turistic/346-circuitul-marii-uniri) | Circuitul Marii Uniri | Trasee urbane | Palatul Administrativ - Palatul Unirii - Hotel „Crucea Albă” - Catedrala Ortodoxă Veche - Muzeul Memorial „Vasile Goldiș” - Casa Memorială „… |
| [348](https://www.visitarad.ro/ro/traseu-turistic/348-traseul-valea-muresului) | Traseul Valea Mureșului | Turism de o zi | Ora de plecare: 9:00 (Arad) Distanță Arad - Biserica de lemn din Julița: 80 km Timp aproximativ: 80 min Sosire: 10:20; Timp staționare: 20 minute; Oră plecare: 10:40. |
| [349](https://www.visitarad.ro/ro/traseu-turistic/349-traseul-halmagiu-halmagel) | Traseul Hălmagiu-Hălmăgel | Turism de o zi | Ora de plecare: 8:00 (Arad) Distanță Arad – Biserica de lemn din Țărmure: 142 km Timp aproximativ: 2h 30 Ora de plecare: 10:30; timp de staționare: 20 de minute; ora de plecare: 10:50 Biserica de lemn din Țărmure Adresă: Țărmure 317172, comuna Hălmagiu [date de contact pe fișa sursă] Descriere: Biserica de lemn din Țărmure este un monument reprezentativ al arhitecturii ecleziastice de la sfârșitul sec. |
| [350](https://www.visitarad.ro/ro/traseu-turistic/350-traseul-ineu-tarnova-casoaia) | Traseul Ineu-Târnova-Căsoaia | Turism de o zi | Ora de plecare: 9:00 (Arad) Distanță Arad-Cetatea Ineului: 60 km Timp aproximativ: 1h 15 minute Ora de sosire: 10:15; timp de staționare: 30 de minute; ora de plecare: 10:45 Cetatea Ineului Adresa: Calea Traian Descriere: A fost, pe rând, fortăreață întărită de Iancu de Hunedoara, posesiune a lui Mihai Viteazu, apoi a fost cucerită de turci și a devenit garnizoană a unui regiment grăniceresc austriac. |
| [351](https://www.visitarad.ro/ro/traseu-turistic/351-traseul-macea-dorobanti) | Traseul Macea-Dorobanți | Turism de o zi | Plecare din Arad: 9:00 Distanță Arad - Parcul dendrologic din Macea: 25 de km Timp aproximativ: 35 de minute Ora de sosire: 9:35; timp de staționare: 1h 30 de minute; ora de plecare: 11:05 Parcul dendrologic de la Macea Adresă: 317210, Macea [date de contact pe fișa sursă] Descriere: Se întinde pe o suprafață de 21,5 ha și se constituie azi ca o importantă bază didactică și de cercetare pentru studeți și corpul didactic de la facultățile de profil ale Universității de Vest „Vasile Goldiș” din Arad. |
| [352](https://www.visitarad.ro/ro/traseu-turistic/352-traseul-paulis-ghioroc-covasant-siria) | Traseul Păuliș-Ghioroc-Covăsânț-Șiria | Turism de o zi | Ora de plecare: 9:00 (Arad) Distanță Arad – Muzeul Școlii „Sabin Manuilă” Sâmbăteni: 18 km Timp aproximativ: 25 de minute Sosire: 9:25; Timp staționare: 20 de minute; Ora de plecare: 9:45 Muzeul Școlii „Sabin Manuilă” Sâmbăteni Adresa: Sat Sâmbăteni, nr. |
| [353](https://www.visitarad.ro/ro/traseu-turistic/353-traseul-sebis-moneasa) | Traseul Sebiș-Moneasa | Turism de o zi | TRASEUL SEBIȘ-DEZNA-MONEASA Ora plecare de la Arad: 9:00 Distanță Arad – Muzeul „Crișului Alb”: 85 km Durată aproximativă: 1h 30 de minute Ora de sosire: 10:30; timp de staționare: 20 de minute; ora de plecare: 10:50 Muzeul Crișului Alb Adresa: strada Parcul Libertății, Sebiș [date de contact pe fișa sursă] Descriere: În cadrul muzeului vizitatorii pot vedea o parte din colecția de obiecte istorice și etnografice adunate de un harnic colectiv local, expuse într-un mod sistematic și bine individualizate; obiectele arheologice expuse rezultă din săpăturile efectuate în jur, provenind din epoca paleoliticului și până în epoca feudalismului dezvoltat, depistate mai ales la Iosășel, Berindia, Chisindia, Cetatea Deznei etc. |
| [354](https://www.visitarad.ro/ro/traseu-turistic/354-traseul-pecica-vinga) | Traseul Pecica-Vinga | Turism de o zi | TRASEUL PECICA-NĂDLAC-ZĂDĂRENI-VINGA Ora de plecare: 9:00 (Arad) Distanță Arad-Ferma de bivoli: 23 km Timp aproximativ: 30 de minute Sosire: 9:30; Timp de staționare: 20 de minute; Ora de plecare: 9:50 Ferma de bivoli [date de contact pe fișa sursă] Adresa: Strada 339, Pecica Istoric Cea mai nouă atracție turistică a orașului Pecica, Ferma de bivoli, a fost inaugurată la data de 12 mai 2012, în vecinătatea Parcului Natural „Lunca Mureșului”, în apropiere de centrul orașului. |
| [355](https://www.visitarad.ro/ro/traseu-turistic/355-traseul-lipova-zabrani) | Traseul Lipova-Zăbrani | Turism de o zi | Ora de plecare: 9:00 (Arad) Distanță Arad-Basilica Maria Radna - 34 km Timp aproximativ – 40 minute Sosire: 9:40; Timp staționare: 45 de minute; Ora de plecare: 10:25 Basilica Maria Radna Adresa: Piața Avram Iancu, nr. |
| [365](https://www.visitarad.ro/ro/traseu-turistic/365-traseul-turistic-dezna-ruinele-cetatii-dezna-marcaj-banda-galbena) | Traseul turistic Dezna – Ruinele Cetății Dezna (marcaj bandă galbenă) | Trasee Montane - munții Codru Moma | Traseul turistic Dezna – Ruinele Cetății Dezna (marcaj bandă galbenă), cu o lungime de cca. |
| [447](https://www.visitarad.ro/ro/traseu-turistic/447-drumul-marei) | Drumul Marei | Drumul Marei (Lipova-Trecutul Viu) | DRUMUL MAREI TRASEU TURISTIC- LITERAR INSPIRAT DIN ROMANUL MARA de IOAN SLAVICI (08.01.1848-17.08.1925) În romanul Mara, Ioan Slavici, descr… |
| [450](https://www.visitarad.ro/ro/traseu-turistic/450-promenada-pe-faleza-muresului) | Promenadă pe Faleza Mureșului | Trasee urbane | Punct de plecare: Colț faleză în zona Bisericii Maranata 👉 Traseu: - Asociația Club Sportiv West - Sala Polivalentă - Parcul Europa - Baza … |

</details>
