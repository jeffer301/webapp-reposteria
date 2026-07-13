FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine

RUN addgroup -S app && adduser -S app -G app

COPY --from=build /app/dist/bakery-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN chown -R app:app /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

RUN touch /var/run/nginx.pid && \
    chown -R app:app /var/run/nginx.pid && \
    chown -R app:app /var/cache/nginx

USER app

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
