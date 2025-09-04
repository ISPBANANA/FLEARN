# FLEARN Backend API

A Node.js Express backend API for the FLEARN learning platform.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Copy the `.env` file and update the values according to your setup:
   ```bash
   cp .env .env.local
   ```

3. **Start MongoDB:**
   Make sure MongoDB is running on your system or update the `MONGO_URL` in your `.env` file to point to your MongoDB Atlas cluster.

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon (auto-restart)
- `npm test` - Run tests (not configured yet)

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)
- `MONGO_URL` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins

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
