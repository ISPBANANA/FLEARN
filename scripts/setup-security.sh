#!/bin/bash

# FLEARN Security Setup Script
# This script sets up security measures for the FLEARN project

echo "🔒 Setting up FLEARN Security Measures"
echo "======================================"

# Make security audit scripts executable
if [ -f "scripts/security-audit.sh" ]; then
    chmod +x scripts/security-audit.sh
    echo "✅ Made security-audit.sh executable"
fi

# Set up pre-commit hook
if [ -f ".git/hooks/pre-commit" ]; then
    chmod +x .git/hooks/pre-commit
    echo "✅ Pre-commit hook installed and made executable"
else
    echo "❌ Pre-commit hook not found"
fi

# Check .gitignore
echo ""
echo "🔍 Checking .gitignore configuration..."
if [ -f ".gitignore" ]; then
    required_entries=(".env" ".env.local" ".env.*" "node_modules/" "*.log")
    
    for entry in "${required_entries[@]}"; do
        if grep -q "$entry" .gitignore; then
            echo "✅ $entry is in .gitignore"
        else
            echo "⚠️  Adding $entry to .gitignore"
            echo "$entry" >> .gitignore
        fi
    done
else
    echo "❌ .gitignore not found - creating one"
    cat > .gitignore << EOF
# Environment files
.env
.env.local
.env.development
.env.test
.env.production
.env.*

# Dependencies
node_modules/

# Logs
*.log

# OS generated files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
EOF
fi

echo ""
echo "🎯 Security Setup Complete!"
echo ""
echo "📋 What was configured:"
echo "  ✅ Security audit scripts made executable"
echo "  ✅ Pre-commit hook installed"
echo "  ✅ .gitignore configured to exclude sensitive files"
echo ""
echo "💡 Usage:"
echo "  • Run security audit manually: ./scripts/security-audit.sh"
echo "  • Security checks run automatically before each commit"
echo "  • To bypass security checks (NOT RECOMMENDED): git commit --no-verify"
echo ""
echo "🔒 Your FLEARN repository is now more secure!"