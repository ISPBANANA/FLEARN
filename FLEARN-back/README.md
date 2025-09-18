# FLEARN Backend API

A Node.js Express backend API for the FLEARN learning platform with Google Cloud authentication.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Google Cloud Console account
- npm or yarn

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Copy the example environment file and update the values:
   ```bash
   cp .env.example .env
   ```

3. **Google Cloud Setup:**
   Follow the detailed setup guide in `GOOGLE_CLOUD_SETUP.md`

4. **Start PostgreSQL:**
   Make sure PostgreSQL is running and create the FLEARN database.

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon (auto-restart)
- `npm test` - Run tests (not configured yet)

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)
- `DATABASE_URL` - PostgreSQL connection string
- `GOOGLE_CLIENT_ID` - Google OAuth 2.0 client ID for authentication

## API Endpoints

### Health Check
- `GET /` - Basic API information
- `GET /health` - Server health status

## Development

Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## Project Structure

```
FLEARN-back/
├── index.js          # Main server file
├── package.json      # Dependencies and scripts
├── .env              # Environment variables
├── .gitignore        # Git ignore rules
└── README.md         # Project documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request
