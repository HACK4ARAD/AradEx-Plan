# Contract de API — AradExperience

Base URL: `/api/v1`. JSON peste tot, UTF-8, date ISO-8601 cu offset (`2026-11-07T11:00:00+02:00`), bani ca număr (RON).
Autentificare: `Authorization: Bearer <jwt>`. Erori: RFC 7807 `ProblemDetail`:
```json
{ "type": "about:blank", "title": "Not Found", "status": 404, "detail": "Event 42 not found", "instance": "/api/v1/events/42",
  "errors": [ { "field": "email", "message": "must be a well-formed email address" } ] }
```
Paginare: `?page=0&size=20` → `{ "content": [...], "page": 0, "size": 20, "totalElements": 57 }`.
Roluri în coloana „Auth”: `pub` = public, `auth` = orice utilizator logat, altfel rolul cerut. `ADMIN` are acces oriunde.
FE: tipurile TypeScript din `AradEx-Frontend/src/shared/types/<modul>.ts` oglindesc DTO-urile de aici — când se schimbă unul, se schimbă și celălalt în același PR.

## DTO-uri comune
```ts
type Role = 'VISITOR'|'LOCAL'|'BUSINESS'|'CITY_HALL'|'ADMIN'|'VOLUNTEER'   // VOLUNTEER: creat de Primărie (T18; coloana users.role îl acceptă după V10)
type UserDto = { id: number; email: string; displayName: string; role: Role; locale: 'ro'|'en'; pointsBalance: number; business?: BusinessSummary }
type BusinessSummary = { id: number; name: string; category: string; verified: boolean; imageUrl?: string }
type GeoPoint = { lat: number; lng: number }
type PlaceType = 'ATTRACTION'|'MUSEUM'|'VENUE'|'WINERY'|'NATURE'|'PARK'|'RESTAURANT'|'CAFE'
type PlaceSummary = { id: number; name: string; type: PlaceType; imageUrl?: string; lat: number; lng: number; visitMinutes: number; tags: string[]; distanceKm?: number; guidePointsCount: number; guideMinutes: number; exteriorOnly: boolean }   // T05: guidePointsCount/guideMinutes/exteriorOnly = badge-urile din liste
type PlaceDto = PlaceSummary & { slug: string; description: string; address?: string; openingHours?: string; rating?: number; parkingHint?: string; imageCredit?: string; guidePoints: GuidePointDto[]; google?: GoogleInfoDto }   // google: T17
type GuidePointDto = { id: number; position: number; title: string; text: string; imageUrl?: string; audioUrl?: string; lat?: number; lng?: number; durationSec?: number }
type EventSummary = { id: number; title: string; category: string; startAt: string; endAt?: string; locationName: string; lat: number; lng: number; imageUrl?: string; ticketType: 'FREE'|'IN_APP'|'EXTERNAL'; priceFrom?: number; isHot: boolean; isDemo: boolean; participantsCount: number; organizerName: string; organizerType: string; distanceKm?: number; saved?: boolean; ratingAvg?: number; ratingCount: number; capacity?: number; spotsLeft?: number }   // capacity/spotsLeft: „Gratuit · înscriere” și „Bilete epuizate” pe card (lipsă = fără limită)
type EventDto = EventSummary & { description: string; address: string; placeId?: number; organizerBusinessId?: number; priceAdult?: number; priceChild?: number; externalUrl?: string; capacity?: number; spotsLeft?: number; savesCount: number; status: 'DRAFT'|'PUBLISHED'|'HIDDEN'; imageCredit?: string }
type EventCreate = { title: string; description: string; category: EventCategory; placeId?: number; locationName?: string; address?: string; lat?: number; lng?: number; startAt: string; endAt?: string; ticketType: 'FREE'|'IN_APP'|'EXTERNAL'; priceAdult?: number; priceChild?: number; externalUrl?: string; capacity?: number; imageUrl?: string; priceFrom?: number; status?: 'DRAFT'|'PUBLISHED' }
type ReviewDto = { id: number; eventId: number; userName: string; stars: number; text?: string; createdAt: string; mine?: boolean }
type GoogleInfoDto = { rating?: number; userRatingCount?: number; reviews: { author: string; rating: number; text: string; relativeTime: string }[]; mapsUrl: string; attribution: 'Powered by Google' }
type TicketDto = { code: string; eventId: number; eventTitle: string; startAt: string; endAt?: string; locationName: string; address?: string; lat: number; lng: number; imageUrl?: string; ticketType: 'FREE'|'IN_APP'|'EXTERNAL'; qtyAdult: number; qtyChild: number; priceAdult?: number; priceChild?: number; total: number; status: 'CONFIRMED'|'CANCELLED'|'USED'; email: string; createdAt: string; usedAt?: string }   // tot ce trebuie ca biletul să se afișeze offline
type OfferSummary = { id: number; businessId: number; businessName: string; title: string; discountLabel: string; localProduct: boolean; validUntil: string; pointsPrice?: number; imageUrl?: string; distanceKm?: number; rating?: number }
type OfferDto = OfferSummary & { description: string; validFrom: string; status: string; viewsCount: number; redemptionsCount: number; usedCount: number; myRedemption?: RedemptionDto }
type RedemptionDto = { id: number; code: string; offerId: number; offerTitle: string; businessName: string; pointsSpent: number; status: 'ISSUED'|'USED'|'CANCELLED'; issuedAt: string; usedAt?: string; offerImageUrl?: string; validUntil?: string }
type ActionSummary = { id: number; title: string; category: 'ENVIRONMENT'|'HEALTH'|'SOCIAL'|'CULTURE'; organizer?: string; startAt: string; endAt: string; locationName: string; lat: number; lng: number; pointsReward: number; capacity: number; registeredCount: number; imageUrl?: string; goingPreview: string[]; myRegistration?: RegistrationDto }
type ActionDto = ActionSummary & { description: string; address?: string; status: 'DRAFT'|'PUBLISHED'|'CANCELLED'|'DONE'; confirmedCount: number; imageCredit?: string }
type RegistrationDto = { id: number; actionId: number; actionTitle: string; actionStartAt: string; locationName: string; pointsReward: number; code: string; status: 'REGISTERED'|'CONFIRMED'|'CANCELLED'|'NO_SHOW'; registeredAt: string; confirmedAt?: string; confirmedBy?: string; actionImageUrl?: string; user?: { id: number; displayName: string } }   // confirmedBy = numele celui care a confirmat / respins; user doar în listele Primăriei
type PointsDto = { balance: number; monthEarned: number; rank: number; streakMonths: number; transactions: { id: number; amount: number; type: 'EARN_ACTION'|'SPEND_OFFER'|'ADJUST'; note?: string; createdAt: string }[] }   // rank = locul în clasamentul lunii; streakMonths = luni consecutive cu puncte câștigate
type LeaderboardDto = { period: 'month'|'year'; entries: { rank: number; userId: number; displayName: string; points: number; actionsCount: number; lastAt?: string; lastActionTitle?: string }[]; me?: { rank: number; points: number } }   // actionsCount / lastAt / lastActionTitle = participările confirmate în perioadă
type ItineraryStop = { order: number; kind: 'PLACE'|'EVENT'|'OFFER'; refId: number; name: string; lat: number; lng: number; arriveAt: string; leaveAt: string; durationMin: number; travelMinutesFromPrev: number; travelMode: 'WALK'|'CAR'|'PUBLIC'; note?: string; parkingHint?: string; hasGuide: boolean; imageUrl?: string }
type ItineraryDto = { id?: number; shareCode?: string; title: string; summary: string; date: string; transport: 'WALK'|'CAR'|'PUBLIC'; totalMinutes: number; stops: ItineraryStop[] }
```

