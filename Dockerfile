# Build with Chromium for prerender snapshots.
# Example:
#   docker build \
#     --build-arg PRERENDER_API_URL=https://mobauniverse.com \
#     --build-arg PRERENDER_PUBLIC_ORIGIN=https://mobauniverse.com \
#     --build-arg VITE_PUBLIC_ORIGIN=https://mobauniverse.com \
#     -t moba-fe .
FROM mcr.microsoft.com/playwright:v1.62.1-jammy AS build
WORKDIR /app

ARG PRERENDER_API_URL=http://host.docker.internal:8000
ARG PRERENDER_PUBLIC_ORIGIN=https://mobauniverse.com
ARG VITE_PUBLIC_ORIGIN=https://mobauniverse.com
ARG SKIP_PRERENDER=0
ENV PRERENDER_API_URL=$PRERENDER_API_URL \
    PRERENDER_PUBLIC_ORIGIN=$PRERENDER_PUBLIC_ORIGIN \
    VITE_PUBLIC_ORIGIN=$VITE_PUBLIC_ORIGIN \
    SKIP_PRERENDER=$SKIP_PRERENDER \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80 443
