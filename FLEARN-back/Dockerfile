# Use Node.js 18 LTS as base image
FROM node:18-alpine

# Cache bust argument to force fresh git clone
ARG CACHEBUST=1

# Update Alpine packages to latest security patches and install git
RUN apk update && apk upgrade --no-cache && apk add --no-cache git

# Set working directory
WORKDIR /app

# Clone the latest version from main branch
RUN git clone --depth 1 --branch main https://github.com/ISPBANANA/FLEARN.git temp && \
    mv temp/FLEARN-back/* . && \
    rm -rf temp

# Install dependencies
RUN npm ci --omit=dev

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8099

# Start the application
CMD ["npm", "start"]
