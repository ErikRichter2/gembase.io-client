# --- Build stage: compile the Vue app ---
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ARG VITE_APP_ENV=dev
ARG VITE_APP_SERVER_ROOT=http://localhost:5000
ENV VITE_APP_ENV=$VITE_APP_ENV \
    VITE_APP_SERVER_ROOT=$VITE_APP_SERVER_ROOT
RUN npm run build-only

# --- Runtime stage: serve static files with nginx ---
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
