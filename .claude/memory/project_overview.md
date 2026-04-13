---
name: FamilyStars Project Overview
description: Genealogical constellation web app, 12-week MVP, family collaboration platform
type: project
---

## FamilyStars — Constelación Genealógica Interactiva

**What**: A web app visualizing family trees as interactive star constellations. Each person = star, each family = constellation with unique color. Connected by curved lines (relationships) and golden lines (marriages between families).

**Why**: Original gift for Chencho's father (genealogy enthusiast). Goal: evolve into collaborative family tool where relatives can suggest new people, photos, and relationships with admin approval.

**Timeline**: 12 weeks MVP (April–June 2026)
- Fase 1 (weeks 1–3): Backend + BD + auth
- Fase 2 (weeks 4–6): React canvas + constelación visual + deploy
- Fase 3 (weeks 7–8): Invitations + collaboration + moderation
- Fase 4 (weeks 9–10): Photos + profiles + mobile
- Fase 5 (weeks 11–12): Extras + optimization + docs

**Owner**: Chencho García (makes UX/design decisions)

**Stack**:
- Frontend: React + Vite, D3.js canvas, Tailwind CSS
- Backend: Node.js + Express
- Database: PostgreSQL (Supabase)
- Storage: Cloudinary (photos)
- Email: Resend (magic links + notifications)
- Hosting: Vercel (frontend), Render.com (backend) — all free tier

**Four Initial Families (Constelaciones)**:
1. Paterna (father's side) — Purple #9B59B6
2. Materna (mother's side) — Cyan #3498DB
3. Política 1 (wife's family) — Orange #F39C12
4. Política 2 (in-laws) — Emerald #27AE60

**Three User Roles**:
- Admin: create families, approve all contributions, manage users
- Collaborator: suggest people/photos (pending approval), edit own profile
- Viewer: see approved constellation only

**Key Principle**: No data goes public without admin approval. Moderation is critical for quality.

**Current State**: Documentation complete (CLAUDE.md, SPEC.md, README.md, task list), beautiful UI demo created, ready to start Phase 1.
