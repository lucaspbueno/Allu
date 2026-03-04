#!/bin/sh
set -e

npx prisma migrate deploy
npm run prisma:seed:docker
exec node dist/index.js
