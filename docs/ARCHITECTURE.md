# Architecture — Community Events Board

> **Status**: This document describes both the current implemented baseline and the proposed architecture for the full application. Sections are labelled **[Implemented]** or **[Proposed]** where the distinction matters.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Folder Structure](#folder-structure)
4. [Frontend Architecture](#frontend-architecture)
5. [Backend Architecture](#backend-architecture)
6. [MongoDB Atlas Integration](#mongodb-atlas-integration)
7. [Authentication and Authorization Flow](#authentication-and-authorization-flow)
8. [Request Validation and Error Handling](#request-validation-and-error-handling)
9. [Data Flow](#data-flow)
10. [Environment Configuration](#environment-configuration)
11. [Security Considerations](#security-considerations)
12. [Deployment](#deployment)

---

## Project Overview

**Community Events Board** is a full-stack web application built with Next.js (App Router). Visitors can browse, filter, and save reminders for community events. Registered users can personalize their event feed by saving favourite categories and customizing the visual design of event cards. A single administrator role manages event creation, editing, and activation status. The entire UI uses a Claymorphism design language.

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.4.0 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^4 |
| Database | MongoDB Atlas | cloud-hosted |
| ODM | Mongoose | ^9 |
| Auth | JSON Web Tokens (jsonwebtoken) | ^9 |
| Password hashing | bcryptjs | ^3 |
| Validation | Zod | ^4 |
| Icons | Lucide React | to be installed |
| Animations | Framer Motion | to be installed |
| Build | Turbopack (via Next.js) | bundled |

> `lucide-react` and `framer-motion` are not yet installed. See `DEVELOPMENT-PLAN.md` for the task that adds them.

---

## Folder Structure

The proposed structure follows Next.js App Router conventions and a feature-adjacent organization under `src/`.

```
src/
├── app/                          # Next.js App Router root
│   ├── layout.tsx                # [Implemented] Root layout (fonts, body)
│   ├── page.tsx                  # [Implemented] Placeholder home page
│   ├── globals.css               # [Implemented] Tailwind import + CSS variables
│   │
│   ├── (public)/                 # [Proposed] Route group — no auth required
│   │   ├── events/
│   │   │   ├── page.tsx          # Public event listing with filters
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Public event detail
│   │   └── page.tsx              # Home / landing
│   │
│   ├── (auth)/                   # [Proposed] Route group — auth pages
│   │   ├── signup/page.tsx
│   │   └── login/page.tsx
│   │
│   ├── (user)/                   # [Proposed] Route group — authenticated users
│   │   ├── feed/page.tsx         # Personalised My Feed
│   │   ├── reminders/page.tsx    # Saved reminders
│   │   └── card-designer/page.tsx
│   │
│   ├── admin/                    # [Proposed] Admin-only pages
│   │   ├── layout.tsx            # Admin layout with auth guard
│   │   ├── page.tsx              # Admin dashboard
│   │   └── events/
│   │       ├── new/page.tsx
│   │       └── [id]/edit/page.tsx
│   │
│   └── api/                      # Route Handlers (REST API)
│       ├── auth/
│       │   ├── signup/route.ts   # [Implemented] POST /api/auth/signup
│       │   ├── login/route.ts    # [Implemented] POST /api/auth/login
│       │   ├── me/route.ts       # [Implemented] GET /api/auth/me
│       │   └── logout/route.ts   # [Implemented] POST /api/auth/logout
│       ├── admin/
│       │   └── me/route.ts       # [Implemented] GET /api/admin/me (admin test)
│       ├── events/               # [Proposed]
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── user/                 # [Proposed]
│       │   ├── favourites/route.ts
│       │   ├── feed/route.ts
│       │   ├── reminders/route.ts
│       │   └── card-design/route.ts
│       └── health/route.ts       # [Implemented]
│
├── components/
│   └── ui/                       # [Proposed] Primitive Claymorphism components
│
├── lib/
│   ├── db.ts                     # [Implemented] Mongoose connection with global cache
│   ├── env.ts                    # [Implemented] Server env variable validation
│   ├── api-response.ts           # [Implemented] Standardised response helpers
│   ├── auth.ts                   # [Implemented] JWT sign/verify + cookie helpers
│   └── csrf.ts                   # [Implemented] Same-origin CSRF check
│
├── models/                       # [Implemented]
│   ├── Event.ts
│   ├── User.ts
│   ├── Reminder.ts
│   └── CardDesign.ts
│
├── services/                     # [Proposed] Business-logic layer
│   ├── eventService.ts
│   ├── authService.ts
│   └── userService.ts
│
├── types/                        # [Implemented] Shared TypeScript interfaces
│   └── index.ts
│
└── middleware.ts                 # [Proposed] Edge middleware for route protection
```

---

## Frontend Architecture

### App Router and Route Groups

The application uses Next.js App Router with route groups (`(public)`, `(auth)`, `(user)`) to share layouts without affecting URL paths. The `admin/` segment is a real URL segment so that admin pages have a clear, distinct path.

### Rendering Strategy

| Page type | Strategy | Reason |
|---|---|---|
| Public event listing | Server Component + ISR | SEO, shared across all visitors |
| Event detail | Server Component + ISR | SEO, infrequently updated |
| Admin pages | Server Component (no cache) | Always fresh, restricted |
| My Feed / Reminders | Server Component (per-request) | User-specific data |
| Card Designer | Client Component | Interactive canvas |

### Client-Side State

No global state manager is planned. React `useState`/`useContext` is sufficient for:
- Current filter selections on the events listing
- Card designer preview state
- Auth token storage in an `HttpOnly` cookie (managed server-side)

### Middleware

`src/middleware.ts` will run at the Edge to check for a valid JWT cookie and redirect unauthenticated requests away from protected routes (`/admin/*`, `/feed`, `/reminders`, `/card-designer`).

---

## Backend Architecture

### Route Handlers

API logic lives in `src/app/api/*/route.ts` files following the Next.js App Router convention. Each file exports named async functions (`GET`, `POST`, `PATCH`, `DELETE`) that receive a `Request` object and return a `Response` (or `NextResponse`).

### Service Layer

Route handlers call service functions in `src/services/` that contain the actual business logic. This keeps handlers thin and testable independently of the HTTP layer.

```
Request → Route Handler (validation) → Service (business logic) → Model (DB query) → Response
```

### Middleware vs Route Handler Guards

- **Edge Middleware** (`middleware.ts`): handles session-based redirects for page routes.
- **Route Handler Guards**: each protected API route independently verifies the JWT from the `Authorization: Bearer <token>` header to enforce role-based access (`admin`, `user`).

---

## MongoDB Atlas Integration

### Connection

**[Implemented]** `src/lib/db.ts` exports `connectDB()`, which:
1. Reads `MONGODB_URI` from `process.env` (throws at module load if missing).
2. Uses a global `mongooseCache` object to reuse the connection across hot reloads in development and across serverless function invocations in production.
3. Resets `cached.promise` on connection failure to allow a clean retry.

### Collections

Four collections are planned (see `DATABASE.md` for full schema):

| Collection | Purpose |
|---|---|
| `events` | Community events created by admin |
| `users` | Registered users and admin account |
| `reminders` | User–event reminder associations |
| `carddesigns` | Per-user card appearance preferences |

---

## Authentication and Authorization Flow

> **[Implemented — Phase 3]** Authentication and JWT cookie handling are live. See `src/lib/auth.ts`, `src/lib/csrf.ts`, and `src/app/api/auth/`.

### Registration and Login

1. User submits credentials to `POST /api/auth/signup` or `POST /api/auth/login`.
2. Route handler validates the body with a Zod schema (Zod v4 — uses `.min(1)` instead of `required_error`).
3. `src/lib/auth.ts` signs the JWT on login; `bcryptjs` hashes passwords (saltRounds = 12).
4. On success a signed JWT is created. The payload contains `{ userId, role }` and a 7-day expiry.
5. The token is set as an `HttpOnly`, `SameSite=Strict` cookie (also `Secure` in production).
6. All state-changing auth endpoints also check the `Origin` header via `src/lib/csrf.ts` as a second CSRF layer.

### Admin Provisioning

The admin account is created by running `npm run seed-admin`. This script:
- Reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from environment variables only.
- Creates the admin account if it does not exist.
- Updates the password hash if the password has changed.
- Refuses to promote an existing normal user — requires manual intervention.
- Is idempotent and safe to run repeatedly.

**Never create an admin via the signup API** — the signup endpoint always assigns `role: "user"` server-side and ignores any `role` field in the request body.

### Protected Route Access

```
Browser request with cookie
  → (Future) Edge Middleware reads cookie
  → Verifies JWT signature and expiry
  → Route Handler calls getAuthFromRequest() from src/lib/auth.ts
  → Re-reads user role from database for admin checks
  → Returns 401/403 if check fails
```

### Roles

| Role | Capability |
|---|---|
| `admin` | Create, edit, activate/deactivate events |
| `user` | Manage favourites, reminders, and card design |
| *(guest)* | Read public events only |

The admin account is seeded at startup from `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables. No public admin registration endpoint exists.

---

## Request Validation and Error Handling

> **[Implemented — Phase 1 & 3]** `src/lib/api-response.ts` provides all response helpers. Zod v4 validation is in use on all auth routes.

### Validation

All incoming request bodies are parsed and validated using **Zod** schemas defined alongside or near the relevant route handler. Invalid input returns `400 Bad Request` with a structured error body before any database query runs.

```ts
// Example pattern
const schema = z.object({ title: z.string().min(3) });
const result = schema.safeParse(await request.json());
if (!result.success) {
  return Response.json({ error: result.error.flatten() }, { status: 400 });
}
```

### Error Response Shape

All API error responses follow a consistent shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "details": {}
  }
}
```

### HTTP Status Codes Used

| Code | Meaning |
|---|---|
| 200 | Success (GET, PATCH) |
| 201 | Resource created (POST) |
| 400 | Validation failure |
| 401 | Missing or invalid token |
| 403 | Valid token but insufficient role |
| 404 | Resource not found |
| 409 | Conflict (duplicate, e.g. email) |
| 500 | Unexpected server error |

---

## Data Flow

```
┌─────────────────────────────────────┐
│  Browser / Client Component         │
│  (fetch, form submit, SWR)          │
└──────────────┬──────────────────────┘
               │ HTTP + JWT cookie
               ▼
┌─────────────────────────────────────┐
│  Edge Middleware  (middleware.ts)    │
│  JWT check → redirect or pass       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Route Handler  (app/api/.../route) │
│  Zod validation → auth guard        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Service Layer  (src/services/)     │
│  Business logic, aggregation        │
└──────────────┬──────────────────────┘
               │ connectDB() + Model
               ▼
┌─────────────────────────────────────┐
│  Mongoose Models  (src/models/)     │
└──────────────┬──────────────────────┘
               │ Mongoose driver
               ▼
┌─────────────────────────────────────┐
│  MongoDB Atlas  (cloud)             │
└─────────────────────────────────────┘
```

Server Components fetch data directly through the service layer (skipping the HTTP layer) when rendering on the server.

---

## Environment Configuration

The following environment variables are required. Copy `.env.example` to `.env.local` and fill in real values. **Never commit `.env.local`.**

| Variable | Purpose | Example |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/events` |
| `JWT_SECRET` | Secret used to sign JWTs | 32+ character random string |
| `JWT_EXPIRES_IN` | Token lifespan | `7d` |
| `ADMIN_EMAIL` | Seed admin account email | `admin@example.com` |
| `ADMIN_PASSWORD` | Seed admin account password | strong password |
| `NEXT_PUBLIC_APP_URL` | Base URL for the app | `http://localhost:3000` |

> `NEXT_PUBLIC_*` variables are exposed to the browser. Do not prefix secrets with `NEXT_PUBLIC_`.

---

## Security Considerations

| Concern | Mitigation |
|---|---|
| Password storage | `bcryptjs` with saltRounds = 12; plain-text passwords never stored or logged |
| JWT secret exposure | Stored only in env vars; never in source code |
| Token transport | `HttpOnly` cookie prevents JavaScript access; `Secure` flag in production |
| CSRF | `SameSite=Strict` cookie + explicit `Origin` header check in `src/lib/csrf.ts` for all state-changing auth endpoints |
| Input injection | Zod validation on all API inputs; Mongoose parameterised queries prevent injection |
| Role injection | `role` is never accepted from client; always assigned server-side as `"user"` on signup; admin assigned only via seed script |
| Admin route exposure | Per-route role check using DB-sourced role (not token claim); future Edge middleware provides additional layer |
| Sensitive env vars | `.env.local` and `.env` are git-ignored; `.env.example` contains no real values |
| Rate limiting | Not yet planned; consider adding before production deployment |
| HTTPS | Enforced by hosting platform (Vercel) in production; `Secure` cookie flag applied |

---

## Deployment

### Development

```bash
npm run dev    # Starts Next.js with Turbopack on http://localhost:3000
```

Set `MONGODB_URI` and other variables in a local `.env.local` file.

### Production (Proposed)

The application is designed to deploy to **Vercel** (zero-configuration for Next.js):

1. Push to the main branch.
2. Vercel builds with `npm run build` and deploys the output.
3. Environment variables are set in the Vercel project dashboard — never in source code.
4. MongoDB Atlas network access must allow Vercel's outbound IP ranges (or allow all with strong credentials).

### Build Command

```bash
npm run build   # next build (TypeScript compilation + static optimisation)
npm run lint    # eslint
```
