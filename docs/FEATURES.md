# Definirea funcționalităților — ce face aplicația, pentru cine, cu ce reguli

Document de referință pentru implementare: fiecare funcționalitate are **cine** o folosește, **unde** (aplicația mobilă / panourile web), **ce poate face**, **regulile** și **ecranele**. Task-urile din `docs/PLAN.md` implementează exact ce e aici; `docs/API.md` dă contractul.

## 0. Principii de produs
**Decizie (7 nov): produsul e aplicația mobilă.** Vizitatorii și localnicii folosesc **doar aplicația de telefon** — **Android (APK/AAB)** și **iOS (bundle din Xcode)**, construite cu Capacitor din același cod Vue. **Web-ul** (`https://aradexperience.site`) e site-ul de prezentare al aplicației: **prezentarea** (ce e AradExperience, funcțiile, rolurile, „Descarcă aplicația” Android/iOS, contact), **Comunitate** doar de citit, **Confidențialitate** și **panourile** Primăriei, firmelor și Adminului (`/city/*`, `/business/*`, `/admin/*`, cu login-ul lor W0). Paginile publice web din designul final (W5–W15: agendă, obiective, hartă, oferte, comunitate, chat, planificator, Contul meu, pagina publică a firmei) **nu se mai fac**; conținutul lor există doar în aplicație. Story-urile de mai jos se citesc așa: „FE mobil” = aplicația; „FE web” = doar panouri sau site-ul de prezentare. **Rutele nu mai au prefix** (`/m`, `/w` au dispărut în T20): web-ul și aplicația mobilă sunt două build-uri complet separate, cu același backend (`docs/API.md` §Rute FE). **Actualizare (7 nov, T23):** un cont personal conectat pe web (Vizitator / Localnic, cu telefon + cod, tab-ul „Cont personal” din W0) vede pe web și paginile aplicației: W1 pagina lui de start, W5/W6 evenimente + bilete, W9 hartă cu transport live, W11 oferte, W12 comunitate cu înscriere, W14 Contul meu, W15 pagina firmei. Pentru cei neconectați web-ul rămâne prezentarea; obiectivele cu ghid, chat-ul, planificatorul și transportul (S8) rămân doar în aplicație.
- **O singură aplicație, cinci roluri.** Vizitator și Localnic folosesc **doar aplicația mobilă** (Android + iOS, în oraș, pe teren). Firma, Primăria și Adminul folosesc **web-ul** (panouri cu tabele, formulare cu previzualizarea telefonului, statistici); pe mobil au doar operațiunile de teren: firma validează coduri la casă, Primăria confirmă prezențe. **Voluntarul** (cont creat de Primărie) folosește doar mobilul: acțiunile lui, scanner, mesaje. Împărțirea exactă mobil / web public / panouri: tabelul din `design/final/README.md`.
- **Primăria = administrator complet** al conținutului orașului (agendă, acțiuni, validare, voluntari, firme partenere, obiective & ghiduri). **Adminul platformei** are în plus moderare pe tot conținutul, utilizatori și setări. Firmele și voluntarii **nu își fac singuri conturi** active: firma se poate înregistra, dar conținutul ei rămâne ciornă până o verifică Primăria/Adminul; voluntarii sunt creați doar de Primărie.
- **Bucla de valoare:** Primăria publică acțiuni → localnicii participă → Primăria confirmă cu QR → puncte → clasament + oferte la firme locale → firmele au clienți → firmele publică evenimente/oferte → vizitatorii au ce face. Fiecare rol primește ceva și dă ceva.
- **Date reale, etichetate.** Evenimentele instituțiilor sunt reale (link spre organizator, `EXTERNAL`); cele cu bilete în aplicație (`IN_APP`) sunt marcate vizibil „Bilete în aplicație / Doar în AradExperience”. Ce e inventat pentru demo e marcat `is_demo` și „(demo)”.
- **Totul în română cu diacritice**, EN opțional. Textele de ghid sunt scrise pentru citit cu voce tare.
- **Ecranele** sunt cele din `design/final/` (aplicația din `mobile.html`; din `web.html` doar panourile și landing-ul, ca bază pentru site-ul de prezentare); prototipul e funcțional și arată și comportamentul (stări, sheet-uri, sincronizarea admin ↔ aplicație).

