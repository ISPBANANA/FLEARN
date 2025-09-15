# FLEARN Security Audit Script (PowerShell)
# This script checks for potential security issues and API key leaks

Write-Host "🔒 FLEARN Security Audit" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green

$errors = 0
$warnings = 0

function Test-APIKeyLeaks {
    Write-Host "`n🔍 Checking for API key leaks..." -ForegroundColor Yellow
    
    # Common patterns that might indicate real API keys
    $patterns = @(
        "[a-zA-Z0-9]{32,}",  # Long alphanumeric strings
        "sk_[a-zA-Z0-9]+",   # Stripe secret keys
        "pk_[a-zA-Z0-9]+",   # Stripe public keys
        "[a-zA-Z0-9-]{30,}\.auth0\.com",  # Real Auth0 domains
        "Bearer [a-zA-Z0-9]{20,}",  # Bearer tokens
        "AKIA[0-9A-Z]{16}",  # AWS Access Keys
        "ghp_[a-zA-Z0-9]{36}",  # GitHub Personal Access Tokens
        "gho_[a-zA-Z0-9]{36}",  # GitHub OAuth Tokens
        "AIza[0-9A-Za-z\\-_]{35}"  # Google API Keys
    )
    
    $excludeFiles = @(
        "*.md",
        "*.log",
        "node_modules/*",
        "*.min.js",
        "*package-lock.json",
        ".git/*"
    )
    
    $suspiciousFiles = @()
    
    foreach ($pattern in $patterns) {
        $searchResults = Select-String -Path "." -Pattern $pattern -Recurse -Exclude $excludeFiles
        foreach ($match in $searchResults) {
            # Skip if it's clearly a placeholder
            if ($match.Line -match "your|placeholder|example|test|demo|localhost") {
                continue
            }
            $suspiciousFiles += $match
        }
    }
    
    if ($suspiciousFiles.Count -gt 0) {
        Write-Host "❌ Potential API key leaks found:" -ForegroundColor Red
        foreach ($file in $suspiciousFiles) {
            Write-Host "   File: $($file.Filename):$($file.LineNumber)" -ForegroundColor Red
            Write-Host "   Line: $($file.Line.Trim())" -ForegroundColor Yellow
        }
        $script:errors += $suspiciousFiles.Count
    } else {
        Write-Host "✅ No obvious API key leaks detected" -ForegroundColor Green
    }
}

function Test-EnvironmentFiles {
    Write-Host "`n🔍 Checking for committed environment files..." -ForegroundColor Yellow
    
    $envFiles = Get-ChildItem -Path "." -Recurse -Include "*.env*" -Name
    
    if ($envFiles.Count -gt 0) {
        Write-Host "⚠️  Environment files found in repository:" -ForegroundColor Yellow
        foreach ($file in $envFiles) {
            Write-Host "   $file" -ForegroundColor Yellow
            
            # Check if it's in .gitignore
            $gitignoreContent = Get-Content ".gitignore" -ErrorAction SilentlyContinue
            if ($gitignoreContent -and ($gitignoreContent -match [regex]::Escape($file))) {
                Write-Host "     ✅ This file is in .gitignore" -ForegroundColor Green
            } else {
                Write-Host "     ❌ This file is NOT in .gitignore!" -ForegroundColor Red
                $script:errors++
            }
        }
    } else {
        Write-Host "✅ No environment files found in repository" -ForegroundColor Green
    }
}

function Test-GitignoreConfiguration {
    Write-Host "`n🔍 Checking .gitignore configuration..." -ForegroundColor Yellow
    
    $requiredEntries = @(
        ".env",
        ".env.local",
        ".env.*",
        "node_modules/",
        "*.log"
    )
    
    if (Test-Path ".gitignore") {
        $gitignoreContent = Get-Content ".gitignore"
        
        foreach ($entry in $requiredEntries) {
            if ($gitignoreContent -match [regex]::Escape($entry)) {
                Write-Host "   ✅ $entry is properly ignored" -ForegroundColor Green
            } else {
                Write-Host "   ⚠️  $entry is not in .gitignore" -ForegroundColor Yellow
                $script:warnings++
            }
        }
    } else {
        Write-Host "❌ .gitignore file not found!" -ForegroundColor Red
        $script:errors++
    }
}

