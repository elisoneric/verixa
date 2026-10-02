FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace and api package definitions
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages ./packages

# Install dependencies
RUN npm ci --workspace=apps/api --include-workspace-root

# Copy api source
COPY apps/api ./apps/api

# Build api
RUN npm run build --workspace=apps/api

# Production Runner Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy runtime packages
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

EXPOSE 4000

WORKDIR /app/apps/api

CMD ["node", "dist/main.js"]