## 1. Conturi și roluri (T03)
| | Vizitator | Localnic | Firmă locală | Primărie | Admin |
|---|---|---|---|---|---|
| Se înregistrează singur | da | da | da (contul e **neverificat** până la Admin) | nu (seed/admin) | nu (seed) |
| Evenimente, locuri, hartă, chat, itinerar, oferte | da | da | da | da | da |
| Bilete în aplicație, salvate | da | da | — | — | — |
| Înscriere la acțiuni comunitare, puncte, clasament | da (poate strânge puncte) | **da** (publicul principal) | — | — | — |
| Publică oferte, evenimente, anunțuri; validează coduri | — | — | **da** | — | da (orice) |
| Creează acțiuni, confirmă participanți, clasament | — | — | — | **da** | da |
| Verifică firme, moderează conținut, utilizatori, obiective & ghiduri | — | — | — | — | **da** |
**GDPR (8 nov):** orice cont creat de utilizator (personal sau firmă, cu email + parolă) cere bifa „Am citit și accept Termenii și condițiile și Politica de confidențialitate” — fără ea butonul arată eroarea și BE răspunde 400; linkurile deschid textele într-o fereastră peste formular (nu se pierde ce ai scris). BE păstrează momentul și versiunea acceptată (`users.terms_accepted_at`, `terms_version`). Textele sunt publice pe web la `/terms` și `/privacy` (în subsolul site-ului).
**Până la lansare (11 nov): doar conturile demo** (`DEMO_ONLY`): login-ul arată „AradExperience nu e încă live” și butoane pentru toate conturile demo; „Cont nou” și „Am uitat parola” sunt ascunse și refuzate de backend. Reguli (9 nov, în locul telefonului + SMS din T21): **toate conturile intră cu e-mail + parolă** (min. 8); „Cont nou” cere numele, adresa, parola și rolul (Vizitator / Localnic), la „Cont nou” primești o singură dată un **cod de recuperare** (`XXXX-XXXX-XXXX`, de salvat); „Am uitat parola” = e-mail + codul de recuperare + parola nouă (intri direct și primești un cod nou). Dacă ai pierdut și codul, Adminul îți pune din panou o **parolă temporară**, pe care ți-o dă personal; la intrare aplicația te obligă să-ți alegi alta. În cont: „Schimbă parola” și „Cod de recuperare nou”. Conturile demo `@demo.ro` nu-și pot schimba parola. Pe web, „Intră ca vizitator” = un clic pe contul demo de vizitator. Voluntarii intră cu codul de la Primărie. JWT 24 h; rolul se alege la înregistrare (Vizitator/Localnic/Firmă) și se schimbă doar de Admin; ADMIN are acces peste tot. Ecrane: S12 (mobil), W0 (web). Profil S11 / W14 cu limbă și deconectare.

