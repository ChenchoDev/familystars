# 🌟 FamilyStars Backend API

Node.js + Express REST API for the FamilyStars genealogical constellation platform.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

**Required variables**:
- `DATABASE_URL`: Supabase PostgreSQL connection string
- `JWT_SECRET`: Long random string (min 64 chars)
- `RESEND_API_KEY`: Email service API key
- `CLOUDINARY_CLOUD_NAME`: Photo storage service
- `FRONTEND_URL`: Your React app URL

### 3. Run Database Migrations

```bash
npm run migrate
```

This creates all tables and inserts initial families.

### 4. Start Development Server

```bash
npm run dev
```

Server runs on http://localhost:3000

### 5. Run Tests

```bash
npm test
```

## 📁 Project Structure

```
src/
├── app.js                 # Express app setup
├── server.js              # Entry point
├── db/
│   ├── index.js          # Connection pool
│   └── migrations.js     # Database schema
├── middleware/
│   ├── auth.js           # JWT verification & roles
│   └── validate.js       # Input validation
├── services/
│   ├── jwt.js            # Token generation
│   ├── email.js          # Resend integration
│   └── cloudinary.js     # Photo storage (phase 2)
├── controllers/
│   ├── auth.js           # Authentication endpoints
│   ├── persons.js        # Person CRUD
│   ├── families.js       # Family management
│   ├── relationships.js  # Family relationships
│   ├── photos.js         # Photo management
│   └── admin.js          # Admin operations
└── routes/
    └── index.js          # Route definitions
```

## 🔌 API Endpoints

See [API_REFERENCE.md](../../API_REFERENCE.md) for complete documentation.

**Quick Links**:
- `POST /auth/magic-link` — Request magic link
- `GET /auth/verify/:token` — Verify token & get JWT
- `GET /persons` — List approved persons
- `POST /persons` — Suggest new person
- `GET /families` — List families
- `GET /admin/pending` — View pending approvals

## 🧪 Testing

Run all tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## 🔐 Authentication

All protected endpoints require `Authorization: Bearer <jwt_token>` header.

Magic link flow:
1. `POST /auth/magic-link` with email
2. User receives email with verification link
3. Click link → redirects to `GET /auth/verify/:token`
4. Backend returns JWT token
5. Store JWT in localStorage, use in all requests

## 👥 Authorization

Three roles:
- **admin**: Full access, approve content
- **collaborator**: Suggest persons/photos (pending approval)
- **viewer**: Read-only access

Controlled by middleware `requireRole('admin', 'collaborator', etc.)`

## 📊 Database

PostgreSQL database with 7 tables:
- `users` — Registered users with roles
- `families` — Genealogical family branches
- `persons` — Individual family members
- `relationships` — Connections between persons
- `person_photos` — Photos with approval workflow
- `social_links` — External profiles (Instagram, LinkedIn, etc.)
- `magic_tokens` — Email verification tokens

## 🚢 Deployment

### Render.com (Recommended)

1. Connect GitHub repo
2. Create "Web Service"
3. Set environment variables in Render dashboard
4. Deploy → auto-deploys on git push to main

### Heroku (Alternative)

```bash
heroku create familystars-api
heroku config:set DATABASE_URL=...
heroku config:set JWT_SECRET=...
git push heroku main
```

## 📝 Development Tips

- **Hot reload**: `npm run dev` with nodemon watches files
- **Database queries**: Use parameterized queries to prevent SQL injection
- **Async/await**: All controller functions are async-wrapped
- **Error handling**: Express-async-errors catches unhandled promise rejections
- **Validation**: Joi schemas in middleware validate all inputs

## 🐛 Troubleshooting

**Connection refused to database**:
- Check `DATABASE_URL` is correct
- Ensure Supabase project is active
- Whitelist your IP in Supabase firewall

**Magic link emails not sending**:
- Verify `RESEND_API_KEY` is valid
- Check `EMAIL_FROM` domain is verified in Resend

**CORS errors**:
- Ensure `FRONTEND_URL` is set correctly
- Check your React app makes requests to correct API URL

## 📚 Next Steps

- Phase 2: React frontend with D3.js canvas
- Phase 3: Invitation system & moderator panel
- Phase 4: Photo uploads & profile editing
- Phase 5: Performance optimization & documentation

---

**Last Updated**: April 2026
**Version**: 1.0
**Node**: 18+
