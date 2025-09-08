# Webhook Service

This service handles GitHub webhooks for automatic deployment of the FLEARN application.

## Features

- Listens for GitHub push events on the main branch
- Verifies webhook signatures for security
- Automatically pulls latest code and rebuilds containers
- Logs all deployment activities
- Graceful error handling and recovery

## Configuration

Set these environment variables:

- `WEBHOOK_SECRET`: GitHub webhook secret (required for security)
- `WEBHOOK_PORT`: Port for the webhook service (default: 3001)
- `PROJECT_PATH`: Path to the FLEARN project (default: /app/flearn)

## Endpoints

- `GET /health` - Health check
- `POST /webhook` - GitHub webhook receiver

## Security

The service verifies GitHub webhook signatures using HMAC SHA-256 to ensure requests are authentic.
