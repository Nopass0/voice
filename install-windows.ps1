# Windows Installation Script for Voice Project
# Run this script in PowerShell as Administrator

Write-Host "Voice Project Windows Setup" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "This script requires Administrator privileges." -ForegroundColor Red
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
    Exit 1
}

# Function to check if a command exists
function Test-Command {
    param($Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Enable Windows features for Docker
Write-Host "`nEnabling Windows features..." -ForegroundColor Yellow
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux -NoRestart | Out-Null
Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -NoRestart | Out-Null

# Install Chocolatey if not installed
if (!(Test-Command choco)) {
    Write-Host "`nInstalling Chocolatey..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    
    # Refresh environment
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

# Install Git if not installed
if (!(Test-Command git)) {
    Write-Host "`nInstalling Git..." -ForegroundColor Yellow
    choco install git -y
    
    # Refresh environment
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

# Install Node.js if not installed
if (!(Test-Command node)) {
    Write-Host "`nInstalling Node.js..." -ForegroundColor Yellow
    choco install nodejs -y
    
    # Refresh environment
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

# Install Docker Desktop
if (!(Test-Command docker)) {
    Write-Host "`nInstalling Docker Desktop..." -ForegroundColor Yellow
    Write-Host "This will download and install Docker Desktop." -ForegroundColor Cyan
    Write-Host "Please follow the Docker Desktop installation wizard." -ForegroundColor Cyan
    
    # Download Docker Desktop installer
    $dockerUrl = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
    $dockerInstaller = "$env:TEMP\DockerDesktopInstaller.exe"
    
    Write-Host "Downloading Docker Desktop..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $dockerUrl -OutFile $dockerInstaller
    
    Write-Host "Starting Docker Desktop installation..." -ForegroundColor Yellow
    Start-Process -FilePath $dockerInstaller -Wait
    
    Remove-Item $dockerInstaller
    
    Write-Host "`nDocker Desktop installed." -ForegroundColor Green
    Write-Host "Please restart your computer and run this script again to continue." -ForegroundColor Yellow
    Write-Host "After restart, make sure Docker Desktop is running." -ForegroundColor Yellow
    Exit 0
}

# Install Bun
if (!(Test-Command bun)) {
    Write-Host "`nInstalling Bun..." -ForegroundColor Yellow
    powershell -c "irm bun.sh/install.ps1 | iex"
    
    # Add Bun to PATH
    $bunPath = "$env:USERPROFILE\.bun\bin"
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($currentPath -notlike "*$bunPath*") {
        [Environment]::SetEnvironmentVariable("Path", "$currentPath;$bunPath", "User")
        $env:Path += ";$bunPath"
    }
}

# Verify installations
Write-Host "`nVerifying installations..." -ForegroundColor Yellow
Write-Host "Git version: $(git --version)" -ForegroundColor Green
Write-Host "Node version: $(node --version)" -ForegroundColor Green
Write-Host "npm version: $(npm --version)" -ForegroundColor Green
Write-Host "Docker version: $(docker --version)" -ForegroundColor Green
Write-Host "Bun version: $(bun --version)" -ForegroundColor Green

Write-Host "`n✅ All dependencies installed successfully!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Make sure Docker Desktop is running" -ForegroundColor White
Write-Host "2. Open a new terminal (cmd or PowerShell)" -ForegroundColor White
Write-Host "3. Navigate to the project directory" -ForegroundColor White
Write-Host "4. Run: .\dev.bat (for development)" -ForegroundColor White
Write-Host "   Or: .\deploy.sh (for production in WSL)" -ForegroundColor White

# Create a desktop shortcut for easy access
$shortcutPath = "$env:USERPROFILE\Desktop\Voice Project.lnk"
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "cmd.exe"
$shortcut.Arguments = "/k cd /d `"$PSScriptRoot`" && echo Voice Project && echo ============ && echo Run 'dev.bat' for development"
$shortcut.WorkingDirectory = $PSScriptRoot
$shortcut.IconLocation = "cmd.exe"
$shortcut.Save()

Write-Host "`nCreated desktop shortcut for easy access!" -ForegroundColor Green