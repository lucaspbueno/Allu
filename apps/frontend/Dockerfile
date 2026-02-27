FROM node:20-alpine AS builder

WORKDIR /app

COPY tsconfig.base.json ./

WORKDIR /app/apps/frontend

COPY apps/frontend/package*.json ./

RUN npm install

COPY apps/frontend/ ./

RUN npm run build

FROM nginx:alpine

RUN addgroup -g 1001 -S app && adduser -u 1001 -S app -G app

COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

USER app

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
