# Tin Foil Times — project brief for Claude Code

COMP.7214 Client Server Web Development, Assessment 3 (40%, 100 marks).
**Due 5pm Friday 6 November 2026.** A satirical conspiracy-newspaper SPA.

---

## How to work with me

I have problems with executive memory. That changes how I need help:

- **Explain things as if I'm about 10 years old.** Use analogies. Detailed is fine, complicated is not.
- **Every piece of code gets detailed comments** saying *how* it works and *why* it works that way — not just what it does.
- **One thing at a time.** Finish a step and tell me it's done before starting the next.
- If I've drifted off-plan, say so plainly and point me back at `ASSIGNMENT-PLAN.md`.

---

## Stack

| Layer | Tech |
| --- | --- |
| Client | React 19 + Vite 8 (port 5173) |
| Server | Express 5 + Mongoose 9 (port 5000) |
| Database | MongoDB Atlas (`cluster0.erzdkpk.mongodb.net`) |

```bash
npm install
npm run seed     # fills Atlas from src/data/leaks.json — WIPES the collection first
npm run dev      # starts BOTH the API (nodemon) and the client (Vite)
npm run dev:client   # client only;  npm run server = API only
```

Credentials live in `.env` (gitignored). The marker needs them, so they go in the Word doc, not the repo.

---

## Verified state (tested 26 Oct 2026)

**Working — don't break these:**

- `GET /api/leaks` → 200 JSON, 35 leaks
- `?category=tech` filters correctly; `?sort=top` sorts by `votes.believe` descending
- Category tabs are properly async — no page reload, real SPA behaviour
- `App.jsx` uses `AbortController` to cancel stale requests. **Keep this.** It stops a slow old request overwriting a fast new one.
- Error state works: backend down → friendly message, page still renders
- `vite build` succeeds, `npm run seed` inserts 35

**Broken or missing — this is the work:**

| Gap | Marks |
| --- | --- |
| No 404 catch-all. Unknown routes return Express's HTML page, not JSON | 6 |
| `TipForm` only `console.log`s — sends zero requests. `POST /api/leaks` is 404 | ~10 |
| Routes sit in `server.js`, not `express.Router()`. No models/routes/controllers folders | ~8 |
| Only Read of CRUD. No POST/PUT/PATCH/DELETE. `votes` and `comments` unreachable | ~4 |
| `src/assets/*` and `src/public/*` referenced nowhere. `public/` is in the wrong place | 4 |
| Test evidence / Postman screenshots / Word doc | ~12 |

---

## Known traps

- **`TipForm` has no headline field**, but the schema has `headline: { required: true }`. Adding POST without adding that field will fail validation every time.
- **`leakSchema` is copy-pasted** into both `server.js` and `seed.js`. Change one, the other silently drifts. Move it to `server/models/leak.model.js`.
- **CORS is hardcoded** to `http://localhost:5173`. Loading the site as `127.0.0.1:5173` blocks every request. Tested and confirmed.
- **`seed.js` uses a path relative to the current folder** — `cd server && node seed.js` fails with ENOENT.
- **All 35 records in `leaks.json` share `_id: "ObjectId('...')"`.** `seed.js` strips it, but `mongoimport` would collide on duplicates. Delete the `_id` lines.
- **`src/public/` is the wrong folder.** Vite only serves `public/` at the project root.
- **`TIN_FOIL_TIMES.zip`** is an older copy of this project sitting in the root. Delete before submitting.

---

## Conventions

- ES modules everywhere (`"type": "module"`).
- Server files run in Node — `eslint.config.js` needs `globals.node` for `server/**/*.js`, currently throws 6 errors.
- Errors return JSON, never HTML. The React app only speaks JSON.
- Comment style: plain language, explain the *why*. Match the existing comments in `App.jsx` and `seed.js` — they're the house style.

## Don't

- Don't run `npm run seed` casually — it deletes the whole collection first.
- Don't rename or restructure `src/components/` without saying so; the Assignment 2 design doc has to match.
- Don't commit `.env`.
