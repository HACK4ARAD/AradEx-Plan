# Setup — ce instalezi ca să rulezi AradExperience pe laptopul tău

Ținta: în ~30 de minute (plus descărcările) ai DB + API + web + aplicația Android pornite local. Pe Windows, `../AradEx-Plan/setup-windows.ps1` verifică tot și instalează ce lipsește (cu `winget`).

## 1. Ce trebuie instalat
| Unealtă | Versiune | La ce folosește | Windows (`winget`) | macOS (`brew`) |
|---|---|---|---|---|
| Git (+ Git Bash pe Windows) | 2.4x | cele 5 repo-uri, `setup.sh` | `Git.Git` | `git` |
| JDK | **21** | backend (Gradle, Spring Boot) **și** build-ul aplicației Android | `EclipseAdoptium.Temurin.21.JDK` | `--cask temurin@21` |
| Node.js + npm | 20+ (LTS) | frontend (Vite, Vue), Capacitor | `OpenJS.NodeJS.LTS` | `node` |
| Docker Desktop | 4.x | Postgres local (`AradEx-Infrastructure`), Testcontainers în testele BE | `Docker.DockerDesktop` | `--cask docker` |
| Android Studio | 2023.3+ | SDK Android 34, emulator, `adb` — aplicația mobilă | `Google.AndroidStudio` | `--cask android-studio` |
| GitHub CLI | 2.x | `gh pr create`, review-uri, `gh run watch` (deploy-ul după merge) | `GitHub.cli` | `gh` |
| Terraform + AWS CLI (doar P1) | 1.17+ / 2.x | infrastructura AWS din `AradEx-Infrastructure/terraform` (restul echipei nu are nevoie) | `Hashicorp.Terraform`, `Amazon.AWSCLI` | `hashicorp/tap/terraform`, `awscli` |
| Claude Code | ultima | lucrul cu skill-urile din `AradEx-Plan/.claude/skills/` | vezi docs Anthropic | idem |
| IDE (opțional) | — | IntelliJ IDEA pentru BE, VS Code (+ Vue - Official) pentru FE | `JetBrains.IntelliJIDEA.Community`, `Microsoft.VisualStudioCode` | `--cask intellij-idea-ce visual-studio-code` |

Nu trebuie instalate separat: Gradle (wrapper-ul `gradlew` îl descarcă), Postgres (rulează în Docker), Capacitor (vine prin `npm install`).

### Android Studio — o singură dată
1. Pornește-l → *More Actions → SDK Manager*: bifează **Android 14 (API 34)** la *SDK Platforms* și **Android SDK Build-Tools 34**, **Platform-Tools**, **Emulator** la *SDK Tools*.
2. *Device Manager → Create device*: Pixel 3a (sau orice telefon) cu imaginea **API 34 x86_64**.
3. Variabile de mediu: `ANDROID_HOME` = `%LOCALAPPDATA%\Android\Sdk` (Windows) / `~/Library/Android/sdk` (macOS); adaugă `%ANDROID_HOME%\platform-tools` în `PATH` (pentru `adb`).
4. `JAVA_HOME` = JDK 21 (nu JDK-ul 17 din Android Studio).

### iOS
Aplicația de iPhone se construiește **doar pe macOS cu Xcode** (din App Store) + CocoaPods: `cd ../AradEx-Frontend && npx cap add ios && npx cap open ios`. Pe Windows nu există simulator iOS — testați mobilul pe emulatorul Android sau pe un iPhone real în Safari.

## 2. Repo-urile
```
mkdir -p ~/HACK4ARAD && cd ~/HACK4ARAD
git clone https://github.com/HACK4ARAD/AradEx-Plan.git
cd AradEx-Plan && ./setup.sh          # clonează celelalte 4 alături, activează hook-ul de commit în toate
git config --global user.name "Prenume Nume" && git config --global user.email "adresa@contului.github"
gh auth login                         # o dată, pentru PR-uri
```

## 3. Prima pornire (din `AradEx-Plan`)
```
(cd ../AradEx-Infrastructure && docker compose up -d)                                  # Postgres :5432
(cd ../AradEx-Backend && cp .env.example .env && ./gradlew :app:bootRun)                # API :8080, Swagger /swagger-ui.html
(cd ../AradEx-Frontend && cp .env.example .env && npm install && npm run dev)           # :5173 → web; aplicația mobilă: npm run dev:mobile (:5174)
```
În `.env`-ul BE pune un `JWT_SECRET` random de minim 32 de caractere (`openssl rand -hex 32`) și lasă `ANTHROPIC_API_KEY` gol până la T12 (cheia Claude API o are P1). Conturi demo (e-mail + parolă `demo1234`): `visitor@demo.ro`, `local@demo.ro`, `firma@demo.ro`, `primaria@demo.ro`, `admin@demo.ro`; „Am uitat parola” local: fără `MAIL_FROM`, codul apare în logul BE (butoanele „Conturi demo” de pe login le completează). SMS real local: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID` în `.env`-ul BE (opțional).

Aplicația Android pe emulator (pornește emulatorul din Android Studio întâi):
```
cd ../AradEx-Frontend
npm run dev:mobile -- --host 127.0.0.1 # aplicația mobilă (:5174) pe IPv4, ca adb reverse să-l găsească
adb reverse tcp:8080 tcp:8080          # localhost:8080 din telefon = API-ul de pe PC (și tcp:5174 pentru live reload)
npm run android:run                    # build + instalează „AradExperience” pe emulator
```
În `CORS_ORIGINS` din `.env`-ul BE trebuie să fie și `http://localhost` (originea aplicației native).

