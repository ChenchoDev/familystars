# 🚀 FamilyStars Quick Reference

**Bookmark this. Read it before every coding session.**

---

## 📍 Files to Read First

1. **CLAUDE.md** — Understand the vision and principles
2. **API_REFERENCE.md** — All endpoints at a glance
3. **FASE_1_SETUP.md** — How to start backend locally (if Fase 1)
4. **GETTING_STARTED.md** — Overall project orientation

---

## 🎯 Current Phase

**Fase 1** ✅ COMPLETE
- Backend fully built
- 25+ endpoints ready
- Database schema created
- Tests in place

**Fase 2** ⏳ NEXT
- Frontend: React + Vite
- Canvas: D3.js constellation
- UI: Search, profile panel, admin dashboard
- Deploy: Vercel + Render

---

## 🚀 To Get Started

```bash
# Backend (Fase 1)
cd apps/backend
npm install
npm run migrate
npm run dev

# Frontend (Fase 2 when ready)
cd apps/frontend
npm create vite@latest . -- --template react
npm install
npm run dev
```

---

## 📊 Architecture at a Glance

```
User
  ↓ (HTTPS/REST)
Frontend: React + Vite (Vercel)
  ↓ API calls
Backend: Express (Render)
  ↓ SQL queries
Database: PostgreSQL (Supabase)
```

**Frontend URL**: http://localhost:5173
**Backend URL**: http://localhost:3000
**Database**: PostgreSQL (4 families, 7 tables)

---

## 🔐 Authentication Flow

1. User requests magic link: `POST /auth/magic-link`
2. Email sent with token
3. User clicks link → `GET /auth/verify/:token`
4. Backend returns JWT
5. Frontend stores in localStorage
6. All API calls include: `Authorization: Bearer {jwt}`

---

## 👥 Three Roles

| Role | Can Do | Cannot Do |
|------|--------|-----------|
| **Admin** | See all, approve/reject, create families | — |
| **Collaborator** | Suggest persons/photos (pending) | Approve, delete, create families |
| **Viewer** | See approved content only | Suggest, edit, delete |

---

## 🗂️ Folder Structure

```
familystars/
├── CLAUDE.md              ← Strategic guide
├── SPEC.md                ← Technical spec
├── README.md              ← Project overview
├── API_REFERENCE.md       ← Endpoints
├── FASE_1_COMPLETE.md     ← Fase 1 checklist
├── FASE_1_SETUP.md        ← Setup instructions
├── QUICK_REFERENCE.md     ← THIS FILE
├── apps/
│   ├── backend/           ← Express API (Fase 1 ✅)
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── services/
│   │   │   ├── routes/
│   │   │   └── db/
│   │   └── package.json
│   └── frontend/          ← React app (Fase 2 ⏳)
└── .claude/memory/        ← Persistent context
```

---

## 🎨 Design System

**Colors** (by family):
- Paterna: `#9B59B6` (purple)
- Materna: `#3498DB` (cyan)
- Política 1: `#F39C12` (orange)
- Política 2: `#27AE60` (green)
- Canvas: `#080C18` (dark navy)

**Typography**:
- Sans-serif (system fonts, Segoe UI)
- Responsive design
- Dark theme throughout

---

## 📱 Key Endpoints (Most Used)

```
Authentication:
  POST   /auth/magic-link          Request magic link
  GET    /auth/verify/:token       Verify and get JWT
  GET    /auth/me                  Current user

Public:
  GET    /persons                  List all persons
  GET    /persons/:id              Person details
  GET    /families                 List families

For Collaborators:
  POST   /persons                  Suggest person (pending)
  POST   /persons/:id/photos       Upload photo (pending)

Admin Only:
  GET    /admin/pending            See pending approvals
  PATCH  /persons/:id/approve      Approve person
  POST   /families                 Create new family
```

See `API_REFERENCE.md` for complete list (25+ endpoints).

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode (auto-rerun on changes)
npm run test:watch

# Lint code
npm run lint
```

---

## 🚨 Common Issues

**"Database connection failed"**
- Check `DATABASE_URL` is correct
- Ensure Supabase project is active
- Whitelist your IP in firewall

**"Port 3000 already in use"**
```bash
PORT=3001 npm run dev
```

**"Module not found"**
```bash
npm install  # reinstall dependencies
```

---

## 📝 Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Commit often
git commit -m "feat: add X"
git commit -m "fix: resolve Y"
git commit -m "test: add tests for Z"

# Push and create PR
git push origin feature/my-feature
```

**Commit style**:
- `feat:` new feature
- `fix:` bug fix
- `test:` add/update tests
- `docs:` documentation
- `refactor:` code reorganization

---

## 🔄 Workflow Per Phase

### Phase 1 (Backend) ✅
```
1. npm install
2. npm run migrate
3. npm run dev
4. Test endpoints: curl http://localhost:3000/health
5. npm test
```

### Phase 2 (Frontend) ⏳
```
1. npm create vite...
2. npm install
3. npm run dev
4. Build constellation canvas (D3.js)
5. Connect to backend API
```

### Phase 3 (Collaboration) ⏳
```
1. Invitation system
2. Moderator panel
3. Notifications
```

### Phases 4-5 ⏳
```
Photos, mobile, extras...
```

---

## 💡 Pro Tips

1. **Memory is persistent**: Check `.claude/memory/` before starting
2. **Documentation is authoritative**: SPEC.md has the ground truth
3. **Tests help**: Run `npm test` to catch bugs early
4. **Commit messages matter**: They tell the story of the code
5. **Ask before major changes**: Check CLAUDE.md principles first

---

## 📞 Who to Ask

- **Technical decisions**: Check SPEC.md or API_REFERENCE.md
- **Design decisions**: Check CLAUDE.md or memory files
- **How to start**: Read FASE_1_SETUP.md
- **Everything**: This Quick Reference

---

## ✨ Remember

- **MVP mindset**: Ship working features, iterate
- **Zero-cost first**: Use free tiers (Vercel, Render, Supabase)
- **Collaboration**: The whole goal is family participation
- **Quality over quantity**: Moderation is critical
- **Beautiful code**: Make it something you're proud of

---

**Updated**: 12 Abril 2026
**Status**: Fase 1 Complete, Ready for Fase 2
**Next**: Read FASE_1_COMPLETE.md for detailed checklist
