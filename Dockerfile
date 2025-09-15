# Etapa de dependencias
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
# Intentar usar la que exista
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    else npm install; fi

# Etapa de build (aunque aquí no hay build TS, dejamos por si crece)
FROM node:20-bookworm-slim AS build
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generar cliente Prisma (necesita schema)
RUN npx prisma generate

# Imagen final runtime
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    RUN_MIGRATIONS=true \
    RUN_SEED=false

# Solo copiar lo necesario
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/server.js ./
COPY docker/entrypoint.sh ./docker/entrypoint.sh

# Dar permisos al entrypoint
RUN chmod +x docker/entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["./docker/entrypoint.sh"]
