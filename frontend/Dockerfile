# Stage 1: Build the Next.js app
FROM node:24-alpine AS builder

# Enable corepack for pnpm
RUN corepack enable

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy all files
COPY . .

# Build-time environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BASE_APP_URL
ARG NEXT_PUBLIC_AUTH_COOKIE_NAME
ARG NEXT_PUBLIC_REFRESH_COOKIE_NAME
ARG NEXT_PUBLIC_IMAGE_DOMAIN
ARG REVALIDATE_PRODUCTS
ARG REVALIDATE_CATEGORIES

# Make them available to Next.js build
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_BASE_APP_URL=${NEXT_PUBLIC_BASE_APP_URL}
ENV NEXT_PUBLIC_AUTH_COOKIE_NAME=${NEXT_PUBLIC_AUTH_COOKIE_NAME}
ENV NEXT_PUBLIC_REFRESH_COOKIE_NAME=${NEXT_PUBLIC_REFRESH_COOKIE_NAME}
ENV NEXT_PUBLIC_IMAGE_DOMAIN=${NEXT_PUBLIC_IMAGE_DOMAIN}
ENV REVALIDATE_PRODUCTS=${REVALIDATE_PRODUCTS}
ENV REVALIDATE_CATEGORIES=${REVALIDATE_CATEGORIES}

# Build Next.js
RUN pnpm build

# Stage 2: Run the Next.js app in production
FROM node:24-alpine AS runner

RUN corepack enable

WORKDIR /app

# ENV NODE_ENV=production

# Copy only necessary files for production
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Expose port
EXPOSE 3000

# Start Next.js
CMD ["pnpm", "start"]
