<#
.SYNOPSIS
  Builds the site and packages it as a zip for manual upload to Hostinger.

.DESCRIPTION
  1. Runs `npm run build` (Astro writes the static site to dist/).
  2. Zips the *contents* of dist/ (index.html at the zip root) into
     dist/portfolio-<timestamp>.zip. dist/ is git-ignored, so the zip never
     reaches the repo.

  Then in Hostinger hPanel: File Manager -> public_html -> delete the old site
  files -> upload the zip -> Extract -> delete the zip from the server.

.EXAMPLE
  .\deploy.ps1              # build + zip
  .\deploy.ps1 -SkipBuild   # zip the existing dist/ only
#>
[CmdletBinding()]
param(
  [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

$distDir = Join-Path $PSScriptRoot 'dist'

# ---- Node version: Astro 7 needs Node >= 22 ----
function Get-NodeMajor {
  try { [int]((& node -v) -replace '^v(\d+).*', '$1') } catch { 0 }
}

if (-not $SkipBuild) {
  if ((Get-NodeMajor) -lt 22) {
    # Fall back to the nvm-windows install of Node 24 if it exists.
    $nvmNode = Join-Path $env:LOCALAPPDATA 'nvm\v24.22.2'
    if (Test-Path -LiteralPath (Join-Path $nvmNode 'node.exe')) {
      Write-Host "Default Node is too old; using $nvmNode" -ForegroundColor Yellow
      $env:PATH = "$nvmNode;$env:PATH"
    }
    if ((Get-NodeMajor) -lt 22) {
      throw "Node >= 22 is required (found $(& node -v)). Run 'nvm use 24' and try again."
    }
  }

  Write-Host "Building with Node $(& node -v)..." -ForegroundColor Cyan
  & npm run build
  if ($LASTEXITCODE -ne 0) { throw "Build failed (exit code $LASTEXITCODE)." }
}

if (-not (Test-Path -LiteralPath (Join-Path $distDir 'index.html'))) {
  throw "dist/index.html not found. Run the script without -SkipBuild."
}

# ---- Zip the contents of dist/ ----
# Remove zips from earlier runs so they are not packed into the new one.
Get-ChildItem -LiteralPath $distDir -Filter '*.zip' -File | Remove-Item -Force

$zipName = "portfolio-$(Get-Date -Format 'yyyyMMdd-HHmm').zip"
$zipPath = Join-Path $distDir $zipName

# Build the zip with System.IO.Compression instead of Compress-Archive:
# Windows PowerShell 5.1's Compress-Archive writes backslashes in entry names,
# which Linux servers (Hostinger) extract as files literally named "_astro\x.js".
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

# -Force so dotfiles such as .htaccess are included.
$files = Get-ChildItem -LiteralPath $distDir -Recurse -File -Force |
  Where-Object { $_.FullName -ne $zipPath }

$rootLength = $distDir.TrimEnd('\').Length + 1
$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($file in $files) {
    $entryName = $file.FullName.Substring($rootLength) -replace '\\', '/'
    [void][System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
      $zip, $file.FullName, $entryName, [System.IO.Compression.CompressionLevel]::Optimal)
  }
} finally {
  $zip.Dispose()
}

$sizeMb = [math]::Round((Get-Item -LiteralPath $zipPath).Length / 1MB, 2)
Write-Host ""
Write-Host "Done: $($files.Count) files -> dist\$zipName ($sizeMb MB)" -ForegroundColor Green
Write-Host "Upload it to Hostinger: File Manager -> public_html -> Upload -> Extract." -ForegroundColor Green