## 4. Verificare (5 minute)
- [ ] `docker ps` arată `aradexperience-db` healthy; `curl localhost:8080/api/v1/health` → `{"status":"ok"…}`
- [ ] `cd ../AradEx-Backend && ./gradlew test` verde, **fără** teste sărite (dacă `AppSmokeTest` e „skipped”, Docker nu rulează)
- [ ] `cd ../AradEx-Frontend && npm run build && npm run test` verde
- [ ] `npm run dev:mobile` → http://localhost:5174/login → `local@demo.ro` / `demo1234` → Acasă; `npm run dev` → http://localhost:5173/login → Primăria → `/city`
- [ ] aplicația „AradExperience” pe emulator: login ca mai sus
- [ ] `git status` în cele 5 repo-uri nu arată `.env`

## 5. Probleme întâlnite (și rezolvarea)
| Simptom | Cauză | Rezolvare |
|---|---|---|
| `git pull`: *SSL certificate problem: unable to get local issuer certificate* | antivirusul/rețeaua interceptează TLS cu un certificat local | `git config --global http.sslBackend schannel` (Git folosește certificatele Windows) |
| Gradle: *PKIX path building failed* | Java nu are certificatul local | înainte de `./gradlew`: `export JAVA_TOOL_OPTIONS="-Djavax.net.ssl.trustStoreType=Windows-ROOT"` (Git Bash) / `$env:JAVA_TOOL_OPTIONS="-Djavax.net.ssl.trustStoreType=Windows-ROOT"` (PowerShell) |
| `gradlew`: *Downloading … failed: timeout (10000ms)* | rețea lentă, wrapper-ul are timeout 10 s | descarcă zip-ul cu `curl -L --ssl-no-revoke -o <dir>/gradle-8.14.3-bin.zip https://services.gradle.org/distributions/gradle-8.14.3-bin.zip` în folderul pe care îl creează wrapper-ul în `~/.gradle/wrapper/dists/gradle-8.14.3-bin/<hash>/`, apoi rulează din nou |
| `docker build` al BE: *unable to get local issuer certificate* | aceeași interceptare, în container | local nu e nevoie de imagine (API-ul rulează cu `bootRun`); imaginea se construiește pe Render |
| `docker ps`: *500 Internal Server Error* / log: *no route to host 192.168.65.7:2375* | engine-ul Docker Desktop blocat la pornire | închide Docker Desktop, `wsl --terminate docker-desktop`, pornește-l din nou |
| Linux (Ubuntu): `docker compose up -d` → *unknown shorthand flag: 'd' in -d* | pachetul `docker.io` vine fără plugin-ul `compose` (există doar vechiul `docker-compose` 1.29) | `sudo apt install docker-compose-v2`; până atunci același container cu `sudo docker run -d --name aradexperience-db -e POSTGRES_DB=aradexperience -e POSTGRES_USER=arad -e POSTGRES_PASSWORD=arad -p 5432:5432 -v aradex-infrastructure_aradexperience_pg:/var/lib/postgresql/data postgres:16-alpine` |
| Linux: *permission denied … /var/run/docker.sock*; `AppSmokeTest` apare „skipped” | utilizatorul nu e în grupul `docker` (Testcontainers nu ajunge la Docker) | `sudo usermod -aG docker $USER`, apoi deconectare + conectare; verifică cu `docker ps` fără `sudo` |
| `AppSmokeTest` „skipped” deși `docker ps` merge (Docker Engine 29+) | Testcontainers 1.19.8 din BOM-ul Spring Boot 3.3.5 vorbește cu Docker pe API 1.32; Docker 29 cere ≥ 1.44 și îl refuză | `./gradlew test -Ptestcontainers.version=1.21.4` (până când `build.gradle` fixează versiunea); după `usermod`, într-un terminal vechi: `sg docker -c "./gradlew --stop; ./gradlew test -Ptestcontainers.version=1.21.4"` |
| Linux: porturile 8080/8081 ocupate de containerele altui proiect | alt `docker-proxy` ascultă acolo | `PORT=8082` în `.env`-ul BE și `VITE_API_URL=http://localhost:8082/api/v1` în `.env`-ul FE |
| BE: *password authentication failed for user "arad"* | alt Postgres ocupă `localhost:5432` (instalat pe Windows sau în WSL/Ubuntu) | oprește-l, sau mută-l pe al nostru: un fișier local (în afara repo-ului) `compose.local.yml` cu `services: { db: { ports: !override ["5433:5432"] } }`, `docker compose -f docker-compose.yml -f ../compose.local.yml up -d`, și `POSTGRES_URL=jdbc:postgresql://localhost:5433/aradexperience` în `.env`-ul BE |
| BE: *Port 8080 was already in use* | alt proces (ex. un server Java din WSL) | `PORT=8081` în `.env`-ul BE + `VITE_API_URL=http://localhost:8081/api/v1` în `.env`-ul FE (și `adb reverse tcp:8081 tcp:8081`) |
| Login din web: eroare CORS | originea nu e în `CORS_ORIGINS` | adaug-o în `.env`-ul BE (separate prin virgulă): `http://localhost:5173,http://127.0.0.1:5173,http://localhost` și repornește API-ul |
| Emulator: *ERR_EMPTY_RESPONSE* pe `localhost:5173` | Vite ascultă doar pe IPv6 (`::1`), `adb reverse` merge pe IPv4 | `npm run dev -- --host 127.0.0.1` |
| Emulator: Chrome „isn't responding” | emulatorul e lent la prima pornire (RAM puțin) | „Wait”; închide aplicațiile grele; aplicația nativă nu folosește Chrome |
| Build Android: *Unsupported class file major version 65* | Gradle prea vechi pentru JDK 21 | wrapper-ul din `AradEx-Frontend/android` e deja pe Gradle 8.14.3; verifică `JAVA_HOME` = JDK 21 |
