# MOJO Standard Dockerfile
# Node.js 22 LTS mit TypeScript Support

FROM node:22-slim AS base

WORKDIR /app

# Install wget for health checks
RUN apt-get update && apt-get install -y \
    wget \
    && rm -rf /var/lib/apt/lists/*

# ============================================
# Dependencies Stage
# ============================================
FROM base AS deps

# Copy package files
COPY package*.json ./

# Configure npm for GitHub Packages (if needed)
ARG NPM_TOKEN
RUN if [ -n "$NPM_TOKEN" ]; then \
      echo "@gkeferstein:registry=https://npm.pkg.github.com" > ~/.npmrc && \
      echo "//npm.pkg.github.com/:_authToken=${NPM_TOKEN}" >> ~/.npmrc; \
    fi

# Install all dependencies (including dev for build)
RUN npm ci

# ============================================
# Build Stage
# ============================================
FROM deps AS builder

COPY . .

# Build TypeScript
RUN npm run build

# ============================================
# Production Dependencies
# ============================================
FROM base AS prod-deps

COPY package*.json ./

ARG NPM_TOKEN
RUN if [ -n "$NPM_TOKEN" ]; then \
      echo "@gkeferstein:registry=https://npm.pkg.github.com" > ~/.npmrc && \
      echo "//npm.pkg.github.com/:_authToken=${NPM_TOKEN}" >> ~/.npmrc; \
    fi

RUN npm ci --only=production

# ============================================
# Production Stage
# ============================================
FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3000

# Copy production dependencies
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:3000/health || exit 1

# Start application
CMD ["node", "dist/index.js"]
