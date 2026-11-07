# T21: conturile personale intră cu telefon + cod OTP

**Data:** 7 nov 2026 · **Owner:** Zoltan (P1) · **Branch:** `feat/T21-phone-otp` în BE, FE, Infrastructure și Plan · **Stare:** design aprobat în discuție.

## Ce vrem
- **Conturile personale** (Vizitator, Localnic) intră în aplicația mobilă **doar cu numărul de telefon și un cod OTP de 6 cifre**, fără email și fără parolă.
- **Firmele, Primăria și Adminul** rămân pe email + parolă, atât în aplicație (link „Ești firmă sau Primărie?”), cât și pe web (W0).
- **Numerele `0799000xxx` sunt de demo:** nu se trimite SMS, iar codul se întoarce în răspuns și apare în aplicație.
- **Orice alt număr** primește un SMS real prin **Twilio Verify**. SMS-ul prin AWS e blocat de SCP-ul contului: SNS SMS și End User Messaging sunt interzise explicit pe planul gratuit; am verificat pe 7 nov.

## Fluxul (aplicația mobilă)
1. Numărul de telefon (`07xx xxx xxx` sau `+…`) → **Trimite codul** (`POST /auth/otp/request`).
2. Codul de 6 cifre → `POST /auth/otp/verify`:
   - **numărul are deja cont:** primește `{ token, user }` și intră;
   - **numărul e nou:** primește `{ signupToken }` și trece la pasul 3.
3. Numele + Vizitator / Localnic → `POST /auth/otp/register { signupToken, displayName, role }` → `{ token, user }`.

Codul se poate retrimite după 60 s. Linkul „Ești firmă sau Primărie?” deschide formularul existent cu email + parolă (doar conectare).

## Backend
- **Telefonul** se normalizează în E.164:
  - `07xxxxxxxx`, `7xxxxxxxx`, `407…` și `0040…` devin `+407…`;
  - un număr care începe cu `+` rămâne cum e;
  - valid = `^\+[1-9]\d{7,14}$`, altfel 400.
- **Număr de demo** = `^\+40799000\d{3}$`.
- **`POST /auth/otp/request {phone}`** → `202 { retryAfterSeconds: 60, demoCode? }`.
  - **Limite:** 1 cerere la 60 s pe număr (altfel 429 cu `retryAfterSeconds`) și maximum 5 coduri pe zi pe număr (429).
  - **Demo:** codul e generat de noi (`SecureRandom`), păstrat doar ca hash, valid 5 minute; `demoCode` vine în răspuns.
  - **Număr real:** Twilio Verify `Verifications` (`Channel=sms`). Dacă Twilio nu e configurat → 503 „SMS indisponibil momentan”.
- **`POST /auth/otp/verify {phone, code}`** →
  - `{ token, user }` dacă există cont pe număr;
  - altfel `{ signupToken }`: un JWT de 15 minute, cu `purpose=signup` și `phone`, care nu e acceptat ca autentificare.

  Pentru demo: ultimul cod nefolosit și neexpirat, maximum 5 încercări, apoi trebuie cerut altul. Pentru numere reale: Twilio `VerificationCheck`. Cod greșit sau expirat → 401 „Cod invalid sau expirat”.
- **`POST /auth/otp/register {signupToken, displayName, role: VISITOR|LOCAL}`** → `201 { token, user }`. Un număr care între timp are cont → 409.
- **Conturile personale nu mai folosesc email:**
  - `POST /auth/register` acceptă doar `BUSINESS`;
  - `POST /auth/login` refuză Vizitatorii și Localnicii cu 403 „Conturile personale intră cu numărul de telefon”, dar doar după ce parola e corectă, ca să nu spună ce conturi există.
- **`UserDto`** primește `phone` (null pentru firme etc.); `email` devine opțional. JWT: claim-ul `email` lipsește la conturile cu telefon.
- **Migrarea `V11__phone_otp.sql`:**
  - `users.phone VARCHAR(16) UNIQUE NULL`; `email` și `password_hash` devin NULL, cu `CHECK (email IS NOT NULL OR phone IS NOT NULL)`;
  - tabela `otp_codes (id, phone, provider 'LOCAL'|'TWILIO', code_hash NULL, attempts, expires_at, consumed_at, created_at)`;
  - numerele de demo pe conturile din seed: `visitor@demo.ro` → `+40799000001`, `local@demo.ro` → `+40799000002`, localnicii fictivi 6–12 → `+40799000003`–`009`.
- **Twilio** prin `RestClient` din Spring, fără SDK nou. Config: `app.twilio.account-sid`, `auth-token`, `verify-service-sid` (din `TWILIO_*`).

## Infrastructură
- Secretul `aradex/twilio` (JSON: `account_sid`, `auth_token`, `verify_service_sid`), cu placeholder în Terraform; valoarea reală o pune Zoltan cu `scripts/set-twilio-keys.sh` (nu în chat).
- Task-ul API primește `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID` din secret.
- `terraform plan` arătat și aprobat înainte de apply.

## Frontend
- **Aplicația mobilă:**
  - ecranul de login (S12) devine fluxul cu telefon în 3 pași, cu „Cod demo: 123456” sub câmp când vine `demoCode`;
  - butoanele demo pentru Vizitator și Localnic completează `0799000001` / `0799000002`;
  - linkul „Ești firmă sau Primărie?” → email + parolă;
  - Profilul arată telefonul.
- **Web (W0):** fără tab-ul „Cont personal”; rămâne login-ul panourilor și „Cont nou de firmă”.

## Erori și cazuri limită
- 429 cu `retryAfterSeconds` (aplicația arată numărătoarea inversă).
- 503 când Twilio lipsește, cu mesaj clar.
- Un `signupToken` expirat la înregistrare → 401: aplicația te întoarce la pasul 1.
- Twilio refuză numărul (de exemplu un număr neverificat pe un cont trial) → 400 cu mesajul „Numărul nu poate primi SMS”.

## Verificare
- **BE:** teste pentru normalizarea telefonului; `OtpService` (demo, limite, expirare, încercări, Twilio cu mock HTTP); `AuthService` (login sau register refuzat pentru personal, register cu `signupToken`); controller (coduri HTTP, ProblemDetail); `./gradlew test` verde.
- **FE:** teste pentru normalizare și pașii fluxului; `npm run test`, `build`, `check:web`; în browser (`dev:mobile`) contul demo `0799000001` intră și un număr demo nou își creează cont.
- **Producție:** după apply și deploy, demo-ul merge; un SMS real ajunge după ce Zoltan pune cheile Twilio.

## În afara scopului
Schimbarea numărului din Profil, login cu telefon pe web, SMS prin AWS (blocat de SCP), limitare pe IP.
