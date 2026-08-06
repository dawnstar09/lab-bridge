$ErrorActionPreference = "Continue"
$logPath = Join-Path $PSScriptRoot "wsl-setup.log"
"STARTED" | Set-Content -LiteralPath $logPath -Encoding UTF8

& dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart 2>&1 |
  Tee-Object -FilePath $logPath -Append
$wslExit = $LASTEXITCODE

& dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart 2>&1 |
  Tee-Object -FilePath $logPath -Append
$vmExit = $LASTEXITCODE

"COMPLETE WSL=$wslExit VM=$vmExit" | Add-Content -LiteralPath $logPath -Encoding UTF8
Write-Host "WSL setup finished. WSL=$wslExit VM=$vmExit"
Read-Host "Press Enter to close"
