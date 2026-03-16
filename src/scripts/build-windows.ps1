# build-windows.ps1 — Build Knapsack for Windows
#
# Prerequisites:
#   1. Rust toolchain: https://rustup.rs/
#   2. Node.js >= 16: https://nodejs.org/
#   3. Visual Studio Build Tools with "Desktop development with C++"
#   4. WebView2 runtime (pre-installed on Windows 10 21H2+ and Windows 11)
#
# Usage:
#   cd src
#   powershell -ExecutionPolicy Bypass -File scripts/build-windows.ps1
#
# Or from the repo root:
#   cd knapsack_desktop/src
#   powershell -ExecutionPolicy Bypass -File scripts/build-windows.ps1

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

Write-Host "`n=== Knapsack Windows Build ===" -ForegroundColor Cyan

# Check prerequisites
Write-Host "`n[1/5] Checking prerequisites..." -ForegroundColor Yellow

if (-not (Get-Command "rustc" -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Rust not found. Install from https://rustup.rs/" -ForegroundColor Red
    exit 1
}
Write-Host "  Rust: $(rustc --version)"

if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js not found. Install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}
Write-Host "  Node: $(node --version)"

if (-not (Get-Command "npm" -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: npm not found." -ForegroundColor Red
    exit 1
}
Write-Host "  npm: $(npm --version)"

# Check for cargo-tauri CLI
$tauriCli = npm list @tauri-apps/cli 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Installing @tauri-apps/cli..." -ForegroundColor Yellow
    npm install --save-dev "@tauri-apps/cli@^1.6.3"
}

# Install npm dependencies
Write-Host "`n[2/5] Installing npm dependencies..." -ForegroundColor Yellow
npm install

# Set up .env if missing
if (-not (Test-Path ".env")) {
    Write-Host "`n[3/5] Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
} else {
    Write-Host "`n[3/5] .env already exists - skipping." -ForegroundColor Yellow
}

# Run prebuild scripts
Write-Host "`n[4/5] Running prebuild scripts..." -ForegroundColor Yellow
node scripts/sync-version.cjs
node scripts/prepare-node.cjs
node scripts/prune-clawdbot.cjs

# Build the Tauri app (use load-env-and-run.cjs so .env vars are available
# to the Rust env!() macro at compile time)
Write-Host "`n[5/5] Building Tauri app for Windows..." -ForegroundColor Yellow
node scripts/load-env-and-run.cjs npx tauri build
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n=== Build FAILED ===" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "`n=== Build Complete ===" -ForegroundColor Green

$bundleDir = Join-Path (Get-Location) "src-tauri\target\release\bundle"
Write-Host "Output files are in: $bundleDir" -ForegroundColor Cyan

# Try to launch the NSIS installer (.exe), fall back to MSI, fall back to opening the folder
$nsisExe = Get-ChildItem -Path "$bundleDir\nsis\*.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
$msiFile = Get-ChildItem -Path "$bundleDir\msi\*.msi" -ErrorAction SilentlyContinue | Select-Object -First 1

if ($nsisExe) {
    Write-Host "Launching installer: $($nsisExe.FullName)" -ForegroundColor Green
    Invoke-Item $nsisExe.FullName
} elseif ($msiFile) {
    Write-Host "Launching installer: $($msiFile.FullName)" -ForegroundColor Green
    Invoke-Item $msiFile.FullName
} else {
    Write-Host "No installer found — opening bundle folder..." -ForegroundColor Yellow
    explorer.exe $bundleDir
}