## Auth & utilizator (T03)
| Metodă | Rută | Auth | Cerere → Răspuns |
|---|---|---|---|
| POST | `/auth/register` | pub | **Din T21 doar firme** (`VISITOR`/`LOCAL` → 400, se fac cu telefonul) · `{ email, password(≥8), displayName, role: 'BUSINESS', business?: { name, category, address, lat?, lng? } }` → `{ token, user: UserDto }` (201; 409 dacă emailul există; 400 dacă rolul nu e VISITOR/LOCAL/BUSINESS, dacă `business` lipsește la BUSINESS sau e trimis la alt rol, dacă `category` nu e din `BusinessCategory`, email > 190 caractere, lat/lng în afara intervalelor). BUSINESS creează și firma cu `verified=false` |
| POST | `/auth/login` | pub | Firme, Primărie, Admin · `{ email, password }` → `{ token, user }` (401 la date greșite, același mesaj pentru email inexistent și parolă greșită; T21: 403 „Personal accounts sign in with their phone number” pentru Vizitator/Localnic, doar după parola corectă) |
| POST | `/auth/otp/request` | pub | T21 · `{ phone }` (orice formă uzuală: `0744 123 456`, `+40…`) → 202 `{ retryAfterSeconds: 60, demoCode? }`. Numerele de demo `0799000xxx` nu primesc SMS: `demoCode` vine în răspuns. Numerele de demo n-au limite (codul e public), iar orice cod demo încă valabil merge (mai mulți oameni pe același cont). Celelalte primesc SMS prin Twilio Verify, **doar numere românești `+40`** (altfel 400), cu limită globală de 300 SMS pe zi (503) și 503 „SMS unavailable” până sunt puse cheile sau dacă Twilio refuză configurația. 400 număr invalid sau care nu poate primi SMS; 429 `{ retryAfterSeconds }` dacă s-a cerut un cod în ultimele 60 s sau deja 5 în ultimele 24 h |
| POST | `/auth/otp/verify` | pub | T21 · `{ phone, code }` → `{ token, user }` dacă numărul are cont, altfel `{ signupToken }` (15 min). 401 „Invalid or expired code” (cod greșit, expirat după 5 min, folosit sau, la numerele reale, după 5 încercări greșite) |
| POST | `/auth/otp/register` | pub | T21 · `{ signupToken, displayName, role: 'VISITOR'\|'LOCAL' }` → 201 `{ token, user }`; 401 token expirat, 409 numărul are deja cont, 400 alt rol |
| GET | `/me` | auth | → `UserDto` (401 dacă tokenul e valid dar contul nu mai există) |
| PATCH | `/me` | auth | `{ displayName?, locale? }` → `UserDto` |
| GET | `/me/points` | auth | → `PointsDto` (T11) |

