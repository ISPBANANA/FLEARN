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

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S webhook -u 1001 -G nodejs

# Change ownership of the app directory
RUN chown -R webhook:nodejs /app

USER webhook

EXPOSE 3001

CMD ["node", "server.js"]