## 2. Evenimente (T06) — vizitator, localnic
- **Listă** cu filtre: perioadă (Azi / Weekendul acesta / Următoarele 7 zile / dată), categorie (Concerte, Teatru și film, Familie, Expoziții, Sport, În aer liber, Târguri, Gastronomie), preț (gratuite / bilete în aplicație / pe site-ul organizatorului), organizator (instituții / firme / Primărie), distanță („lângă mine”, rază). Sortare după dată sau distanță. Paginare (web 9/pagină, mobil infinite scroll).
- **Card**: poză, dată+oră, titlu, loc + distanță, preț sau „Gratuit”, badge **🔥 Popular** (`participantsCount ≥ 50` sau `savesCount ≥ 20`), badge **Bilete în aplicație** (IN_APP) sau **Extern** (link), bookmark.
- **Detaliu**: descriere, organizator (link spre pagina firmei dacă e firmă), dată/ore, loc cu „Indicații” (hartă + traseu), preț, acces, **recenzii** (vezi §9), butoane: Salvează, Trimite (Web Share), **Adaugă în calendar** (fișier .ics + link „Google Calendar” fără login), Bilete / Înscrie-te / „Pe site-ul organizatorului”.
- **Salvate**: listă proprie (S1 tab / W14); salvarea e idempotentă.
- Reguli: se afișează doar `PUBLISHED`; evenimentele trecute ies din liste dar rămân în „Trecute” la bilete; distanța se calculează față de poziția utilizatorului sau centrul Aradului.
- Ecrane: S1/E6, S2, S3 · W1, W5, W6.

## 3. Bilete & înscrieri (T07) — vizitator, localnic
- `IN_APP`: alegi data (dacă sunt mai multe), cantități Adult / Copil, total → „plată” demonstrativă (nu există procesator) → bilet cu **cod + QR**, e-mail de confirmare simulat, apare în „Biletele mele” (Viitoare/Trecute), funcționează **offline** (cache local).
- `FREE`: același flux cu „Înscrie-te” (bilet gratuit, cod QR).
- `EXTERNAL`: doar link; nu se emite nimic.
- Organizatorul (firma / admin) poate **scana biletul la intrare** → `USED`, o singură dată.
- Reguli: capacitate (`capacity − participantsCount`), 409 când e plin; `participantsCount` crește la emitere; biletul nu se anulează în v1 (pitch: „ce urmează”).
- Ecrane: S4, S5, S6, S9, S10 · W6 (cutia de bilete), W14.

## 4. Obiective & ghid virtual (T05) — vizitator (și localnic)
- **Listă** de obiective (12 reale, vezi `docs/ARAD-DATA.md`) cu tip, durată de vizită, distanță, badge „Ghid · N puncte · M min”, filtre pe tip/tag.
- **Detaliu** = ghid: hero, program și tarife reale, parcare, „Ești aici” (dacă e în raza de 150 m), **bara audio** (text-to-speech din browser în ro-RO; play/pauză, următorul punct, viteză), lista punctelor cu text; „Indicații”, „Pune în program” (→ planificator), evenimentele de la locul respectiv.
- Reguli: `exteriorOnly` afișează avertisment „se vizitează doar din exterior” (Cetatea, Turnul de Apă); limba ghidului urmează limba aplicației (EN doar dacă există text EN).
- Admin: CRUD obiective și puncte (W25), opțional „Generează cu AI”.
- Ecrane: E3 · W7, W8, W25.

## 5. Hartă & indicații (T08) — toți
- Pin-uri pentru evenimente / oferte / obiective / acțiuni cu aceleași filtre ca listele; tap pe pin → card → „Arată traseul” (pe jos / mașină, OSRM) sau „Deschide”.
- „Indicații” de oriunde deschide harta centrată, cu traseu de la poziția curentă; buton „Deschide în Google Maps” (link, fără cheie).
- Reguli: fără poziție GPS → centrul Aradului; fără OSRM → linie dreaptă + estimare.
- **Poziția live (8 nov):** cât harta e deschisă GPS-ul precis se citește continuu (la 1–2 s, pe pauză în fundal); punctul albastru are săgeata direcției (GPS-ul în mers, busola pe loc). „Locația mea” te ține în centru până tragi de hartă (butonul devine albastru).
- **Punct ales pe hartă (8 nov):** apăsare lungă pe hartă → steag + card „Punctul ales pe hartă” cu „Trasee până aici” (Transport, `?to=pt:lat,lng`) și „Arată traseul”; în Transport, sub sugestii, „Alege punctul pe hartă” (`/map?pick=1`, o atingere alege). Pentru locurile pe care căutarea nu le găsește.
- **Harta se rotește (8 nov):** în aplicație harta e MapLibre GL (BSD; aceleași dale Esri ca rezerva Leaflet): rotire cu două degete, busola readuce nordul sus, a doua atingere pe „Locația mea” = harta în direcția de mers. Ordinea hărților: Google (cu cheie, site-ul) → MapLibre (WebGL) → Leaflet.
- Ecrane: S7, E4 · W1 (mini), W9.

