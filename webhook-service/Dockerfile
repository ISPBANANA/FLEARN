FROM node:18-alpine

# Install Docker CLI and git
RUN apk add --no-cache docker-cli git bash

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