JWT: HS256, claims `sub`=userId, `role`, `email` (lipsește la conturile cu telefon), `exp` = 24 h. Tokenul de înregistrare T21 (`purpose=signup`, `phone`) nu e acceptat ca autentificare. `UserDto` are și `phone` (E.164, conturile personale); `email` e opțional. Email-ul se normalizează (trim + lowercase) la register și login.
Securitate (T03, `config/SecurityConfig`): regulile din coloana „Auth” pentru toate rutele de mai jos sunt deja scrise; inclusiv `/vol/**` → VOLUNTEER și `POST /auth/volunteer` public (T18). Fără token sau token invalid → 401, rol greșit → 403, ambele ProblemDetail cu `instance`. Verificările de proprietar (creator, organizator, firma ofertei) rămân în service (403 `ForbiddenException`). Conturi demo: Vizitator `0799 000 001`, Localnic `0799 000 002` (telefon + codul afișat în aplicație); `firma@demo.ro`, `primaria@demo.ro`, `admin@demo.ro` / `demo1234`.

## Locuri & ghid (T05)
| Metodă | Rută | Auth | Cerere → Răspuns |
|---|---|---|---|
| GET | `/places?type&q&near=lat,lng&tags` | pub | → `PlaceSummary[]` (fără paginare, < 100). `type` = un `PlaceType` (altfel 400); `q` caută în nume, descriere și etichete, fără diacritice; `tags` = csv, potrivire pe oricare; `near` adaugă `distanceKm` și sortează după distanță (400 dacă nu e `lat,lng`); fără `near`, ordinea e după id |
| GET | `/places/{id}?near=lat,lng` | pub | → `PlaceDto` cu `guidePoints` ordonate după `position` (404 dacă nu există); `near` opțional → `distanceKm` („Ești aici” ≤ 0,15 km) |
| POST | `/city/places` | CITY_HALL, ADMIN | `PlaceRequest` → `PlaceDto` (201; 409 dacă `slug` e ocupat; fără `slug` se generează din nume, cu `-2`, `-3` la nevoie) |
| PUT | `/city/places/{id}` | CITY_HALL, ADMIN | `PlaceRequest` → `PlaceDto` (404; 409 slug; `slug` lipsă = rămâne cel vechi) |
| DELETE | `/city/places/{id}` | CITY_HALL, ADMIN | 204 (șterge și punctele de ghid; 404; 409 dacă are evenimente legate) |
| POST | `/city/places/{id}/guide-points` | CITY_HALL, ADMIN | `GuidePointRequest` → `GuidePointDto` (201; fără `position` = la final; 409 dacă poziția e ocupată; 404) |
| PUT | `/city/places/{id}/guide-points/{gpId}` | CITY_HALL, ADMIN | `GuidePointRequest` → `GuidePointDto` (o poziție ocupată de alt punct = schimb de poziții, pentru „mută sus/jos”; 404 dacă punctul nu e al locului) |
| DELETE | `/city/places/{id}/guide-points/{gpId}` | CITY_HALL, ADMIN | 204 (404) |
| POST | `/ai/tts` (opțional) | auth | `{ text, voice? }` → `audio/mpeg` (cache după hash) |
| GET | `/places/{id}/google`, `/businesses/{id}/google` (opțional, T17) | pub | → `GoogleInfoDto` din Google Places API (New) Place Details, prin backend, cache 24 h; 404 dacă nu există `googlePlaceId`; afișat cu „Powered by Google” |

Cererile din „Obiective & ghiduri” (`CityPlacesApi`):
```ts
type PlaceRequest = { name: string /*≤160*/; slug?: string /*a-z0-9-*/; type: PlaceType; description: string; address?: string; lat: number; lng: number; imageUrl?: string; imageCredit?: string; openingHours?: string; visitMinutes?: number /*5–600, implicit 60*/; tags?: string[] /*≤12×30, se salvează cu litere mici*/; rating?: number /*0–5*/; parkingHint?: string; exteriorOnly: boolean }
type GuidePointRequest = { position?: number /*1–99*/; title: string /*≤160*/; text: string /*≤4000*/; imageUrl?: string; audioUrl?: string; lat?: number; lng?: number; durationSec?: number /*5–1800; lipsă = estimat din text, ~140 cuvinte/min*/ }
```

