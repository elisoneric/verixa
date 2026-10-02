FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace and docs package definitions
COPY package*.json ./
COPY apps/docs/package*.json ./apps/docs/
COPY packages ./packages

# Install dependencies
RUN npm ci --workspace=apps/docs --include-workspace-root

# Copy docs source
COPY apps/docs ./apps/docs

# Build docs
RUN npm run build --workspace=apps/docs

# Production Runner Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3002

# Copy Next.js standalone build
COPY --from=builder /app/apps/docs/.next/standalone ./
COPY --from=builder /app/apps/docs/.next/static ./apps/docs/.next/static
COPY --from=builder /app/apps/docs/public ./apps/docs/public

EXPOSE 3002

WORKDIR /app/apps/docs

CMD ["node", "server.js"]
