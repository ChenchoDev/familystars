FAMILYSTARS
Constelación Genealógica Interactiva
─── Documento de Especificación Técnica ───
Proyecto:
FamilyStars
Versión:
1.0 — MVP
Autor:
Chencho (propietario del proyecto)
Fecha:
Abril 2026
Destinatario:
Desarrollador IA (Claude)


1. Visión General del Proyecto
FamilyStars es una aplicación web interactiva que visualiza árboles genealógicos familiares como constelaciones estelares. Cada persona es una estrella; cada familia, una constelación con su propio color y territorio visual. Las uniones entre familias (matrimonios) se representan como líneas doradas que conectan constelaciones.

El proyecto nació como regalo para el padre del propietario, apasionado por la genealogía, con la intención de que se convierta en un espacio colaborativo donde toda la familia pueda participar ampliando el árbol a lo largo del tiempo.

Objetivo principal
Construir una app web colaborativa, moderna y de acceso público/controlado donde las familias puedan visualizar, completar y compartir su árbol genealógico de forma progresiva.


1.1 Principios de diseño
Visual primero: la constelación es la interfaz, no un árbol de texto
Colaborativo por naturaleza: cualquier familiar puede sugerir personas nuevas
Control de calidad: ningún dato aparece sin aprobación del administrador
Privacidad gradual: datos sensibles visibles solo para miembros verificados
Mobile-first: diseñado para compartir por WhatsApp y usar en el móvil

1.2 Familias iniciales
El árbol comenzará con las siguientes ramas familiares, cada una con su propio color de constelación:

Constelación
Familia
Color
Paterna
Familia del padre (apellido paterno)
Lila / púrpura
Materna
Familia de la madre (apellido materno)
Azul celeste
Política 1
Familia de la esposa
Naranja dorado
Política 2
Familia de cuñados (expansible)
Verde esmeralda




2. Arquitectura Técnica
2.1 Stack tecnológico
El stack está seleccionado para maximizar velocidad de desarrollo, coste cero en fase MVP y facilidad de migración futura al NAS doméstico del propietario.

Capa
Tecnología
Servicio / Hosting
Tier gratuito
Frontend
React + Vite
Vercel
Ilimitado (proyectos personales)
Backend API
Node.js + Express
Render.com
750 h/mes
Base de datos
PostgreSQL
Supabase
500 MB, 2 proyectos
Almacenamiento fotos
Cloudinary SDK
Cloudinary
25 GB + transformaciones
Autenticación / email
JWT + magic links
Resend.com
3.000 emails/mes
Visualización
D3.js / Canvas API
Incluido en frontend
—


2.2 Diagrama de despliegue
  [Usuario / Familiar]
        |
        v
  [Vercel — React + Vite]  <——  assets estáticos, constelación D3
        |
        v  HTTPS / REST
  [Render — Node.js + Express]
        |            |
        v            v
  [Supabase]    [Cloudinary]
  PostgreSQL     Fotos + avatares
        |
        v  (backup nocturno)
  [NAS Asustor — doméstico]
  Copia de seguridad local


2.3 Modelo de datos principal
Tabla: persons
Campo
Descripción
id (UUID)
Identificador único
first_name
Nombre de pila
last_name
Apellido(s)
birth_date
Fecha de nacimiento (puede ser aproximada)
death_date
Fecha de fallecimiento (opcional)
birth_place
Lugar de nacimiento
current_location
Lugar de residencia actual
bio
Texto biográfico corto (libre)
avatar_url
URL de Cloudinary para foto de perfil
family_id (FK)
Constelación a la que pertenece
status
pending | approved | rejected
created_by (FK)
Usuario que lo creó
approved_by (FK)
Admin que lo aprobó
created_at
Timestamp de creación


Tabla: relationships
Campo
Descripción
id (UUID)
Identificador único
person_a_id (FK)
Referencia a persons
person_b_id (FK)
Referencia a persons
type
parent | child | partner | sibling | cousin | other
verified
Boolean — aprobado por admin
notes
Texto libre para aclarar la relación


Tabla: families (constelaciones)
Campo
Descripción
id (UUID)
Identificador único
name
Nombre de la familia (ej: "Familia García")
color_hex
Color de la constelación en la UI
description
Texto de presentación de la rama
admin_id (FK)
Usuario administrador de esta rama


Tabla: person_photos
Campo
Descripción
id (UUID)
Identificador único
person_id (FK)
Persona a la que pertenece la foto
cloudinary_url
URL de la imagen en Cloudinary
caption
Pie de foto opcional
year
Año aproximado de la foto
uploaded_by (FK)
Usuario que subió la foto
approved
Boolean — aprobada por admin


