# Manthulir — Frontend

React (Vite) frontend for Manthulir, a transition-support platform
helping small and marginal farmers in Tamil Nadu move from chemical to
organic/natural farming. Talks to the
[`manthulir`](../manthulir) API — see that
repo for the backend/ML service.

Stack: React 18, React Router, TanStack Query, React Hook Form + Zod,
Tailwind CSS, i18next (Tamil/English), Vite PWA plugin.

## Local setup

Requires the backend running (see the backend repo's README — the fastest
path is its `node run-dev-backend.mjs` helper, which spins up an in-memory
MongoDB, seeds it, and starts the API on `:5000` with CORS already open to
this app's dev server).

```bash
npm install
cp .env.example .env   # defaults to http://localhost:5000/api, fine for local dev
npm run dev             # http://localhost:5173
```

Seeded admin login (from the backend's seed data): phone `9999999999`,
password `adminPass123`.

## Environment variables

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API, including `/api`. Baked in at build time (Vite env vars are compile-time, not runtime) — set it in your hosting platform's build environment, then rebuild/redeploy to pick up a change. |

## Testing

```bash
npm test   # Vitest + Testing Library, jsdom environment
```

## Building for production

```bash
npm run build     # outputs to dist/
npm run preview   # serve the production build locally on :4173, to sanity-check before deploying
```

## Deploying to Netlify

`netlify.toml` at the repo root already sets the build command (`npm run
build`), publish directory (`dist`), and the SPA fallback redirect this app
needs (client-side routing via `react-router-dom`'s `BrowserRouter` means
every route must fall back to `index.html`, or deep links/refreshes 404 on
a static host).

1. Netlify → **Add new site → Import an existing project**, point it at
   this repo.
2. It should auto-detect the build settings from `netlify.toml`. If not,
   set them manually: build command `npm run build`, publish directory
   `dist`.
3. Site settings → **Environment variables** → add `VITE_API_BASE_URL` set
   to your deployed backend's URL + `/api`
   (e.g. `https://manthulir-api.onrender.com/api`).
4. Deploy. If you change `VITE_API_BASE_URL` later, trigger a new deploy —
   it won't take effect until the app is rebuilt.
5. Once you have the final Netlify URL, set it as `CORS_ALLOWED_ORIGINS` on
   the backend (see backend README) and redeploy the backend — otherwise
   the browser blocks every API request from the deployed frontend.

## Known gaps

- `vite.config.js`'s PWA manifest references icon files
  (`apple-touch-icon.png`, `masked-icon.svg`, `pwa-192x192.png`,
  `pwa-512x512.png`) that don't exist in `public/` yet — the build still
  succeeds, but "Add to Home Screen" will show a broken/missing icon until
  real icon assets are added.
- The main JS bundle is ~746KB (203KB gzipped) with no route-based code
  splitting yet — works fine, but `React.lazy()` per route would improve
  initial load time.
