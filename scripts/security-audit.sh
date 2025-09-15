#!/bin/bash

# FLEARN Security Audit Script (Bash)
# This script checks for potential security issues and API key leaks

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔒 FLEARN Security Audit${NC}"
echo -e "${GREEN}========================${NC}"

errors=0
warnings=0

check_api_key_leaks() {
    echo -e "\n${YELLOW}🔍 Checking for API key leaks...${NC}"
    
    # Common patterns that might indicate real API keys
    patterns=(
        "[a-zA-Z0-9]{32,}"
        "sk_[a-zA-Z0-9]+"
        "pk_[a-zA-Z0-9]+"
        "[a-zA-Z0-9-]{30,}\.auth0\.com"
        "Bearer [a-zA-Z0-9]{20,}"
        "AKIA[0-9A-Z]{16}"
        "ghp_[a-zA-Z0-9]{36}"
        "gho_[a-zA-Z0-9]{36}"
        "AIza[0-9A-Za-z\\-_]{35}"
    )
    
    suspicious_found=false
    
    for pattern in "${patterns[@]}"; do
        # Search for patterns, excluding common non-sensitive files
        results=$(grep -r -E "$pattern" . \
            --exclude-dir=node_modules \
            --exclude-dir=.git \
            --exclude="*.log" \
            --exclude="*package-lock.json" \
            --exclude="*.min.js" \
            2>/dev/null || true)
        
        if [ ! -z "$results" ]; then
            # Filter out obvious placeholders
            filtered_results=$(echo "$results" | grep -v -i "your\|placeholder\|example\|test\|demo\|localhost" || true)
            
            if [ ! -z "$filtered_results" ]; then
                if [ "$suspicious_found" = false ]; then
                    echo -e "${RED}❌ Potential API key leaks found:${NC}"
                    suspicious_found=true
                fi
                echo -e "${RED}Pattern: $pattern${NC}"
                echo -e "${YELLOW}$filtered_results${NC}"
                ((errors++))
            fi
        fi
    done
    
    if [ "$suspicious_found" = false ]; then
        echo -e "${GREEN}✅ No obvious API key leaks detected${NC}"
    fi
}

check_environment_files() {
    echo -e "\n${YELLOW}🔍 Checking for committed environment files...${NC}"
    
    env_files=$(find . -name "*.env*" -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null || true)
    
    if [ ! -z "$env_files" ]; then
        echo -e "${YELLOW}⚠️  Environment files found in repository:${NC}"
        for file in $env_files; do
            echo -e "${YELLOW}   $file${NC}"
            
            # Check if it's in .gitignore
            if [ -f ".gitignore" ] && grep -q "$(basename "$file")" .gitignore; then
                echo -e "${GREEN}     ✅ This file is in .gitignore${NC}"
            else
                echo -e "${RED}     ❌ This file is NOT in .gitignore!${NC}"
                ((errors++))
            fi
        done
    else
        echo -e "${GREEN}✅ No environment files found in repository${NC}"
    fi
}

check_gitignore_configuration() {
    echo -e "\n${YELLOW}🔍 Checking .gitignore configuration...${NC}"
    
    required_entries=(".env" ".env.local" ".env.*" "node_modules/" "*.log")
    
    if [ -f ".gitignore" ]; then
        for entry in "${required_entries[@]}"; do
            if grep -q "$entry" .gitignore; then
                echo -e "${GREEN}   ✅ $entry is properly ignored${NC}"
            else
                echo -e "${YELLOW}   ⚠️  $entry is not in .gitignore${NC}"
                ((warnings++))
            fi
        done
    else
        echo -e "${RED}❌ .gitignore file not found!${NC}"
        ((errors++))
    fi
}

