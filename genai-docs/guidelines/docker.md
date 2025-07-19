
# Docker Best Practices for Node.js with pnpm and sqlite3

Building optimized Docker images for Node.js applications, especially those using `pnpm` and native addons like `sqlite3`, requires a structured approach to ensure small, secure, and efficient images.

## Core Principles

- **Multi-stage Builds**: Use multi-stage builds to separate the build environment from the production environment. This is the single most important practice for creating lean production images.
- **Lean Base Images**: Start with a minimal base image like `node:20-slim` to reduce size and attack surface.
- **Layer Caching**: Structure your `Dockerfile` to take advantage of Docker's layer caching. Install dependencies before copying source code.
- **Non-root User**: Run the application as a non-root user to improve security.

## Recommended `Dockerfile` Structure

This `Dockerfile` provides a template for building a Node.js application with `pnpm` and `sqlite3`.

```dockerfile
# ---- Base Stage ----
FROM node:20-slim AS base
WORKDIR /app
RUN corepack enable

# ---- Builder Stage ----
FROM base AS builder
RUN apt-get update && apt-get install -y --no-install-recommends build-essential python3

COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

# ---- Pruner Stage ----
FROM base AS pruner
WORKDIR /app
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
RUN pnpm prune --prod

# ---- Final Production Stage ----
FROM base AS final
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

COPY --from=pruner --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

ENV NODE_ENV production

EXPOSE 7456

CMD [ "node", "dist/server/server.js" ]
```

## Key Stages Explained

- **`builder`**: This stage installs all dependencies, including `devDependencies`, and the necessary build tools (`build-essential`, `python3`) to compile native addons like `sqlite3`. It then builds the application.
- **`pruner`**: This stage takes the `node_modules` from the `builder` stage and removes the `devDependencies`, leaving only the production dependencies.
- **`final`**: This is the production stage. It copies the pruned `node_modules` and the built application from the previous stages. It also creates a non-root user to run the application.
