# Server (API) Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy source
COPY src ./src

# Expose port
EXPOSE 4000

# Environment defaults (can be overridden by docker-compose)
ENV PORT=4000
ENV CORS_ORIGIN=*

# Start server
CMD ["node", "src/index.js"]
