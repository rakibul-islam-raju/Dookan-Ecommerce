# Use Node.js base image
FROM node:24-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy all source files
COPY . .

# Accept build arguments
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Build the Vite app
RUN pnpm build

# Install a lightweight static server
# RUN pnpm add -g serve

# Expose port
EXPOSE 4173

# Start the app
CMD ["pnpm", "preview", "--host"]
