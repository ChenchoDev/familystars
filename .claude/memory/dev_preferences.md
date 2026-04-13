---
name: Development Preferences & Guidelines
description: How to approach this project — priorities, constraints, collaboration style
type: feedback
---

## Development Approach

### Priority 1: MVP First
- **Why**: Chencho wants a working app his family can use within 12 weeks, not a perfect foundation for future expansion.
- **How to apply**: Each phase should deliver working, usable features. Skip premature optimization (Redux before needed, Storybook before design is finalized, etc.). Iterate based on real usage.

### Priority 2: Zero-Cost Hosting (Phase MVP)
- **Why**: No budget for infrastructure until family needs to scale. All tier gratuito services must be maximized first.
- **How to apply**: Aggressive use of: Vercel free, Render.com free (750h/month), Supabase free (500MB), Cloudinary free (25GB), Resend free (3000 emails/month). Design systems and DB schema to stay under limits. Upgrade only if bottleneck confirmed.

### Priority 3: Family Collaboration Over Features
- **Why**: The whole point is relatives can contribute. Moderation (admin approval) is core, not optional. Quality of data > quantity.
- **How to apply**: Every feature should consider: "Can a non-technical family member use this? Will the admin approve/reject workflow function smoothly?" Invest heavily in moderation UX (admin panel, notifications).

### Priority 4: Aesthetic Excellence, Not Generic AI Slop
- **Why**: This is a gift app. It needs to be beautiful and distinctive. The constellation metaphor should feel intentional and delightful, not like a default tree diagram.
- **How to apply**: Use the UI demo and design system as reference. Invest time in animations, colors, typography. The constellation canvas should be the star, not an afterthought. Mobile should feel native and responsive.

### Priority 5: Documentation for Non-Tech Users
- **Why**: Family members aren't developers. Chencho (admin) needs clear docs on inviting people, approving content, managing users. Visitors need to understand how to use it.
- **How to apply**: Create user-facing documentation (wiki, help section, email templates). Test instructions with non-technical person before considering "done".

---

## Collaboration Style

### Decisions About Chencho
- **UX/Visual changes**: Always propose alternatives, wait for Chencho's input before finalizing
- **New features**: Check SPEC.md first. If it's in the spec, build it. If it's a "nice to have," ask Chencho.
- **Timeline adjustments**: If a phase is slipping, communicate early. Chencho likely has a deadline (maybe wants to gift the app by summer).
- **Scope creep**: Politely push back on requests outside the 12-week plan. Suggest post-MVP instead.

### Decisions About Architecture
- **Backend API design**: You decide, based on SPEC.md. Keep it simple and RESTful.
- **Frontend component structure**: You decide. Use modern patterns (hooks, Context for state, Tailwind for styling).
- **Database schema**: You decide, based on SPEC.md requirements. Start minimal, scale if needed.
- **Performance**: Optimize when you see a real problem (slow rendering, data fetching), not speculatively.

### Testing Philosophy
- **Phase 1**: Unit tests for auth + API endpoints (mandatory). Jest + supertest.
- **Phase 2+**: Smoke tests for critical paths (can a visitor see the constellation? Can a collaborator suggest a person?). Manual testing covers the rest.
- **Don't test**: Third-party libraries (assume they're tested). UI layout perfection (visual regression testing is overkill for MVP).

---

## Red Flags to Avoid

### ❌ Don't Do This

- **Premature abstraction**: Don't create utility helpers for code used once. Don't build a component library when you have 5 components total.
- **Over-engineering**: Don't use GraphQL for a REST-friendly app. Don't use a complex state management before Redux/Zustand is actually bottlenecking.
- **Scope creep in phase**: Once a phase starts, don't add new features. Create a ticket for post-MVP instead.
- **Backwards compatibility**: If you need to change the DB schema, change it. Don't add shims or migrations for unused columns.
- **Copy-pasting code**: If you write the same thing 3x, refactor. Less than 3x, leave it.
- **Gold-plating**: Don't polish animations that users will see once. Don't write 50-line CSS for a button that appears in one place.

---

## Quality Checklist Per Phase

### Phase Completion = When...
- [ ] All endpoints tested and working locally
- [ ] Frontend components render correctly
- [ ] No console errors/warnings
- [ ] Deployed to staging (Vercel/Render) and URL accessible
- [ ] Major bug report fixed, minor issues documented
- [ ] At least one family member (test user) can use the feature without instructions
- [ ] Code is readable (not over-commented, but self-explanatory)

### Don't Ship When...
- [ ] Awaiting "permission" to deploy (coordinate with Chencho upfront)
- [ ] Console has unresolved errors
- [ ] API calls timeout or crash the app
- [ ] Admin can't moderate content
- [ ] Mobile layout is broken
- [ ] Email notifications don't send (critical for invitations)

---

## Communication Cadence

- **Weekly check-in**: Async via Git commits + README progress. Chencho reviews and gives feedback.
- **Blocker**: If stuck for >2 hours, message Chencho or document the issue in a GitHub issue.
- **Phase completion**: Announce completion, include what works + what's deferred to next phase.

---

## Energy & Tone

- **Enthusiasm**: This is a special project. Bring your best design sense and craftsmanship.
- **Pragmatism**: Perfect is the enemy of done. Ship early, iterate based on feedback.
- **Pride in work**: Future Chencho (and his family) will use this for years. Make it something you're proud of.
