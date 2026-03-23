# Packs the web page files into a zip under dist/
param(
    [string]$SourceDir = (Resolve-Path "$PSScriptRoot"),
    [string]$OutDir = (Join-Path $PSScriptRoot 'dist'),
    [string]$ZipName = $null,
    [switch]$IncludeReadme
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Files required to run the static webpage
$files = @(
    'index.html',
    'script.js',
    'style.css',
    'side-panel.css',
    'drag.css'
)

if ($IncludeReadme) {
    $files += 'README.md'
}

if (-not (Test-Path $OutDir)) {
    New-Item -ItemType Directory -Path $OutDir | Out-Null
}

if (-not $ZipName) {
    $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $ZipName = "equation-webpage-$timestamp.zip"
}

$destZip = Join-Path $OutDir $ZipName

# Validate files exist and provide helpful warnings
$missing = @()
foreach ($f in $files) {
    $p = Join-Path $SourceDir $f
    if (-not (Test-Path $p)) { $missing += $f }
}

if ($missing.Count -gt 0) {
    Write-Warning ("Missing files: {0}" -f ($missing -join ', '))
}

# Create archive with clean, flat structure based on relative names
Push-Location $SourceDir
try {
    Compress-Archive -Path $files -DestinationPath $destZip -Force
    Write-Host ("Created: {0}" -f $destZip)
}
finally {
    Pop-Location
}
