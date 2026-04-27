; Knapsack Web Installer (stub)
; Downloads the full NSIS installer from the latest GitHub release at runtime.
; The compiled stub is ~400 KB vs the full installer (100+ MB), giving users
; a fast initial download while the real payload streams in the background.

Unicode True
!include "MUI2.nsh"
!include "LogicLib.nsh"

;------------------------------------------------------------------
; Metadata
;------------------------------------------------------------------
Name "Knapsack"
OutFile "Knapsack-web-setup.exe"
RequestExecutionLevel user
ShowInstDetails show
SetCompressor /SOLID lzma

BrandingText "Knapsack by Knap"

;------------------------------------------------------------------
; Interface
;------------------------------------------------------------------
!define MUI_ICON "..\src-tauri\icons\icon.ico"
!define MUI_ABORTWARNING
!define MUI_ABORTWARNING_TEXT "Cancel the Knapsack installation?"

; Header text shown on the instfiles page
!define MUI_INSTFILESPAGE_FINISHHEADER_TEXT    "Knapsack is ready"
!define MUI_INSTFILESPAGE_FINISHHEADER_SUBTEXT "Installation completed successfully."
!define MUI_INSTFILESPAGE_ABORTHEADER_TEXT     "Installation cancelled"
!define MUI_INSTFILESPAGE_ABORTHEADER_SUBTEXT  "The installation was aborted."

!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_LANGUAGE "English"

