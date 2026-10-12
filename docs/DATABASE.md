# Database Design — Community Events Board

> **Status**: Phase 2 complete. All four Mongoose models are implemented in `src/models/`. The seed script (`scripts/seed-events.ts`) has been executed against MongoDB Atlas and verified. See the [Seed Data](#seed-data) section below.

---

## Table of Contents

1. [Overview](#overview)
2. [Collections Summary](#collections-summary)
3. [Collection: events](#collection-events)
4. [Collection: users](#collection-users)
5. [Collection: reminders](#collection-reminders)
6. [Collection: carddesigns](#collection-carddesigns)
7. [Relationships](#relationships)
8. [Recommended Indexes](#recommended-indexes)
9. [Schema Design Trade-offs](#schema-design-trade-offs)

---

## Overview

The application uses **MongoDB Atlas** accessed through **Mongoose**. All collections live in a single database (e.g. `community-events`). The schema design favours reads over writes because the public event listing is the most frequently accessed operation.

---

## Collections Summary

| Collection | Documents represent |
|---|---|
| `events` | Community events created by the administrator |
| `users` | Registered users and the single admin account |
| `reminders` | A user's saved reminder for a specific event |
| `carddesigns` | A user's saved card appearance customisation |

---

## Collection: events

### Purpose

Stores every community event. Events can be active (visible to the public) or inactive (hidden, accessible only to admin).

### Mongoose Schema

```ts
{
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 120,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  category: {
    type: String,
    required: true,
    enum: ['Music', 'Workshop', 'Food', 'Sports', 'Kids'],
  },
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  venue: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  date: {
    type: Date,
    required: true,
  },
  imageUrl: {
    type: String,
    trim: true,
    default: null,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: Date,   // auto via timestamps: true
  updatedAt: Date,   // auto via timestamps: true
}
```

### Field Notes

| Field | Notes |
|---|---|
| `category` | Restricted to the five defined values. Changing the enum requires a migration. |
| `isActive` | `false` hides the event from all public endpoints. Admin can toggle. |
| `date` | Stored as UTC. Display formatting is handled on the client. |
| `imageUrl` | Optional URL. No binary image storage in MongoDB; images will be externally hosted (e.g. a CDN or public folder). |
| `createdBy` | References the admin user who created the event. |

### Mongoose Options

```ts
{ timestamps: true }
```

---

## Collection: users

### Purpose

Stores both the admin account (seeded at startup) and registered visitors.

### Mongoose Schema

```ts
{
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 254,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'user'],
    default: 'user',
  },
  displayName: {
    type: String,
    trim: true,
    maxlength: 60,
    default: null,
  },
  favouriteCategories: {
    type: [String],
    enum: ['Music', 'Workshop', 'Food', 'Sports', 'Kids'],
    default: [],
  },
  createdAt: Date,
  updatedAt: Date,
}
```

### Field Notes

| Field | Notes |
|---|---|
| `email` | Unique index enforced at the DB level. Stored lowercase. |
| `passwordHash` | bcryptjs output. Never store or log the plain-text password. |
| `role` | Only `'admin'` or `'user'`. Admin is seeded; no public admin registration. |
| `favouriteCategories` | Array of category strings. Validated against the same enum as events. Used to power My Feed. Empty array = no personalisation applied. |
| `displayName` | Optional user-facing name. Not required for MVP. |

### Mongoose Options

```ts
{ timestamps: true }
```

---

## Collection: reminders

### Purpose

Stores which events a user has bookmarked as reminders. Each document represents a single user–event pair, making reminder creation and removal simple atomic operations.

### Mongoose Schema

```ts
{
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  createdAt: Date,
}
```

### Field Notes

| Field | Notes |
|---|---|
| `userId` + `eventId` | Compound unique index prevents duplicate reminders for the same user–event pair. |
| `createdAt` | Auto-set via `timestamps: true` (only `createdAt` is needed; updatedAt is not useful here). |

### Mongoose Options

```ts
{ timestamps: { createdAt: true, updatedAt: false } }
```

---

## Collection: carddesigns

### Purpose

Stores each user's saved card appearance preferences. One document per user (upserted on save).

### Proposed Card Themes

| Theme name | Description |
|---|---|
| `pastel-cloud` | Soft white with lavender shadow (default) |
| `sunset-peach` | Warm peach background with terracotta shadow |
| `mint-fresh` | Mint green with deep green shadow |
| `sky-blue` | Light blue with navy shadow |
| `lilac-dream` | Lilac with purple shadow |

### Sticker Options (sample set — finalised during UI implementation)

Stickers are emoji or small icon identifiers stored as strings. A maximum of **three** stickers may be saved per card.

Examples: `🎵`, `🌟`, `🎉`, `🏆`, `🍕`, `⚽`, `👶`, `🎨`, `🌿`

### Mongoose Schema

```ts
{
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  theme: {
    type: String,
    required: true,
    enum: ['pastel-cloud', 'sunset-peach', 'mint-fresh', 'sky-blue', 'lilac-dream'],
    default: 'pastel-cloud',
  },
  stickers: {
    type: [String],
    default: [],
    validate: {
      validator: (arr: string[]) => arr.length <= 3,
      message: 'A card design may have at most 3 stickers.',
    },
  },
  fontStyle: {
    type: String,
    enum: ['rounded', 'serif', 'mono'],
    default: 'rounded',
  },
  createdAt: Date,
  updatedAt: Date,
}
```

### Field Notes

| Field | Notes |
|---|---|
| `userId` | Unique — one design document per user. Use `findOneAndUpdate` with `upsert: true` on save. |
| `theme` | Controls background colour and shadow colour pair. |
| `stickers` | Validated to ≤ 3 items at the schema level. |
| `fontStyle` | Optional typographic preference for the card. |

### Mongoose Options

```ts
{ timestamps: true }
```

---

## Relationships

```
users ──< reminders >── events
users ──< carddesigns
users ──< events  (via createdBy)
```

All relationships are expressed as `ObjectId` references. No embedding of related documents is used at this stage, because:
- Reminders and card designs are accessed independently of the event or user document most of the time.
- Embedding reminders inside users or events would create unbounded array growth.

---

## Recommended Indexes

| Collection | Index | Type | Reason |
|---|---|---|---|
| `events` | `{ isActive: 1, date: 1 }` | Compound | Primary public listing query: active events sorted by date |
| `events` | `{ category: 1, isActive: 1, date: 1 }` | Compound | Category filter on public listing |
| `events` | `{ city: 1, isActive: 1, date: 1 }` | Compound | City filter on public listing |
| `events` | `{ title: 'text', description: 'text' }` | Text | Full-text keyword search |
| `users` | `{ email: 1 }` | Unique | Enforces uniqueness; used on login lookup |
| `reminders` | `{ userId: 1, eventId: 1 }` | Unique compound | Prevents duplicates; used for reminder toggle |
| `reminders` | `{ userId: 1 }` | Single | Fetch all reminders for a user |
| `carddesigns` | `{ userId: 1 }` | Unique | One design per user; fast lookup on login |

### Combined Filter Query

When a visitor filters by category **and** city **and** provides a keyword, the query combines all three:

```ts
const filter: QueryFilter<IEvent> = {
  isActive: true,
  date: { $gt: now },
};

if (category) filter.category = category;                    // exact enum match
if (city)     filter.city = new RegExp(escapeRegex(city), "i"); // case-insensitive contains
if (search)   filter.$text = { $search: search };           // text index word search

const events = await Event.find(filter)
  .sort({ date: 1 })          // always ascending by date
  .skip((page - 1) * limit)
  .limit(limit)
  .lean();
```

#### Sort order with text search

Results are **always sorted by `date` ascending** (nearest upcoming first). Unlike earlier documentation drafts, text relevance score (`$meta: "textScore"`) is **not** used as a sort key. MongoDB allows sorting by a regular field (e.g. `date`) when a `$text` clause is present — only sorting by `$meta: "textScore"` requires a corresponding projection. This preserves the expected chronological ordering regardless of whether a search term is active.

#### Index trade-offs

| Query path | Index used | Notes |
|---|---|---|
| No filters (active + upcoming) | `{ isActive: 1, date: 1 }` | Primary listing |
| Category filter | `{ category: 1, isActive: 1, date: 1 }` | Compound index covers category + active + date sort |
| City filter | `{ city: 1, isActive: 1, date: 1 }` | City regex can be prefix-optimised; suffix/contains regex does a collection scan regardless |
| Text search | Text index on `{ title: "text", description: "text" }` | MongoDB uses the text index to find documents; the `date` sort is applied after |
| Text + category + city | Text index for `$text`; filter applied in memory after text scan | MongoDB can only use one special index per query; category and city constraints act as post-filters on the text index result set |

**City regex note**: `city` matching uses `/input/i` (contains, case-insensitive). A city regex that starts with `^` (prefix) can use an index; a contains regex does not. At the expected data volume for a community events board the cost is acceptable. If the city list grows, normalising city to a lowercase stored value and using an exact equality check would allow the compound index to be used.

**Text search note**: The text index supports word-boundary stemming (e.g. "jazz" matches "Jazz" or "jazzy") but **not** substring partial-word matching (e.g. "jaz" does not match "jazz"). This is the standard MongoDB `$text` behaviour and is documented accurately in `docs/API.md`.

> **Verified against seed data**: index selection and query behaviour confirmed via the TypeScript build and query structure. Full `explain()` verification requires a live Atlas connection.

---

## Schema Design Trade-offs

| Decision | Alternative considered | Reason for choice |
|---|---|---|
| Reminders as a separate collection | Embed reminder IDs in User document | Separate collection avoids unbounded user document growth and allows simple atomic upsert/delete per reminder |
| Card design as a separate collection | Embed in User document | Separation keeps the User schema focused; card design is loaded only when the designer is open |
| Favourite categories stored on User | Separate favourites collection | There are only 5 categories; an array of strings on the user is efficient and avoids an extra collection for such a small dataset |
| One admin role, no multi-admin | Multiple admin accounts | Simplest model for an assignment; a real application would need RBAC |
| Text index for keyword search | External search (Algolia, Elasticsearch) | MongoDB Atlas text index is sufficient for a community events board at this scale; zero extra infrastructure |
| `imageUrl` string reference | Binary in GridFS or embedded base64 | Keeps documents small; external hosting of images is standard practice |

---

## Seed Data

### Seed Script

> **Note:** The sample-event seed script (`scripts/seed-events.ts`) has been removed. The public events listing will be empty until an administrator creates events via `POST /api/admin/events`. No existing event documents in MongoDB are affected.

For admin provisioning, use `npm run seed-admin`. See [Admin Provisioning](../README.md#admin-provisioning) for details.

### Implementation Notes

**Deduplication strategy**: each event is identified by its `title` field. The script uses `Event.updateOne({ title }, { $set: ... }, { upsert: true })` so re-running the script is safe — it updates existing documents and creates missing ones without duplicating.

**Date recalculation**: event dates are computed relative to `Date.now()` at seed execution so that upcoming/past split always makes sense regardless of when the script runs.

### Verified Distribution (executed 2026-10-12)

| Metric | Count |
|---|---|
| Total seed events | 15 |
| Active upcoming | 9 |
| Inactive upcoming | 2 |
| Past (any active state) | 4 |
| Categories covered | Music (4), Workshop (3), Food (3), Sports (3), Kids (3) — wait: see below |
| Cities covered | Coimbatore (5), Chennai (2), Bangalore (2), Mumbai (2), Hyderabad (2), Delhi (1), Pune (1) |

**Category distribution**:
- Music: 4 (Coimbatore Jazz Evening, Chennai Indie Music Fest, Chennai Classical Music Night, Pune Rock Night [Draft])
- Workshop: 3 (Bangalore Web Dev Workshop, Coimbatore UI/UX Design Sprint, Bangalore Python Bootcamp)
- Food: 3 (Mumbai Street Food Festival, Coimbatore Organic Food Fair, Mumbai Biryani Battle)
- Sports: 3 (Hyderabad 10K Community Run, Coimbatore Marathon Preview [Draft], Hyderabad Junior Football League*)
- Kids: 3 (Delhi Kids Science Carnival, Coimbatore Kids Art Camp, Hyderabad Junior Football League)

> *The Hyderabad Junior Football League is categorised as `Kids`.

**Seed execution verified**: 15 events inserted on first run, 0 duplicates on second run.

### Implemented Models

| File | Collection | Status |
|---|---|---|
| `src/models/Event.ts` | `events` | ✅ Implemented |
| `src/models/User.ts` | `users` | ✅ Implemented |
| `src/models/Reminder.ts` | `reminders` | ✅ Implemented |
| `src/models/CardDesign.ts` | `carddesigns` | ✅ Implemented |

### Implemented Indexes (actual schema)

| Collection | Index | Type | Notes |
|---|---|---|---|
| `events` | `{ isActive: 1, date: 1 }` | Compound | Primary listing query |
| `events` | `{ category: 1, isActive: 1, date: 1 }` | Compound | Category filter |
| `events` | `{ city: 1, isActive: 1, date: 1 }` | Compound | City filter |
| `events` | `{ title: "text", description: "text" }` | Text | Keyword search |
| `users` | `{ email: 1 }` | Unique | Enforced at field level + explicit index |
| `reminders` | `{ user: 1, event: 1 }` | Unique compound | Prevents duplicates; reminder toggle |
| `reminders` | `{ user: 1 }` | Single | Fetch all reminders for a user |
| `carddesigns` | `{ user: 1, event: 1 }` | Unique compound | One design per user per event |

### Schema Deviations from Original Proposal

| Field | Original DATABASE.md | Implemented | Reason |
|---|---|---|---|
| `events.venue` | Required string | Not included | Task spec does not list `venue` as a required field; excluded to keep scope clean for Phase 2 |
| `events.createdBy` | Required ObjectId ref | Not included | Admin seeding is out of scope for Phase 2; added in Phase 4 when admin auth exists |
| `users.role` | `enum ['admin','user']` | Included | Kept for completeness |
| `users.displayName` | Optional string | Not included | Optional field deferred to Phase 3 when signup is implemented |
| `carddesigns.userId` (unique per user) | Unique on userId | Compound `{user,event}` | Task spec explicitly requires one design per user per event |
| `carddesigns.fontStyle` | Included | Not included | Task spec does not list fontStyle; deferred to Phase 8 |
