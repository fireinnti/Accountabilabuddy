# Build frontend
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm install
RUN npm run build

# Run backend
FROM node:20
WORKDIR /app
COPY --from=builder /app /app
ENV NODE_ENV=production
EXPOSE 44000
CMD ["node", "server/index.js"]
