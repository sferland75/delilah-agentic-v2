# Build stage
FROM node:20-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files first
COPY frontend/package*.json ./

# Enable npm cache and ci for faster installs
RUN npm ci

# Copy the rest of the code
COPY frontend/ .

# Development stage
FROM node:20-alpine

WORKDIR /app

# Copy from builder
COPY --from=builder /app ./

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "start"]