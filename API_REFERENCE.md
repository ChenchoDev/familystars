# 🔌 FamilyStars API Reference

**Base URL**: `https://familystars-api.onrender.com` (production)
**Auth**: `Authorization: Bearer {jwt_token}`
**Format**: JSON

---

## 🔐 Authentication

### POST `/auth/magic-link`
Request a magic link (no credentials).

```json
Request:
{ "email": "user@example.com" }

Response (200):
{ "message": "Email sent to user@example.com" }
```

---

### GET `/auth/verify/{token}`
Verify magic link token and get JWT.

```json
Response (200):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Juan García",
    "role": "collaborator",
    "family_id": "uuid"
  }
}

Response (400):
{ "error": "Invalid or expired token" }
```

---

### GET `/auth/me`
Get current authenticated user.

```json
Response (200):
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Juan García",
  "role": "collaborator",
  "family_id": "uuid"
}
```

---

### POST `/auth/invite` [ADMIN ONLY]
Generate invitation token for new collaborator.

```json
Request:
{
  "email": "tio@gmail.com",
  "family_id": "uuid",
  "role": "collaborator"
}

Response (201):
{
  "invite_token": "inv_abc123xyz...",
  "invite_url": "https://familystars.app/invite/inv_abc123xyz...",
  "expires_at": "2026-04-20T10:00:00Z"
}
```

---

## 👥 Persons

### GET `/persons`
List all approved persons with canvas coordinates.

**Query params**:
- `family_id` (optional)
- `limit` (default: 100, max: 500)
- `offset` (default: 0)

```json
Response (200):
{
  "data": [
    {
      "id": "uuid",
      "first_name": "Juan",
      "last_name": "García",
      "birth_date": "1950-05-15",
      "death_date": null,
      "avatar_url": "https://cloudinary.../avatar.jpg",
      "family_id": "uuid",
      "x": 150,
      "y": 200,
      "generation": 0,
      "status": "approved"
    }
  ],
  "total": 45
}
```

---

### GET `/persons/{id}`
Get full person profile.

```json
Response (200):
{
  "id": "uuid",
  "first_name": "Juan",
  "last_name": "García",
  "birth_date": "1950-05-15",
  "death_date": null,
  "birth_place": "Madrid",
  "current_location": "Barcelona",
  "bio": "Ingeniero jubilado, apasionado por la genealogía",
  "avatar_url": "https://...",
  "family": {
    "id": "uuid",
    "name": "Familia García",
    "color_hex": "9B59B6"
  },
  "relationships": [
    { "person_id": "uuid", "type": "child", "name": "María García" }
  ],
  "photos": [
    { "id": "uuid", "url": "https://...", "caption": "1990", "year": 1990, "approved": true }
  ],
  "social_links": [
    { "platform": "instagram", "url": "https://instagram.com/...", "label": "Personal" }
  ],
  "status": "approved",
  "created_at": "2026-04-01T10:00:00Z"
}
```

---

### POST `/persons`
Create/suggest new person.

```json
Request:
{
  "first_name": "María",
  "last_name": "García",
  "birth_date": "1952-03-20",
  "birth_place": "Valladolid",
  "current_location": "Madrid",
  "bio": "Profesora de primaria",
  "family_id": "uuid"
}

Response (201):
{
  "id": "uuid",
  "status": "pending",  // "approved" if admin
  "message": "Persona sugerida. Espera aprobación del admin."
}

Response (400):
{ "error": "Validation error: first_name required" }
```

---

### PATCH `/persons/{id}`
Update person (self, or admin).

```json
Request:
{
  "bio": "Ingeniero de sistemas, escritor",
  "current_location": "Valencia"
}

Response (200):
{ "id": "uuid", "status": "approved", "updated_at": "..." }
```

---

### PATCH `/persons/{id}/approve` [ADMIN ONLY]
Approve pending person.

```json
Response (200):
{ "id": "uuid", "status": "approved" }
```

---

### DELETE `/persons/{id}` [ADMIN ONLY]
Delete person.

```json
Response (204):
(no content)
```

---

## 📷 Photos

### GET `/persons/{person_id}/photos`
Get person's approved photos.

```json
Response (200):
{
  "data": [
    {
      "id": "uuid",
      "cloudinary_url": "https://res.cloudinary.com/...",
      "caption": "Boda de Juan y María, 1975",
      "year": 1975,
      "approved": true,
      "uploaded_by": { "name": "Carlos" }
    }
  ]
}
```

---

### POST `/persons/{person_id}/photos`
Upload new photo.

**Content-Type**: `multipart/form-data`

```
Request:
file: <image file>
caption: "Boda 1975"
year: 1975

Response (201):
{
  "id": "uuid",
  "cloudinary_url": "https://...",
  "status": "pending",  // or "approved" if admin
  "message": "Foto subida. Espera aprobación."
}
```

---

### PATCH `/person_photos/{id}/approve` [ADMIN ONLY]
Approve pending photo.

```json
Response (200):
{ "id": "uuid", "approved": true }
```

---

### DELETE `/person_photos/{id}` [ADMIN ONLY]
Delete photo.

```json
Response (204):
(no content)
```

