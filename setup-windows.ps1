# Verifică uneltele necesare pentru AradExperience pe Windows și (cu -Install) instalează cu winget ce lipsește.
# Detalii și probleme cunoscute: docs/SETUP.md
#   powershell -ExecutionPolicy Bypass -File .\setup-windows.ps1            # doar verificare
#   powershell -ExecutionPolicy Bypass -File .\setup-windows.ps1 -Install   # instalează ce lipsește
param([switch]$Install)

$ErrorActionPreference = 'Continue'
$missing = @()

function Report($name, $ok, $detail, $wingetId) {
  if ($ok) { Write-Host ("[ok]   {0,-16} {1}" -f $name, $detail) -ForegroundColor Green }
  else {
    Write-Host ("[lipsă] {0,-15} {1}" -f $name, $detail) -ForegroundColor Yellow
    if ($wingetId) { $script:missing += $wingetId }
  }
}

function FirstLine($exe, [string[]]$argList) {
  # prin cmd, ca stderr (java -version scrie acolo) să vină ca text, nu ca eroare PowerShell
  try { return ((cmd /c ('"' + $exe + '" ' + ($argList -join ' ') + ' 2>&1')) | Select-Object -First 1 | Out-String).Trim() } catch { return $null }
}

# Git
$git = Get-Command git -ErrorAction SilentlyContinue
Report 'Git' ($null -ne $git) $(if ($git) { FirstLine 'git' @('--version') } else { 'winget: Git.Git' }) 'Git.Git'

# JDK 21 (JAVA_HOME sau java din PATH)
$javaExe = if ($env:JAVA_HOME -and (Test-Path "$env:JAVA_HOME\bin\java.exe")) { "$env:JAVA_HOME\bin\java.exe" } else { (Get-Command java -ErrorAction SilentlyContinue).Source }
$javaVer = if ($javaExe) { FirstLine $javaExe @('-version') } else { $null }
$java21 = $javaVer -match '"21\.'
Report 'JDK 21' $java21 $(if ($javaVer) { "$javaVer ($javaExe)" } else { 'winget: EclipseAdoptium.Temurin.21.JDK' }) 'EclipseAdoptium.Temurin.21.JDK'
if ($javaVer -and -not $java21) { Write-Host '       JAVA_HOME trebuie să fie un JDK 21 (backend + build Android).' -ForegroundColor Yellow }

# Node 20+
$nodeVer = if (Get-Command node -ErrorAction SilentlyContinue) { FirstLine 'node' @('--version') } else { $null }
$nodeOk = $nodeVer -and ([int]($nodeVer.TrimStart('v').Split('.')[0]) -ge 20)
Report 'Node.js 20+' $nodeOk $(if ($nodeVer) { $nodeVer } else { 'winget: OpenJS.NodeJS.LTS' }) 'OpenJS.NodeJS.LTS'

# Docker
$dockerCli = Get-Command docker -ErrorAction SilentlyContinue
$dockerUp = $false
if ($dockerCli) { docker info --format '{{.ServerVersion}}' 2>$null | Out-Null; $dockerUp = ($LASTEXITCODE -eq 0) }
Report 'Docker Desktop' ($null -ne $dockerCli) $(if ($dockerCli) { if ($dockerUp) { 'engine pornit' } else { 'instalat, dar engine-ul nu răspunde — pornește Docker Desktop' } } else { 'winget: Docker.DockerDesktop' }) 'Docker.DockerDesktop'

# Android SDK 34 + adb + emulator
$sdk = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { "$env:LOCALAPPDATA\Android\Sdk" }
$studio = Test-Path "$env:ProgramFiles\Android\Android Studio"
Report 'Android Studio' $studio $(if ($studio) { "$env:ProgramFiles\Android\Android Studio" } else { 'winget: Google.AndroidStudio' }) 'Google.AndroidStudio'
Report 'Android SDK 34' (Test-Path "$sdk\platforms\android-34") "$sdk\platforms\android-34 (SDK Manager → Android 14 / API 34)" $null
Report 'adb' (Test-Path "$sdk\platform-tools\adb.exe") "$sdk\platform-tools (SDK Manager → Platform-Tools)" $null
$avds = if (Test-Path "$sdk\emulator\emulator.exe") { & "$sdk\emulator\emulator.exe" -list-avds 2>$null } else { @() }
Report 'Emulator (AVD)' (@($avds).Count -gt 0) $(if (@($avds).Count) { ($avds -join ', ') } else { 'Device Manager → Create device (API 34 x86_64)' }) $null
if (-not $env:ANDROID_HOME) { Write-Host "       Setează ANDROID_HOME=$sdk (variabilă de mediu de utilizator)." -ForegroundColor Yellow }

# GitHub CLI
$gh = Get-Command gh -ErrorAction SilentlyContinue
Report 'GitHub CLI' ($null -ne $gh) $(if ($gh) { FirstLine 'gh' @('--version') } else { 'winget: GitHub.cli' }) 'GitHub.cli'

# Git pe certificatele Windows (rețele/antivirus care interceptează TLS)
if ($git) {
  $backend = (git config --global --get http.sslBackend)
  if ($backend -ne 'schannel') { Write-Host '[sfat] git config --global http.sslBackend schannel   (dacă git pull dă „unable to get local issuer certificate”)' -ForegroundColor Cyan }
}

if ($missing.Count -eq 0) { Write-Host "`nToate uneltele de bază sunt instalate. Pasul următor: ./setup.sh (din Git Bash) — vezi docs/SETUP.md." -ForegroundColor Green; exit 0 }
if (-not $Install) { Write-Host "`nLipsesc: $($missing -join ', '). Rulează din nou cu -Install ca să le instalez cu winget." -ForegroundColor Yellow; exit 1 }

foreach ($id in $missing) {
  Write-Host "→ winget install $id" -ForegroundColor Cyan
  winget install --id $id -e --source winget --accept-package-agreements --accept-source-agreements
}
Write-Host "`nGata. Deschide un terminal NOU (PATH actualizat) și rulează scriptul din nou pentru verificare." -ForegroundColor Green
