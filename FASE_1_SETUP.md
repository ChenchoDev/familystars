# 🚀 FASE 1 SETUP — Empieza AHORA

¡Backend completamente creado! Todo lo que necesitas para empezar está listo. Sigue estos 4 pasos.

---

## ☕ PASO 1: Copia el `.env` y Configura Credenciales (5 min)

```bash
cd apps/backend
cp .env.example .env
```

Abre `.env` y completa SOLO estos valores (el resto pueden quedar en blanco por ahora):

```env
DATABASE_URL=postgresql://[usuario]:[password]@[host]:[puerto]/[database]
JWT_SECRET=cambiar-por-una-cadena-aleatoria-de-al-menos-64-caracteres
NODE_ENV=development
```

**Cómo obtener `DATABASE_URL` de Supabase**:
1. Ve a [supabase.com](https://supabase.com)
2. Crea proyecto nuevo
3. Copia URL de conexión → pégala en `.env`

---

## ☕ PASO 2: Instala Dependencias (3 min)

```bash
npm install
```

Espera a que termine...

---

## ☕ PASO 3: Ejecuta Migrations (1 min)

```bash
npm run migrate
```

Verás:
```
✅ Connected to database
✅ Migrations completed successfully
✅ Created family: Paterna
✅ Created family: Materna
✅ Created family: Política 1
✅ Created family: Política 2
🎉 All migrations completed successfully!
```

**Si sale error**: Revisa que `DATABASE_URL` es correcto y la BD es nueva.

---

## ☕ PASO 4: Inicia el Servidor (2 min)

```bash
npm run dev
```

Deberías ver:
```
🌟 FamilyStars API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Server running on port 3000
  Environment: development
  Endpoints:
  - Health: GET /health
  - Auth: POST /auth/magic-link
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**¡API está VIVA!** ✅

---

## 🧪 PASO 5: Prueba Endpoints (Opcional pero Recomendado)

### Health Check

```bash
curl http://localhost:3000/health
```

Respuesta esperada:
```json
{"status":"ok","timestamp":"2026-04-12T..."}
```

### Request Magic Link

```bash
curl -X POST http://localhost:3000/auth/magic-link \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Respuesta esperada:
```json
{"message":"Magic link sent to test@example.com"}
```

**Nota**: En desarrollo, los emails no se envían (RESEND_API_KEY está vacío). Verás en la terminal que se intentó.

---

## 📊 Endpoints Listos Para Usar

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/auth/magic-link` | Solicitar enlace mágico |
| GET | `/auth/verify/:token` | Verificar token |
| GET | `/persons` | Listar personas aprobadas |
| POST | `/persons` | Crear/sugerir persona |
| GET | `/families` | Listar familias |

**Documentación completa**: Ver `API_REFERENCE.md` en la raíz del proyecto.

---

## 🚨 Troubleshooting Rápido

**Error: `database connection failed`**
- ✅ `DATABASE_URL` está correcto?
- ✅ BD Supabase está activa?
- ✅ Whitelist tu IP en firewall de Supabase?

**Error: `RESEND_API_KEY not configured`**
- Normal en desarrollo. Email no enviará hasta que lo configures. Continúa sin problema.

**Puerto 3000 ya en uso**
```bash
# Cambia el puerto
PORT=3001 npm run dev
```

---

## ✅ Fase 1 Completada — Qué Sigue

- [ ] Backend funcionando localmente
- [ ] Base de datos creada con 4 familias
- [ ] API lista para recibir requests
- [ ] Tests lista para ejecutar: `npm test`

**Próximo**: Fase 2 (React + Canvas D3.js + Deploy)

---

## 📞 Comando útil

Ver estado de todo en una línea:

```bash
npm run dev && npm test
```

Corre el servidor y ejecuta tests en paralelo.

---

**¡Fase 1 TERMINADA!** ☕✨

Ahora Chencho tiene una API REST completamente funcional, con autenticación, base de datos, y todos los endpoints documentados.

**Próximo paso**: Fase 2 — React Frontend con constelación visual.

