$ErrorActionPreference = "Stop"
$tokens = $null
$errors = $null
$path = Join-Path $PSScriptRoot "verify-windows-installer.ps1"
$ast = [System.Management.Automation.Language.Parser]::ParseFile($path, [ref]$tokens, [ref]$errors)
if ($errors.Count -ne 0) { throw "Windows installer checker has PowerShell parse errors" }

# Load only the two pure policy functions from the real checker. Never execute
# its installer, cleanup, process, or filesystem entrypoint in these fixtures.
foreach ($name in @("Assert-ReleaseSignature", "Assert-ReleaseVersion")) {
  $functions = @($ast.FindAll({ param($node) $node -is [System.Management.Automation.Language.FunctionDefinitionAst] -and $node.Name -eq $name }, $true))
  if ($functions.Count -ne 1) { throw "Expected one real policy function: $name" }
  . ([ScriptBlock]::Create($functions[0].Extent.Text))
}

function Get-AuthenticodeSignature {
  param([string]$LiteralPath)
  if ($LiteralPath -ne "fictional.exe") { throw "Unexpected fixture signature path" }
  return $script:signature
}
function Get-Item {
  param([string]$LiteralPath)
  if ($LiteralPath -ne "fictional.exe") { throw "Unexpected fixture version path" }
  return [pscustomobject]@{ VersionInfo = [pscustomobject]@{ ProductVersion = $script:version } }
}
function Expect-Rejection {
  param([ScriptBlock]$Action)
  $rejected = $false
  try { & $Action | Out-Null } catch { $rejected = $true }
  if (-not $rejected) { throw "Unsafe fixture was accepted" }
}
function Valid-Signature {
  return [pscustomobject]@{
    Status = "Valid"
    SignerCertificate = [pscustomobject]@{ Thumbprint = "FICTIONAL-SIGNER" }
    TimeStamperCertificate = [pscustomobject]@{ Thumbprint = "FICTIONAL-TIMESTAMP" }
  }
}

$script:signature = Valid-Signature
if ((Assert-ReleaseSignature -Path "fictional.exe" -ExpectedThumbprint "FICTIONAL-SIGNER") -ne "FICTIONAL-SIGNER") { throw "Valid fixture failed" }
Expect-Rejection { Assert-ReleaseSignature -Path "fictional.exe" -ExpectedThumbprint "OTHER-SIGNER" }
foreach ($status in @("NotSigned", "HashMismatch", "NotTrusted")) {
  $script:signature = Valid-Signature
  $script:signature.Status = $status
  Expect-Rejection { Assert-ReleaseSignature -Path "fictional.exe" }
}
$script:signature = Valid-Signature
$script:signature.TimeStamperCertificate = $null
Expect-Rejection { Assert-ReleaseSignature -Path "fictional.exe" }
$script:signature = Valid-Signature
$script:signature.SignerCertificate = $null
Expect-Rejection { Assert-ReleaseSignature -Path "fictional.exe" }

foreach ($value in @("3.4.6", "3.4.6.0", "3.4.6+fixture")) {
  $script:version = $value
  Assert-ReleaseVersion -Path "fictional.exe" -ExpectedVersion "3.4.6"
}
foreach ($value in @("3.4.5", "3.4.60", "unversioned", "3.4.6.1")) {
  $script:version = $value
  Expect-Rejection { Assert-ReleaseVersion -Path "fictional.exe" -ExpectedVersion "3.4.6" }
}
Write-Host "14 Windows release signature/version policy fixtures passed; no installer or application executed."
