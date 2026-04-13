# Instrucciones de Deploy - FamilyStars

> **IMPORTANTE**: El código ya está preparado. Tú harás los commits de Git.

## 📋 Checklist Pre-Deploy

- [x] Landing page creada (`pages/Landing.jsx`)
- [x] PWA setup completo (manifest.json, service-worker.js)
- [x] Router actualizado (/ = Landing, /app = Constelación)
- [x] Meta tags PWA en index.html
- [x] Service worker registrado en index.html

## 🚀 Pasos de Deploy (SIN commits por mi parte)

### Paso 1: Prepara Git en tu máquina

```bash
cd d:\chenchoWeb\familystars

# Si no existe .git aún:
git init

# Configura tu usuario de Git (la cuenta que quieras usar)
git config user.name "Tu Nombre"
git config user.email "tu-email@example.com"

# O si quieres usar una config local (solo para este repo):
git config --local user.name "Tu Nombre"
git config --local user.email "tu-email@example.com"
```

### Paso 2: Hace Stage + Commit (TÚ)

```bash
cd d:\chenchoWeb\familystars

# Ver cambios
git status

# Agregar todo
git add .

# Hacer commit (tú eliges el mensaje)
git commit -m "Feat: Landing page + PWA setup"
```

### Paso 3: Sube a GitHub (TÚ)

```bash
# Crea un repositorio en GitHub

# Agregar remote
git remote add origin https://github.com/TU_USERNAME/familystars.git

# Push a main
git branch -M main
git push -u origin main
```

### Paso 4: Deploy Frontend (Vercel)

1. Ve a https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Root Directory**: `apps/frontend`
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`

5. Agrega variable de entorno:
   ```
   VITE_API_URL = https://familystars-api.onrender.com
   ```

6. Click "Deploy"
7. Vercel te dará una URL (ej: `https://familystars-xxxxx.vercel.app`)

**Nota**: Según Render esté deployado, la API URL puede cambiar.

### Paso 5: Deploy Backend (Render)

**Si no lo has hecho ya:**

1. Ve a https://dashboard.render.com
2. Click "New" → "Web Service"
3. Conecta tu repositorio GitHub
4. Configura:
   - **Name**: `familystars-api`
   - **Environment**: `Node`
   - **Build Command**: `cd apps/backend && npm install`
   - **Start Command**: `cd apps/backend && npm start`
   - **Root Directory**: `.`

5. Agrega variables de entorno (ve a DEPLOYMENT.md para la lista completa):
   ```
   DATABASE_URL = [tu Neon connection string]
   JWT_SECRET = [el secret del proyecto]
   CLOUDINARY_CLOUD_NAME = [tu cloud name]
   CLOUDINARY_API_KEY = [tu api key]
   CLOUDINARY_API_SECRET = [tu secret]
   RESEND_API_KEY = [tu resend key]
   FRONTEND_URL = https://familystars-xxxxx.vercel.app
   ```

6. Click "Create Web Service"
7. Espera ~5-10 minutos
8. Nota tu API URL: `https://familystars-api.onrender.com`

### Paso 6: Actualiza Vercel con URL Backend (SI CAMBIÓ)

Si en Paso 4 no sabías la URL de Render:

1. Ve a Vercel → Tu proyecto → Settings → Environment Variables
2. Actualiza `VITE_API_URL` con tu URL de Render
3. Click "Deploy" en la pestaña Deployments

## ✅ Validar Deploy

### Frontend
- https://familystars-xxxxx.vercel.app → Deberías ver la Landing Page

### PWA
- Abre en Chrome DevTools → Application → Manifest
- Deberías ver el manifest.json correctamente cargado
- En Android: Abre el menú y verás "Instalar FamilyStars"

### Backend
- https://familystars-api.onrender.com/health → Deberías ver un JSON

### Prueba rápida
1. Ve a la landing page
2. Click "Usar la App"
3. Deberías ver la constelación con datos mock (o reales si tienes BD poblada)
4. Busca una persona → debería animar correctamente
5. En Android: Abre menú → "Instalar FamilyStars" → funciona como app nativa

## 🔄 Si algo falla

- **Vercel build fail**: Ve a Deployments → logs
- **Render crash**: Ve a Runtime Logs en Render dashboard
- **API calls failing**: Verifica VITE_API_URL en Vercel
- **PWA no funciona**: Revisa que manifest.json esté accesible en /manifest.json

## 📝 Notas Importantes

- **Primera vez tarda**: Vercel ~3 min, Render ~5-10 min
- **Cold starts**: Render puede tener cold start en primeros 15s, es normal
- **PWA offline**: Funciona offline solo para archivos cacheados (HTML/CSS/JS), no API calls
- **iOS**: En iOS 16+, la PWA funciona pero sin notificaciones push
- **Android**: Funciona como app nativa completa con notificaciones (cuando las implementemos)

---

## 🚀 Próximos Pasos (Fase 3)

Una vez que todo esté deployado:
1. Implementar autenticación (magic links)
2. Agregar panel admin
3. Crear sistema de invitaciones
4. Implementar formulario de sugerencias

¿Necesitas ayuda con algo específico?
