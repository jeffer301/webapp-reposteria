FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine

RUN apk add --no-cache tini

WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY . .

RUN mkdir -p uploads && chown -R node:node uploads

USER node

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "src/index.js"]