Tabla: users
Campo
Descripción
id (UUID)
Identificador único
email
Email (único)
name
Nombre mostrado
role
admin | collaborator | viewer
family_id (FK)
Familia a la que está vinculado (opcional)
invite_token
Token de invitación usado para registrarse
created_at
Timestamp de registro


Tabla: social_links
Campo
Descripción
id (UUID)
Identificador único
person_id (FK)
Persona asociada
platform
instagram | facebook | linkedin | twitter | other
url
URL del perfil
label
Texto alternativo (ej: "Instagram personal")




3. Sistema de Permisos y Roles
El sistema de permisos es la pieza más crítica de la aplicación. Debe ser robusto pero sencillo de entender para usuarios no técnicos. Se definen tres roles con responsabilidades claramente delimitadas.

3.1 Roles y capacidades
Capacidad
Admin
Colaborador
Visitante
Ver constelación completa
SI
SI
SI
Ver perfiles completos
SI
SI
Solo básicos
Sugerir nueva persona
SI (directo)
SI (pendiente)
NO
Editar propio perfil
SI
SI
NO
Añadir fotos a persona
SI (directo)
SI (pendiente)
NO
Aprobar sugerencias
SI
NO
NO
Crear nuevas familias
SI
NO
NO
Invitar colaboradores
SI
NO
NO
Eliminar personas/fotos
SI
NO
NO
Ver datos pendientes
SI
NO
NO


3.2 Flujo de moderación
Toda contribución de un colaborador pasa por el siguiente flujo antes de ser visible en la constelación pública:

  Colaborador sugiere nueva persona o foto
            |
            v
  Registro en BD con status = "pending"
  (invisible para otros usuarios)
            |
            v
  Admin recibe notificación por email
            |
      -------+-------
      |             |
      v             v
  APRUEBA        RECHAZA
      |             |
      v             v
  status =       status =
  "approved"     "rejected"
  Aparece en     Desaparece con
  constelación   nota opcional


3.3 Sistema de invitaciones
Los colaboradores acceden mediante un enlace de invitación único generado por el admin. No existe registro abierto.

Admin genera un token de invitación desde el panel de administración
El sistema envía un email con el enlace: https://familystars.app/invite/{token}
El familiar accede al enlace, introduce su nombre y queda registrado como Colaborador
El token queda invalidado tras un uso (o tras 7 días, lo que ocurra primero)
El admin puede revocar el acceso de cualquier colaborador en cualquier momento



