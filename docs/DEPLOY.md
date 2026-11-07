# Deploy

## Local
Ce instalezi și problemele cunoscute (TLS interceptat, porturi ocupate, emulator): `docs/SETUP.md`.
```
cp .env.example .env            # completează ANTHROPIC_API_KEY (Claude API), JWT_SECRET
(cd ../AradEx-Infrastructure && docker compose up -d)            # Postgres
cd ../AradEx-Backend && ./gradlew :app:bootRun               # :8080
cd ../AradEx-Frontend && npm install && npm run dev            # :5173
cd ../AradEx-Frontend && npm run android:run                  # aplicația Android pe emulator (T15)
```
Aplicația Android de demo: `npm run android:run` construiește APK-ul de debug cu `VITE_API_URL` din `.env`. Pentru demo pe telefon pune `VITE_API_URL=https://aradexperience.site/api/v1`. Originea aplicației native, `http://localhost`, trebuie să fie în `CORS_ORIGINS`; în producție o adaugă P1 în Terraform, dacă e nevoie.

## Producție: AWS (T04 → T16a)

### Ce rulează unde: aplicația mobilă vs web
| | Ce e | Cine o folosește | Unde rulează |
|---|---|---|---|
| **Aplicația mobilă** — produsul | Vue `/m` împachetat cu Capacitor: **Android** (APK/AAB) și **iOS** (Xcode), toate ecranele pentru vizitator și localnic (evenimente, bilete, locuri + ghid, hartă, oferte, comunitate, chat, itinerar) | vizitatori, localnici, voluntari; firma / Primăria doar pentru operațiunile de teren | pe telefon (se instalează, nu se găzduiește pe AWS — T15); apelează API-ul `https://aradexperience.site/api/v1` |
| **Web** — prezentare + panouri | `https://aradexperience.site`: **site-ul de prezentare** (cu „Descarcă aplicația”) și **panourile** Primăriei, firmelor și Adminului (`/w/login`, `/w/city/*`, `/w/business/*`, `/w/admin/*`) | Primăria, firmele, Adminul; vizitatorii văd doar prezentarea | AWS, containerul nginx `aradex-web` |

Paginile publice web (W5–W15) nu se fac; ce e pentru public e doar în aplicație (decizia din `docs/PLAN.md`, T20). Imaginea web conține tot build-ul Vite, deci `/m` merge și în browser, dar doar pentru test și ca rezervă, nu ca produs.

**URL:** https://aradexperience.site (`www.` redirecționează aici) · API: `https://aradexperience.site/api/v1` · health: `https://aradexperience.site/api/v1/health` · Swagger: `https://aradexperience.site/swagger-ui.html`

Totul e descris în Terraform în `AradEx-Infrastructure/terraform`. Runbook-ul complet (de la zero la live, redeploy, ștergere) e în `AradEx-Infrastructure/README.md`; designul și deciziile, în `AradEx-Infrastructure/docs/superpowers/specs/`.

| Componentă | Unde | Detalii |
|---|---|---|
| Domeniu + DNS | Hostinger (cumpărat) → Route 53 | nameserverele `ns-1529.awsdns-63.org`, `ns-1983.awsdns-55.co.uk`, `ns-293.awsdns-36.com`, `ns-714.awsdns-25.net` |
| HTTPS + rutare | ALB public `aradex-api`, certificat ACM (`eu-north-1`) | HTTP → HTTPS, `www` → apex; `/api/*`, `/swagger-ui*`, `/v3/api-docs*` → API; restul → frontend-ul web (nginx) |
| API | ECS Fargate, serviciul `aradex-api` (x86, 0,5 vCPU / 1 GB), imaginea din ECR `aradex-api` | `Dockerfile`-ul din `AradEx-Backend`; env: `POSTGRES_*`, `JWT_SECRET`, `ANTHROPIC_API_KEY` (din Secrets Manager, `aradex/anthropic`), `ANTHROPIC_MODEL=claude-haiku-5-5`, `CORS_ORIGINS=https://aradexperience.site`, `SPRING_PROFILES_ACTIVE=prod` |
| Web (prezentare + panouri) | ECS Fargate, serviciul `aradex-web` (nginx), imaginea din ECR `aradex-web` | `deploy/Dockerfile` + `deploy/nginx.conf` din `AradEx-Frontend`; `VITE_API_URL` din SSM `/aradex/web/api_url` |
| DB | RDS PostgreSQL 16, `db.t4g.micro`, privată | Flyway rulează migrările + seed-ul la pornirea API-ului; datele demo sunt identice cu cele locale |
| Alerte | SNS → email (Zoltan) | API fără taskuri sănătoase, erori 5xx, CPU; buget 50 $ cu alertă la 20 $ |

**Fără CloudFront:** contul AWS nu poate crea distribuții CloudFront până nu e verificat de AWS Support, așa că HTTPS-ul se termină direct pe ALB.

### Cum ajunge codul în producție
- **Automat:** orice merge pe `main` în `AradEx-Backend` sau `AradEx-Frontend` rulează `.github/workflows/deploy.yml` din repo-ul respectiv:
  - **BE:** `./gradlew test`, apoi imaginea, apoi ECS;
  - **FE:** `npm run test` și `npm run build`, apoi imaginea nginx, apoi ECS.

  Dacă testele pică, nu se face deploy. Dacă taskul nou nu pornește, ECS revine singur la versiunea anterioară. **Un merge pe `main` înseamnă deploy în producție în ~5–8 minute.**
- **Manual:** tab-ul *Actions* din repo → *Deploy API* / *Deploy web* → *Run workflow*, sau `gh workflow run deploy.yml -R HACK4ARAD/AradEx-Backend`.
- **Infrastructura** (rețea, DB, ALB, servicii) se schimbă doar cu `terraform plan` + `apply` în `AradEx-Infrastructure`, de P1.

### Cine are acces
- **Contul AWS** `712710404828` (regiunea `eu-north-1`): Zoltan (P1).
- **GitHub Actions:** utilizatorii IAM `aradex-gha-backend` și `aradex-gha-frontend`, cu permisiuni doar pentru deploy-ul repo-ului lor. Cheile sunt în secretele repo-urilor și le rotește `AradEx-Infrastructure/scripts/github-keys.sh`. Organizația AWS a contului interzice OIDC.
- **Logurile** sunt în CloudWatch: `/aradex/api` și `/aradex/web`. Cine nu are acces la AWS vede rularea deploy-ului în tab-ul *Actions* și cere logurile aplicației lui P1.

### După demo
Luni: `AradEx-Infrastructure/scripts/destroy.sh` șterge tot; rămâne doar snapshot-ul final al bazei de date (`aradex-final`). Domeniul rămâne la Hostinger.
