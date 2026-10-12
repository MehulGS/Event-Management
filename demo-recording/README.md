# Demo Recording

This folder is reserved for the final assignment demonstration video.

---

## Purpose

Store the 3–4 minute screen recording that walks an evaluator through the completed Community Events Board application.

## Suggested filename

```
community-events-board-demo.mp4
```

## Recording status

> **The demonstration video has not been recorded or added yet.**
> This folder is a placeholder. Once recorded, place the `.mp4` file here (or follow the submission method described below if the file is too large for Git).

---

## Recommended demonstration sequence

1. **Landing page and public event listing** — show the home page with featured events, then navigate to `/events` and demonstrate the category, city, and keyword filters together with URL-synced pagination.
2. **Combined filters and pagination** — apply two or more filters simultaneously and step through multiple pages to show results updating correctly.
3. **Event details and Card Designer** — open an event detail page, walk through the slug URL format, then use the Card Designer: change the background theme, add stickers, observe the live preview update, and save the design.
4. **Login and user features** — log in with the evaluator account, set favourite categories at `/favorites`, visit `/feed` to see the personalised listing, and add a reminder at `/reminders`.
5. **Admin dashboard** — navigate to `/admin`, show the paginated event table (10 per page), create a new event, edit it, toggle its active status, and demonstrate that past-date validation is enforced on both client and server.
6. **Brief technical walkthrough** — explain the database schema (four collections: `events`, `users`, `reminders`, `carddesigns`), the compound indexes used, how passwords are hashed with `bcryptjs` (saltRounds = 12), and how admin authorisation works (role re-read from the database on every admin request, never trusted from the JWT claim alone).

---

## Submission note

If the `.mp4` file exceeds GitHub's 100 MB file size limit, do **not** force it into the repository. Instead, upload it to a file-sharing service (Google Drive, Dropbox, WeTransfer, or similar) and include the shareable link in your assignment submission form alongside the repository URL.

---

## Sensitive information reminder

Do **not** include any of the following in the recording:

- Admin passwords or any account passwords
- The `MONGODB_URI` connection string or any other secret environment variable
- Private account information, API keys, or tokens
- Any content that is not directly relevant to demonstrating the assignment features
