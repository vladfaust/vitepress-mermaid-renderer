#!/usr/bin/env pwsh
# Test script for vitepress-mermaid-renderer
# This script builds the package, creates a test environment, and runs the documentation server

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Step {
    param (
        [string]$Message,
        [string]$SubMessage = ""
    )
    Write-Host "`n$Message" -ForegroundColor Green
    if ($SubMessage) {
        Write-Host $SubMessage -ForegroundColor Gray
    }
}

function Write-SubStep {
    param ([string]$Message)
    Write-Host "  - $Message" -ForegroundColor Gray
}

function Remove-SafeItem {
    param (
        [string]$Path,
        [string]$Message
    )
    if (Test-Path $Path) {
        Write-SubStep $Message
        Remove-Item -Recurse -Force $Path
    }
}

try {
    Write-Step "🧹 Cleaning up previous build artifacts"
    
    # Clean up package files
    Get-ChildItem -Path .\ -Filter "*.tgz" | ForEach-Object {
        Write-SubStep "Removing package: $($_.Name)"
        Remove-Item -Force $_
    }
    
    Remove-SafeItem "dist" "Removing dist directory"

    Write-Step "📦 Building the package"
    $buildResult = bun run build
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed with exit code $LASTEXITCODE`n$buildResult"
    }

    Write-Step "📋 Creating package"
    $packResult = npm pack
    if ($LASTEXITCODE -ne 0) {
        throw "Package creation failed with exit code $LASTEXITCODE`n$packResult"
    }

    Write-Step "🔄 Setting up test environment" "Switching to test-project directory"
    Push-Location .\test-project\

    try {
        # Clean test project
        Remove-SafeItem ".vitepress\cache" "Cleaning VitePress cache"
        Remove-SafeItem "dist" "Cleaning dist directory"
        Remove-SafeItem "node_modules" "Cleaning node_modules"
        
        Write-Step "📥 Installing dependencies"
        $installResult = bun install
        if ($LASTEXITCODE -ne 0) {
            throw "Dependencies installation failed with exit code $LASTEXITCODE`n$installResult"
        }

        Write-SubStep "Removing existing package..."
        bun remove vitepress-mermaid-renderer 2>$null

        Write-SubStep "Installing local package..."
        $packageFile = Get-ChildItem -Path ..\ -Filter "*.tgz" | Select-Object -First 1
        if (-not $packageFile) {
            throw "No package file found in parent directory"
        }

        $addResult = bun add "../$($packageFile.Name)"
        if ($LASTEXITCODE -ne 0) {
            throw "Local package installation failed with exit code $LASTEXITCODE`n$addResult"
        }

        Write-Step "🚀 Starting development server" "Press Ctrl+C to stop the server"
        bun run docs:dev
        if ($LASTEXITCODE -ne 0) {
            throw "Development server failed to start"
        }
    }
    finally {
        Pop-Location
    }
}
catch {
    Write-Host "`n❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}