4. Interfaz de Usuario
4.1 Vista principal: la constelación
La pantalla principal es un canvas interactivo de fondo oscuro (color #080C18 — azul noche profundo) que ocupa toda la pantalla. Sobre él flotan las estrellas-personas organizadas por constelaciones familiares.

Comportamiento del canvas
Arrastrar: mover el universo libremente en todas direcciones
Rueda del ratón / pinch en móvil: zoom entre 0.3x y 2.5x
Clic en estrella: abre el panel lateral de perfil
Clic en zona vacía: cierra el panel y limpia la selección
Estrellas de fondo: 120 puntos de luz estáticos con animación de titileo (opacidad pulsante, fase aleatoria por estrella)

Estrellas-persona
Tamaño: proporcional a la generación (abuelos más grandes, nietos más pequeños). Rango: 20–36 px de diámetro
Color: determinado por la familia (constelación). Cada familia tiene su color primario y color de badge de fondo
Interior: foto de perfil circular si existe; iniciales (nombre[0] + apellido[0]) si no hay foto
Halo pulsante: círculo difuminado del color de la familia con animación de scale 1.0 → 1.12 → 1.0 cada 3 segundos
Etiqueta: nombre debajo de la estrella, apellido en texto más pequeño y opacidad reducida
Al seleccionar: escala 1.5x, resto de estrellas no relacionadas bajan a opacidad 0.18

Líneas de conexión
Tipo de relación
Estilo visual
Padre / madre / hijo
Línea curva sutil del color de la familia, opacidad 0.35
Hermano / primo
Línea curva sutil del color de la familia, opacidad 0.25
Matrimonio (misma familia)
Línea discontinua blanca, opacidad 0.22
Matrimonio (entre familias)
Línea discontinua dorada (#C9A84C), opacidad 0.35, grosor 1.5px


4.2 Buscador
Barra de búsqueda posicionada en la parte superior central, siempre visible sobre el canvas. Busca en tiempo real por:
Nombre o apellido de persona
Nombre de familia / constelación
Rol (abuelo, tío, primo...)
Lugar de nacimiento o residencia

Al seleccionar un resultado, el canvas hace pan + zoom animado para centrar la estrella seleccionada, y se abre automáticamente el panel de perfil.

4.3 Panel de perfil
Panel lateral (derecha en desktop, modal inferior en móvil) que se abre al clicar en cualquier estrella. Contiene:

Sección
Contenido
Cabecera
Avatar circular grande, nombre completo, año de nacimiento, rol familiar
Datos básicos
Familia (con su color), edad, lugar de nacimiento, lugar actual
Etiquetas
Tags personalizados (profesión, aficiones, etc.)
Conexiones
Lista de relaciones directas con tipo de relación
Galería
Miniaturas de fotos (expandibles al clicar)
Redes sociales
Iconos con enlaces a perfiles si los hay
Acciones
Botón "Editar" (solo para admin/colaborador autorizado), "Añadir foto"


4.4 Vistas adicionales (post-MVP)
Línea de tiempo: vista cronológica de todos los eventos familiares (nacimientos, bodas, fallecimientos)
Mapa de orígenes: mapa real con pins en los lugares de nacimiento de cada rama familiar
Cómo me relaciono con X: algoritmo que calcula y explica el camino de parentesco entre dos personas cualquiera
Muro de recuerdos: sección por persona donde familiares pueden añadir anécdotas y fotos adicionales
Notificaciones de cumpleaños: email automático cuando es el cumple de alguien del árbol



5. Endpoints de la API REST
5.1 Autenticación
Método
Endpoint
Descripción
POST
/auth/magic-link
Solicita un magic link de acceso al email
GET
/auth/verify/:token
Verifica el token y devuelve JWT
POST
/auth/invite
Admin: genera un token de invitación
GET
/auth/me
Devuelve el usuario autenticado actual


5.2 Personas
Método
Endpoint
Descripción
GET
/persons
Lista todas las personas aprobadas (con coordenadas para canvas)
GET
/persons/:id
Perfil completo de una persona
POST
/persons
Crea/sugiere una nueva persona
PATCH
/persons/:id
Edita datos de una persona (permisos según rol)
PATCH
/persons/:id/approve
Admin: aprueba una persona pendiente
DELETE
/persons/:id
Admin: elimina una persona
GET
/persons/:id/photos
Lista las fotos de una persona
POST
/persons/:id/photos
Sube una foto nueva a Cloudinary y la registra


5.3 Relaciones
Método
Endpoint
Descripción
GET
/relationships
Lista todas las relaciones aprobadas
POST
/relationships
Crea/sugiere una nueva relación
PATCH
/relationships/:id/approve
Admin: aprueba una relación pendiente
DELETE
/relationships/:id
Admin: elimina una relación


5.4 Familias
Método
Endpoint
Descripción
GET
/families
Lista todas las familias/constelaciones
POST
/families
Admin: crea una nueva constelación
PATCH
/families/:id
Admin: edita datos de una familia


5.5 Administración
Método
Endpoint
Descripción
GET
/admin/pending
Lista todo el contenido pendiente de aprobación
GET
/admin/users
Lista todos los usuarios registrados
PATCH
/admin/users/:id/role
Cambia el rol de un usuario
DELETE
/admin/users/:id
Revoca el acceso de un usuario




6. Plan de Desarrollo por Fases
El desarrollo se organiza en fases incrementales. Cada fase entrega valor usable independientemente. El propietario puede compartir la URL con la familia desde la Fase 2.

Fase 1 — Fundamentos (semanas 1–3)
Configuración del proyecto: monorepo, ESLint, Prettier, Git
Base de datos: esquema PostgreSQL en Supabase con todas las tablas
Backend: Express con estructura MVC, middleware de autenticación JWT
Sistema de magic links: Resend para envío de emails de acceso
Endpoints básicos de personas, relaciones y familias
Tests unitarios de los endpoints principales

Fase 2 — Constelación visual (semanas 4–6)
React + Vite: estructura de proyecto, routing, contexto de auth
Canvas principal con D3.js: nodos, líneas de relación, zoom y pan
Buscador en tiempo real sobre el canvas
Panel de perfil lateral con toda la información de cada persona
Carga inicial con datos de ejemplo (la familia García/Rodríguez/Navarro del prototipo)
Despliegue en Vercel + Render: URL pública funcional

Fase 3 — Colaboración (semanas 7–8)
Sistema de invitaciones: generación de tokens, emails, registro de colaboradores
Formulario "Sugerir persona": los colaboradores pueden añadir nuevos miembros
Panel de administración: vista de pendientes, aprobar/rechazar con un clic
Notificaciones por email al admin cuando hay contenido pendiente
Protección de rutas según rol en frontend

Fase 4 — Perfiles ricos (semanas 9–10)
Subida de fotos: integración con Cloudinary, recorte circular para avatares
Galería de fotos por persona con lightbox
Redes sociales: añadir y mostrar enlaces a perfiles externos
Edición de perfil propio para colaboradores
Vista móvil optimizada: panel inferior, gestos táctiles para zoom y pan

Fase 5 — Extras y pulido (semanas 11–12)
Notificaciones de cumpleaños por email (cron job diario)
Línea de tiempo familiar
Script de backup nocturno al NAS Asustor
Optimización de rendimiento para árboles grandes (>300 personas)
Documentación de usuario final

Entregable MVP
Al finalizar la Fase 4, la aplicación está lista para uso familiar real: URL pública, acceso por invitación, moderación por admin y perfiles con fotos.




7. Variables de Entorno Requeridas
7.1 Backend (.env)
# Base de datos
DATABASE_URL=postgresql://user:pass@db.supabase.co:5432/postgres

# JWT
JWT_SECRET=cadena-aleatoria-muy-larga-de-al-menos-64-caracteres
JWT_EXPIRES_IN=7d

# Cloudinary (fotos)
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret

# Resend (emails)
RESEND_API_KEY=re_xxxxxxxxxxxxxxx
EMAIL_FROM=noreply@familystars.app

# App
FRONTEND_URL=https://familystars.vercel.app
ADMIN_EMAIL=tu-email@gmail.com
NODE_ENV=production


7.2 Frontend (.env)
# API
VITE_API_URL=https://familystars-api.onrender.com

# Cloudinary (solo para upload directo desde cliente)
VITE_CLOUDINARY_CLOUD_NAME=tu-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=familystars-preset




8. Estructura de Carpetas del Proyecto
familystars/
  ├── apps/
  │   ├── frontend/                  # React + Vite
  │   │   ├── src/
  │   │   │   ├── components/
  │   │   │   │   ├── constellation/ # Canvas principal, nodos, líneas
  │   │   │   │   ├── profile/       # Panel lateral de perfil
  │   │   │   │   ├── search/        # Buscador
  │   │   │   │   └── admin/         # Panel de administración
  │   │   │   ├── hooks/             # useConstellation, useAuth, useSearch
  │   │   │   ├── api/               # Cliente HTTP (fetch wrappers)
  │   │   │   ├── context/           # AuthContext, FamilyContext
  │   │   │   └── utils/             # Helpers de coordenadas, colores
  │   │   └── vite.config.js
  │   └── backend/                   # Node.js + Express
  │       ├── src/
  │       │   ├── routes/            # persons, families, auth, admin
  │       │   ├── controllers/       # Lógica de negocio
  │       │   ├── middleware/        # auth, roleCheck, validate
  │       │   ├── models/            # Queries SQL (pg)
  │       │   ├── services/          # cloudinary, resend, jwt
  │       │   └── jobs/              # birthday cron, backup cron
  │       └── package.json
  ├── packages/
  │   └── shared/                    # Tipos TypeScript compartidos
  ├── scripts/
  │   └── backup-to-nas.sh           # Script nocturno de backup
  └── README.md




9. Consideraciones Finales
9.1 Privacidad y RGPD
Las personas vivas con foto requieren consentimiento implícito (el colaborador que las añade es responsable)
Existirá un botón "Solicitar eliminación de mis datos" accesible desde cualquier perfil
Las personas fallecidas se consideran datos de interés histórico familiar sin restricciones adicionales
Las fotos se almacenan en Cloudinary con acceso controlado por URL firmada (no indexables por buscadores)

9.2 Escalabilidad
El canvas de D3.js soporta eficientemente hasta ~500 nodos con las optimizaciones de virtualización incluidas
Para árboles mayores de 500 personas, implementar clustering: mostrar la constelación por familia y hacer zoom para expandir
Cloudinary gestiona automáticamente el redimensionado y compresión de fotos para distintos tamaños de pantalla

9.3 Migración futura al NAS
Cuando el propietario decida migrar del cloud al NAS doméstico (Asustor Drivestor 2 Pro AS3302T), el proceso es directo:
Exportar dump de PostgreSQL desde Supabase
Importarlo en PostgreSQL dockerizado en el NAS
Configurar DDNS en el NAS para acceso externo
Actualizar las variables de entorno del frontend apuntando al nuevo backend
Mantener Cloudinary o migrar fotos a almacenamiento local del NAS

Al estar todo containerizado con Docker, la app es la misma independientemente de dónde se ejecute.

Primer paso recomendado
Empezar por la Fase 1: configurar el repositorio, la base de datos en Supabase y los endpoints básicos. El prototipo visual de la constelación ya existe y puede usarse como referencia exacta de implementación para el frontend.




FamilyStars — Un universo para no perder a nadie
Desarrollado con amor para Martín y para todas las generaciones que vendrán.
