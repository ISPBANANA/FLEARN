# Use the latest Node.js 20 LTS Alpine image as the base image
FROM node:20-alpine

# Cache bust argument to force fresh git clone
ARG CACHEBUST=1

# Install git
RUN apk add --no-cache git

# Set working directory
WORKDIR /app

# Clone the latest version from main branch
RUN git clone --depth 1 --branch main https://github.com/ISPBANANA/FLEARN.git temp && \
    mv temp/FLEARN-front/* . && \
    rm -rf temp

# Install dependencies
RUN npm ci

# Build the Next.js app
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port 3000 (default for Next.js)
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "start"]
