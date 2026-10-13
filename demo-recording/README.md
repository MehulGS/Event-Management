# Demo Recording

This folder stores the final assignment demonstration videos — one desktop recording and one mobile recording.

---

## Recording status

> **The demonstration videos have not been recorded or added yet.**
> This folder is a placeholder. Once recorded, place both `.mp4` files here (or follow the submission method described below if the files are too large for Git).

---

## Expected files

| File | Viewport | Description |
|---|---|---|
| `community-events-board-demo-desktop.mp4` | Desktop (1280 px or wider) | Full walkthrough of all features on a desktop browser |
| `community-events-board-demo-mobile.mp4` | Mobile (375–430 px, e.g. iPhone) | Same walkthrough demonstrating the responsive mobile layout |

---

## Recommended demonstration sequence

Follow the same sequence for both recordings; the mobile recording should focus on layout differences (hamburger menu, stacked cards, touch-friendly controls).

1. **Landing page and public event listing** — show the home page with featured events, then navigate to `/events` and demonstrate the category, city, and keyword filters together with URL-synced pagination.
2. **Combined filters and pagination** — apply two or more filters simultaneously and step through multiple pages to show results updating correctly.
3. **Event details and Card Designer** — open an event detail page, walk through the slug URL format, then use the Card Designer: change the background theme, add stickers, observe the live preview update, and save the design.
4. **Login and user features** — log in with the evaluator account, set favourite categories at `/favorites`, visit `/feed` to see the personalised listing, and add a reminder at `/reminders`.
5. **Admin dashboard** — navigate to `/admin`, show the paginated event table (10 per page), create a new event, edit it, toggle its active status, and demonstrate that past-date validation is enforced on both client and server.
6. **Brief technical walkthrough** — explain the database schema (four collections: `events`, `users`, `reminders`, `carddesigns`), the compound indexes used, how passwords are hashed with `bcryptjs` (saltRounds = 12), and how admin authorisation works (role re-read from the database on every admin request, never trusted from the JWT claim alone).

---

## How to record

**Desktop** — use any screen recorder (OBS Studio, Loom, macOS built-in `⌘ Shift 5`, Windows Game Bar `Win + G`). Record at 1280 × 800 or higher.

**Mobile** — use browser DevTools device emulation (Chrome DevTools → Toggle device toolbar → iPhone 14 or similar, 390 × 844) or record on a real device. Keep the viewport clearly visible.

Target duration: **3–4 minutes per recording**.

---

## Submission note

If either `.mp4` file exceeds GitHub's 100 MB file size limit, do **not** force it into the repository. Instead:

1. Upload the file(s) to a file-sharing service (Google Drive, Dropbox, WeTransfer, or similar).
2. Make the share link publicly accessible (or accessible to the evaluator).
3. Include the shareable link(s) in your assignment submission form alongside the repository URL.

---

## Sensitive information reminder

Do **not** include any of the following in either recording:

- Admin passwords or any account passwords
- The `MONGODB_URI` connection string or any other secret environment variable
- Private account information, API keys, or tokens
- Any content that is not directly relevant to demonstrating the assignment features
