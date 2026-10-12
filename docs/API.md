# API Reference — Community Events Board

> **Status**: Phases 3–5 implemented. Authentication (Phase 3) and event management + public discovery (Phases 4–5) are live. User features (Phases 6–8) remain planned.

---

## Table of Contents

1. [Conventions](#conventions)
2. [Authentication](#authentication)
3. [Pagination](#pagination)
4. [Error Response Format](#error-response-format)
5. [Health Check](#health-check)
6. [Auth Endpoints](#auth-endpoints)
7. [Event Endpoints (Public)](#event-endpoints-public)
8. [Event Endpoints (Admin)](#event-endpoints-admin)
9. [User — Favourite Categories](#user--favourite-categories)
10. [User — My Feed](#user--my-feed)
11. [User — Reminders](#user--reminders)
12. [User — Card Design](#user--card-design)

---

## Conventions

- Base path: `/api`
- All request and response bodies are `application/json`.
- Dates are ISO 8601 strings (`YYYY-MM-DDTHH:mm:ss.sssZ`).
- ObjectId fields are returned as 24-character hex strings.
- Boolean query parameters accept `true` / `false` strings.
- Endpoints marked 🔒 **require** a valid JWT in the `Authorization: Bearer <token>` header or `token` HttpOnly cookie.
- Endpoints marked 🛡️ **require** the `admin` role in addition to a valid JWT.

---

## Authentication

The API supports two methods of passing the JWT:

1. **Cookie** (preferred for browser clients): `token` cookie set by the server on login.
2. **Header** (for API clients): `Authorization: Bearer <token>`

Token payload shape:

```json
{
  "userId": "64a1b2c3d4e5f6a7b8c9d0e1",
  "role": "user",
  "iat": 1700000000,
  "exp": 1700604800
}
```

Tokens expire after 7 days. On expiry the client must log in again.

---

## Pagination

All list endpoints that return multiple records support cursor-free page-based pagination via query parameters:

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | integer ≥ 1 | `1` | Page number |
| `limit` | integer 1–50 | `12` | Results per page |

Paginated responses include a `pagination` object:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 47,
    "totalPages": 4,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## Error Response Format

All error responses share this structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description of what went wrong.",
    "details": {}
  }
}
```

Common error codes:

| Code | HTTP Status | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request body or query params failed Zod validation |
| `UNAUTHORIZED` | 401 | Missing, expired, or invalid JWT |
| `FORBIDDEN` | 403 | Valid JWT but insufficient role |
| `NOT_FOUND` | 404 | Requested resource does not exist |
| `CONFLICT` | 409 | Duplicate resource (e.g. email already registered) |
| `INTERNAL_ERROR` | 500 | Unhandled server error |

---

## Health Check

### `GET /api/health`

Returns the application and database status. No authentication required.

> **[Implemented — Phase 1]** `src/app/api/health/route.ts`

**Response 200**

```json
{
  "success": true,
  "message": "Service is healthy",
  "database": {
    "connected": true,
    "name": "community_events_board"
  }
}
```

**Response 503** (database unreachable)

```json
{
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Database is unavailable"
  }
}
```

> **Note on response shape**: The health response uses the `success` / `message` / `database` envelope (consistent with the standardised `ok()` helper) rather than the `status` / `database` / `timestamp` shape shown in earlier drafts. The 503 path uses the standard error envelope from `src/lib/api-response.ts`.

---

## Auth Endpoints

> **[Implemented — Phase 3]** All auth endpoints are live. See `src/app/api/auth/` and `src/app/api/admin/me/`.

### `POST /api/auth/signup`

Registers a new user account. Only the `user` role can be self-registered.

**Request body**

```json
{
  "email": "visitor@example.com",
  "password": "Str0ng!Pass",
  "displayName": "Alex"
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| `email` | string | ✅ | Valid email format, max 254 chars |
| `password` | string | ✅ | Min 8 chars |
| `displayName` | string | ❌ | Max 60 chars |

**Response 201**

```json
{
  "message": "Account created successfully.",
  "user": {
    "id": "64a1b2c3d4e5f6a7b8c9d0e1",
    "email": "visitor@example.com",
    "displayName": "Alex",
    "role": "user"
  }
}
```

**Errors**: `400 VALIDATION_ERROR`, `409 CONFLICT` (email taken)

---

### `POST /api/auth/login`

Authenticates a user and returns a signed JWT.

**Request body**

```json
{
  "email": "visitor@example.com",
  "password": "Str0ng!Pass"
}
```

**Response 200**

Sets `token` as an `HttpOnly`, `Secure`, `SameSite=Strict` cookie.

```json
{
  "message": "Login successful.",
  "user": {
    "id": "64a1b2c3d4e5f6a7b8c9d0e1",
    "email": "visitor@example.com",
    "role": "user"
  }
}
```

> **Note**: The JWT is delivered only via the `Set-Cookie` header (HTTP-only cookie). It is NOT included in the response body. This prevents JavaScript from reading the token and mitigates XSS token theft.

**Errors**: `400 VALIDATION_ERROR`, `401 UNAUTHORIZED` (wrong credentials)

---

### `GET /api/auth/me`

🔒 Returns the authenticated user's safe profile.

> **[Implemented — Phase 3]** `src/app/api/auth/me/route.ts`

**Response 200**

```json
{
  "success": true,
  "user": {
    "id": "64a1b2c3d4e5f6a7b8c9d0e1",
    "email": "visitor@example.com",
    "role": "user",
    "favouriteCategories": [],
    "createdAt": "2026-10-12T18:00:00.000Z"
  }
}
```

**Errors**: `401 UNAUTHORIZED` (missing, invalid, or expired token)

---

### `POST /api/auth/logout`

Clears the JWT cookie. No authentication required (logout always succeeds).

**Response 200**

```json
{ "success": true, "message": "Logged out successfully." }
```

> Sets `token=; Max-Age=0` cookie to clear the session.

---

### `GET /api/admin/me`

🛡️ Verifies admin identity. Used to confirm authentication and admin authorization are working.

> **[Implemented — Phase 3]** `src/app/api/admin/me/route.ts`
> Authorization is enforced by re-reading the user's role from the database — not from the JWT claim — so a role change in the DB takes effect immediately.

**Response 200**

```json
{
  "success": true,
  "message": "Admin identity verified.",
  "admin": {
    "id": "64a1b2c3d4e5f6a7b8c9d0e1",
    "email": "admin@example.com",
    "role": "admin",
    "createdAt": "2026-10-12T18:00:00.000Z"
  }
}
```

**Errors**: `401 UNAUTHORIZED` (no valid token), `403 FORBIDDEN` (valid token but not admin)

---

## Event Endpoints (Public)

> **[Implemented — Phase 5]** Both public event endpoints are live. See `src/app/api/events/`.

### `GET /api/events`

Returns a paginated list of **active, upcoming** events. Supports optional filtering by category, city, and keyword search.

Only events where `isActive: true` **and** `date > now` (server time) are returned. Inactive and past events are never exposed through this endpoint.

**Query parameters**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | integer ≥ 1 | `1` | Page number |
| `limit` | integer 1–50 | `12` | Results per page (max 50) |
| `category` | string | — | Exact enum match: `Music`, `Workshop`, `Food`, `Sports`, `Kids` |
| `city` | string (≤ 100 chars) | — | Case-insensitive **contains** regex match against the `city` field |
| `search` | string (≤ 200 chars) | — | MongoDB text index search across `title` and `description` |

#### Filter Semantics

All supplied filters are combined with **AND** logic:

| Filter | Matching rule | Notes |
|---|---|---|
| `category` | Exact case-sensitive enum match | Invalid values return `400 VALIDATION_ERROR` |
| `city` | Case-insensitive substring (`/city/i`) | Special regex characters are escaped before use; input is capped at 100 chars |
| `search` | MongoDB `$text` query on `title` + `description` | Word-boundary matching via the text index (no partial-word/substring matching) |

#### Sort order

Results are **always sorted by `date` ascending** (nearest upcoming event first), even when `search` is provided. Text relevance score is never used as a sort key.

#### Example combined query

```
GET /api/events?category=Music&city=Coimbatore&search=jazz&page=1&limit=6
```

All three filters apply simultaneously (AND logic): active upcoming Music events in Coimbatore whose title or description contains the word "jazz".

**Response 200**

```json
{
  "success": true,
  "data": [
    {
      "id": "64a1b2c3d4e5f6a7b8c9d0e1",
      "title": "Coimbatore Jazz Evening",
      "description": "A relaxed evening of live jazz...",
      "category": "Music",
      "city": "Coimbatore",
      "date": "2026-11-15T12:30:00.000Z",
      "price": 299,
      "imageUrl": "https://images.unsplash.com/...",
      "isActive": true,
      "createdAt": "2026-10-01T10:00:00.000Z",
      "updatedAt": "2026-10-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

An empty result set (no matching events) returns HTTP 200 with `data: []` and correct pagination metadata.

**Errors**: `400 VALIDATION_ERROR` (invalid `category`, `page` out of range, `limit` out of range, `city` or `search` too long)

---

### `GET /api/events/:id`

Returns the full detail of a single **active, upcoming** event.

Inactive events and past events return `404 NOT_FOUND` — identical to a non-existent event. This prevents callers from probing for hidden or expired events.

**Path parameter**: `id` — 24-character hex MongoDB ObjectId.

**Response 200**

```json
{
  "success": true,
  "data": {
    "id": "64a1b2c3d4e5f6a7b8c9d0e1",
    "title": "Coimbatore Jazz Evening",
    "description": "A relaxed evening of live jazz...",
    "category": "Music",
    "city": "Coimbatore",
    "date": "2026-11-15T12:30:00.000Z",
    "price": 299,
    "imageUrl": "https://images.unsplash.com/...",
    "isActive": true,
    "createdAt": "2026-10-01T10:00:00.000Z",
    "updatedAt": "2026-10-01T10:00:00.000Z"
  }
}
```

**Errors**: `404 NOT_FOUND` (missing, inactive, past, or malformed ID)

---

## Event Endpoints (Admin)

> **[Implemented — Phase 4]** All admin event endpoints are live. See `src/app/api/admin/events/`.
>
> **Base path for admin event endpoints**: `/api/admin/events` (not `/api/events`).

### `POST /api/admin/events`

🛡️ Creates a new event. Requires admin JWT and same-origin CSRF check.

**Request body**

```json
{
  "title": "Summer Jazz Night",
  "description": "An evening of live jazz in the park.",
  "category": "Music",
  "city": "Coimbatore",
  "date": "2026-11-15T12:30:00.000Z",
  "price": 299,
  "imageUrl": "https://example.com/images/jazz.jpg",
  "isActive": true
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| `title` | string | ✅ | 3–120 chars (trimmed) |
| `description` | string | ✅ | 1–2000 chars (trimmed) |
| `category` | string | ✅ | One of: `Music`, `Workshop`, `Food`, `Sports`, `Kids` |
| `city` | string | ✅ | 1–100 chars (trimmed) |
| `date` | ISO date string | ✅ | Valid ISO 8601 date string |
| `price` | number | ✅ | ≥ 0 (INR; 0 = free) |
| `imageUrl` | string | ✅ | Valid HTTP or HTTPS URL |
| `isActive` | boolean | ❌ | Defaults to `true` |

Client-supplied `_id`, `createdBy`, or any unknown field is rejected (`.strict()` schema).

**Response 201**

```json
{
  "success": true,
  "message": "Event created.",
  "data": {
    "id": "64a1b2c3d4e5f6a7b8c9d0e1",
    "title": "Summer Jazz Night",
    "category": "Music",
    "city": "Coimbatore",
    "date": "2026-11-15T12:30:00.000Z",
    "price": 299,
    "imageUrl": "https://example.com/images/jazz.jpg",
    "isActive": true,
    "createdAt": "2026-10-13T10:00:00.000Z",
    "updatedAt": "2026-10-13T10:00:00.000Z"
  }
}
```

**Errors**: `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 FORBIDDEN`

---

### `PATCH /api/admin/events/:id`

🛡️ Updates one or more fields of an existing event (partial update).

Only the following fields may be updated: `title`, `description`, `category`, `city`, `date`, `price`, `imageUrl`, `isActive`. Unknown fields are rejected with `400`.

**Request body**: any subset of the fields above.

**Response 200**

```json
{
  "success": true,
  "message": "Event updated.",
  "data": { "id": "...", "title": "...", /* full event object */ }
}
```

**Errors**: `400 VALIDATION_ERROR`, `401`, `403`, `404 NOT_FOUND`

---

### `PATCH /api/admin/events/:id/status`

🛡️ Activates or deactivates an event. Events are **never deleted** — deactivation hides them from public APIs.

**Request body**

```json
{ "isActive": false }
```

The `isActive` field is **required** and must be a boolean. Strings (`"false"`), numbers, and null are rejected.

**Response 200**

```json
{
  "success": true,
  "message": "Event deactivated.",
  "data": { "id": "...", "isActive": false }
}
```

**Errors**: `400`, `401`, `403`, `404`

---

### `GET /api/admin/events`

🛡️ Returns all events (active and inactive) for the admin dashboard.

> **[Planned — Phase 4]** This listing endpoint is not yet implemented. Admin event creation, update, and status change are implemented.

---

### `DELETE /api/events/:id`

> **Not implemented.** The assignment requires deactivation (soft delete) instead of permanent deletion. Use `PATCH /api/admin/events/:id/status` with `{ "isActive": false }` instead.

---

## User — Favourite Categories

### `GET /api/user/favourites`

🔒 Returns the authenticated user's saved favourite categories.

**Response 200**

```json
{
  "data": {
    "favouriteCategories": ["Music", "Food"]
  }
}
```

---

### `PUT /api/user/favourites`

🔒 Replaces the user's entire favourite category list.

**Request body**

```json
{
  "favouriteCategories": ["Music", "Kids"]
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| `favouriteCategories` | string[] | ✅ | Each item must be one of the five valid categories; empty array is allowed |

**Response 200**

```json
{
  "message": "Favourites updated.",
  "data": {
    "favouriteCategories": ["Music", "Kids"]
  }
}
```

**Errors**: `400 VALIDATION_ERROR`, `401`

---

## User — My Feed

### `GET /api/user/feed`

🔒 Returns a paginated list of active events filtered to the user's favourite categories. If the user has no favourite categories saved, all active events are returned.

Supports the same `page`, `limit`, `city`, `search`, and `sort` parameters as `GET /api/events`. The `category` parameter is ignored (categories come from the user's profile).

**Response 200**: same envelope as `GET /api/events`.

---

## User — Reminders

### `GET /api/user/reminders`

🔒 Returns all events for which the authenticated user has saved a reminder.

**Response 200**

```json
{
  "data": [
    {
      "reminderId": "64a1...",
      "event": { /* full event object */ },
      "savedAt": "2026-10-10T14:30:00.000Z"
    }
  ]
}
```

---

### `POST /api/user/reminders`

🔒 Saves a reminder for an event.

**Request body**

```json
{ "eventId": "64a1b2c3d4e5f6a7b8c9d0e1" }
```

**Response 201**

```json
{
  "message": "Reminder saved.",
  "data": {
    "reminderId": "64a1...",
    "eventId": "64a1b2c3d4e5f6a7b8c9d0e1"
  }
}
```

**Errors**: `400 VALIDATION_ERROR`, `401`, `404 NOT_FOUND` (event not found), `409 CONFLICT` (already saved)

---

### `DELETE /api/user/reminders/:eventId`

🔒 Removes a reminder for the specified event.

**Path parameter**: `eventId` — ObjectId of the event.

**Response 200**

```json
{ "message": "Reminder removed." }
```

**Errors**: `401`, `404 NOT_FOUND` (reminder not found)

---

## User — Card Design

### `GET /api/user/card-design`

🔒 Returns the authenticated user's saved card design. If no design has been saved, returns the default values.

**Response 200**

```json
{
  "data": {
    "theme": "pastel-cloud",
    "stickers": ["🎵", "🌟"],
    "fontStyle": "rounded"
  }
}
```

---

### `PUT /api/user/card-design`

🔒 Saves (or replaces) the user's card design. Uses upsert internally.

**Request body**

```json
{
  "theme": "sunset-peach",
  "stickers": ["🎉", "🏆"],
  "fontStyle": "serif"
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| `theme` | string | ✅ | One of: `pastel-cloud`, `sunset-peach`, `mint-fresh`, `sky-blue`, `lilac-dream` |
| `stickers` | string[] | ❌ | Max 3 items |
| `fontStyle` | string | ❌ | One of: `rounded`, `serif`, `mono` |

**Response 200**

```json
{
  "message": "Card design saved.",
  "data": {
    "theme": "sunset-peach",
    "stickers": ["🎉", "🏆"],
    "fontStyle": "serif"
  }
}
```

**Errors**: `400 VALIDATION_ERROR` (too many stickers, invalid theme), `401`
