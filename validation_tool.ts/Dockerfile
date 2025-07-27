# Stage 1: Build the application
FROM node:20-slim AS builder

WORKDIR /app

# Copy validation_tool.ts specific package.json
COPY package.json ./

# Install pnpm
RUN npm install -g pnpm

# Copy the rest of the validation_tool.ts source code
COPY . ./

# Change to validation_tool.ts directory for project-specific dependency installation and build
WORKDIR /app

# Install dependencies for validation_tool.ts
RUN pnpm install

# Rebuild native modules for the Docker environment specifically for validation_tool.ts
RUN pnpm rebuild

# Build the application
RUN pnpm build

# Stage 2: Create the production image
FROM node:20-alpine

WORKDIR /app

# Copy validation_tool.ts specific package.json for production install
COPY package.json ./

# Copy built assets from the builder stage
COPY --from=builder /app/dist ./dist

# Copy necessary files for running the server
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.prod.ts ./server.prod.ts

# Copy the public directory from the builder stage's validation_tool.ts directory into the production image
COPY --from=builder /app/public ./public

# Copy the healthcheck script
COPY scripts/healthcheck.js ./scripts/healthcheck.js

WORKDIR /app

# Install production dependencies only
RUN npm install -g pnpm && pnpm install --prod

ENV NODE_ENV=production
ENV CARDS_TO_PROCESS_MOUNT_PATH=/mnt/image_data_source
ENV JSON_DATA_SOURCE_MOUNT_PATH=/mnt/json_data_source
ENV JSON_DATA_PROCESSED_MOUNT_PATH=/mnt/data_processed_batches

# Healthcheck instruction
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD node scripts/healthcheck.js || exit 1

EXPOSE 7456

CMD ["node", "dist/server/server.prod.js"]