function Test-HardcodedPasswords {
    Write-Host "`n🔍 Checking for hardcoded passwords..." -ForegroundColor Yellow
    
    # Look for suspicious password patterns
    $patterns = @(
        "password\s*=\s*['`"][^'`"]{8,}['`"]",
        "PASSWORD\s*=\s*[^'`"]\S{8,}",
        "secret\s*=\s*['`"][^'`"]{8,}['`"]"
    )
    
    $suspiciousLines = @()
    
    foreach ($pattern in $patterns) {
        $searchResults = Select-String -Path "." -Pattern $pattern -Recurse -Exclude "*.md", "*.log", "node_modules/*", "*package-lock.json", ".git/*"
        foreach ($match in $searchResults) {
            # Skip if it's clearly documentation or placeholder
            if ($match.Line -match "example|placeholder|your_|test_|generate|documentation") {
                continue
            }
            $suspiciousLines += $match
        }
    }
    
    if ($suspiciousLines.Count -gt 0) {
        Write-Host "⚠️  Potential hardcoded passwords found:" -ForegroundColor Yellow
        foreach ($line in $suspiciousLines) {
            Write-Host "   File: $($line.Filename):$($line.LineNumber)" -ForegroundColor Yellow
            Write-Host "   Line: $($line.Line.Trim())" -ForegroundColor Yellow
        }
        $script:warnings += $suspiciousLines.Count
    } else {
        Write-Host "✅ No hardcoded passwords detected" -ForegroundColor Green
    }
}

function Test-SecretsInDockerCompose {
    Write-Host "`n🔍 Checking Docker Compose for hardcoded secrets..." -ForegroundColor Yellow
    
    if (Test-Path "docker-compose.yml") {
        $dockerContent = Get-Content "docker-compose.yml"
        $hardcodedSecrets = @()
        
        foreach ($line in $dockerContent) {
            # Look for values that aren't using environment variables
            if ($line -match ":\s*['`"]?[a-zA-Z0-9@#`$%^&*]{8,}['`"]?\s*`$" -and 
                $line -notmatch "\`$\{.*\}" -and 
                $line -notmatch "image:|container_name:|networks:|volumes:|ports:|localhost|example") {
                $hardcodedSecrets += $line.Trim()
            }
        }
        
        if ($hardcodedSecrets.Count -gt 0) {
            Write-Host "⚠️  Potential hardcoded values in docker-compose.yml:" -ForegroundColor Yellow
            foreach ($secret in $hardcodedSecrets) {
                Write-Host "   $secret" -ForegroundColor Yellow
            }
            $script:warnings += $hardcodedSecrets.Count
        } else {
            Write-Host "✅ Docker Compose uses environment variables properly" -ForegroundColor Green
        }
    }
}

function Show-SecurityRecommendations {
    Write-Host "`n💡 Security Recommendations:" -ForegroundColor Cyan
    Write-Host "=================================" -ForegroundColor Cyan
    Write-Host "1. Never commit real API keys or passwords to version control" -ForegroundColor White
    Write-Host "2. Always use environment variables for sensitive data" -ForegroundColor White
    Write-Host "3. Add all .env* files to .gitignore" -ForegroundColor White
    Write-Host "4. Use strong, unique passwords (16+ characters)" -ForegroundColor White
    Write-Host "5. Rotate secrets regularly (every 90 days)" -ForegroundColor White
    Write-Host "6. Use placeholder values in documentation and examples" -ForegroundColor White
    Write-Host "7. Enable 2FA on all service accounts (Auth0, GitHub, etc.)" -ForegroundColor White
    Write-Host "8. Monitor logs for unauthorized access attempts" -ForegroundColor White
    Write-Host "9. Review and update security policies regularly" -ForegroundColor White
    Write-Host "10. Run this security audit before every commit" -ForegroundColor White
}

# Run all security tests
Test-APIKeyLeaks
Test-EnvironmentFiles
Test-GitignoreConfiguration
Test-HardcodedPasswords
Test-SecretsInDockerCompose

# Show results
Write-Host "`n📊 Security Audit Results:" -ForegroundColor Magenta
Write-Host "==========================" -ForegroundColor Magenta
Write-Host "Errors: $errors" -ForegroundColor $(if ($errors -gt 0) { "Red" } else { "Green" })
Write-Host "Warnings: $warnings" -ForegroundColor $(if ($warnings -gt 0) { "Yellow" } else { "Green" })

if ($errors -gt 0) {
    Write-Host "`n❌ SECURITY AUDIT FAILED" -ForegroundColor Red
    Write-Host "Please fix all errors before committing code!" -ForegroundColor Red
    Show-SecurityRecommendations
    exit 1
} elseif ($warnings -gt 0) {
    Write-Host "`n⚠️  SECURITY AUDIT PASSED WITH WARNINGS" -ForegroundColor Yellow
    Write-Host "Consider addressing warnings for better security" -ForegroundColor Yellow
    Show-SecurityRecommendations
    exit 0
} else {
    Write-Host "`n✅ SECURITY AUDIT PASSED" -ForegroundColor Green
    Write-Host "No security issues detected!" -ForegroundColor Green
    exit 0
}