FROM node:20-alpine AS builder

WORKDIR /app

COPY tsconfig.base.json ./

WORKDIR /app/apps/frontend

COPY apps/frontend/package*.json ./

RUN npm install

COPY apps/frontend/ ./

RUN npm run build

FROM node:20-alpine

WORKDIR /app/apps/frontend

RUN addgroup -g 1001 -S app && adduser -u 1001 -S app -G app && \
    chown -R app:app /app

COPY --from=builder --chown=app:app /app/apps/frontend/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/apps/frontend/dist ./dist
COPY --from=builder --chown=app:app /app/apps/frontend/package.json ./
COPY --from=builder --chown=app:app /app/apps/frontend/vite.config.ts ./

USER app

EXPOSE 4173

CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "4173"]
