# API Reference — Community Events Board

> **Status**: Proposed contract. No API routes have been implemented yet. This document defines the intended REST API that will be built in Phases 3–8 of the development plan. All endpoints, request shapes, and response shapes are subject to change until implemented and tested.

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

**Response 200**

```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-10-12T10:00:00.000Z"
}
```

**Response 503** (database unreachable)

```json
{
  "status": "degraded",
  "database": "disconnected",
  "timestamp": "2026-10-12T10:00:00.000Z"
}
```

---

## Auth Endpoints

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
    "displayName": "Alex",
    "role": "user"
  },
  "token": "<jwt>"
}
```

**Errors**: `400 VALIDATION_ERROR`, `401 UNAUTHORIZED` (wrong credentials)

---

### `POST /api/auth/logout`

🔒 Clears the JWT cookie.

**Response 200**

```json
{ "message": "Logged out successfully." }
```

---

## Event Endpoints (Public)

### `GET /api/events`

Returns a paginated list of **active** events. Supports filtering, sorting, and keyword search.

**Query parameters**

| Parameter | Type | Description |
|---|---|---|
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Results per page (default: 12, max: 50) |
| `category` | string | Filter by category: `Music`, `Workshop`, `Food`, `Sports`, `Kids` |
| `city` | string | Case-insensitive partial match on city name |
| `search` | string | Full-text search across title and description |
| `sort` | string | `date_asc` (default), `date_desc` |

#### Combined Filter Behaviour

Filters are additive (AND logic):
- `category` applies an exact enum match.
- `city` applies a case-insensitive regex match.
- `search` activates the MongoDB text index; when combined with other filters, `{ isActive: true }` and category/city constraints are applied alongside `$text`.
- When `search` is active, results are sorted by text relevance score instead of date. Explicit `sort` is ignored when `search` is provided.

**Response 200**

```json
{
  "data": [
    {
      "id": "64a1b2c3d4e5f6a7b8c9d0e1",
      "title": "Summer Jazz Night",
      "description": "An evening of live jazz in the park.",
      "category": "Music",
      "city": "Dublin",
      "venue": "St. Stephen's Green",
      "date": "2026-11-15T19:00:00.000Z",
      "imageUrl": "https://example.com/images/jazz.jpg",
      "isActive": true,
      "createdAt": "2026-10-01T10:00:00.000Z"
    }
  ],
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

**Errors**: `400 VALIDATION_ERROR` (invalid query params)

---

### `GET /api/events/:id`

Returns the full detail of a single **active** event.

**Path parameter**: `id` — MongoDB ObjectId of the event.

**Response 200**

```json
{
  "data": {
    "id": "64a1b2c3d4e5f6a7b8c9d0e1",
    "title": "Summer Jazz Night",
    "description": "An evening of live jazz in the park.",
    "category": "Music",
    "city": "Dublin",
    "venue": "St. Stephen's Green",
    "date": "2026-11-15T19:00:00.000Z",
    "imageUrl": "https://example.com/images/jazz.jpg",
    "isActive": true,
    "createdAt": "2026-10-01T10:00:00.000Z",
    "updatedAt": "2026-10-01T10:00:00.000Z"
  }
}
```

**Errors**: `404 NOT_FOUND`

---

## Event Endpoints (Admin)

### `POST /api/events`

🛡️ Creates a new event.

**Request body**

```json
{
  "title": "Summer Jazz Night",
  "description": "An evening of live jazz in the park.",
  "category": "Music",
  "city": "Dublin",
  "venue": "St. Stephen's Green",
  "date": "2026-11-15T19:00:00.000Z",
  "imageUrl": "https://example.com/images/jazz.jpg",
  "isActive": true
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| `title` | string | ✅ | 3–120 chars |
| `description` | string | ✅ | Max 2000 chars |
| `category` | string | ✅ | One of the five defined categories |
| `city` | string | ✅ | Max 100 chars |
| `venue` | string | ✅ | Max 200 chars |
| `date` | ISO date string | ✅ | Must be a valid date |
| `imageUrl` | string | ❌ | Valid URL or omitted |
| `isActive` | boolean | ❌ | Defaults to `true` |

**Response 201**

```json
{
  "message": "Event created.",
  "data": { /* full event object */ }
}
```

**Errors**: `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 FORBIDDEN`

---

### `PATCH /api/events/:id`

🛡️ Updates one or more fields of an existing event.

**Request body**: any subset of the fields accepted by `POST /api/events`.

**Response 200**

```json
{
  "message": "Event updated.",
  "data": { /* updated event object */ }
}
```

**Errors**: `400 VALIDATION_ERROR`, `401`, `403`, `404 NOT_FOUND`

---

### `PATCH /api/events/:id/status`

🛡️ Toggles the active/inactive status of an event.

**Request body**

```json
{ "isActive": false }
```

**Response 200**

```json
{
  "message": "Event deactivated.",
  "data": { "id": "...", "isActive": false }
}
```

**Errors**: `400`, `401`, `403`, `404`

---

### `DELETE /api/events/:id`

🛡️ Permanently deletes an event.

> Consider making this a soft delete (set `isActive: false`) instead. Permanent deletion will also orphan associated reminders. Decision pending.

**Response 200**

```json
{ "message": "Event deleted." }
```

**Errors**: `401`, `403`, `404`

---

### `GET /api/admin/events`

🛡️ Returns all events (both active and inactive) for the admin dashboard. Supports the same filter and pagination parameters as the public listing, plus:

| Parameter | Type | Description |
|---|---|---|
| `status` | string | `active`, `inactive`, or omitted for all |

**Response 200**: same pagination envelope as the public listing.

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
