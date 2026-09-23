# syntax=docker/dockerfile:1.7

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --no-audit --no-fund --prefer-offline

COPY . .

EXPOSE 5000

CMD ["node", "src/server.js"]