## 6. Planificator de itinerar (T13) — vizitator
- Intrări: cât timp (3 h / jumătate de zi / o zi / 2 zile), data și ora de start, **transport** (pe jos / mașină / transport public), interese (chips), text liber.
- Ieșire: program cu opriri ordonate (obiective, pauze la oferte, evenimente din ziua aia), ore de sosire/plecare, durată, timp de deplasare între opriri, note; hartă cu traseu numerotat; la mașină, **parcări** (`parkingHint`); „Pornește ghidul” pentru oprirea curentă; Salvează (link cu `shareCode`), Regenerează, Trimite pe telefon, PDF (web).
- Reguli: doar id-uri din catalog; orele se normalizează (fără suprapuneri; respectă programul obiectivelor); durata totală ≤ timpul ales; fallback pre-generat dacă AI pică; ultimul itinerar salvat se poate redeschide fără cont (shareCode).
- Ecrane: E1, E2, E4 · W10.

## 7. Chat AI (T12) — toți
- Răspunde doar din evenimentele și locurile din aplicație (următoarele 14 zile), pune o întrebare de clarificare (chips) când lipsesc ziua/compania, întoarce carduri de evenimente; „Chat nou”.
- Reguli: fără plăți, fără date inventate; răspuns offline marcat când AI nu e disponibil; rate-limit.
- Ecrane: S8 · W13.

## 8. Oferte (T10) — vizitator, localnic ↔ firmă
- Listă cu categorii (Cafenele, Restaurante, „Făcut în Arad”, Evenimente, Cu puncte), distanță, rating-ul firmei; banner de campanie.
- **Revendicare** → cod `AX-O…` + QR, „Arată codul la casă”; o revendicare activă per ofertă per utilizator; `pointsPrice` → plata cu puncte la revendicare (sold insuficient → 409).
- **Firma validează** codul (scanner sau text) → `USED` o singură dată; vede istoric, statistici (afișări, folosite, plăți cu puncte).
- Reguli: oferta e vizibilă doar `PUBLISHED` și în perioada de valabilitate; firma neverificată → ofertele rămân `DRAFT`.
- Ecrane: S1b, S1c, S1g · W11, W15, W16, W19.

## 9. Recenzii (T06/T07, parte 2)
- După ce un eveniment a trecut, un utilizator cu bilet/înscriere (sau orice utilizator logat, pentru evenimente gratuite) poate lăsa **1–5 stele + text scurt**; media și numărul apar pe detaliul evenimentului și pe pagina firmei (media firmei = media evenimentelor + ofertelor ei).
- Reguli: o recenzie per utilizator per eveniment, editabilă; Admin poate ascunde.
- **Google (opțional, T17):** pentru obiective și firme care au `googlePlaceId`, se afișează rating-ul și până la 5 recenzii Google, cele mai bine notate primele (Places API, prin backend, cache 24 h, cu atribuire „Powered by Google”). Doar citire; fără sincronizare în sens invers (ar cere OAuth și nu merită la hackathon). Evenimentele din aplicație rămân doar în aplicație.
- Ecrane: S3, W6, W15.

