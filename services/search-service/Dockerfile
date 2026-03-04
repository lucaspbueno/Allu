FROM node:20-slim AS builder

WORKDIR /app

COPY tsconfig.base.json ./
COPY services/search-service/package*.json ./

RUN npm install

COPY services/search-service/tsconfig.json ./

RUN sed -i 's|../../tsconfig.base.json|./tsconfig.base.json|' tsconfig.json

COPY services/search-service/prisma ./prisma
COPY services/search-service/src ./src

RUN npm run build

FROM node:20-slim

WORKDIR /app

RUN apt-get -y update \
    && apt-get -y install --no-install-recommends openssl \
    && apt-get -y install --no-install-recommends wget \
    && addgroup --system --gid 1001 app \
    && adduser --system --uid 1001 --ingroup app --no-create-home app \
    && mkdir -p /var/log/app \
    && chown app:app /var/log/app \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json* ./

RUN npm ci --omit=dev

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
COPY services/search-service/entrypoint.sh ./

RUN chmod +x entrypoint.sh

USER app

EXPOSE ${SEARCH_PORT}

ENV NODE_ENV=production

CMD ["npm", "run", "start"]
