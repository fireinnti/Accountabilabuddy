# Multi-stage build for Accountabilabuddy
# NOTE: For production hardening, run an image scan and consider using distroless/base minimal images.
# --- Build Stage ---
FROM node:20-slim AS build
WORKDIR /app

# Install deps (only package.json + lock if present)
COPY package*.json ./
RUN npm ci

# Copy source (exclude via .dockerignore for speed)
COPY . .

# Accept build args for flexibility
ARG VITE_USE_REAL_API=true
ENV VITE_USE_REAL_API=$VITE_USE_REAL_API

# Build frontend (outputs to dist/)
RUN npm run build

# --- Production Stage ---
FROM node:20-slim AS prod
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN useradd -m appuser

# Copy package manifests and install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built assets and server code only
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/mydb.sqlite ./

# Expose server port (align with fly.toml)
ARG PORT=44000
ENV PORT=$PORT
EXPOSE $PORT

USER appuser

# Start Express (serves API + static frontend)
CMD ["node", "server/index.js"]