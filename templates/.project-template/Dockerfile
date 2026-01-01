# MOJO Standard Dockerfile
# Node.js 22 LTS

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

# Install dependencies
RUN npm ci --only=production 2>/dev/null || npm install --only=production

# ============================================
# Build Stage (for TypeScript projects)
# ============================================
FROM base AS builder

COPY package*.json ./

ARG NPM_TOKEN
RUN if [ -n "$NPM_TOKEN" ]; then \
      echo "@gkeferstein:registry=https://npm.pkg.github.com" > ~/.npmrc && \
      echo "//npm.pkg.github.com/:_authToken=${NPM_TOKEN}" >> ~/.npmrc; \
    fi

RUN npm ci 2>/dev/null || npm install

COPY . .

# Build if script exists
RUN npm run build 2>/dev/null || echo "No build script"

# ============================================
# Production Stage
# ============================================
FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3000

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/dist ./dist 2>/dev/null || true
COPY --from=builder /app/src ./src 2>/dev/null || true
COPY --from=builder /app/package.json ./

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:3000/health || exit 1

# Start application
CMD ["node", "src/index.js"]