## Evenimente (T06) & bilete (T07)
| Metodă | Rută | Auth | Cerere → Răspuns |
|---|---|---|---|
| GET | `/events?from&to&category&near=lat,lng&radiusKm=5&organizerBusinessId&organizerType&ticketType&hot=true&q&sort&status&page&size` | pub | → `Page<EventSummary>`; `saved` completat dacă e logat. `from`/`to` = zile `YYYY-MM-DD` în ora Aradului (inclusiv); **fără `from` doar evenimentele care nu s-au terminat**. `category`, `organizerType`, `ticketType` acceptă mai multe valori CSV. `q` caută fără diacritice în titlu, loc și organizator. `sort=date` (implicit) / `distance` (cere `near`). `status=DRAFT\|HIDDEN\|ALL` doar pentru CITY_HALL/ADMIN (altfel ignorat → PUBLISHED). `size` max 100 |
| GET | `/events/{id}?near` | pub | → `EventDto` (404 pentru ciorne / ascunse, cu excepția creatorului, Primăriei și Adminului) |
| POST | `/events` | CITY_HALL, ADMIN | `EventCreate` → `EventDto`. Locul: `placeId` (numele, adresa, coordonatele și poza se copiază din obiectiv) sau `locationName` + `lat` + `lng`. IN_APP cere `priceAdult`; `priceFrom` doar la EXTERNAL; `status` = DRAFT (ciornă) sau PUBLISHED (implicit). Organizator: „Primăria Arad” (CITY) / platforma (ADMIN) |
| PUT / DELETE | `/events/{id}` | creator sau ADMIN | PUT = același `EventCreate`; DELETE ascunde evenimentul (`HIDDEN`), biletele rămân valide → 204 |
| POST / DELETE | `/events/{id}/save` | auth | → 204 (idempotent) |
| GET | `/me/saved-events` | auth | → `EventSummary[]` |
| POST | `/events/{id}/tickets` | auth | `{ qtyAdult, qtyChild, email? }` (T21: emailul de contact e opțional) (0–10 fiecare, cel puțin 1) → 201 `TicketDto`. IN_APP: total din prețuri. FREE cu `capacity`: înscriere a unei persoane (`qtyAdult=1`), una per utilizator (409 la a doua); FREE fără `capacity` → 400 (intrare liberă). 409 „Sold out” / „Only N spots left”; 400 pentru EXTERNAL și pentru evenimente încheiate; 404 pentru ciorne |
| GET | `/me/tickets?upcoming=true\|false` | auth | → `TicketDto[]` — `true`: cele care nu s-au terminat, după dată; `false`: trecute, cele recente primele; fără parametru: toate |
| GET | `/tickets/{code}` | proprietar/organizator/ADMIN | → `TicketDto` |
| POST | `/tickets/{code}/use` | organizator/ADMIN | → `TicketDto` (409 dacă e deja USED). Organizator = creatorul evenimentului sau firma organizatoare |
| GET | `/events/{id}/ics` | pub | → fișier `text/calendar` (Adaugă în calendar). FE construiește și linkul Google Calendar fără login: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=…&dates=YYYYMMDDTHHMMSSZ/…&location=…&details=…` |
| GET | `/events/{id}/reviews` | pub | **T07 partea 2 (tabela e în V5, endpoint-urile nu sunt încă):** → `ReviewDto[]` + `{ avg, count }` în header-ul răspunsului sau ca `{ avg, count, items }` |
| POST / PUT | `/events/{id}/reviews` | auth | `{ stars: 1..5, text? }` → `ReviewDto` (400 dacă evenimentul nu a trecut; una per utilizator, PUT o editează) |
| DELETE | `/admin/reviews/{id}` | ADMIN | → 204 (ascunde) |

Cod bilet: `AX-T{eventId}-{6 caractere A-Z0-9}`. QR-ul conține exact codul.

## Hartă (T08) — fără endpoint-uri noi
FE folosește `GET /events?near=`, `GET /places?near=`, `GET /offers?near=`, `GET /community/actions` și OSRM public pentru trasee.

## Firme (T09)
| Metodă | Rută | Auth | Cerere → Răspuns |
|---|---|---|---|
| GET | `/businesses/{id}` | pub | → `{ business: BusinessDto, offers: OfferSummary[], events: EventSummary[], announcements: AnnouncementDto[] }` (incrementează `viewsCount`; doar evenimentele viitoare `PUBLISHED` și anunțurile `PUBLISHED`; `offers` e `[]` până la T10); 404 dacă firma nu există |
| GET | `/business/me` | BUSINESS | → `{ business: BusinessDto, stats: { views, codesUsed, pointsPayments, upcomingEvents } }` (`codesUsed` vine din T10, `pointsPayments` din T11 — până atunci 0); 404 dacă contul nu are firmă |
| PUT | `/business/me` | BUSINESS | `BusinessUpdate` = `BusinessDto` fără `id`, `verified`, `viewsCount` (`name`, `category`, `address`, `lat`, `lng` obligatorii) → `BusinessDto` |
| GET | `/business/events` | BUSINESS | → `EventDto[]` (toate evenimentele firmei, inclusiv ciorne și trecute) |
| POST | `/business/events` | BUSINESS | `EventCreate` → 201 `EventDto` (status `DRAFT` dacă firma nu e verificată; fără `lat`/`lng` = la sediul firmei); 400 dacă `endAt` ≤ `startAt`, `IN_APP` fără `priceAdult`, `EXTERNAL` fără `externalUrl` |
| PUT / DELETE | `/business/events/{id}` | BUSINESS (proprietar; ADMIN orice) | PUT: `EventCreate` → `EventDto` (locația rămâne dacă nu trimiți `lat`/`lng`) · DELETE → 204 · 403 dacă e al altei firme, 404 dacă nu există |
| GET / POST | `/business/announcements` | BUSINESS | `{ title (≤120), body (≤1000), imageUrl? }` → 201 `AnnouncementDto { id, title, body, imageUrl?, status, createdAt }` (`status` = `DRAFT` dacă firma nu e verificată) |
| DELETE | `/business/announcements/{id}` | BUSINESS (proprietar; ADMIN orice) | → 204 · 403 dacă e al altei firme |
| GET | `/business/activity` | BUSINESS | → `{ items: { type: 'CODE_USED'\|'OFFER_SAVED'\|'OFFER_REDEEMED'\|'TICKET'\|'POINTS_PAYMENT', text, at }[] }` (ultimele 20; goală până când T07/T10/T11 adaugă sursele) |

`BusinessDto = BusinessSummary & { description, address, lat, lng, phone?, website?, viewsCount }`.
`EventCreate = { title, description, category, placeId?, locationName?, address?, lat?, lng?, startAt, endAt?, ticketType, priceAdult?, priceChild?, externalUrl?, capacity?, imageUrl? }` (introdus de T09; T06 îl refolosește pentru `POST /events`). `EventCategory`, `OrganizerType`, `TicketType`, `ContentStatus` sunt în `AradEx-Backend/api/…/enums` și în `AradEx-Frontend/src/shared/types/business.ts` (`EventCategory`, `ContentStatus`, `EventCreate` — T06 le poate muta în `types/events.ts`).

## Oferte (T10, puncte în T11)
| Metodă | Rută | Auth | Cerere → Răspuns |
|---|---|---|---|
| GET | `/offers?category&localProduct=true&points=true&near=lat,lng&q` | pub | → `OfferSummary[]` (doar `PUBLISHED`, valabile azi în ora Aradului; `category` = `OfferCategory`; `localProduct=true` = „Făcut în Arad” (`localProduct` sau `category=LOCAL`); `points=true` = „Cu puncte” (au `pointsPrice`); cu `near` se completează `distanceKm` (față de firmă) și se sortează după distanță; 400 dacă `near` nu e `lat,lng`) |
| GET | `/offers/{id}` | pub | → `OfferDto` (+ `myRedemption` = ultimul meu cod pentru ofertă, dacă sunt logat; incrementează `viewsCount`); 404 dacă nu e `PUBLISHED` |
| POST | `/offers/{id}/redeem` | auth | → 201 `RedemptionDto` (`ISSUED`); 404 ofertă inexistentă / nepublicată; 409 „You already have an active code for this offer”; 409 „This offer is not valid today”; **T11 — plata cu puncte:** `?withPoints=true` plătește `pointsPrice` din punctele comunitare (`pointsSpent` = prețul; 409 `insufficient_points` dacă soldul nu ajunge și atunci nu se emite niciun cod; 400 dacă oferta n-are `pointsPrice`); ofertele doar pe puncte (eticheta „N p”, ca `offerBadge` din FE) se plătesc mereu cu puncte; fără parametru, oferta normală se revendică gratuit |
| GET | `/me/redemptions` | auth | → `RedemptionDto[]` (cele mai noi primele) |
| GET | `/business/offers` | BUSINESS | → `OfferDto[]` (ale firmei mele, inclusiv ciorne; fără cele ascunse) |
| POST | `/business/offers` | BUSINESS | `OfferCreate` → 201 `OfferDto` (`DRAFT` dacă firma nu e verificată); 400 dacă `validUntil` < `validFrom` sau `status=HIDDEN` |
| PUT | `/business/offers/{id}` | BUSINESS (proprietar; ADMIN orice) | `OfferCreate` → `OfferDto` (pauză = `status: DRAFT`); 403 dacă e a altei firme |
| DELETE | `/business/offers/{id}` | BUSINESS (proprietar; ADMIN orice) | → 204; dacă oferta are deja coduri emise, devine `HIDDEN` (istoricul codurilor rămâne); 403 dacă e a altei firme |
| POST | `/business/redemptions/use` | BUSINESS | `{ code }` (litere mici și spațiile se acceptă) → `RedemptionDto` cu `USED` + `usedAt`; 404 „Unknown code”; 409 „Code already used” / „This code belongs to another business” / „Code cancelled”. Atomic: două scanări simultane → doar una reușește |
| GET | `/business/redemptions?status` | BUSINESS | → `RedemptionDto[]` (codurile ofertelor mele, ultimele 100, cele mai noi primele) |

`OfferCategory = 'CAFE'|'RESTAURANT'|'LOCAL'|'EVENT'|'OTHER'` (T10; cercurile Cafenele / Restaurante / Făcut în Arad / Evenimente). `OfferSummary` primește `category`; `validUntil` lipsește = ofertă permanentă.
`OfferCreate = { title (≤120), description (≤2000), discountLabel (≤30), category?, localProduct, validFrom?, validUntil?, pointsPrice? (1–10000), imageUrl?, status?: 'DRAFT'|'PUBLISHED' }` — `category` lipsă = din categoria firmei (CAFE→CAFE, RESTAURANT→RESTAURANT, PRODUCER/WINERY→LOCAL, altfel OTHER), `validFrom` lipsă = azi, `validUntil` lipsă = permanentă.
Cod ofertă: `AX-O{offerId}-{6}` (alfabetul fără 0/O/1/I). În pagina firmei (`GET /businesses/{id}`) `offers` = ofertele ei active; `stats.codesUsed` = suma `usedCount`; `activity` conține `CODE_USED` și `OFFER_REDEEMED`.

## Comunitate & puncte (T11)
| Metodă | Rută | Auth | Cerere → Răspuns |
|---|---|---|---|
| GET | `/community/actions?upcoming=true` | pub | → `ActionSummary[]` (+ `myRegistration` dacă e logat). `upcoming=true` (implicit) = publicate care nu s-au încheiat **înainte de azi** (cele de azi rămân toată ziua, pentru validare), cea mai apropiată prima; `false` = publicate + încheiate (DONE), cele mai noi primele |
| GET | `/community/actions/{id}` | pub | → `ActionDto` (ciornele și acțiunile anulate: 404, mai puțin pentru CITY_HALL / ADMIN) |
| POST | `/community/actions/{id}/register` | LOCAL, VISITOR | → `RegistrationDto` (201; 409 plin / deja înscris / respins / acțiune încheiată sau nepublicată; 404 ciornă). După o anulare, reînscrierea refolosește același cod |
| DELETE | `/community/actions/{id}/register` | auth | → 204 (idempotent; 404 dacă nu e înscris; 409 dacă e deja confirmat sau respins) |
| GET | `/me/community/registrations` | auth | → `RegistrationDto[]` (fără cele anulate; întâi cele care urmează) |
| GET | `/community/leaderboard?period=month\|year` | pub (+ `me` dacă e logat) | → `LeaderboardDto` (luna / anul curent, ora Aradului; doar puncte câștigate; top 50; egalitățile după id; fără puncte în perioadă → `me.rank` = primul loc după cei cu puncte; 400 la altă perioadă) |
| GET | `/city/dashboard` | CITY_HALL | → `CityDashboardDto { upcomingEvents, registrations, pointsAwarded, pendingValidations, activeVolunteers, actions: { id, title, startAt, registeredCount, capacity, pendingCount, imageUrl? }[], activity: { type: RegistrationStatus, userName, actionTitle, points, by?, at }[] }` (panoul W2; `pointsAwarded` = luna curentă; `activeVolunteers` = 0 până la T18) |
| GET / POST | `/city/actions` | CITY_HALL | GET → `ActionDto[]` (toate, inclusiv ciorne). POST `ActionCreate { title, description, category, organizer?, startAt, endAt, locationName, address?, lat?, lng?, pointsReward (10–200), capacity (1–1000), imageUrl?, imageCredit?, status?: 'DRAFT'\|'PUBLISHED' }` → `ActionDto` (201; fără lat/lng → centrul Aradului; 400 dacă `endAt <= startAt`) |
| PUT | `/city/actions/{id}` | CITY_HALL | `ActionCreate` → `ActionDto` (`status` lipsă = neschimbat; 409 dacă `capacity` < înscriși) |
| GET | `/city/actions/{id}/registrations?status` | CITY_HALL | → `RegistrationDto[]` cu `user` și `confirmedBy` |
| POST | `/city/registrations/confirm` | CITY_HALL | `{ code }` → `ConfirmResultDto = RegistrationDto & { alreadyConfirmed: boolean; pointsAwarded: number }` (idempotent: a doua oară 200 cu `alreadyConfirmed: true`, `pointsAwarded: 0`; 404 cod necunoscut; 400 format greșit; 409 anulată de participant / acțiune nepublicată). T18 `/vol/scan` refolosește aceeași logică (`CityCommunityService.confirmByCode`) |
| POST | `/city/registrations/{id}/confirm` | CITY_HALL | → `ConfirmResultDto` (și pentru un NO_SHOW respins din greșeală) |
| POST | `/city/registrations/{id}/reject` | CITY_HALL | → `RegistrationDto` NO_SHOW (idempotent; eliberează locul; 409 dacă e deja confirmată) |

Cod înscriere: `AX-C{actionId}-{6}`. Punctele se scriu **doar** prin `PointsService` (`award` / `spend` → 409 `insufficient_points` / `adjust` pentru T14). Confirmarea acordă `pointsReward` o singură dată (înscrierea e blocată pe durata tranzacției + index unic pe câștigul per acțiune).

## AI (T12, T13)
| Metodă | Rută | Auth | Cerere → Răspuns |
|---|---|---|---|
| POST | `/ai/chat` | pub (rate-limit 20/min/IP) | `{ messages: { role: 'user'\|'assistant', content }[], locale }` → `{ reply, suggestedEventIds: number[], quickReplies: string[], offline: boolean }` |
| POST | `/ai/itinerary` | pub | `{ date, startTime?: '10:00', hours?: number, days?: number, transport, interests: string[], freeText?, start?: GeoPoint }` → `ItineraryDto` (nesalvat) |
| POST | `/itineraries` | pub (userId dacă e logat) | `ItineraryDto` → `ItineraryDto` cu `id`, `shareCode` |
| GET | `/itineraries/{idOrShareCode}` | pub | → `ItineraryDto` |
| GET | `/me/itineraries` | auth | → `ItineraryDto[]` |

AI-ul e **Claude** (Anthropic API, SDK-ul oficial Java, modelul din `ANTHROPIC_MODEL`, implicit `claude-haiku-5-5`). Răspunsul modelului e forțat cu structured outputs (`outputConfig` cu schema JSON; schemele în `ai/schemas/*.json`); BE validează id-urile și normalizează orele. Timeout 20 s, apoi fallback din `ai/fallback/*.json` cu `offline: true`.

## Admin (T14)
| Metodă | Rută | Auth | Cerere → Răspuns |
|---|---|---|---|
| GET | `/admin/stats` | ADMIN | → `{ usersByRole, events, ticketsSold, offersRedeemed, pointsAwarded, actions }` |
| GET | `/city/businesses?verified=false` | CITY_HALL, ADMIN | → `BusinessDto[]` (Firme partenere) |
| POST | `/city/businesses` | CITY_HALL, ADMIN | `{ email, name, category, address, contactName }` → `BusinessDto` (cont BUSINESS nou, verificat, parolă de unică folosință trimisă „prin e-mail”, simulat) |
| POST | `/city/businesses/{id}/verify` | CITY_HALL, ADMIN | → `BusinessDto` (publică și conținutul `DRAFT` al firmei) |
| POST | `/city/businesses/{id}/reject` | CITY_HALL, ADMIN | `{ reason? }` → 204 (conținutul rămâne ciornă) |
| PATCH | `/admin/events/{id}/status` / `/admin/offers/{id}/status` / `/admin/actions/{id}/status` | ADMIN | `{ status }` |
| GET | `/admin/users?role&q` | ADMIN | → `Page<UserDto>` |
| PATCH | `/admin/users/{id}` | ADMIN | `{ role?, pointsAdjust?, disabled? }` → `UserDto` (punctele trec prin `PointsService`, tip `ADJUST`) |

## Voluntari (T18)
Rolul `VOLUNTEER` e deja în `Role` (BE + FE) și în `SecurityConfig` din T03 (`/vol/**` → VOLUNTEER, `POST /auth/volunteer` public, `/city/volunteers/**` → CITY_HALL/ADMIN); T18 adaugă migrarea V10 (CHECK-ul din `users.role`). Conturile le creează doar Primăria.
| Metodă | Rută | Auth | Cerere → Răspuns |
|---|---|---|---|
| GET / POST | `/city/volunteers` | CITY_HALL, ADMIN | `{ name, phone, actionIds: number[], oneTime }` → `VolunteerDto { id, name, phone, actionIds, oneTime, status: 'ACTIVE'\|'SUSPENDED', loginCode }` (cod de 6 cifre, „trimis prin SMS” = simulat) |
| PATCH | `/city/volunteers/{id}` | CITY_HALL, ADMIN | `{ actionIds?, status? }` → `VolunteerDto` |
| GET / POST | `/city/volunteers/{id}/messages` | CITY_HALL, ADMIN | `{ text }` → `MessageDto { id, fromCity, text, createdAt }` |
| POST | `/auth/volunteer` | pub | `{ code }` → `{ token, user }` (401 cod greșit sau suspendat) |
| GET | `/vol/actions` | VOLUNTEER | → `ActionSummary[]` alocate (+ `unlocked` = se deschide cu 30 min înainte de start) |
| POST | `/vol/scan` | VOLUNTEER | `{ code }` → `ConfirmResultDto` (aceeași logică idempotentă ca `/city/registrations/confirm`; 403 dacă acțiunea nu e a lui) |
| GET / POST | `/vol/messages` | VOLUNTEER | `{ text }` → `MessageDto[]` / `MessageDto` |

## Transport (T19) — fără endpoint-uri
Liniile de tramvai CTP Arad (OSM, ODbL) și orarele de exemplu sunt date statice în FE (`shared/data/tram.ts`, din `design/final/shared/tram.js`); traseele pe jos prin OSRM, ca la T08.

## Poze (media, T05+)
Pozele încărcate din panou stau în S3 (bucket privat `aradex-media-…`, `AradEx-Infrastructure/terraform/modules/api/media.tf`); local, fără `MEDIA_BUCKET`, pe disc (`MEDIA_LOCAL_DIR`, implicit `uploads/`). API-ul le servește el (fără CloudFront).
| Metodă | Rută | Auth | Cerere → Răspuns |
|---|---|---|---|
| POST | `/city/media` | CITY_HALL, ADMIN | `multipart/form-data`, câmpul `file` → `MediaDto` (201). JPEG, PNG, WebP sau GIF (tipul se verifică după conținut), max 10 MB; altfel 400. URL-ul primit se pune în `imageUrl` și se salvează cu obiectivul |
| POST | `/city/media/import-places?limit=10` | CITY_HALL, ADMIN | → `MediaImportDto`. Copiază în S3 pozele obiectivelor și ale punctelor de ghid care sunt pe alte site-uri (visitarad.ro…) și pune URL-ul nostru în `image_url`; câte `limit` (1–25) pe cerere, repetat până `remaining = 0`. **Rulează și singur** (`MediaAutoSync`): la 1 minut după pornire, apoi la 2 minute, doar cu S3 + `MEDIA_PUBLIC_URL` (`MEDIA_AUTO_SYNC=false` îl oprește); panoul nu mai are buton. `image_credit` rămâne. Pozele care nu se pot descărca sunt sărite până la repornirea API-ului |
| GET | `/media/{folder}/{name}` | pub | → poza (`Cache-Control: public, max-age=31536000, immutable`; cheile nu se refolosesc). `folder` = `uploads` (din panou), `places`, `guide` (din import); 404 altfel |

```ts
type MediaDto = { url: string /*public, absolut*/; key: string /*ex. uploads/3f9a1c0b7d2e4a51.jpg*/; contentType: string; size: number }
type MediaImportDto = { imported: number; failed: number; remaining: number }
```
URL-ul public: `MEDIA_PUBLIC_URL` (în AWS `https://<domeniu>/api/v1/media`), altfel adresa cererii + `/api/v1/media`.

