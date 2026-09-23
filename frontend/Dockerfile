# # syntax=docker/dockerfile:1.7

# FROM node:20-alpine AS builder

# WORKDIR /app

# ARG VITE_API_URL=/api
# ARG VITE_SOCKET_URL=
# ARG VITE_DEMO_MODE=false
# ENV VITE_API_URL=$VITE_API_URL
# ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
# ENV VITE_DEMO_MODE=$VITE_DEMO_MODE

# COPY package*.json ./
# RUN --mount=type=cache,target=/root/.npm \
#     npm ci --no-audit --no-fund --prefer-offline

# COPY . .
# RUN npm run build

# FROM nginx:alpine

# COPY --from=builder /app/dist /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]


# syntax=docker/dockerfile:1.7

# FROM node:20-alpine AS builder

# WORKDIR /app

# ARG VITE_API_URL=/api
# ARG VITE_SOCKET_URL=
# ARG VITE_DEMO_MODE=false
# ENV VITE_API_URL=$VITE_API_URL
# ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
# ENV VITE_DEMO_MODE=$VITE_DEMO_MODE

# COPY package*.json ./
# RUN --mount=type=cache,target=/root/.npm \
#     npm ci --no-audit --no-fund --prefer-offline

# COPY . .
# RUN npm run build

# FROM nginx:alpine

# COPY --from=builder /app/dist /usr/share/nginx/html
# RUN rm -f /etc/nginx/conf.d/default.conf
# COPY nginx.render.conf /etc/nginx/conf.d/render.conf

# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]


# syntax=docker/dockerfile:1.7
# syntax=docker/dockerfile:1.7
# syntax=docker/dockerfile:1.7
# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./

RUN npm config set strict-ssl false \
    && npm config set registry https://registry.npmjs.org/ \
    && npm ci --no-audit --no-fund


# Local development target
FROM base AS development

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]


# Production build target
FROM base AS builder

ARG VITE_API_URL=/api
ARG VITE_SOCKET_URL=
ARG VITE_DEMO_MODE=false

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_SOCKET_URL=${VITE_SOCKET_URL}
ENV VITE_DEMO_MODE=${VITE_DEMO_MODE}

COPY . .

RUN npm run build


# Production Nginx target
FROM nginx:alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html

RUN rm -f /etc/nginx/conf.d/default.conf

COPY nginx.render.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]