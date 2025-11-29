<#
Generate PNG fallbacks from the SVG icons.

Requires ImageMagick (`magick`) or Inkscape installed and on PATH.

Usage: run this from the `MessApp` folder in PowerShell:
  ./generate-icons.ps1

#>

Write-Host "Generating PNG icons from SVG sources..."

# ensure images directory exists
if (-not (Test-Path -Path .\images)) {
  New-Item -ItemType Directory -Path .\images | Out-Null
}

if (Get-Command magick -ErrorAction SilentlyContinue) {
  Write-Host "Using ImageMagick (magick)"
  magick convert icon-192.svg -resize 192x192 images/icon-192.png
  magick convert icon-512.svg -resize 512x512 images/icon-512.png
  Write-Host "Generated images/icon-192.png and images/icon-512.png"
  return
}

if (Get-Command inkscape -ErrorAction SilentlyContinue) {
  Write-Host "Using Inkscape"
  inkscape icon-192.svg --export-type=png --export-filename=images/icon-192.png --export-width=192 --export-height=192
  inkscape icon-512.svg --export-type=png --export-filename=images/icon-512.png --export-width=512 --export-height=512
  Write-Host "Generated images/icon-192.png and images/icon-512.png"
  return
}

Write-Host "No supported image converter found. Install ImageMagick or Inkscape and re-run this script." -ForegroundColor Yellow