check_hardcoded_passwords() {
    echo -e "\n${YELLOW}🔍 Checking for hardcoded passwords...${NC}"
    
    # Look for suspicious password patterns
    patterns=(
        "password\s*=\s*['\"][^'\"]{8,}['\"]"
        "PASSWORD\s*=\s*[^'\"]\S{8,}"
        "secret\s*=\s*['\"][^'\"]{8,}['\"]"
    )
    
    suspicious_found=false
    
    for pattern in "${patterns[@]}"; do
        results=$(grep -r -E "$pattern" . \
            --exclude-dir=node_modules \
            --exclude-dir=.git \
            --exclude="*.log" \
            --exclude="*.md" \
            --exclude="*package-lock.json" \
            2>/dev/null || true)
        
        if [ ! -z "$results" ]; then
            # Filter out documentation and placeholders
            filtered_results=$(echo "$results" | grep -v -i "example\|placeholder\|your_\|test_\|generate\|documentation" || true)
            
            if [ ! -z "$filtered_results" ]; then
                if [ "$suspicious_found" = false ]; then
                    echo -e "${YELLOW}⚠️  Potential hardcoded passwords found:${NC}"
                    suspicious_found=true
                fi
                echo -e "${YELLOW}$filtered_results${NC}"
                ((warnings++))
            fi
        fi
    done
    
    if [ "$suspicious_found" = false ]; then
        echo -e "${GREEN}✅ No hardcoded passwords detected${NC}"
    fi
}

check_docker_compose_secrets() {
    echo -e "\n${YELLOW}🔍 Checking Docker Compose for hardcoded secrets...${NC}"
    
    if [ -f "docker-compose.yml" ]; then
        # Look for values that aren't using environment variables
        hardcoded_secrets=$(grep -E ":\s*['\"]?[a-zA-Z0-9@#\$%^&*]{8,}['\"]?\s*$" docker-compose.yml | \
            grep -v "\$\{.*\}" | \
            grep -v -E "image:|container_name:|networks:|volumes:|ports:|localhost|example" || true)
        
        if [ ! -z "$hardcoded_secrets" ]; then
            echo -e "${YELLOW}⚠️  Potential hardcoded values in docker-compose.yml:${NC}"
            echo -e "${YELLOW}$hardcoded_secrets${NC}"
            ((warnings++))
        else
            echo -e "${GREEN}✅ Docker Compose uses environment variables properly${NC}"
        fi
    fi
}

show_security_recommendations() {
    echo -e "\n${CYAN}💡 Security Recommendations:${NC}"
    echo -e "${CYAN}=================================${NC}"
    echo -e "${WHITE}1. Never commit real API keys or passwords to version control${NC}"
    echo -e "${WHITE}2. Always use environment variables for sensitive data${NC}"
    echo -e "${WHITE}3. Add all .env* files to .gitignore${NC}"
    echo -e "${WHITE}4. Use strong, unique passwords (16+ characters)${NC}"
    echo -e "${WHITE}5. Rotate secrets regularly (every 90 days)${NC}"
    echo -e "${WHITE}6. Use placeholder values in documentation and examples${NC}"
    echo -e "${WHITE}7. Enable 2FA on all service accounts (Auth0, GitHub, etc.)${NC}"
    echo -e "${WHITE}8. Monitor logs for unauthorized access attempts${NC}"
    echo -e "${WHITE}9. Review and update security policies regularly${NC}"
    echo -e "${WHITE}10. Run this security audit before every commit${NC}"
}

# Run all security tests
check_api_key_leaks
check_environment_files
check_gitignore_configuration
check_hardcoded_passwords
check_docker_compose_secrets

# Show results
echo -e "\n${MAGENTA}📊 Security Audit Results:${NC}"
echo -e "${MAGENTA}==========================${NC}"
if [ $errors -gt 0 ]; then
    echo -e "${RED}Errors: $errors${NC}"
else
    echo -e "${GREEN}Errors: $errors${NC}"
fi

if [ $warnings -gt 0 ]; then
    echo -e "${YELLOW}Warnings: $warnings${NC}"
else
    echo -e "${GREEN}Warnings: $warnings${NC}"
fi

if [ $errors -gt 0 ]; then
    echo -e "\n${RED}❌ SECURITY AUDIT FAILED${NC}"
    echo -e "${RED}Please fix all errors before committing code!${NC}"
    show_security_recommendations
    exit 1
elif [ $warnings -gt 0 ]; then
    echo -e "\n${YELLOW}⚠️  SECURITY AUDIT PASSED WITH WARNINGS${NC}"
    echo -e "${YELLOW}Consider addressing warnings for better security${NC}"
    show_security_recommendations
    exit 0
else
    echo -e "\n${GREEN}✅ SECURITY AUDIT PASSED${NC}"
    echo -e "${GREEN}No security issues detected!${NC}"
    exit 0
fi