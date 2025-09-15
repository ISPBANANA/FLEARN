#!/bin/bash
# FLEARN API Quick Setup Script

echo "🚀 FLEARN API Quick Setup"
echo "========================="

# Check if we're in the right directory
if [ ! -f "FLEARN-back/package.json" ]; then
    echo "❌ Please run this script from the FLEARN root directory"
    exit 1
fi

echo "📦 Installing dependencies..."
cd FLEARN-back
npm install

echo "⚙️ Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created - please update with your actual values"
else
    echo "✅ .env file already exists"
fi

echo "🗄️ Database setup instructions:"
echo "1. Install PostgreSQL if not already installed"
echo "2. Create database and user:"
echo "   psql -U postgres -c \"CREATE DATABASE flearn_db;\""
echo "   psql -U postgres -c \"CREATE USER flearn_user WITH PASSWORD 'your_password';\""
echo "   psql -U postgres -c \"GRANT ALL PRIVILEGES ON DATABASE flearn_db TO flearn_user;\""
echo "3. Run schema:"
echo "   psql -U flearn_user -d flearn_db -f init-scripts/02-schema.sql"

echo "🔐 Auth0 setup instructions:"
echo "1. Create Auth0 account at https://auth0.com"
echo "2. Create a new application (Single Page Web App)"
echo "3. Create a new API with identifier: https://flearn-api.com"
echo "4. Update .env file with your Auth0 credentials"

echo "🎯 To start the server:"
echo "   npm start"

echo "📚 For detailed instructions, see API_SETUP_GUIDE.md"
echo "✨ Setup script completed!"
