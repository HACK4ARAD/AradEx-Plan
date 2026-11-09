# Model de date (PostgreSQL)

Convenții: tabele și coloane `snake_case`, id-uri `BIGSERIAL`, timpi `TIMESTAMPTZ` (stocați UTC, afișați Europe/Bucharest),
bani `NUMERIC(10,2)` în RON, enum-uri ca `VARCHAR` validate în Java (`enum`), `created_at TIMESTAMPTZ NOT NULL DEFAULT now()` peste tot.
Fiecare tabel are migrarea lui în task-ul care îl introduce (`V{n}__{modul}.sql`), seed-ul în `V{n}_1__seed_{modul}.sql`; toate stau în `AradEx-Backend/app/src/main/resources/db/migration/`.
Nu se modifică o migrare deja aplicată pe `main` — se adaugă una nouă.

## Enum-uri
- `Role`: `VISITOR, LOCAL, BUSINESS, CITY_HALL, ADMIN, VOLUNTEER` (`VOLUNTEER` e în Java și în `SecurityConfig` — `/vol/**` — din T03; CHECK-ul din `users.role` îl primește în V15, T18). Emailurile din `users` se stochează cu litere mici (trim + lowercase); telefoanele în E.164 (`+40…`, T21).
- `BusinessCategory`: `CAFE, RESTAURANT, PRODUCER, WINERY, SHOP, OTHER`
- `PlaceType`: `ATTRACTION, MUSEUM, VENUE, WINERY, NATURE, PARK, RESTAURANT, CAFE`
- `EventCategory`: `CONCERT, THEATRE, FAMILY, EXHIBITION, SPORT, OUTDOOR, FAIR, FOOD`
- `OrganizerType`: `CITY, BUSINESS, ADMIN, EXTERNAL`
- `TicketType`: `FREE, IN_APP, EXTERNAL`
- `ContentStatus`: `DRAFT, PUBLISHED, HIDDEN` (evenimente/oferte/anunțuri)
- `TicketStatus`: `CONFIRMED, CANCELLED, USED`
- `RedemptionStatus`: `ISSUED, USED, CANCELLED`
- `ActionCategory`: `ENVIRONMENT, HEALTH, SOCIAL, CULTURE` (ca în design: Mediu, Sănătate, Social, Cultură)
- `ActionStatus`: `DRAFT, PUBLISHED, CANCELLED, DONE` (`DRAFT` = ciornă, vizibilă doar în panoul Primăriei)
- `RegistrationStatus`: `REGISTERED, CONFIRMED, CANCELLED, NO_SHOW`
- `PointsType`: `EARN_ACTION, SPEND_OFFER, ADJUST`
- `Transport`: `WALK, CAR, PUBLIC`
- `TransitMode`: `TRAM, BUS` (`transit_routes.mode`, T22)

## Tabele

### users (T03, V2)
Migrarea `V2__users_businesses.sql` + seed-ul `V2_1__seed_users.sql` (5 conturi demo + 7 localnici + 5 firme fictive) **există deja**.
`id, email UNIQUE NULL, phone UNIQUE NULL (T21, E.164), password_hash NULL, display_name, role, locale('ro'|'en'), points_balance INT DEFAULT 0, avatar_url NULL, created_at, disabled_at NULL (T14, V13: contul dezactivat de Admin nu mai poate intra)` · `CHECK (email IS NOT NULL OR phone IS NOT NULL)`. Conturile personale (Vizitator, Localnic) au telefon și intră cu cod OTP; firmele, Primăria și Adminul au email + parolă.

### password_reset_codes (V21, 9 nov)
`id, user_id FK users ON DELETE CASCADE, code_hash (BCrypt), attempts INT DEFAULT 0, expires_at (15 min), consumed_at NULL, created_at` · index parțial `(user_id, created_at DESC) WHERE consumed_at IS NULL`. Codul de 6 cifre trimis pe email la „Am uitat parola”. V21 a șters `otp_codes` (V11) și `sms_outbox` (V14): login-ul cu telefon + SMS nu mai există.

### businesses (T03, V2)
`id, owner_user_id FK users UNIQUE, name, category, description, address, lat DOUBLE, lng DOUBLE, phone NULL, website NULL, image_url NULL, verified BOOL DEFAULT false, views_count INT DEFAULT 0, created_at, rejected_at NULL, reject_reason NULL (T14, V13)`

**T14 (`V13__admin.sql`)**: `users.disabled_at`, `businesses.rejected_at` + `reject_reason`, indexurile `businesses(verified, created_at DESC)` și `users(role)`. Verificarea firmei (Primăria sau Adminul) publică tot conținutul ei `DRAFT` (evenimente, oferte, anunțuri) și șterge respingerea; respingerea unei firme verificate (suspendare) trece conținutul ei `PUBLISHED` înapoi în `DRAFT`. Firmele create din panou primesc coordonatele centrului Aradului până își completează profilul.

