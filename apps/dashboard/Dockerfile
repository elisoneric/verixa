FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace and dashboard package definitions
COPY package*.json ./
COPY apps/dashboard/package*.json ./apps/dashboard/
COPY packages ./packages

# Install dependencies
RUN npm ci --workspace=apps/dashboard --include-workspace-root

# Copy dashboard source
COPY apps/dashboard ./apps/dashboard

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build dashboard
RUN npm run build --workspace=apps/dashboard

# Production Runner Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy Next.js standalone build
COPY --from=builder /app/apps/dashboard/.next/standalone ./
COPY --from=builder /app/apps/dashboard/.next/static ./apps/dashboard/.next/static
COPY --from=builder /app/apps/dashboard/public ./apps/dashboard/public

EXPOSE 3000

WORKDIR /app/apps/dashboard

CMD ["node", "server.js"]
