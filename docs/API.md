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
type EventSummary = { id: number; title: string; category: string; startAt: string; endAt?: string; locationName: string; lat: number; lng: number; imageUrl?: string; ticketType: 'FREE'|'IN_APP'|'EXTERNAL'; priceFrom?: number; isHot: boolean; isDemo: boolean; participantsCount: number; organizerName: string; organizerType: string; distanceKm?: number; saved?: boolean; ratingAvg?: number; ratingCount: number }
type EventDto = EventSummary & { description: string; address: string; placeId?: number; organizerBusinessId?: number; priceAdult?: number; priceChild?: number; externalUrl?: string; capacity?: number; spotsLeft?: number; savesCount: number; status: string }
type ReviewDto = { id: number; eventId: number; userName: string; stars: number; text?: string; createdAt: string; mine?: boolean }
type GoogleInfoDto = { rating?: number; userRatingCount?: number; reviews: { author: string; rating: number; text: string; relativeTime: string }[]; mapsUrl: string; attribution: 'Powered by Google' }
type TicketDto = { code: string; eventId: number; eventTitle: string; startAt: string; locationName: string; qtyAdult: number; qtyChild: number; total: number; status: string; createdAt: string }
type OfferSummary = { id: number; businessId: number; businessName: string; title: string; discountLabel: string; localProduct: boolean; validUntil: string; pointsPrice?: number; imageUrl?: string; distanceKm?: number; rating?: number }
type OfferDto = OfferSummary & { description: string; validFrom: string; status: string; viewsCount: number; redemptionsCount: number; usedCount: number; myRedemption?: RedemptionDto }
type RedemptionDto = { id: number; code: string; offerId: number; offerTitle: string; businessName: string; pointsSpent: number; status: 'ISSUED'|'USED'|'CANCELLED'; issuedAt: string; usedAt?: string }
type ActionSummary = { id: number; title: string; category: string; startAt: string; endAt: string; locationName: string; lat: number; lng: number; pointsReward: number; capacity: number; registeredCount: number; imageUrl?: string; goingPreview: string[]; myRegistration?: RegistrationDto }
type ActionDto = ActionSummary & { description: string; address: string; status: string; confirmedCount: number }
type RegistrationDto = { id: number; actionId: number; actionTitle: string; code: string; status: 'REGISTERED'|'CONFIRMED'|'CANCELLED'|'NO_SHOW'; registeredAt: string; confirmedAt?: string; user?: { id: number; displayName: string } }
type PointsDto = { balance: number; monthEarned: number; rank?: number; transactions: { id: number; amount: number; type: string; note?: string; createdAt: string }[] }
type LeaderboardDto = { period: 'month'|'year'; entries: { rank: number; userId: number; displayName: string; points: number }[]; me?: { rank: number; points: number } }
type ItineraryStop = { order: number; kind: 'PLACE'|'EVENT'|'OFFER'; refId: number; name: string; lat: number; lng: number; arriveAt: string; leaveAt: string; durationMin: number; travelMinutesFromPrev: number; travelMode: 'WALK'|'CAR'|'PUBLIC'; note?: string; parkingHint?: string; hasGuide: boolean; imageUrl?: string }
type ItineraryDto = { id?: number; shareCode?: string; title: string; summary: string; date: string; transport: 'WALK'|'CAR'|'PUBLIC'; totalMinutes: number; stops: ItineraryStop[] }
```

## Auth & utilizator (T03)
| Metodă | Rută | Auth | Cerere → Răspuns |
|---|---|---|---|
| POST | `/auth/register` | pub | `{ email, password(≥8), displayName, role: 'VISITOR'\|'LOCAL'\|'BUSINESS', business?: { name, category, address, lat?, lng? } }` → `{ token, user: UserDto }` (201; 409 dacă emailul există; 400 dacă rolul nu e VISITOR/LOCAL/BUSINESS, dacă `business` lipsește la BUSINESS sau e trimis la alt rol, dacă `category` nu e din `BusinessCategory`, email > 190 caractere, lat/lng în afara intervalelor). BUSINESS creează și firma cu `verified=false` |
| POST | `/auth/login` | pub | `{ email, password }` → `{ token, user }` (401 la date greșite, același mesaj pentru email inexistent și parolă greșită) |
| GET | `/me` | auth | → `UserDto` (401 dacă tokenul e valid dar contul nu mai există) |
| PATCH | `/me` | auth | `{ displayName?, locale? }` → `UserDto` |
| GET | `/me/points` | auth | → `PointsDto` (T11) |

JWT: HS256, claims `sub`=userId, `role`, `email`, `exp` = 24 h. Email-ul se normalizează (trim + lowercase) la register și login.
Securitate (T03, `config/SecurityConfig`): regulile din coloana „Auth” pentru toate rutele de mai jos sunt deja scrise; inclusiv `/vol/**` → VOLUNTEER și `POST /auth/volunteer` public (T18). Fără token sau token invalid → 401, rol greșit → 403, ambele ProblemDetail cu `instance`. Verificările de proprietar (creator, organizator, firma ofertei) rămân în service (403 `ForbiddenException`). Conturi demo: `visitor@demo.ro`, `local@demo.ro`, `firma@demo.ro`, `primaria@demo.ro`, `admin@demo.ro` / `demo1234`.

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
| GET | `/events?from&to&category&near=lat,lng&radiusKm=5&organizerBusinessId&organizerType&hot=true&q&page&size` | pub | → `Page<EventSummary>`; `saved` completat dacă e logat |
| GET | `/events/{id}` | pub | → `EventDto` |
| POST | `/events` | CITY_HALL, ADMIN | `EventCreate` (titlu, descriere, categorie, placeId?/locație, startAt, endAt?, ticketType, prețuri, capacity?, imageUrl?) → `EventDto` |
| PUT / DELETE | `/events/{id}` | creator sau ADMIN | |
| POST / DELETE | `/events/{id}/save` | auth | → 204 (idempotent) |
| GET | `/me/saved-events` | auth | → `EventSummary[]` |
| POST | `/events/{id}/tickets` | auth | `{ qtyAdult, qtyChild, email }` → `TicketDto` (409 `capacity`; 400 dacă `ticketType=EXTERNAL`) |
| GET | `/me/tickets?upcoming=true` | auth | → `TicketDto[]` |
| GET | `/tickets/{code}` | proprietar/organizator/ADMIN | → `TicketDto` |
| POST | `/tickets/{code}/use` | organizator/ADMIN | → `TicketDto` (409 dacă e deja USED) |
| GET | `/events/{id}/ics` | pub | → fișier `text/calendar` (Adaugă în calendar). FE construiește și linkul Google Calendar fără login: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=…&dates=YYYYMMDDTHHMMSSZ/…&location=…&details=…` |
| GET | `/events/{id}/reviews` | pub | → `ReviewDto[]` + `{ avg, count }` în header-ul răspunsului sau ca `{ avg, count, items }` |
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
| GET | `/offers?category&localProduct=true&near=lat,lng&q` | pub | → `OfferSummary[]` (doar `PUBLISHED`, valabile azi) |
| GET | `/offers/{id}` | pub | → `OfferDto` (+ `myRedemption` dacă e logat) |
| POST | `/offers/{id}/redeem` | auth | → `RedemptionDto` (409 dacă există una `ISSUED`; 409 `insufficient_points` dacă `pointsPrice` > sold) |
| GET | `/me/redemptions` | auth | → `RedemptionDto[]` |
| GET / POST | `/business/offers` | BUSINESS | `OfferCreate { title, description, discountLabel, localProduct, validFrom, validUntil, pointsPrice?, imageUrl? }` → `OfferDto` |
| PUT / DELETE | `/business/offers/{id}` | BUSINESS | |
| POST | `/business/redemptions/use` | BUSINESS | `{ code }` → `RedemptionDto` cu `USED` (404 cod necunoscut, 409 deja folosit / nu e al firmei) |
| GET | `/business/redemptions?status` | BUSINESS | → `RedemptionDto[]` |

Cod ofertă: `AX-O{offerId}-{6}`.

## Comunitate & puncte (T11)
| Metodă | Rută | Auth | Cerere → Răspuns |
|---|---|---|---|
| GET | `/community/actions?upcoming=true` | pub | → `ActionSummary[]` (+ `myRegistration` dacă e logat) |
| GET | `/community/actions/{id}` | pub | → `ActionDto` |
| POST | `/community/actions/{id}/register` | LOCAL (și VISITOR) | → `RegistrationDto` (409 plin / deja înscris) |
| DELETE | `/community/actions/{id}/register` | auth | → 204 |
| GET | `/me/community/registrations` | auth | → `RegistrationDto[]` |
| GET | `/community/leaderboard?period=month\|year` | pub (+ `me` dacă e logat) | → `LeaderboardDto` |
| GET / POST | `/city/actions` | CITY_HALL | `ActionCreate { title, description, category, startAt, endAt, locationName, address, lat, lng, pointsReward, capacity, imageUrl? }` → `ActionDto` |
| PUT | `/city/actions/{id}` | CITY_HALL | |
| GET | `/city/actions/{id}/registrations?status` | CITY_HALL | → `RegistrationDto[]` cu `user` |
| POST | `/city/registrations/confirm` | CITY_HALL | `{ code }` → `ConfirmResultDto = RegistrationDto & { alreadyConfirmed: boolean; pointsAwarded: number }` (idempotent: a doua oară 200 cu `alreadyConfirmed: true`, `pointsAwarded: 0`; 404 cod necunoscut) |
| POST | `/city/registrations/{id}/confirm` | CITY_HALL | → `ConfirmResultDto` |
| POST | `/city/registrations/{id}/reject` | CITY_HALL | → `RegistrationDto` NO_SHOW |

Cod înscriere: `AX-C{actionId}-{6}`. Punctele se scriu **doar** prin `PointsService` (`award`/`spend`).

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

## Diverse
| Metodă | Rută | Auth | Răspuns |
|---|---|---|---|
| GET | `/health` | pub | `{ status: 'ok', time, version }` |

## Rute FE
Mobil (`/m`): `/m` S1 · `/m/search` S2 · `/m/events/:id` S3 · `/m/events/:id/tickets` S4 · `/m/checkout` S5 · `/m/confirm/:code` S6 · `/m/map` S7 · `/m/chat` S8 · `/m/tickets` S9 · `/m/tickets/:code` S10 · `/m/profile` S11 · `/m/login` S12 · `/m/offers` · `/m/offers/:id` · `/m/community` · `/m/community/actions/:id` · `/m/community/leaderboard` · `/m/places/:id` E3 · `/m/plan` E1 · `/m/itinerary/:id` E2 · `/m/itinerary/:id/map` E4 · `/m/businesses/:id` · `/m/panel` E5 (firmă / primărie: validare + liste) · `/m/places` (lista obiectivelor) · `/m/itineraries` (itinerariile mele) · `/m/transport` · `/m/transport/lines/:id/:dir` · `/m/transport/trip/:to` (T19) · `/m/vol/login` · `/m/vol/actions` · `/m/vol/scan` · `/m/vol/messages` (T18). Tab bar: Evenimente · Chat · Hartă · Bilete/Panou · Transport; voluntar: Acțiuni · Scanează · Mesaje.

**Decizia din 7 nov (`docs/PLAN.md`):** produsul e aplicația mobilă (rutele `/m`, Android + iOS). Pe web rămân doar **site-ul de prezentare** (`/w`, pornind din W1) și **panourile** (`/w/login` W0, `/w/business/*`, `/w/city/*`, `/w/admin/*`); rutele publice web de mai jos marcate ~~tăiat~~ se scot în T20. Endpoint-urile API nu se schimbă.

Web (`/w`): `/w` W1 → site de prezentare · ~~`/w/events` W5~~ · ~~`/w/events/:id` W6~~ · ~~`/w/places` W7~~ · ~~`/w/places/:id` W8~~ · ~~`/w/map` W9~~ · ~~`/w/plan` W10~~ · ~~`/w/offers` W11~~ · ~~`/w/community` W12~~ · ~~`/w/chat` W13~~ · ~~`/w/account` W14~~ · ~~`/w/businesses/:id` W15~~ · `/w/login` W0 · `/w/business/*` panou firmă (Panou, Oferte, Evenimente, Anunțuri, Validează coduri, Recenzii, Profilul firmei) · `/w/city/*` panou Primărie, folosit și de Admin (Panou, Evenimente, Obiective & ghiduri, Acțiuni comunitare, Validare, Voluntari, Mesaje, Clasament, Firme partenere) · `/w/admin/*` doar Admin (Dashboard, Conținut & moderare, Utilizatori, Setări). Ecranele: `design/final/screens/`.
