# Development Plan — Community Events Board

> This plan maps every assignment requirement to a concrete implementation task with acceptance criteria. Tasks are grouped into phases that respect inter-dependencies. No task is marked complete unless the code exists, builds, and has been manually verified.

---

## Table of Contents

1. [Requirement Map](#requirement-map)
2. [Phase Overview](#phase-overview)
3. [Phase 1 — Foundation and Configuration](#phase-1--foundation-and-configuration)
4. [Phase 2 — Database Models and Seed Data](#phase-2--database-models-and-seed-data)
5. [Phase 3 — Authentication and Authorization](#phase-3--authentication-and-authorization)
6. [Phase 4 — Admin Event Management](#phase-4--admin-event-management)
7. [Phase 5 — Public Event Discovery](#phase-5--public-event-discovery)
8. [Phase 6 — Favourite Categories and My Feed](#phase-6--favourite-categories-and-my-feed)
9. [Phase 7 — Persistent Reminders](#phase-7--persistent-reminders)
10. [Phase 8 — Persistent Card Designer](#phase-8--persistent-card-designer)
11. [Phase 9 — Responsive Claymorphism UI](#phase-9--responsive-claymorphism-ui)
12. [Phase 10 — Testing and Security Verification](#phase-10--testing-and-security-verification)
13. [Phase 11 — README, GitHub, and Submission Recording](#phase-11--readme-github-and-submission-recording)
14. [Testing Checklist](#testing-checklist)

---

## Requirement Map

| Assignment Requirement | Implementation Phase | Key Files |
|---|---|---|
| MongoDB database with at least 2 collections | Phase 2 | `src/models/` |
| Mongoose schemas with validation | Phase 2 | `src/models/` |
| Admin: create, edit, activate/deactivate events | Phase 4 | `src/app/api/events/`, `src/app/admin/` |
| Public event listing with filters and pagination | Phase 5 | `src/app/api/events/`, `src/app/(public)/events/` |
| Category filter | Phase 5 | query param `category` |
| City filter | Phase 5 | query param `city` |
| Text search | Phase 5 | MongoDB text index + `$text` query |
| User registration and login | Phase 3 | `src/app/api/auth/` |
| Password hashing (bcrypt) | Phase 3 | `src/services/authService.ts` |
| JWT authentication | Phase 3 | `src/lib/auth.ts` |
| Admin page/API protected | Phase 3–4 | `src/middleware.ts`, route guards |
| Favourite categories | Phase 6 | `src/app/api/user/favourites/` |
| My Feed (personalised) | Phase 6 | `src/app/api/user/feed/` |
| Reminders (persistent, DB-backed) | Phase 7 | `src/models/Reminder.ts`, `src/app/api/user/reminders/` |
| Card designer (persistent, DB-backed) | Phase 8 | `src/models/CardDesign.ts`, `src/app/api/user/card-design/` |
| Claymorphism UI | Phase 9 | `src/components/`, `globals.css` |
| Responsive design | Phase 9 | Tailwind responsive classes |

---

## Phase Overview

```
Phase 1  →  Phase 2  →  Phase 3  →  Phase 4
                                        ↓
                              Phase 5  (can overlap 4)
                                        ↓
                    Phase 6, 7, 8  (parallel after Phase 5)
                                        ↓
                              Phase 9  (UI — ongoing)
                                        ↓
                              Phase 10 → Phase 11
```

---

## Phase 1 — Foundation and Configuration

**Goal**: All tooling, environment config, and shared utilities are in place before any feature is built.

### Status: Partially implemented

| Task | Status | Notes |
|---|---|---|
| Next.js project scaffold | ✅ Done | `create-next-app` with TypeScript + Tailwind |
| `src/lib/db.ts` — Mongoose connection | ✅ Done | Global cache, throws if URI missing |
| `next.config.ts` — Turbopack, caching | ✅ Done | Component caching + partial prefetching enabled |
| `.env.example` with all required vars | ⬜ TODO | File exists but is empty — fill in variable names |
| `src/types/index.ts` — shared TS interfaces | ⬜ TODO | `IEvent`, `IUser`, `IReminder`, `ICardDesign` |
| `src/lib/auth.ts` — JWT sign/verify helpers | ⬜ TODO | `signToken()`, `verifyToken()` |
| `src/lib/errors.ts` — typed API error helpers | ⬜ TODO | `ApiError` class, `handleApiError()` |
| CSS custom properties in `globals.css` | ⬜ TODO | All tokens from `DESIGN-SYSTEM.md` |
| Install `lucide-react` | ⬜ TODO | `npm install lucide-react` |
| Install `framer-motion` | ⬜ TODO | `npm install framer-motion` |

**Acceptance criteria**:
- `npm run build` completes without errors.
- `connectDB()` successfully connects to Atlas when `MONGODB_URI` is set.
- All CSS tokens are available globally.

**Dependencies**: None.

---

## Phase 2 — Database Models and Seed Data

**Goal**: All Mongoose models exist with validation, indexes, and a seed script that creates the admin account and sample events.

| Task | Status | Notes |
|---|---|---|
| `src/models/Event.ts` | ⬜ TODO | Schema per `DATABASE.md` |
| `src/models/User.ts` | ⬜ TODO | Schema per `DATABASE.md` |
| `src/models/Reminder.ts` | ⬜ TODO | Schema per `DATABASE.md` |
| `src/models/CardDesign.ts` | ⬜ TODO | Schema per `DATABASE.md` |
| `src/scripts/seed.ts` | ⬜ TODO | Creates admin from env vars + 10 sample events across all categories |

**Acceptance criteria**:
- All models import without TypeScript errors.
- Running `npx ts-node src/scripts/seed.ts` populates the database.
- MongoDB Atlas shows the collections with the expected documents and indexes.
- Duplicate email insert throws `MongoServerError` (unique index).
- Inserting more than 3 stickers throws Mongoose validation error.

**Dependencies**: Phase 1 complete.

---

## Phase 3 — Authentication and Authorization

**Goal**: Users can register, log in, and receive a JWT. Protected routes reject unauthenticated requests.

| Task | Status | Notes |
|---|---|---|
| `POST /api/auth/signup` | ⬜ TODO | Zod validation, hash password, create user |
| `POST /api/auth/login` | ⬜ TODO | Compare hash, issue JWT, set HttpOnly cookie |
| `POST /api/auth/logout` | ⬜ TODO | Clear cookie |
| `src/middleware.ts` — Edge JWT check | ⬜ TODO | Protects `/admin/*`, `/feed`, `/reminders`, `/card-designer` |
| Route handler `requireAuth` guard | ⬜ TODO | Helper used inside each protected route |
| Route handler `requireAdmin` guard | ⬜ TODO | Extends `requireAuth`, checks `role === 'admin'` |
| Login page UI | ⬜ TODO | `src/app/(auth)/login/page.tsx` |
| Signup page UI | ⬜ TODO | `src/app/(auth)/signup/page.tsx` |

**Acceptance criteria**:
- Registering with an existing email returns `409 CONFLICT`.
- Logging in with wrong password returns `401 UNAUTHORIZED`.
- Logging in sets the `token` cookie.
- Visiting `/admin` without a valid token redirects to `/login`.
- A valid user token cannot access admin-only API routes (returns `403 FORBIDDEN`).

**Dependencies**: Phase 2 complete.

---

## Phase 4 — Admin Event Management

**Goal**: The admin can create, edit, and activate/deactivate events through a protected dashboard.

| Task | Status | Notes |
|---|---|---|
| `POST /api/events` — create event | ⬜ TODO | Admin only; Zod validation |
| `PATCH /api/events/:id` — update event | ⬜ TODO | Admin only; partial update |
| `PATCH /api/events/:id/status` — toggle active | ⬜ TODO | Admin only |
| `GET /api/admin/events` — list all (admin) | ⬜ TODO | Includes inactive events |
| Admin dashboard page | ⬜ TODO | `src/app/admin/page.tsx` — event list table |
| New event form | ⬜ TODO | `src/app/admin/events/new/page.tsx` |
| Edit event form | ⬜ TODO | `src/app/admin/events/[id]/edit/page.tsx` |
| Admin layout with auth guard | ⬜ TODO | `src/app/admin/layout.tsx` |

**Acceptance criteria**:
- Admin can create an event and it appears in the admin list.
- Admin can toggle an event inactive; it disappears from the public listing.
- Non-admin JWT returns `403` on all admin API routes.
- All form fields validate with descriptive error messages.

**Dependencies**: Phase 3 complete.

---

## Phase 5 — Public Event Discovery

**Goal**: Any visitor can browse, filter, search, and paginate events.

| Task | Status | Notes |
|---|---|---|
| `GET /api/events` — public listing | ⬜ TODO | Active events, filters, pagination |
| `GET /api/events/:id` — event detail | ⬜ TODO | Active events only |
| Public events listing page | ⬜ TODO | `src/app/(public)/events/page.tsx` |
| Event detail page | ⬜ TODO | `src/app/(public)/events/[id]/page.tsx` |
| EventCard component | ⬜ TODO | Displays title, category badge, date, city, image |
| EventFilters component | ⬜ TODO | Category select, city input, keyword input |
| EventGrid component | ⬜ TODO | Responsive grid layout |
| Pagination component | ⬜ TODO | Previous / Next / page numbers |

**Acceptance criteria**:
- Listing returns only active events.
- Filtering by category + city returns the intersection.
- Keyword search finds events matching title or description.
- Pagination returns the correct page and total count.
- Requesting a non-existent event returns `404 NOT_FOUND`.

**Dependencies**: Phase 2 complete (Phase 4 provides seed data for realistic testing).

---

## Phase 6 — Favourite Categories and My Feed

**Goal**: Authenticated users can save up to 5 category preferences and see a personalised feed.

| Task | Status | Notes |
|---|---|---|
| `GET /api/user/favourites` | ⬜ TODO | Return user's saved categories |
| `PUT /api/user/favourites` | ⬜ TODO | Replace the category list |
| `GET /api/user/feed` | ⬜ TODO | Active events filtered by favourites |
| Favourites settings UI | ⬜ TODO | Category toggle chips |
| My Feed page | ⬜ TODO | `src/app/(user)/feed/page.tsx` |

**Acceptance criteria**:
- Saving `["Music", "Kids"]` and loading My Feed returns only Music and Kids events.
- Saving an empty array returns all active events on My Feed.
- Invalid category names in the PUT body return `400 VALIDATION_ERROR`.

**Dependencies**: Phase 3 and Phase 5 complete.

---

## Phase 7 — Persistent Reminders

**Goal**: Authenticated users can save and remove event reminders that persist in the database.

| Task | Status | Notes |
|---|---|---|
| `GET /api/user/reminders` | ⬜ TODO | Return all reminder events for user |
| `POST /api/user/reminders` | ⬜ TODO | Save reminder; 409 if already exists |
| `DELETE /api/user/reminders/:eventId` | ⬜ TODO | Remove reminder |
| Reminder toggle button on event card | ⬜ TODO | Bookmark icon, optimistic UI update |
| Reminders page | ⬜ TODO | `src/app/(user)/reminders/page.tsx` |

**Acceptance criteria**:
- Saving the same event reminder twice returns `409 CONFLICT`.
- Removing a reminder that does not exist returns `404 NOT_FOUND`.
- Reminders persist across sessions (stored in DB, not `localStorage`).
- Reminders page correctly lists all saved events.

**Dependencies**: Phase 3 and Phase 5 complete.

---

## Phase 8 — Persistent Card Designer

**Goal**: Authenticated users can customise and persistently save an event card theme, stickers, and font style.

| Task | Status | Notes |
|---|---|---|
| `GET /api/user/card-design` | ⬜ TODO | Return saved or default design |
| `PUT /api/user/card-design` | ⬜ TODO | Upsert design |
| CardDesigner component | ⬜ TODO | Theme picker, sticker picker (max 3), font picker |
| Live card preview | ⬜ TODO | Event card renders with selected theme in real time |
| Card designer page | ⬜ TODO | `src/app/(user)/card-designer/page.tsx` |

**Acceptance criteria**:
- Selecting more than 3 stickers is prevented by the UI and rejected by the API.
- Saving a design and reloading the page shows the same design.
- The design is applied to event cards throughout the app for the logged-in user.

**Dependencies**: Phase 3 and Phase 5 complete.

---

## Phase 9 — Responsive Claymorphism UI

**Goal**: All pages use the defined design system consistently. The application is fully responsive across mobile, tablet, and desktop.

| Task | Status | Notes |
|---|---|---|
| Update `globals.css` with all design tokens | ⬜ TODO | Colours, shadows, radii, spacing |
| Navbar component | ⬜ TODO | Logo, nav links, auth state, hamburger menu |
| Footer component | ⬜ TODO | Simple footer with links |
| Apply card shadow conventions | ⬜ TODO | All cards use `--shadow-raised` |
| Apply button styles | ⬜ TODO | Primary, secondary, danger variants |
| Apply input styles | ⬜ TODO | Inset shadow on all form fields |
| Category badge components | ⬜ TODO | Correct colours per category |
| Loading skeletons | ⬜ TODO | Match event card shape |
| Empty state components | ⬜ TODO | Friendly message + icon |
| Error state components | ⬜ TODO | Toast notifications |
| Responsive event grid | ⬜ TODO | 1 → 2 → 3 columns |
| Reduced motion support | ⬜ TODO | CSS media query + Framer Motion hook |
| Accessibility audit | ⬜ TODO | Focus states, ARIA labels, semantic HTML |

**Acceptance criteria**:
- All pages render correctly at 375px, 768px, and 1280px widths.
- No horizontal scroll on mobile.
- All interactive elements have visible focus styles.
- No raw hex colour values in component files (all reference CSS tokens or Tailwind classes mapped to tokens).

**Dependencies**: Phases 1–8 providing real content to style.

---

## Phase 10 — Testing and Security Verification

**Goal**: Verify that authentication, authorization, and data integrity work correctly.

| Task | Status | Notes |
|---|---|---|
| Manual API testing (Postman or curl) | ⬜ TODO | Cover all endpoints per `API.md` |
| Auth boundary testing | ⬜ TODO | Confirm unauthenticated and wrong-role rejections |
| Input validation testing | ⬜ TODO | Submit invalid data to each endpoint |
| Duplicate data testing | ⬜ TODO | Duplicate email, duplicate reminder |
| Pagination testing | ⬜ TODO | Verify page counts and edge cases (last page, empty page) |
| Filter combination testing | ⬜ TODO | Category + city + search together |
| Security review | ⬜ TODO | Check no secrets in source, no plain-text passwords in DB |

**Acceptance criteria**:
- All endpoints return the documented status codes for the documented scenarios.
- No plain-text passwords in the `users` collection.
- No JWT secret in any committed file.
- Admin routes return `401`/`403` for unauthenticated or unauthorised requests.

**Dependencies**: Phases 2–8 complete.

---

## Phase 11 — README, GitHub, and Submission Recording

**Goal**: Final documentation polish and submission preparation.

| Task | Status | Notes |
|---|---|---|
| Complete `README.md` | ✅ Done (this sprint) | Updated in this documentation task |
| Complete `.env.example` | ⬜ TODO | All variable names, no values |
| Fill in `AI-USAGE.md` with actual usage | ⬜ TODO | Record tools and tasks at the end |
| Record submission video | ⬜ TODO | Demonstrate all features per brief |
| Final GitHub push | ⬜ TODO | Clean commit history; no secrets |
| Answer assignment questions in README | ✅ Done | Marked pending verification where implementation is needed |

**Dependencies**: Phase 10 complete.

---

## Testing Checklist

Use this checklist during and after Phase 10.

### Authentication
- [ ] Signup with valid data creates a user
- [ ] Signup with existing email returns 409
- [ ] Signup with short password returns 400
- [ ] Login with correct credentials returns JWT cookie
- [ ] Login with wrong password returns 401
- [ ] Accessing `/admin` without token redirects to login
- [ ] Accessing admin API with user token returns 403
- [ ] Logout clears the cookie

### Events (Admin)
- [ ] Admin can create an event with all required fields
- [ ] Creating event with missing required field returns 400
- [ ] Admin can edit an event's title and category
- [ ] Admin can deactivate an event
- [ ] Deactivated event does not appear in public listing
- [ ] Admin can reactivate an event

### Events (Public)
- [ ] Public listing returns only active events
- [ ] Category filter narrows results correctly
- [ ] City filter is case-insensitive
- [ ] Keyword search returns relevant results
- [ ] Category + city + keyword combined returns intersection
- [ ] Pagination: page 2 returns different results than page 1
- [ ] Total and totalPages are accurate
- [ ] Event detail returns 404 for non-existent or inactive event

### Favourites and My Feed
- [ ] Setting favourites persists after page reload
- [ ] My Feed shows only events in favourite categories
- [ ] My Feed with no favourites shows all active events
- [ ] Invalid category name in favourites returns 400

### Reminders
- [ ] Saving a reminder persists after page reload
- [ ] Saving same reminder twice returns 409
- [ ] Removing a reminder updates the reminders page
- [ ] Removing non-existent reminder returns 404

### Card Designer
- [ ] Selecting a theme updates the card preview in real time
- [ ] Adding 4 stickers is blocked
- [ ] Saving a design persists after page reload
- [ ] Saved design applies to event cards for logged-in user

### UI and Responsiveness
- [ ] No horizontal scroll at 375px viewport
- [ ] Event grid collapses to 1 column on mobile
- [ ] All buttons and links have visible focus states
- [ ] Loading skeletons appear while data fetches
- [ ] Empty state shown when no events match filters
- [ ] Error toast shown on failed API call
