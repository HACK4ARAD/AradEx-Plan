---
name: fe-feature
description: Cum se adaugă un ecran sau o funcționalitate în AradEx-Frontend (Vue 3): tipuri din API.md, client API, store/composable, componente de feature în shared, view mobil, view web (pe feature), rută, navigație, stări de încărcare/gol/eroare, stil Clean Ink. Folosește-l pentru orice ecran nou (Sx, Ex, Wx) sau feature de UI.
---

# Feature nou în `AradEx-Frontend`

Căile sunt relative la rădăcina repo-ului `AradEx-Frontend` (sau a worktree-ului tău `../_wt/AradEx-Frontend-Txx`); documentele sunt în `AradEx-Plan/docs/`. Lucrezi doar în fișierele feature-ului tău. Citește `AradEx-Frontend/CLAUDE.md`, rutele din `AradEx-Plan/docs/API.md` §Rute FE, regulile ecranului din `AradEx-Plan/docs/FEATURES.md` și ecranul din planșele `AradEx-Plan/design/final/screens/` (istoric: `AradEx-Plan/design/screens/` (S = prototip original, E/W = extensii, W5+ = paginile web). Un feature `<f>` (ex. `events`) atinge: `shared/types/<f>.ts`, `shared/api/<f>.ts`, `shared/composables/use<F>.ts`, `shared/components/<f>/`, `mobile/views/<f>/`, `web/views/<f>/`, `shared/i18n/ro/<f>.json` + `en/<f>.json` (după T02 toate există ca fișiere ale culoarului tău; `router/index.ts` și `types/api.ts` nu le atingi).

## Ordinea
1. **Tipuri** în `src/shared/types/<f>.ts` (fișierul modulului tău; `api.ts` doar re-exportă, nu-l edita) — copiază DTO-urile din `docs/API.md` pentru endpoint-urile pe care le folosești (nu inventa câmpuri). Multe există deja.
2. **Client API** `src/shared/api/<f>.ts` — un fișier per interfață din BE (`EventsApi` → `events.ts`), o funcție per endpoint, tipată, prin `client.get/post/...`:
   ```ts
   export const eventsApi = {
     list: (q: EventQuery) => client.get<Page<EventSummary>>('/events', { query: q }),
     get: (id: number) => client.get<EventDto>(`/events/${id}`),
     save: (id: number) => client.post<void>(`/events/${id}/save`),
   }
   ```
3. **Stare**: date de ecran → composable `shared/composables/use<F>.ts` (`useEvents(filters)` cu `data/loading/error/reload`); stare globală (user, toast, coș de bilete) → store Pinia în `shared/stores`.
4. **Componente de feature** în `src/shared/components/<f>/` (`EventCard.vue`, `EventFilters.vue`) — tot ce apare și pe mobil și pe web. Componentele generice (`AppButton`, `AppChip`…) sunt în `components/ui` și se importă din `@/shared/components`.
5. **View mobil** `src/mobile/views/<f>/<Nume>View.vue` (lățime 390, tab bar jos, top bar cu back unde e cazul). Compune din componente; fără CSS custom dacă Tailwind + tokens ajung.
6. **View web** `src/web/views/<f>/<Nume>View.vue` — același composable, altă așezare (sidebar + conținut, tabele pentru panouri, hartă + listă side-by-side). Pagina web trebuie să rămână utilizabilă pe telefon (grid-urile devin o coloană).
7. **Rută**: după T02 (P1) fiecare rută arată deja spre fișierul ei de view din `views/<f>/` (cu `meta: { roles?, title, screen, task }`) și navigația e completă — tu doar înlocuiești conținutul view-ului tău. Dacă îți trebuie o rută nouă sau o intrare în navigație, o ceri lui P1.
8. **i18n**: toate textele în `src/shared/i18n/ro/<f>.json` (cheia `<f>.ecran.element`) și aceleași chei în `en/<f>.json` (până la T15 pot avea textul românesc).
9. **Test** (vitest, lângă fișier): composable-ul cu logică (`useTickets.test.ts`: total, validare) și componenta cu reguli vizibile (`EventCard.test.ts`: badge Popular, preț/gratuit).
10. Rulează `npm run dev`, verifică în Chrome device toolbar 390×844 și la 1280px; `npm run build` și `npm run test`.

## Stări obligatorii pe orice listă/detaliu
```vue
<Skeleton v-if="loading" :rows="3" />
<EmptyState v-else-if="!items.length" icon="event" :title="t('events.empty')" :action="t('events.search')" @action="router.push('/m/search')" />
<template v-else> … </template>
```
Erorile API → `ui.error(err)` (toast cu `detail`) + buton „Reîncearcă”. Niciodată ecran alb.

## Componente comune (există sau le creezi în shared, nu în view)
`ui/`: `AppButton` (primary negru / secondary alb cu bordură / ghost; `size`, `loading`, `icon`), `AppChip` (selectabil), `AppInput`, `AppCard`, `AppSheet` (bottom sheet mobil = dialog pe web), `AppToast`, `EmptyState`, `Skeleton`.
`<feature>/`: `auth/LoginForm`, `events/EventCard` (poză, dată, titlu, loc + distanță, preț/gratuit, badge 🔥 când `isHot`, bookmark), `offers/OfferCard`, `community/ActionCard` (dată mare în stânga, +puncte, avatare „X, Y și încă N merg”), `places/PlaceCard`, `places/AudioGuideBar`, `map/MapView`, `qr/QrCode`, `qr/QrScanner`.

## Stil (Clean Ink) — cheat sheet
- Fundal `bg-bg`, text `text-ink`, secundar `text-muted`, bordură `border-line` (clasele Tailwind definite în `base.css`).
- Card: `bg-white rounded-2xl p-4`. Buton primar: `bg-ink text-white rounded-[14px] h-12 font-semibold`. Chip: `rounded-full border px-3 h-9`, selectat = negru cu text alb.
- Titluri: `text-[28px] font-semibold tracking-[-0.02em]` (mobil), `text-[32px]` (web). Corp 15–16px, secundar 13px.
- Badge-uri: Popular `bg-yellow`, puncte `bg-green text-white`, ofertă `bg-peach text-accent`.
- Icon: `<AppIcon name="event" />` (Material Symbols Outlined, clasa `.msym`).
- Mobil: zonă de conținut cu `pb-24` ca tab bar-ul să nu acopere butonul de jos; butonul principal al ecranului e fix jos (`fixed bottom-20 inset-x-4`).

## Capcane
- TypeScript cu `erasableSyntaxOnly`: fără `enum` — folosește `type Role = 'VISITOR' | …` și `as const`.
- Leaflet are nevoie de `import 'leaflet/dist/leaflet.css'` și de `invalidateSize()` după ce containerul devine vizibil (tab-uri, sheet-uri).
- Camera (`html5-qrcode`) merge doar pe HTTPS sau `localhost`; pe telefon real folosiți URL-ul Netlify sau `npm run dev -- --host` + certificate, altfel testați cu input manual de cod.
- `speechSynthesis` pornește doar dintr-un handler de tap; pe iOS vocile se încarcă asincron (`onvoiceschanged`).
- Datele vin ca ISO cu offset — formatează cu `useFormat`, nu cu `toLocaleString` direct.
- `import.meta.env` nu merge în template — citește-l în `<script setup>` într-o constantă.