### places (T05, V3)
`id, name, slug UNIQUE, type, description TEXT, address, lat, lng, image_url, image_credit NULL, opening_hours TEXT NULL, visit_minutes INT, tags VARCHAR (csv: "istorie,familie"), rating NUMERIC(2,1) NULL, parking_hint TEXT NULL, exterior_only BOOL DEFAULT false (Cetatea, Turnul de Apă), source_url VARCHAR(300) NULL (fișa sursă visitarad.ro, pentru atribuire — V3_2; încă nu e în entitate / DTO), google_place_id VARCHAR(255) NULL (T17, V18 — se completează singur la prima cerere, vezi API.md §Google), created_at`
Migrarea `V3__places.sql` + seed-ul `V3_1__seed_places.sql` (12 locuri reale, 33 puncte de ghid) **există deja** în `AradEx-Backend` (modulul `app`) și trec pe Postgres 16. **`V3_2__places_visitarad.sql`** (7 nov) adaugă `source_url`, corectează coordonatele celor 12 (verificate pe OSM) și inserează **223 de locuri reale** din exportul visitarad.ro (obiective, muzee, crame, cafenele, restaurante; fără cazare) — id-uri din secvență, idempotent prin `slug`; **`V5_2__seed_event_venues.sql`** mută evenimentele din seed pe coordonatele corecte ale sălilor. Detalii: `docs/ARAD-DATA.md`.

### guide_points (T05, V3)
`id, place_id FK places ON DELETE CASCADE, position INT, title, text TEXT, image_url NULL, audio_url NULL, lat NULL, lng NULL, duration_sec INT NULL`
UNIQUE (place_id, position).

### events (T06, V4)
`id, title, description TEXT, category, organizer_type, organizer_business_id FK businesses NULL, organizer_name, place_id FK places NULL, location_name, address, lat, lng, start_at, end_at NULL, image_url NULL, ticket_type, price_from NUMERIC NULL, price_adult NUMERIC NULL, price_child NUMERIC NULL, external_url NULL, capacity INT NULL, participants_count INT DEFAULT 0, saves_count INT DEFAULT 0, status DEFAULT 'PUBLISHED', is_demo BOOL DEFAULT false (eveniment FICTIV pentru demo), created_by FK users NULL, created_at`
Migrarea `V4__events.sql` + seed-ul `V4_1__seed_events.sql` (21 evenimente reale nov–dec 2026 + 9 demo) **există deja**; `V4_4__seed_events_more.sql` (7 nov) adaugă 5 evenimente reale care lipseau (2 concerte ale Filarmonicii în decembrie, 2 concerte de colinde la Târgul de Crăciun, expozițiile permanente ale Complexului Muzeal — singurul EXHIBITION), id-uri din secvență, idempotent după titlu + început.
Index: `(start_at)`, `(category, start_at)`, `(organizer_business_id)`.
Derivat în DTO: `isHot = participants_count >= 50 OR saves_count >= 20`; `distanceKm` când se cere `near`.

### saved_events (T06, V4)
`user_id FK, event_id FK, created_at` — PK (user_id, event_id). Trigger simplu sau update în service pentru `events.saves_count`.

### tickets (T07, V5 — împreună cu reviews)
`id, event_id FK, user_id FK, qty_adult INT, qty_child INT, total NUMERIC, code UNIQUE ('AX-T{eventId}-XXXXXX'), status DEFAULT 'CONFIRMED', email, used_at NULL, created_at` — **există** (`V5__tickets.sql`, cu `CHECK qty_adult + qty_child > 0`). Un rând = o comandă (adulți + copii) sau o înscriere gratuită, cu un singur cod QR. `events.participants_count` crește în aceeași tranzacție, cu rândul evenimentului blocat.

**V16 (`V16__ticket_payments.sql`, plata cu Stripe în modul de test):** `tickets.payment_intent_id VARCHAR(100) NULL` cu index unic parțial (o plată = un singur bilet). NULL = bilet gratuit sau plată demonstrativă.

**Migrări în altă ordine:** fiecare story are numărul lui rezervat, dar se unesc în ordinea în care sunt gata (V6 a intrat înaintea lui V5). De aceea `spring.flyway.out-of-order: true` în `application.yml`: o migrare cu număr mai mic, venită mai târziu, se aplică (nu e refuzată).

### announcements (T09, V6)
(`businesses.google_place_id VARCHAR NULL` se adaugă tot în V6 pentru T17; îl pune firma din panoul „Recenzii”, nu se caută automat.)
**T17 (`V18__places_google.sql`; V16 = plățile, V17 = itinerariile)**: `places.google_place_id VARCHAR(255) NULL`. T17 citește / scrie coloana direct (JDBC, `repository/google/GoogleLinkRepository`), fără să modifice entitățile `Place` / `Business`.
`id, business_id FK, title, body TEXT, image_url NULL, status DEFAULT 'PUBLISHED', created_at`

