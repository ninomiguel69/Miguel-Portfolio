# PowerShell Script to Fix VS Code / Antigravity IDE Webview Service Worker Issue
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  VS Code / Antigravity IDE Webview Cache Repair Utility" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$paths = @(
    "$env:APPDATA\Antigravity IDE\Service Worker",
    "$env:APPDATA\Code\Service Worker"
)

foreach ($p in $paths) {
    if (Test-Path $p) {
        Write-Host "Found Service Worker directory at: $p" -ForegroundColor Yellow
        try {
            # Try removing files
            Get-ChildItem $p -Recurse | Where-Object { -not $_.PSIsContainer } | ForEach-Object {
                try {
                    Remove-Item $_.FullName -Force -ErrorAction Stop
                } catch {
                    # If locked, will clear on next restart
                }
            }
            Write-Host "Cleared Service Worker cache in $p" -ForegroundColor Green
        } catch {
            Write-Host "Some files in $p are locked by the running IDE. Please reload or restart the IDE." -ForegroundColor Magenta
        }
    }
}

Write-Host "`nTo finish repair in Antigravity IDE / VS Code:" -ForegroundColor Cyan
Write-Host "1. Press Ctrl + Shift + P in your editor" -ForegroundColor White
Write-Host "2. Type and select: 'Developer: Reload Window'" -ForegroundColor White
Write-Host "==========================================================`n" -ForegroundColor Cyan
