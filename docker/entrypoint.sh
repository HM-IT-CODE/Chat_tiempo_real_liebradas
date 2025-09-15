#!/bin/sh
set -e

# Ejecutar prisma generate siempre para asegurar cliente actualizado
echo "[entrypoint] Generando cliente Prisma..."
npx prisma generate

# Si se pasaron migraciones y el provider soporta migrate deploy (SQLServer lo soporta)
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "[entrypoint] Ejecutando prisma migrate deploy..."
  npx prisma migrate deploy || echo "[entrypoint] Advertencia: migrate deploy falló (puede no haber migraciones)"
fi

# Semilla opcional
if [ "$RUN_SEED" = "true" ]; then
  if [ -f "prisma/seed.js" ]; then
    echo "[entrypoint] Ejecutando seed..."
    node prisma/seed.js || echo "[entrypoint] Seed falló"
  else
    echo "[entrypoint] No existe prisma/seed.js, saltando seed"
  fi
fi

echo "[entrypoint] Iniciando aplicación..."
exec node server.js
