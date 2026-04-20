# ---------- frontend/Dockerfile ----------
# Stage 1: build
FROM node:20-alpine AS builder

WORKDIR /app

# cache deps layer
COPY package*.json ./
RUN npm ci

# build-time env (Vite-ისთვის build-ის დროს ეძლევა VITE_API_URL)
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY . .
RUN npm run build

# Stage 2: serve via nginx
FROM nginx:1.27-alpine

# default nginx config removed
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# built SPA
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost/ > /dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
