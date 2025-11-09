# Build only TypeScript packages (skip WASM)
Write-Host "☠️ Building TypeScript packages only..." -ForegroundColor Magenta

Set-Location packages/amiron-pal
Write-Host "Building @amiron/pal..." -ForegroundColor Cyan
pnpm build

Set-Location ../amiron-intuition
Write-Host "Building @amiron/intuition..." -ForegroundColor Cyan
pnpm build

Set-Location ../amiron-workbench
Write-Host "Building @amiron/workbench..." -ForegroundColor Cyan
pnpm build

Set-Location ../amiron-ritual-api
Write-Host "Building @amiron/ritual-api..." -ForegroundColor Cyan
pnpm build

Set-Location ../..
Write-Host "✅ TypeScript packages built successfully" -ForegroundColor Green
Write-Host "⚠️  Note: @amiron/exec (WASM) was skipped - requires Rust" -ForegroundColor Yellow
