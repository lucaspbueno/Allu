FROM node:20-alpine AS builder

WORKDIR /app

COPY tsconfig.base.json ./

WORKDIR /app/apps/frontend

COPY apps/frontend/package*.json ./

RUN npm install

COPY apps/frontend/ ./

ARG VITE_CART_API_URL
ARG VITE_CATALOG_API_URL
ARG VITE_SEARCH_API_URL

ENV VITE_CART_API_URL=${VITE_CART_API_URL}
ENV VITE_CATALOG_API_URL=${VITE_CATALOG_API_URL}
ENV VITE_SEARCH_API_URL=${VITE_SEARCH_API_URL}

RUN npm run build

FROM node:20-alpine

WORKDIR /app/apps/frontend

RUN addgroup -g 1001 -S app \
    && adduser -u 1001 -S app -G app \
    && chown -R app:app /app

COPY --from=builder --chown=app:app /app/apps/frontend/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/apps/frontend/dist ./dist
COPY --from=builder --chown=app:app /app/apps/frontend/package.json ./
COPY --from=builder --chown=app:app /app/apps/frontend/vite.config.ts ./

USER app

EXPOSE ${FRONTEND_PORT}

CMD sh -c "npx vite preview --host 0.0.0.0 --port ${FRONTEND_PORT}"
