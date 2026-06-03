param(
  [Parameter(Mandatory = $true)]
  [string]$InstallerPath,

  [string]$InstallDir = (Join-Path $(if ($env:RUNNER_TEMP) { $env:RUNNER_TEMP } else { $env:TEMP }) "knapsack-install-qa"),

  [int]$TimeoutSeconds = 180
)

$ErrorActionPreference = "Stop"

function Resolve-AppRoot {
  param([string]$Root)

  $directExe = Join-Path $Root "Knapsack.exe"
  if (Test-Path $directExe) {
    return $Root
  }

  $exe = Get-ChildItem -Path $Root -Recurse -Filter "Knapsack.exe" -File -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if (-not $exe) {
    throw "Knapsack.exe was not installed or extracted under $Root"
  }
  return $exe.DirectoryName
}

function Assert-File {
  param(
    [string]$AppRoot,
    [string]$RelativePath
  )

  $path = Join-Path $AppRoot $RelativePath
  if (-not (Test-Path $path)) {
    throw "Missing installed file: $RelativePath"
  }
  $item = Get-Item $path
  if ($item.Length -eq 0) {
    throw "Installed file is empty: $RelativePath"
  }
  Write-Host "verified $RelativePath ($($item.Length) bytes)"
}

if (-not (Test-Path $InstallerPath)) {
  throw "Installer not found: $InstallerPath"
}

if (Test-Path -LiteralPath $InstallDir) {
  Remove-Item -LiteralPath $InstallDir -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null

$ext = [System.IO.Path]::GetExtension($InstallerPath).ToLowerInvariant()
Write-Host "Verifying Windows installer artifact: $InstallerPath"
Write-Host "Install/extract target: $InstallDir"

if ($ext -eq ".msi") {
  $args = @("/a", $InstallerPath, "/qn", "TARGETDIR=$InstallDir")
  $process = Start-Process -FilePath "msiexec.exe" -ArgumentList $args -PassThru -WindowStyle Hidden
} elseif ($ext -eq ".exe") {
  # NSIS requires /D=... to be the final argument. Keep the target path simple
  # and unquoted so NSIS accepts it.
  if ($InstallDir -match "\s") {
    throw "NSIS /D install path must not contain spaces: $InstallDir"
  }
  $args = @("/S", "/NS", "/D=$InstallDir")
  $process = Start-Process -FilePath $InstallerPath -ArgumentList $args -PassThru -WindowStyle Hidden
} else {
  throw "Unsupported Windows installer extension: $ext"
}

if (-not $process.WaitForExit($TimeoutSeconds * 1000)) {
  Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
  throw "Installer did not exit within $TimeoutSeconds seconds: $InstallerPath"
}

if ($process.ExitCode -ne 0) {
  throw "Installer exited with code $($process.ExitCode): $InstallerPath"
}

$appRoot = Resolve-AppRoot -Root $InstallDir
Write-Host "Resolved installed app root: $appRoot"

$required = @(
  "Knapsack.exe",
  "resources\node\node.exe",
  "resources\node\node_modules\npm\bin\npm-cli.js",
  "resources\clawdbot\package.json",
  "resources\clawdbot\openclaw.mjs",
  "resources\clawdbot\dist\entry.js",
  "resources\clawdbot\dist\index.js"
)

foreach ($file in $required) {
  Assert-File -AppRoot $appRoot -RelativePath $file
}

$clawdbotRoot = Join-Path $appRoot "resources\clawdbot"
$tarPath = Join-Path $clawdbotRoot "node_modules.tar"
$nodeModulesProbe = Join-Path $clawdbotRoot "node_modules\@earendil-works\pi-agent-core\dist\index.js"
if ((Test-Path $tarPath) -or (Test-Path $nodeModulesProbe)) {
  if (Test-Path $tarPath) {
    Write-Host "verified resources\clawdbot\node_modules.tar"
  }
  if (Test-Path $nodeModulesProbe) {
    Write-Host "verified extracted node_modules runtime probe"
  }
} else {
  throw "Missing gateway runtime dependencies: expected node_modules.tar or extracted node_modules probe"
}

Write-Host "Windows installer artifact verification passed."

$uninstaller = Join-Path $appRoot "uninstall.exe"
if (Test-Path $uninstaller) {
  $uninstall = Start-Process -FilePath $uninstaller -ArgumentList @("/S") -PassThru -WindowStyle Hidden
  if (-not $uninstall.WaitForExit(60000)) {
    Stop-Process -Id $uninstall.Id -Force -ErrorAction SilentlyContinue
    Write-Warning "Silent uninstall did not exit within 60s; cleaned install directory manually."
  }
}

try {
  if (Test-Path -LiteralPath $InstallDir) {
    Remove-Item -LiteralPath $InstallDir -Recurse -Force -ErrorAction Stop
  }
} catch {
  Write-Warning "Unable to remove test install directory ${InstallDir}: $_"
}
