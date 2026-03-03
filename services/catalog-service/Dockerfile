FROM node:20-alpine AS builder

WORKDIR /app

COPY tsconfig.base.json ./
COPY services/catalog-service/package*.json ./

RUN npm install

COPY services/catalog-service/tsconfig.json ./

RUN sed -i 's|../../tsconfig.base.json|./tsconfig.base.json|' tsconfig.json

COPY services/catalog-service/prisma ./prisma
COPY services/catalog-service/src ./src

RUN npm run build

FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache wget openssl && addgroup -g 1001 -S app && adduser -u 1001 -S app -G app && \
    mkdir -p /var/log/app && chown app:app /var/log/app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json* ./

RUN npm install --omit=dev

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER app

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "dist/index.js"]
