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

  ; Write a self-contained PowerShell download script to a temp file.
  ; Writing to a file avoids the quoting nightmare of passing a long
  ; inline -Command string through NSIS → cmd → powershell.
  FileOpen  $R0 "$TEMP\knapsack-dl.ps1" w
  FileWrite $R0 '[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12$\r$\n'
  FileWrite $R0 '$ProgressPreference = "SilentlyContinue"$\r$\n'
  FileWrite $R0 '$ErrorActionPreference = "Stop"$\r$\n'
  FileWrite $R0 '$dest = "$env:TEMP\knapsack-setup-full.exe"$\r$\n'
  FileWrite $R0 'try {$\r$\n'
  FileWrite $R0 '  Write-Host "Fetching latest version info..."$\r$\n'
  FileWrite $R0 '  $meta    = Invoke-RestMethod "https://github.com/knap-ai/knapsack_desktop/releases/latest/download/latest.json"$\r$\n'
  FileWrite $R0 '  $zipUrl  = $meta.platforms."windows-x86_64".url$\r$\n'
  FileWrite $R0 '  $exeUrl  = $zipUrl -replace "\.nsis\.zip$", ".exe"$\r$\n'
  FileWrite $R0 '  $version = $meta.version$\r$\n'
  FileWrite $R0 '  Write-Host "Downloading Knapsack $version ..."$\r$\n'
  FileWrite $R0 '  Invoke-WebRequest -Uri $exeUrl -OutFile $dest -UseBasicParsing$\r$\n'
  FileWrite $R0 '  Write-Host "Download complete."$\r$\n'
  FileWrite $R0 '} catch {$\r$\n'
  FileWrite $R0 '  Write-Host "ERROR: $_"$\r$\n'
  FileWrite $R0 '  exit 1$\r$\n'
  FileWrite $R0 '}$\r$\n'
  FileClose $R0

  DetailPrint "Contacting GitHub to find the latest release..."
  nsExec::ExecToLog 'powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$TEMP\knapsack-dl.ps1"'
  Pop $0
  Delete "$TEMP\knapsack-dl.ps1"

  ${If} $0 != 0
    MessageBox MB_OK|MB_ICONSTOP \
      "Could not download Knapsack.$\n$\nPlease check your internet connection and try again.$\n$\nAlternatively, download directly from:$\nhttps://github.com/knap-ai/knapsack_desktop/releases/latest"
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
