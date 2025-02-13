# Use official Node.js image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install --only=production

# Copy the entire project
COPY . .

# Build the NestJS project
RUN npm run build

# Use a lightweight Node.js image for production
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy built files and node_modules from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

# Set the command to start the application
CMD ["node", "dist/main.js"]

