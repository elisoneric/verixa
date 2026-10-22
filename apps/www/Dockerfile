FROM node:22-alpine AS builder

WORKDIR /app

# Copy root workspace and www package definitions
COPY package*.json ./
COPY apps/www/package*.json ./apps/www/
COPY packages ./packages

# Install dependencies
RUN npm ci --workspace=apps/www --include-workspace-root

# Copy www source
COPY apps/www ./apps/www

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build www marketing site
RUN npm run build --workspace=apps/www

# Production Runner Stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Copy Next.js standalone build
COPY --from=builder /app/apps/www/.next/standalone ./
COPY --from=builder /app/apps/www/.next/static ./apps/www/.next/static
COPY --from=builder /app/apps/www/public ./apps/www/public

EXPOSE 3001

WORKDIR /app/apps/www

CMD ["node", "server.js"]
