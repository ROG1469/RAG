# Start the development server with environment variables loaded
# This script ensures environment variables are available in the PowerShell session

Write-Host "Loading environment variables..." -ForegroundColor Cyan

# Load from .env.local
Get-Content .env.local | ForEach-Object {
    if ($_ -match '^([^#=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
        Write-Host "  ✓ $key" -ForegroundColor Green
    }
}

Write-Host "`nStarting development server..." -ForegroundColor Cyan
npm run dev
