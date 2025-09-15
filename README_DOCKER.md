# API - Docker & Prisma

## Requisitos

- Docker / Docker Desktop
- Acceso a la base de datos SQL Server externa (firewall abierto, host/IP correcto)
- Archivo `.env` con la variable `DATABASE_URL`

Ejemplo de `DATABASE_URL` para SQL Server:

```
DATABASE_URL="sqlserver://SERVIDOR_SQL;database=SistemaLiberadas;user=sa;password=TU_PASSWORD;trustServerCertificate=true"
```

## Estructura añadida

- `Dockerfile` multi-stage (deps, build, runner)
- `docker/entrypoint.sh` (genera cliente Prisma, aplica migraciones opcionalmente y arranca)
- `docker-compose.yml` para levantar el servicio
- `.dockerignore` para reducir contexto de build

## Comandos básicos

### Construir imagen

```bash
docker compose build
```

### Levantar contenedor

```bash
docker compose up -d
```

### Ver logs

```bash
docker compose logs -f api
```

### Detener

```bash
docker compose down
```

## Variables especiales del entrypoint

- `RUN_MIGRATIONS` (default "true") ejecuta `prisma migrate deploy`.
- `RUN_SEED` (default "false") ejecuta `node prisma/seed.js` si existe.

Modificar en `docker-compose.yml` o pasar via `docker run -e`.

## Cambios de esquema Prisma

1. Edita `prisma/schema.prisma`.
2. Genera migración (solo en desarrollo local, no dentro del contenedor final):
   ```bash
   npx prisma migrate dev --name nombre_cambio
   ```
3. Confirma que se creó carpeta en `prisma/migrations/`.
4. Construye nueva imagen y despliega. En el arranque el contenedor aplicará migraciones con `migrate deploy`.

Si solo cambias tipos sin nueva migración (ajustes insignificantes), asegúrate de correr:

```bash
npx prisma generate
```

y reconstruir imagen.

## Prisma Studio (solo local)

No se expone en la imagen de producción. Para usarlo:

```bash
npm run prisma:studio
```

## Conexión a SQL Server externa

Asegúrate que el host/IP del SQL Server sea accesible desde la máquina donde corre Docker. Si está en la misma red local, puede bastar con la IP privada. Si usas nombre de host de Windows (ej: `SERVIDOR\INSTANCIA`), puedes necesitar configurar puerto explícito (default 1433) y en ocasiones DNS.

Formato con puerto:

```
sqlserver://HOST:1433;database=DB;user=USUARIO;password=PASS;trustServerCertificate=true
```

## Salud del servicio

El servidor WebSocket inicia en `ws://localhost:3001`. No hay endpoint HTTP; si quieres agregar healthcheck HTTP puedes añadir Express GET `/health`.

Ejemplo rápido (opcional) para agregar en `server.js`:

```js
// const express = require('express');
// const app = express();
// app.get('/health', (_,res)=>res.json({status:'ok'}));
// app.listen(3000);
```

## Ejecutar sin docker-compose

```bash
docker build -t admin-financiero-api .

docker run -d \
  --name admin-financiero-api \
  -e DATABASE_URL="$(grep DATABASE_URL .env | cut -d'=' -f2-)" \
  -e RUN_MIGRATIONS=true \
  -p 3001:3001 \
  admin-financiero-api
```

## Troubleshooting

- Error TLS / certificado: añadir `trustServerCertificate=true` (ya está en tu .env).
- Tiempo de espera: verifica firewall / puerto 1433.
- Migraciones no aplican: revisa logs de arranque (`migrate deploy`).
- Cambié schema pero cliente viejo: reconstruye imagen (prisma generate se ejecuta en build y entrypoint).

## Seguridad

No comitees `.env` con credenciales sensibles. Usa secretos en entornos productivos.

---

Lista para usar. 🚀