## 10. Firme (T09) — firmă ↔ public
- Înregistrare ca firmă → cont `BUSINESS` + profil (nume, categorie, adresă pe hartă, descriere, program, contact) → **verificare de Admin** → conținutul devine public.
- Pagina publică: profil, oferte active, evenimente viitoare, anunțuri, hartă, recenzii.
- Panou: statistici (afișări, coduri folosite, plăți cu puncte, participanți), **Oferte / Evenimente / Anunțuri / Validează coduri / Profil**, activitate recentă.
- Anunțuri = scurte, fără dată (program, noutăți, angajări); apar pe pagina firmei și în feed-ul „lângă mine”.
- Ecrane: S11b–d, E5 · W4, W15–W19 · Admin W23.

## 11. Comunitate & puncte (T11) — localnic ↔ Primărie
- Primăria creează **acțiuni** (titlu, categorie, zi/interval, loc pe hartă, puncte, locuri, descriere) → localnicii se **înscriu** (cod `AX-C…` + QR, anulare posibilă) → pe teren, Primăria **scanează QR-ul** (sau confirmă din listă) → `CONFIRMED` + puncte acordate o singură dată → **clasament** lunar/anual (doar puncte câștigate) cu premii; punctele se **cheltuiesc** la oferte.
- Reguli: capacitate; o înscriere per acțiune; confirmarea e idempotentă; punctele se scriu doar prin `PointsService`; sold = suma tranzacțiilor; clasamentul e public; `NO_SHOW` pentru respinși.
- Ecrane: S1d–f, E7 · W2, W12, W20–W22.

## 12. Panourile web: Primărie și Admin (T11, T14)
- **Primăria** (`/city/*`): Panou (KPI, participare la acțiuni, activitate), Evenimente (agenda orașului; creează evenimente oficiale, ascunde), Acțiuni comunitare (creare cu puncte 30–100, locuri, voluntari alocați, poză), **Validare participanți** (listă per acțiune cu Confirmă/Respinge/Confirmă toți + cardul „Voluntarii care scanează”; fără scanner în web), Voluntari (creare cont cu cod SMS simulat, acțiuni alocate, unică folosință, suspendare, mesaj), Mesaje (conversații cu voluntarii), Clasament (lună/an, premii, export CSV), Firme partenere (creare cont + invitație, verificare/respingere a firmelor înregistrate singure, „Intră în cont”), Obiective & ghiduri (editare puncte de ghid, „Generează cu AI”).
- **Admin** (`/admin/*`): același panou + Conținut & moderare (publică/ascunde orice eveniment, ofertă, acțiune), Utilizatori (rol, ajustare puncte cu notă, dezactivare), Setări (praguri „Popular”, integrări, limbi).
- Toate formularele de creare au **previzualizare live** a cardului așa cum apare în aplicație.
- Ecrane: planșa web din `design/final/screens/sheet-web.png` (paginile 14–29).

## 13. Transport în comun (T19, mobil)
- Tab „Transport” în navbar. Destinație (căutare în obiective, stații și repere, sau sugestiile) → lista traseelor (tramvai sau autobuz: linie, urcare cu plecarea live, coborâre, durată; și pe jos) → alegi → harta cu tot drumul (pe jos + linie + pe jos), „Pornește călătoria” (simulare; cu GPS-ul pornit avansează singură la stații). Stații lângă tine cu plecările live, liniile (Tramvaie / Autobuze, câte vehicule circulă acum), pagina liniei (stațiile, „lângă tine”, vehiculele care vin).
- Căutarea destinației: listă derulantă sub câmp — cu câmpul gol cele mai populare (repere, obiective cu ghid, stații mari), apoi după primele litere scrise; fiecare loc cu insignele liniilor CTP care opresc lângă el (≤ 400 m). Aceeași listă e și în Căutare (S2), cu obiective și evenimente.
- Alte variante: cu bicicleta (stațiile bike sharing ale Primăriei: iei de la cea mai apropiată, lași lângă destinație) și cu mașina (parcarea cu plată Recons de lângă destinație, cu zona, tariful și dacă e cu plată acum). Scurtături spre harta cu liniile live, bicicletele și parcările; „Cum ajung” pe eveniment și obiectiv.
- Reguli: rețeaua și plecările sunt cele reale (CTP Arad / Telelink, atribuirea afișată); duratele de mers sunt estimate și se spune asta; din afara Aradului (peste 25 km) planul pornește din centru.

