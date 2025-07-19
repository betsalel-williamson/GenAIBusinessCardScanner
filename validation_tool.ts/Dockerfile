# Stage 1: Build the application
FROM node:20-slim AS builder

WORKDIR /app

# Copy pnpm related files
COPY package.json pnpm-workspace.yaml ./ 

# Copy validation_tool.ts specific package.json
COPY validation_tool.ts/package.json validation_tool.ts/

# Install pnpm
RUN npm install -g pnpm

# Copy the rest of the validation_tool.ts source code
COPY validation_tool.ts validation_tool.ts/

# Change to validation_tool.ts directory for project-specific dependency installation and build
WORKDIR /app/validation_tool.ts

# Install dependencies for validation_tool.ts
RUN pnpm install

# Rebuild native modules for the Docker environment specifically for validation_tool.ts
RUN pnpm rebuild

# Build the application
RUN pnpm build

# Stage 2: Create the production image
FROM node:20-alpine

WORKDIR /app

# Copy pnpm related files for production install
COPY package.json pnpm-workspace.yaml ./ 

# Copy validation_tool.ts specific package.json for production install
COPY validation_tool.ts/package.json validation_tool.ts/

# Copy built assets from the builder stage
COPY --from=builder /app/validation_tool.ts/dist ./validation_tool.ts/dist

# Copy necessary files for running the server
COPY --from=builder /app/validation_tool.ts/package.json ./validation_tool.ts/package.json
COPY --from=builder /app/validation_tool.ts/server.prod.ts ./validation_tool.ts/server.prod.ts

# Copy the public directory from the builder stage's validation_tool.ts directory into the production image
COPY --from=builder /app/validation_tool.ts/public ./validation_tool.ts/public

WORKDIR /app/validation_tool.ts

# Install production dependencies only
RUN npm install -g pnpm && pnpm install --prod

# Install curl for healthcheck
RUN apk add --no-cache curl

ENV NODE_ENV=production
ENV CARDS_TO_PROCESS_MOUNT_PATH=/mnt/cards_to_process

# Healthcheck instruction
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:7456 || exit 1

EXPOSE 7456

CMD ["node", "dist/server/server.prod.js"]
