# Deploy

## Local
Ce instalezi și problemele cunoscute (TLS interceptat, porturi ocupate, emulator): `docs/SETUP.md`.
```
cp .env.example .env            # completează OPENAI_API_KEY, JWT_SECRET
(cd ../AradEx-Infrastructure && docker compose up -d)            # Postgres
cd ../AradEx-Backend && ./gradlew :app:bootRun               # :8080
cd ../AradEx-Frontend && npm install && npm run dev            # :5173
cd ../AradEx-Frontend && npm run android:run                  # aplicația Android pe emulator (T15)
```
Aplicația Android de demo: `npm run android:run` construiește APK-ul de debug cu `VITE_API_URL` din `.env` — pentru demo pe telefon pune URL-ul public al API-ului (Render) și adaugă `http://localhost` în `CORS_ORIGINS`.

## Producție (T04 → T16)
| Componentă | Unde | Config |
|---|---|---|
| DB | Neon (free) sau Render Postgres | copiază connection string în `POSTGRES_URL` (format JDBC: `jdbc:postgresql://host/db?sslmode=require`), user/parolă |
| API | Render Web Service, Docker — repo `AradEx-Backend`, `Dockerfile` la rădăcină | env: `POSTGRES_*`, `JWT_SECRET`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `CORS_ORIGINS=https://<app>.netlify.app`, `SPRING_PROFILES_ACTIVE=prod`; health check `/api/v1/health` |
| APP | Netlify — repo `AradEx-Frontend` | base `/` (rădăcina repo-ului), build `npm run build`, publish `dist`, env `VITE_API_URL=https://<api>.onrender.com/api/v1`; `public/_redirects`: `/* /index.html 200` |

Completați aici URL-urile reale când există:
- API: `https://________.onrender.com`
- APP: `https://________.netlify.app`
- DB: ________ (cine are credențialele)

Note: Render free adoarme după 15 min de inactivitate → prima cerere durează ~30 s. Duminică dimineață deschideți API-ul cu 10 minute înainte de demo (sau țineți un ping la 10 minute).
Migrările + seed-ul rulează automat la pornirea API-ului (Flyway). Datele demo trebuie să fie identice cu cele locale.
