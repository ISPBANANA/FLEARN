# FLEARN API Quick Setup Script (PowerShell)

Write-Host "🚀 FLEARN API Quick Setup" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green

# Check if we're in the right directory
if (!(Test-Path "FLEARN-back/package.json")) {
    Write-Host "❌ Please run this script from the FLEARN root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
Set-Location FLEARN-back
npm install

Write-Host "⚙️ Checking environment configuration..." -ForegroundColor Yellow
if (!(Test-Path ".env")) {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Blue
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created - please update with your actual values" -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

Write-Host "`n🗄️ Database setup instructions:" -ForegroundColor Cyan
Write-Host "1. Install PostgreSQL if not already installed"
Write-Host "2. Open pgAdmin or use psql command line"
Write-Host "3. Create database and user:"
Write-Host "   CREATE DATABASE flearn_db;"
Write-Host "   CREATE USER flearn_user WITH PASSWORD 'your_password';"
Write-Host "   GRANT ALL PRIVILEGES ON DATABASE flearn_db TO flearn_user;"
Write-Host "4. Run schema file: init-scripts/02-schema.sql"

Write-Host "`n🔐 Auth0 setup instructions:" -ForegroundColor Cyan
Write-Host "1. Create Auth0 account at https://auth0.com"
Write-Host "2. Create a new application (Single Page Web App)"
Write-Host "3. Create a new API with identifier: https://flearn-api.com"
Write-Host "4. Update .env file with your Auth0 credentials"

Write-Host "`n🎯 To start the server:" -ForegroundColor Magenta
Write-Host "   npm start"

Write-Host "`n📚 For detailed instructions, see API_SETUP_GUIDE.md" -ForegroundColor Blue
Write-Host "✨ Setup script completed!" -ForegroundColor Green