### offers (T10, V7)
`id, business_id FK, title VARCHAR(120), description TEXT, discount_label ('-20%','2+1','Gratuit','40 p'), category ('CAFE'|'RESTAURANT'|'LOCAL'|'EVENT'|'OTHER', DEFAULT 'OTHER'), local_product BOOL DEFAULT false, valid_from DATE DEFAULT azi, valid_until DATE NULL (= permanentă), points_price INT NULL (> 0), image_url NULL, status DEFAULT 'PUBLISHED', views_count INT DEFAULT 0, redemptions_count INT DEFAULT 0, used_count INT DEFAULT 0, created_at` · **`featured` BOOL DEFAULT false (V19):** ofertă promovată, prima în `GET /offers` (și la sortarea după distanță); doar din seed.
`category` adăugat în T10 pentru cercurile din tab-ul Oferte (designul final); CHECK `valid_until >= valid_from`. Index: `(business_id)`, `(status, valid_until)`.

### offer_redemptions (T10, V7)
`id, offer_id FK, user_id FK, code UNIQUE ('AX-O{offerId}-XXXXXX'), points_spent INT DEFAULT 0, status DEFAULT 'ISSUED', issued_at, used_at NULL, used_by_user_id FK users NULL`
Regulă: o singură revendicare cu status `ISSUED` per (offer_id, user_id) — garantată de indexul unic parțial `uq_redemptions_active (offer_id, user_id) WHERE status = 'ISSUED'`. După ce codul e folosit, utilizatorul poate revendica din nou. Seed: `V7_1__seed_offers.sql` (8 oferte FICTIVE, 2 ciorne la firmele neverificate, 4 coduri).

### community_actions (T11, V8)
`id, title, description TEXT, category, organizer NULL („Partener / direcție”), start_at, end_at (CHECK > start_at), location_name, address NULL, lat, lng, points_reward INT, capacity INT, registered_count INT DEFAULT 0, confirmed_count INT DEFAULT 0, image_url NULL, image_credit NULL, status DEFAULT 'PUBLISHED', created_by FK users, created_at`
`registered_count` = înscrieri REGISTERED + CONFIRMED (o respingere / anulare eliberează locul); contoarele se schimbă cu rândul acțiunii blocat (`SELECT … FOR UPDATE`).
Migrarea `V8__community_points.sql` + seed-ul `V8_1__seed_community.sql` **există** (branch `feat/T11-community`; se merge-uiește după V5–V7, vezi STATUS).

### community_registrations (T11, V8)
`id, action_id FK (ON DELETE CASCADE), user_id FK, code UNIQUE ('AX-C{actionId}-XXXXXX'), status DEFAULT 'REGISTERED', registered_at, confirmed_at NULL, confirmed_by FK users NULL`
UNIQUE (action_id, user_id). La NO_SHOW, `confirmed_at` / `confirmed_by` = momentul și autorul respingerii. După o anulare, reînscrierea refolosește rândul (și codul).

### points_transactions (T11, V8)
`id, user_id FK, amount INT (+/-, ≠ 0), type, ref_type ('ACTION'|'OFFER'|'ADMIN') NULL, ref_id BIGINT NULL, note NULL, created_at`
`users.points_balance` = suma tranzacțiilor; se actualizează atomic (`UPDATE … SET points_balance = points_balance ± n`, fără să scadă sub 0) în aceeași tranzacție DB de `PointsService`. Clasamentul = `SUM(amount) WHERE amount > 0 AND created_at în perioadă GROUP BY user_id` (luna / anul curent, Europe/Bucharest).
Index unic parțial `(user_id, ref_id) WHERE type = 'EARN_ACTION' AND ref_type = 'ACTION'`: un singur câștig per acțiune per utilizator, chiar și la două confirmări simultane.

### reviews (T07 partea 2, V5 — în aceeași migrare cu tickets)
`id, event_id FK, user_id FK, stars INT CHECK 1..5, text VARCHAR(600) NULL, status DEFAULT 'PUBLISHED', created_at, updated_at` — UNIQUE (event_id, user_id). Media și numărul se calculează la citire (sau cache `events.rating_avg`, `events.rating_count`).