;------------------------------------------------------------------
; Main section
;------------------------------------------------------------------
Section "Install" SecMain

  SetDetailsPrint both

  ; Clean up any stale error file from a previous failed run.
  Delete "$TEMP\knapsack-dl-error.txt"

  ; Write a self-contained PowerShell download script to a temp file.
  ; Writing to a file avoids the quoting nightmare of passing a long
  ; inline -Command string through NSIS -> cmd -> powershell.
  FileOpen  $R0 "$TEMP\knapsack-dl.ps1" w

  ; --- Environment setup -------------------------------------------------
  ; Enable TLS 1.2 (required by GitHub). TLS 1.3 is added best-effort so
  ; this still works on older .NET Frameworks that don't define the enum.
  FileWrite $R0 'try { [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls13 } catch { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 }$\r$\n'
  ; Honor the user's authenticated corporate proxy, if any. Without this
  ; .NET refuses to use the system proxy and downloads fail on many
  ; enterprise networks even when browsers and curl.exe work fine.
  FileWrite $R0 'try { [System.Net.WebRequest]::DefaultWebProxy.Credentials = [System.Net.CredentialCache]::DefaultCredentials } catch {}$\r$\n'
  FileWrite $R0 '$ProgressPreference = "SilentlyContinue"$\r$\n'
  FileWrite $R0 '$ErrorActionPreference = "Stop"$\r$\n'
  FileWrite $R0 '$dest   = Join-Path $env:TEMP "knapsack-setup-full.exe"$\r$\n'
  FileWrite $R0 '$errLog = Join-Path $env:TEMP "knapsack-dl-error.txt"$\r$\n'
  FileWrite $R0 '$ua     = "Knapsack-Installer/1.0"$\r$\n'
  FileWrite $R0 'if (Test-Path $dest) { Remove-Item $dest -Force -ErrorAction SilentlyContinue }$\r$\n'

  ; --- Retry helper ------------------------------------------------------
  FileWrite $R0 'function Invoke-WithRetry([ScriptBlock]$Block, [string]$Label, [int]$Attempts = 4) {$\r$\n'
  FileWrite $R0 '  $delay = 2$\r$\n'
  FileWrite $R0 '  for ($i = 1; $i -le $Attempts; $i++) {$\r$\n'
  FileWrite $R0 '    try { return & $Block }$\r$\n'
  FileWrite $R0 '    catch {$\r$\n'
  FileWrite $R0 '      Write-Host ("{0} attempt {1}/{2} failed: {3}" -f $Label, $i, $Attempts, $_.Exception.Message)$\r$\n'
  FileWrite $R0 '      if ($i -eq $Attempts) { throw }$\r$\n'
  FileWrite $R0 '      Start-Sleep -Seconds $delay$\r$\n'
  FileWrite $R0 '      $delay = [Math]::Min($delay * 2, 30)$\r$\n'
  FileWrite $R0 '    }$\r$\n'
  FileWrite $R0 '  }$\r$\n'
  FileWrite $R0 '}$\r$\n'

  ; --- Main flow ---------------------------------------------------------
  FileWrite $R0 'try {$\r$\n'
  FileWrite $R0 '  Write-Host "Fetching latest version info..."$\r$\n'
  FileWrite $R0 '  $metaUrl = "https://github.com/knap-ai/knapsack_desktop/releases/latest/download/latest.json"$\r$\n'
  FileWrite $R0 '  $meta    = Invoke-WithRetry -Label "Metadata" -Block { Invoke-RestMethod -Uri $metaUrl -UseBasicParsing -TimeoutSec 30 -Headers @{ "User-Agent" = $ua } }$\r$\n'
  FileWrite $R0 '  $plat    = $meta.platforms."windows-x86_64"$\r$\n'
  FileWrite $R0 '  if (-not $plat -or -not $plat.url) { throw "latest.json has no windows-x86_64 entry" }$\r$\n'
  FileWrite $R0 '  $zipUrl  = $plat.url$\r$\n'
  FileWrite $R0 '  $exeUrl  = $zipUrl -replace "_en-US\.nsis\.zip$", "-setup.exe"$\r$\n'
  FileWrite $R0 '  $version = $meta.version$\r$\n'
  FileWrite $R0 '  Write-Host "Downloading Knapsack $version ..."$\r$\n'
  FileWrite $R0 '  Write-Host "URL: $exeUrl"$\r$\n'

  ; Prefer curl.exe (ships with Windows 10 1803+). It has built-in retry,
  ; picks up system proxy env vars automatically, and is far more reliable
  ; than Invoke-WebRequest on slow or proxied connections. Fall back to
  ; Invoke-WebRequest with our own retry loop if curl isn't available.
  FileWrite $R0 '  $curl = Join-Path $env:SystemRoot "System32\curl.exe"$\r$\n'
  FileWrite $R0 '  if (Test-Path $curl) {$\r$\n'
  FileWrite $R0 '    Write-Host "Using curl.exe"$\r$\n'
  FileWrite $R0 '    & $curl --fail --location --retry 5 --retry-delay 2 --retry-all-errors --connect-timeout 30 --max-time 1800 -A $ua -o $dest $exeUrl$\r$\n'
  FileWrite $R0 '    if ($LASTEXITCODE -ne 0) { throw "curl.exe failed (exit $LASTEXITCODE)" }$\r$\n'
  FileWrite $R0 '  } else {$\r$\n'
  FileWrite $R0 '    Write-Host "curl.exe not found, using Invoke-WebRequest"$\r$\n'
  FileWrite $R0 '    Invoke-WithRetry -Label "Download" -Block { Invoke-WebRequest -Uri $exeUrl -OutFile $dest -UseBasicParsing -TimeoutSec 1800 -Headers @{ "User-Agent" = $ua } }$\r$\n'
  FileWrite $R0 '  }$\r$\n'

  ; Validate. GitHub occasionally serves a tiny HTML redirect/error page
  ; with HTTP 200 under duress - that would masquerade as a successful
  ; download and then blow up on ExecWait. The real installer is >50 MB.
  FileWrite $R0 '  if (-not (Test-Path $dest)) { throw "Download produced no file" }$\r$\n'
  FileWrite $R0 '  $size = (Get-Item $dest).Length$\r$\n'
  FileWrite $R0 '  if ($size -lt 10485760) { throw ("Downloaded file is too small ({0} bytes) - likely an error page" -f $size) }$\r$\n'
  FileWrite $R0 '  Write-Host ("Download complete ({0:N0} bytes)." -f $size)$\r$\n'
  FileWrite $R0 '} catch {$\r$\n'
  FileWrite $R0 '  $msg = ($_.Exception.Message -replace "[\r\n]+", " ").Trim()$\r$\n'
  FileWrite $R0 '  if ($msg.Length -gt 400) { $msg = $msg.Substring(0, 400) + "..." }$\r$\n'
  FileWrite $R0 '  Write-Host "ERROR: $msg"$\r$\n'
  ; WriteAllText (no newline, no BOM) keeps the file to a single NSIS
  ; FileRead without a BOM byte contaminating the parsed message.
  FileWrite $R0 '  try { [System.IO.File]::WriteAllText($errLog, $msg, (New-Object System.Text.UTF8Encoding $false)) } catch {}$\r$\n'
  FileWrite $R0 '  if (Test-Path $dest) { Remove-Item $dest -Force -ErrorAction SilentlyContinue }$\r$\n'
  FileWrite $R0 '  exit 1$\r$\n'
  FileWrite $R0 '}$\r$\n'
  FileClose $R0

  DetailPrint "Contacting GitHub to find the latest release..."
  nsExec::ExecToLog 'powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$TEMP\knapsack-dl.ps1"'
  Pop $0
  Delete "$TEMP\knapsack-dl.ps1"

  ${If} $0 != 0
    ; Read the specific error message captured by the PowerShell script so
    ; the user sees something actionable ("curl.exe failed (exit 35)",
    ; "The remote name could not be resolved", etc.) rather than a generic
    ; "check your internet connection" when the real cause is different.
    ; The PowerShell script writes a single line with no trailing newline
    ; via WriteAllText, so one FileRead captures the whole message.
    StrCpy $R2 ""
    ClearErrors
    FileOpen $R1 "$TEMP\knapsack-dl-error.txt" r
    ${IfNot} ${Errors}
      FileRead $R1 $R2
      FileClose $R1
    ${EndIf}
    Delete "$TEMP\knapsack-dl-error.txt"
    ${If} $R2 == ""
      StrCpy $R3 ""
    ${Else}
      StrCpy $R3 "$\n$\nDetails: $R2"
    ${EndIf}
    MessageBox MB_OK|MB_ICONSTOP \
      "Could not download Knapsack.$R3$\n$\nPlease check your internet connection and try again.$\n$\nAlternatively, download directly from:$\nhttps://github.com/knap-ai/knapsack_desktop/releases/latest"
    Quit
  ${EndIf}

  DetailPrint "Launching installer..."
  ExecWait '"$TEMP\knapsack-setup-full.exe"' $0
  Delete "$TEMP\knapsack-setup-full.exe"

  ${If} $0 != 0
    MessageBox MB_OK|MB_ICONEXCLAMATION \
      "The Knapsack installer exited with code $0.$\nInstallation may not have completed."
  ${EndIf}

SectionEnd