## 14. Voluntar (T18, mobil)
- Cont creat doar de Primărie (panoul web › Voluntari: nume, telefon pentru SMS, e-mail opțional, coordonator, acțiunile alocate, „unică folosință”); intră în aplicație cu codul de 6 cifre („Intră cu codul de voluntar” de pe ecranul de conectare). Are doar 3 tab-uri: **Acțiuni** (coordonatorul și contoarele; acțiunile alocate, cu lacăt până cu 30 min înainte de start, bifă verde când toți înscrișii sunt confirmați, „Acțiune încheiată” după ziua ei), **Scanează** (alege acțiunea; camera sau codul tastat; rezultat: confirmat +puncte / deja scanat / cod necunoscut / altă acțiune / încă închisă; scanările recente) și **Mesaje** (câte un chat de grup pentru fiecare acțiune, cu toți voluntarii alocați ei: text și poze din telefon; punct pe tab și număr pe chat pentru mesaje noi; Primăria nu e în chat). Restul aplicației nu e pentru el, iar la panoul web n-are acces.
- Primăria: Voluntari (KPI, Toți / Activi / Suspendați, cod de acces, acțiuni, coordonator, scanări, stare; „Acțiuni” = realocare, suspendă / reactivează), Voluntar nou (cu previzualizarea pe telefon și SMS-ul simulat); **fără mesaje în panou** (Primărie, Admin, firme); voluntarii apar și în Acțiuni comunitare (coloana „Voluntari”) și în Validare („Voluntarii care scanează”). Scanarea nu se face din web.
- Reguli: confirmarea acordă punctele o singură dată (aceeași confirmare ca la Primărie); cont de unică folosință expiră după ultima acțiune; contul suspendat nu mai intră și nu mai scanează.

## 15. Transversale
- **Aplicația nativă** Android + iOS (Capacitor; aplicația nu se publică pe web), offline pentru bilete și ultimul itinerar; **i18n** RO + EN + HU (interfața; conținutul din DB e în română; alegerea limbii e o listă derulantă în Profil, în Contul meu și în bara de sus a web-ului); **notificări** (în afara v1 — pitch); **hărți** Leaflet/OSM; **securitate**: JWT, roluri pe rute, coduri QR = doar text, fără date personale; **erori** ProblemDetail afișate în toast.
- **Aplicația mobilă vs web — nu sunt la fel:** aplicația (Android + iOS) are **toate** ecranele publice, pe rând, cu tab bar (Evenimente · Chat · Hartă · Bilete/Panou · Transport); biletele, salvatele și profilul sunt în aplicație. Web-ul are **doar** site-ul de prezentare (fără funcții pentru public, cu „Descarcă aplicația”) și **panourile** (tabele, formulare cu previzualizare, statistici) pentru Primărie, firme și Admin. Nu există echivalent web pentru ecranele publice (W5–W15, inclusiv „Contul meu” W14) — **în afară de T23**: pentru un cont personal conectat web-ul are evenimente + bilete, hartă cu transport, oferte, comunitate și Contul meu. Unde rulează fiecare: `docs/DEPLOY.md`.

## Ce NU e în v1 (de spus în pitch la „ce urmează”)
Plăți reale, anularea biletelor, notificări push, sincronizare cu Google Calendar (doar export .ics / link), conținutul (evenimente, ghiduri) tradus în EN / HU, recenzii la obiective, mesagerie firmă–client, rapoarte PDF pentru Primărie, trasee cu schimbare de linie în Transport, SMS real pentru voluntari.
