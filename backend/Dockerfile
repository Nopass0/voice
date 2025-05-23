# Backend Dockerfile
FROM oven/bun:latest

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./
COPY prisma ./prisma/

# Install dependencies
RUN bun install --frozen-lockfile

# Generate Prisma client
RUN bun run prisma generate

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["bun", "run", "src/index.ts"]