## Diverse
| Metodă | Rută | Auth | Răspuns |
|---|---|---|---|
| GET | `/health` | pub | `{ status: 'ok', time, version }` |

## Rute FE
Două aplicații **complet separate**, din același repo și cu același backend, **fără prefix în URL** (decizia din 7 nov, T20):
- **web-ul**: `npm run build` → `dist/`, publicat pe aradexperience.site;
- **aplicația mobilă**: `npm run build:mobile` → `dist-mobile/`, doar în Capacitor (iOS + Android); local cu `npm run dev:mobile`.

Build-ul web nu conține nimic din aplicația mobilă (`npm run check:web` verifică asta și la deploy). Aplicația mobilă nu se poate deschide de pe site.

Pe web, linkurile vechi de panou `/w/…` duc la aceeași cale fără prefix; în fiecare aplicație, orice cale necunoscută duce la `/`. Endpoint-urile API nu se schimbă.

**Aplicația mobilă** (iOS + Android, are tot):

| Rută | Ecran |
|---|---|
| `/` | S1 Acasă (Evenimente / Oferte / Comunitate) |
| `/search` · `/events/:id` · `/events/:id/tickets` | S2 · S3 · S4 |
| `/checkout` · `/confirm/:code` · `/tickets` · `/tickets/:code` | S5 · S6 · S9 · S10 |
| `/map` · `/chat` · `/profile` · `/login` · `/saved` | S7 · S8 · S11 · S12 · Salvate |
| `/offers` · `/offers/:id` | oferte |
| `/community` · `/community/actions/:id` · `/community/leaderboard` | comunitate |
| `/places` · `/places/:id` | lista obiectivelor · E3 ghidul virtual |
| `/plan` · `/itineraries` · `/itinerary/:id` · `/itinerary/:id/map` | E1 · itinerariile mele · E2 · E4 |
| `/businesses/:id` | pagina firmei |
| `/panel` | E5 / E7: firma și Primăria pe teren (validare + liste) |
| `/transport` · `/transport/lines/:id/:dir` · `/transport/trip/:to` | T19 |
| `/vol/login` · `/vol/actions` · `/vol/scan` · `/vol/messages` | T18 |

