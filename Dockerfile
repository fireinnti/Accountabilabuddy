# Multi-stage build for Accountabilabuddy (Alpine variants)
# NOTE: For production hardening, run an image scan and consider using distroless/base minimal images.
# --- Build Stage ---
FROM node:20-alpine AS build
WORKDIR /app

# Install native build deps needed to compile any native modules during npm install
RUN apk add --no-cache --virtual .build-deps python3 make g++

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source (exclude via .dockerignore for speed)
COPY . .

# Accept build args for flexibility
ARG VITE_USE_REAL_API=true
ENV VITE_USE_REAL_API=$VITE_USE_REAL_API

# Build frontend (outputs to dist/)
RUN npm run build

# Prune dev deps to keep node_modules small for production and remove build deps
RUN npm prune --production && apk del .build-deps

# --- Production Stage ---
FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -S appuser && adduser -S -G appuser appuser

# Copy package manifests 
COPY package*.json ./
COPY --from=build /app/node_modules ./node_modules

# Copy built assets
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server

# Ensure ownership of app dir so the non-root user can access files
RUN chown -R appuser:appuser /app || true

# Expose server port (align with fly.toml)
ARG PORT=44000
ENV PORT=$PORT
EXPOSE $PORT

USER appuser

# Start Express (serves API + static frontend)
CMD ["node", "server/index.js"]

# --- Optional Local Final Stage (for local development) ---
# Build locally with: docker build --target local -t accountabilabuddy:local .
FROM node:20-alpine AS local
WORKDIR /app
ENV NODE_ENV=development

# Create non-root user
RUN addgroup -S appuser && adduser -S -G appuser appuser

# Copy production node_modules and built assets from build stage
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server

# Copy local exported sqlite into the image for local dev and rename to mydb.sqlite
# Ensure you build with the exported.sqlite file present in the build context.
COPY exported.sqlite ./mydb.sqlite

# Ensure the app directory and sqlite file are owned by the non-root user and writable
RUN chown -R appuser:appuser /app && chmod 664 ./mydb.sqlite || true

# Expose server port (align with fly.toml)
ARG PORT=44000
ENV PORT=$PORT
EXPOSE $PORT

USER appuser

# Start Express (serves API + static frontend)
CMD ["node", "server/index.js"]