# Use the latest Node.js 20 LTS Alpine image as the base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Next.js app
RUN npm run build

# Expose port 3000 (default for Next.js)
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "start"]
# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "run", "dev"]