### volunteers, volunteer_actions, action_chat_messages, action_chat_reads (T18, V15)
Voluntarul e un rând în `users` cu rolul `VOLUNTEER`, **fără email, telefon și parolă** (V15 relaxează `users_email_or_phone` pentru el) + `volunteers`:
`user_id PK FK users ON DELETE CASCADE, phone VARCHAR(16) NOT NULL (E.164, pentru SMS-ul simulat; nu în users.phone, ca să nu intre cu OTP), email NULL, login_code VARCHAR(6) UNIQUE CHECK 6 cifre, one_time BOOL DEFAULT false, status ('ACTIVE'|'SUSPENDED') DEFAULT 'ACTIVE', coordinator_id FK users (CITY_HALL/ADMIN), created_by FK users, created_at, last_login_at NULL`.
`volunteer_actions`: `user_id FK volunteers, action_id FK community_actions` — PK (user_id, action_id), index pe action_id.
`action_chat_messages` (chatul de grup al voluntarilor unei acțiuni; Primăria nu e în chat): `id, action_id FK community_actions ON DELETE CASCADE, author_id FK users, text VARCHAR(1000) NULL, image_url VARCHAR(500) NULL (poza din bucket, `/media/chat/…`), created_at` · CHECK text sau poză · index (action_id, id).
`action_chat_reads`: `user_id FK, action_id FK, last_read_id` — PK (user_id, action_id); mesajele noi = ale altora cu id mai mare.
„Cine a scanat pe cine” = `community_registrations.confirmed_by` (T11), nu un tabel nou. V10 a rămas nefolosit (V11–V14 intraseră înainte; vezi docs/API.md §Voluntari).

### itineraries (T13, V17)
`id, share_code UNIQUE ('AX-I-XXXXXX'), user_id FK NULL (NULL = salvat fără cont), title, summary, ask, date, days (1–2), transport ('WALK'|'CAR'|'PUBLIC'), start_time, total_minutes, total_km, offline, stops JSONB (lista `ItineraryStop` din API, refăcută din DB la salvare), created_at`. V17, nu V9: producția era deja la V15, iar V16 e luat de plăți (Stripe).

### transit_routes, transit_stops, transit_patterns, transit_pattern_stops (T22, V12)
Rețeaua statică CTP Arad, doar citire (seed `V12_1__seed_transit.sql`, generat o dată cu `docs/tools/ctp-transit-seed.mjs` din exportul static; aplicația nu descarcă nimic la pornire). Id-urile liniilor și stațiilor sunt cele din Telelink. Datele live (vehicule, sosiri) **nu** stau în DB.
- `transit_routes`: `id INT PK (routeId Telelink), short_name (numărul afișat: „1”, „39b”), long_name, mode ('TRAM'|'BUS'), color NULL ('#rrggbb'), text_color NULL` — 29 de rânduri.
- `transit_stops`: `id INT PK, name, code NULL, lat, lng` — 299 (un rând = un peron; același nume poate avea două id-uri, câte unul pe sens).
- `transit_patterns`: `id SERIAL PK, route_id FK, pattern_index INT (poate fi negativ), from_stop_id NULL FK, to_stop_id NULL FK, path TEXT (polilinie codificată, precizie 5, simplificată la ~5 m)` · `UNIQUE (route_id, pattern_index)` — 77.
- `transit_pattern_stops`: `pattern_id FK ON DELETE CASCADE, seq INT (de la 1), stop_id FK` · `PK (pattern_id, seq)`, index pe `stop_id` — 805 opriri.

## Relații pe scurt
```
users 1─1 businesses (doar rol BUSINESS)
businesses 1─n events | offers | announcements
places 1─n guide_points ; places 1─n events (opțional)
users n─n events (saved_events) ; users 1─n tickets ─n 1 events
users 1─n offer_redemptions ─n 1 offers
community_actions 1─n community_registrations ─n 1 users
users 1─n points_transactions ; users 1─n itineraries
transit_routes 1─n transit_patterns 1─n transit_pattern_stops n─1 transit_stops (T22, doar citire)
```

## Seed (date demo) — ce trebuie să existe
- 5 conturi demo (T03), 1 firmă verificată „Cafeneaua din Pasaj” + 2–3 firme extra (Brutăria Veche, Crama Dealul Miniș, Producători din județul Arad).
- 12 locuri reale cu ghid (T05, există), 30 de evenimente pe 6 nov – 20 dec 2026 (T06, există), 5–8 oferte (T10), 3 acțiuni comunitare + înscriși + puncte (T11), 2 voluntari cu codurile `482913` (Andrei Popa, acțiunile 1–2) și `731508` (Maria Ionescu, acțiunea 3, unică folosință), coordonatoarea Ioana Marin (`ioana.marin@demo.ro`) și Radu Toma (`radu.toma@demo.ro`), parola `demo1234`, Maria alocată și la plantare, unde chatul de grup are deja 4 mesaje și o poză (T18, `V15_1`, FICTIV).
- Imaginile: `AradEx-Frontend/public/img/<fișier>.jpg` (copiate din `design/assets/`), stocate în DB ca path relativ `/img/loc-pc.jpg`. Pozele obiectivelor și ale evenimentelor din aceleași săli se leagă în `V4_2__seed_images.sql` (există).