---

## 🔗 Relationships

### GET `/relationships`
List all approved relationships.

**Query params**:
- `person_id` (optional): filter by person
- `verified` (default: true)

```json
Response (200):
{
  "data": [
    {
      "id": "uuid",
      "person_a": { "id": "uuid", "name": "Juan García" },
      "person_b": { "id": "uuid", "name": "María García" },
      "type": "partner",
      "verified": true,
      "notes": "Matrimonio 1975"
    }
  ]
}
```

---

### POST `/relationships`
Create/suggest relationship.

```json
Request:
{
  "person_a_id": "uuid",
  "person_b_id": "uuid",
  "type": "parent",
  "notes": "Confirmado en registro civil"
}

Response (201):
{
  "id": "uuid",
  "verified": false,  // or true if admin
  "message": "Relación sugerida. Espera aprobación."
}
```

**Valid types**: `parent`, `child`, `partner`, `sibling`, `cousin`, `other`

---

### PATCH `/relationships/{id}/approve` [ADMIN ONLY]
Approve relationship.

```json
Response (200):
{ "id": "uuid", "verified": true }
```

---

### DELETE `/relationships/{id}` [ADMIN ONLY]
Delete relationship.

```json
Response (204):
(no content)
```

---

## 👨‍👩‍👧‍👦 Families

### GET `/families`
List all families/constellations.

```json
Response (200):
{
  "data": [
    {
      "id": "uuid",
      "name": "Familia García",
      "color_hex": "9B59B6",
      "description": "Rama ancestral paterna",
      "person_count": 24,
      "admin": { "id": "uuid", "name": "Chencho García" }
    }
  ]
}
```

---

### POST `/families` [ADMIN ONLY]
Create new family.

```json
Request:
{
  "name": "Familia Navarro",
  "color_hex": "FF5733",
  "description": "Rama de los Navarro de Andalucía"
}

Response (201):
{ "id": "uuid", "name": "Familia Navarro", ... }
```

---

### PATCH `/families/{id}` [ADMIN ONLY]
Update family.

```json
Request:
{
  "description": "Rama maternal desde Granada",
  "color_hex": "3498DB"
}

Response (200):
{ "id": "uuid", ... }
```

---

## 🛡️ Admin

### GET `/admin/pending`
List all pending approvals.

```json
Response (200):
{
  "pending_persons": [ ... ],
  "pending_photos": [ ... ],
  "pending_relationships": [ ... ]
}
```

---

### GET `/admin/users`
List all users.

```json
Response (200):
{
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Juan García",
      "role": "collaborator",
      "family_id": "uuid",
      "created_at": "2026-04-01T10:00:00Z"
    }
  ]
}
```

---

### PATCH `/admin/users/{id}/role` [ADMIN ONLY]
Change user role.

```json
Request:
{ "role": "admin" }

Response (200):
{ "id": "uuid", "role": "admin" }

Valid roles: "admin", "collaborator", "viewer"
```

---

### DELETE `/admin/users/{id}` [ADMIN ONLY]
Revoke user access.

```json
Response (204):
(no content)
```

---

## 🔍 Search

### GET `/search`
Global search across persons, families, places.

**Query params**:
- `q` (required): search query
- `type` (optional): "person", "family", "place"

```json
Response (200):
{
  "results": [
    {
      "id": "uuid",
      "type": "person",
      "name": "Juan García",
      "family": "Familia García",
      "highlight": "Juan <mark>García</mark>"
    }
  ]
}
```

---

## ⚠️ Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "status": 400
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden (wrong role) |
| 404 | Not Found |
| 409 | Conflict (duplicate email, etc.) |
| 429 | Too Many Requests (rate limit) |
| 500 | Server Error |

---

## 🔄 Rate Limiting

- `/auth/magic-link`: 3 requests/hour per IP
- General endpoints: 100 requests/minute per user
- Admin endpoints: 50 requests/minute per admin

Header: `X-RateLimit-Remaining`

---

## 🚀 Quick Integration Examples

### Frontend: Magic Link Login

```javascript
// 1. Request magic link
const response = await fetch('https://api.familystars.app/auth/magic-link', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' })
});

// 2. User checks email, clicks link
// 3. Verify token (e.g., /invite?token=xxx redirects to /auth/verify/xxx)
const authResponse = await fetch(`https://api.familystars.app/auth/verify/${token}`);
const { token: jwtToken, user } = await authResponse.json();

// 4. Store JWT in localStorage
localStorage.setItem('authToken', jwtToken);
```

---

### Frontend: Fetch Constellation

```javascript
// All authenticated requests need Bearer token
const response = await fetch('https://api.familystars.app/persons', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
});
const { data, total } = await response.json();
// Use `data` to render stars on canvas
```

---

### Frontend: Suggest Person

```javascript
const response = await fetch('https://api.familystars.app/persons', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  },
  body: JSON.stringify({
    first_name: 'María',
    last_name: 'García',
    birth_date: '1952-03-20',
    family_id: 'uuid-here'
  })
});

// Status will be "pending" for collaborators
// Admin will get notified by email
```

---

**Last updated**: April 2026
**API Version**: 1.0