Tab bar: Evenimente · Chat · Hartă · Bilete/Panou · Transport; voluntarul are Acțiuni · Scanează · Mesaje.

**Web** (`https://aradexperience.site`): site-ul de prezentare al aplicației mobile + panourile.

| Rută | Ce e |
|---|---|
| `/` | site-ul de prezentare (pornește din W1; conținutul în T20) |
| `/community` | Comunitate, doar de citit (W12): acțiunile care urmează + clasamentul; înscrierea e doar în aplicație |
| `/privacy` | Confidențialitate (cerută de Google Play și App Store) |
| `/login` | W0, login-ul panourilor |
| `/business/*` | panou firmă: Panou, Oferte, Evenimente, Anunțuri, Validează coduri, Recenzii, Profilul firmei |
| `/city/*` | panou Primărie, folosit și de Admin: Panou, Evenimente, Obiective & ghiduri, Acțiuni comunitare, Validare, Voluntari, Mesaje, Clasament, Firme partenere |
| `/admin/*` | doar Admin: Dashboard, Conținut & moderare, Utilizatori, Setări |

Pe web **nu există**: W5–W11, W13–W15 (agendă, eveniment, obiective, ghid, hartă, planificator, oferte, chat, Contul meu, pagina publică a firmei). Sunt doar în aplicație. Ecranele: `design/final/screens/`.
