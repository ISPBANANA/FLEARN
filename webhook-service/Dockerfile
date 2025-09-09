FROM node:18-alpine

# Install Docker CLI, Docker Compose, and git
RUN apk add --no-cache docker-cli docker-compose git bash curl

# Install Docker Compose v2 plugin
RUN mkdir -p ~/.docker/cli-plugins/ && \
    curl -SL "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-linux-x86_64" -o ~/.docker/cli-plugins/docker-compose && \
    chmod +x ~/.docker/cli-plugins/docker-compose

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
