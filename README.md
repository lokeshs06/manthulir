# Manthulir

Transition support platform helping small and marginal farmers in Tamil Nadu move from
chemical to organic/natural farming without losing income, inspired by the natural
farming philosophy of G. Nammalvar.

> Status: Full stack (backend + frontend) complete, including the optional WhatsApp
> channel. See "Build status" at the end of this file for detail on each phase,
> including assumptions made where the spec was ambiguous.

## Architecture

```
manthulir/
├── api/            Node.js 20 + Express + MongoDB (Mongoose) — main REST API
├── ml-service/     Python 3.11 + FastAPI + PyTorch — pest/disease detection inference
├── frontend/       React (Vite) — see frontend/README.md
└── docker-compose.yml
```

- **api**: business logic, auth, schemes, transition timeline, verification trail,
  produce marketplace, clusters, admin tools. Talks to `ml-service` over HTTP for
  pest detection inference only.
- **ml-service**: stateless inference service, never exposed publicly — only callable
  by the API using an internal shared key. Supports a `MOCK_MODEL=true` mode so the
  API can be built/tested before any model is trained.
- **frontend**: the actual farmer/buyer/admin-facing app. Talks only to `api`, never
  directly to `ml-service`.

## Local setup — fastest (no Docker, no manual DB setup)

```bash
node run-dev-backend.mjs   # spins up an in-memory MongoDB, seeds it, starts the API on :5000
```

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173, already pointed at :5000
```

Seeded admin login: phone `9999999999`, password `adminPass123`. Real pest
detection additionally needs the ML service running (see below) — without
it, pest photo uploads show a graceful "temporarily unavailable" message
rather than crashing.

## Local setup — with Docker

```bash
cp api/.env.example api/.env
cp ml-service/.env.example ml-service/.env
# edit both .env files (at minimum: JWT secrets, Cloudinary creds if testing uploads)

docker compose up --build
```

- API: http://localhost:5000/api
- Swagger docs: http://localhost:5000/api/docs
- ML service: http://localhost:8000 (internal; health check at `/health`)
- MongoDB: localhost:27017

Run the frontend separately (Docker Compose here only covers the two
backend services): `cd frontend && npm install && npm run dev`.

## Local setup — without Docker, step by step

Requires Node.js 20+, Python 3.11+, and a MongoDB instance (local or Atlas).

```bash
cd api
cp .env.example .env   # point MONGODB_URI at your local/Atlas cluster
npm install
npm run seed            # optional: creates admin + sample data
npm run dev
```

```bash
cd ml-service
cp .env.example .env    # MOCK_MODEL=true works without any trained weights
python -m venv venv && source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

```bash
cd frontend
cp .env.example .env    # defaults to http://localhost:5000/api
npm install
npm run dev
```

## API documentation

Every endpoint is documented via swagger-jsdoc annotations in `src/routes/*.js` and
served at `/api/docs` (Swagger UI) once the API is running. Request bodies for
create/update endpoints reference shared component schemas
(`SchemeInput`, `ProduceInput`, `ClusterInput`, `ArticleInput`, `PestRemedyInput`)
defined in `src/docs/swagger.js`, each with an example payload.

## Environment variables

See `api/.env.example` and `ml-service/.env.example` for the full list, with comments.
Key ones:

| Variable | Where | Purpose |
|---|---|---|
| `MONGODB_URI` | api | MongoDB Atlas or local connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | api | Separate secrets for access vs refresh tokens |
| `CLOUDINARY_*` | api | Image uploads (verification photos, pest photos, certificates) |
| `ML_SERVICE_URL` / `ML_SERVICE_INTERNAL_KEY` | api | How the API reaches the ML service |
| `INTERNAL_API_KEY` | ml-service | Must match `ML_SERVICE_INTERNAL_KEY` above |
| `MOCK_MODEL` | ml-service | `true` = fake deterministic predictions, no model required |
| `WHATSAPP_VERIFY_TOKEN` | api | Chosen by you; entered into the Meta App Dashboard webhook config |
| `WHATSAPP_APP_SECRET` | api | Verifies the `X-Hub-Signature-256` header on inbound webhooks |
| `WHATSAPP_ACCESS_TOKEN` / `WHATSAPP_PHONE_NUMBER_ID` | api | Used to send replies via the WhatsApp Cloud API |

## Seeding

```bash
cd api
npm run seed
```

Creates an admin account (from `SEED_ADMIN_*` env vars), sample schemes, pest
remedies, articles, farmers, a cluster, verification logs, and produce listings.

## Running tests

```bash
cd api
npm test               # Jest + Supertest + mongodb-memory-server (no real DB needed)
npm run test:coverage  # with coverage report
```

```bash
cd ml-service
pytest
```

## Training the pest/disease detection model

**A real model is trained and live** (`MOCK_MODEL=false` by default in
`.env.example`): MobileNetV3-Large, 8 tomato leaf disease classes
(PlantVillage), 98.28% test accuracy / 97.72% macro-F1. Full details —
data sources, hardware, per-class results, and what's deliberately *not*
covered yet (insect pests — IP102 was unobtainable in the training
environment) — are in `ml-service/training/EXPERIMENT_NOTES.md`.

To retrain or extend it: `ml-service/training/` — `prepare_dataset.py` →
`train.py` → `evaluate.py` → `export.py`. Datasets are **not** auto-downloaded;
place them under `ml-service/training/data/raw/` first.

1. Download the dataset(s) yourself into `data/raw/<source>/` (each keeping its
   own original per-class folder layout) — see EXPERIMENT_NOTES.md for how the
   current PlantVillage subset was pulled via `git sparse-checkout`.
2. Open `training/class_config.py` and add/edit entries with the exact
   `datasetLabel` folder name from that dataset.
3. `python prepare_dataset.py --labels-out <path>` — stratified 70/15/15 split.
   **Always pass `--labels-out` pointing somewhere other than
   `ml-service/artifacts/labels.json` for any experimental/partial-class-set
   run** — omitting it overwrites the production labels file the running
   service loads.
4. `python train.py` — two-stage MobileNetV3-Large transfer learning; checkpoints the
   best model by validation macro-F1 to `<checkpoint-dir>/best_model.pt`.
5. `python evaluate.py` — accuracy, macro-F1, per-class report, confusion matrix image,
   worst-performing classes.
6. `python export.py --num-classes <N> --model-version <version>` — exports
   a TorchScript artifact (and optionally ONNX).
7. Once satisfied, copy the exported model, its labels.json, and
   model_version.txt into `ml-service/artifacts/`, and set `MOCK_MODEL=false` /
   `MODEL_VERSION=<version>` in `ml-service/.env`, then restart the service.

## WhatsApp channel (optional)

A farmer messages the WhatsApp Business number and gets a numbered menu: scheme
matching (asked step by step: district → land size → crop), pest detection (send a
photo, reused via the same `pestDetection.service.js` used by the REST API), and
their transition timeline. All business logic is reused from the existing services —
the WhatsApp layer is purely conversational routing.

Setup:
1. Create a Meta App with the WhatsApp product, get a phone number ID and access token.
2. Set `WHATSAPP_*` env vars (see table above).
3. Register the webhook URL (`https://<your-domain>/api/whatsapp/webhook`) in the
   Meta App Dashboard with your chosen `WHATSAPP_VERIFY_TOKEN`.
4. Subscribe the app to the `messages` webhook field.

Conversation state lives in the `WhatsAppSession` collection, keyed by phone number,
with a 24-hour rolling TTL index (`updatedAt` + `expireAfterSeconds: 86400`) — an
inactive conversation resets to the main menu after a day. A WhatsApp phone number is
matched to a platform account via `User.phone`; unregistered numbers are told to
register on the app first before scheme-match/pest-detection/timeline data is shown.

## Deploying to Render (backend) + Netlify (frontend)

This is a monorepo — `api/`, `ml-service/`, and `frontend/` all live in this
one repo, deployed as three separate services (two on Render, one on
Netlify). See `frontend/README.md` for frontend-specific dev notes. This
section covers the two backend services (`api/` and `ml-service/`) on
Render.

### 1. MongoDB Atlas (required first)

Provision a free-tier Atlas cluster, create a database user, and either
whitelist Render's egress IPs or allow `0.0.0.0/0` (fine for a demo/small
project, paired with a strong generated DB password — Atlas lets you
generate one). Copy the connection string; you'll paste it into
`MONGODB_URI` below.

### 2. Cloudinary (required for image uploads)

Verification photos, produce photos, and pest-detection photos all upload
through Cloudinary. Create a free account, grab the cloud name, API key,
and API secret from its dashboard.

### 3. Deploy both backend services via the Render Blueprint

`render.yaml` at the repo root defines both services. In the Render
dashboard: **New → Blueprint**, point it at this repo. It'll ask you to
fill in every field marked `sync: false` — see the comments at the top of
`render.yaml` for which ones need to match each other
(`ML_SERVICE_INTERNAL_KEY` / `INTERNAL_API_KEY` must be identical) and
which need the other service's URL (`ML_SERVICE_URL`, only known after the
ML service's first deploy — deploy once, copy its `.onrender.com` URL from
its dashboard page, then set it on the API service and redeploy).

Without a blueprint, deploy manually as two Web Services instead:
- **API**: root dir `api`, build `npm install`, start `npm start`, health
  check path `/api/health`.
- **ML service**: root dir `ml-service`, build (CPU-only torch — see
  `render.yaml`'s comment on why this matters for the free tier's
  build/memory limits):
  `pip install --index-url https://download.pytorch.org/whl/cpu torch==2.5.1 torchvision==0.20.1 && pip install -r requirements.txt`,
  start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, health check
  path `/health`.

The ML service should ideally never be public — use Render's private
networking between services if your plan supports it, and only expose the
API publicly. If the ML service must be public (free tier typically has no
private networking), the `X-Internal-Key` check is the only thing standing
between it and the internet, so keep that key secret and non-guessable.

### 4. Seed the database

Once the API is live, run `npm run seed` once against it — either via
Render's shell (dashboard → your API service → Shell) or by running it
locally with `MONGODB_URI` pointed at the Atlas cluster. This creates the
admin account (from `SEED_ADMIN_*`) and all sample reference data (schemes,
pest remedies, articles, sample farmers).

### 5. Netlify frontend

Connect this same repo to Netlify (New site from Git). Since the frontend
lives in a subdirectory of this monorepo (not the repo root), set
**Base directory** to `frontend` in Netlify's site settings — its
`netlify.toml` then supplies the build command (`npm run build`) and
publish directory (`dist`), both relative to that base. Set the
**environment variable** `VITE_API_BASE_URL` in Netlify's site settings to
your deployed API's URL + `/api` (e.g. `https://manthulir-api.onrender.com/api`)
— this is baked in at build time, so redeploy after changing it.

### 6. Close the loop: CORS

Once you have the real Netlify URL, set `CORS_ALLOWED_ORIGINS` on the API
service to that exact origin (e.g. `https://your-site.netlify.app`,
comma-separated if you have a custom domain too) and redeploy the API —
without this, the browser will block every request from the deployed
frontend.

### Notes

- Render's free tier spins down idle services — the first request after
  inactivity can take 30-60s while it wakes up (this hits the ML service's
  PyTorch model load too). Fine for a demo, worth knowing about.
- `MOCK_MODEL=false` in `render.yaml` deploys the real trained model
  (see `ml-service/training/EXPERIMENT_NOTES.md` for its honest accuracy
  numbers and known limitations) — the same 17MB `model.torchscript.pt` is
  committed to this repo specifically so the deployed service has something
  to load (everything else under `ml-service/artifacts/*.pt` except this
  exact file, and everything under `ml-service/training/data/`, stays
  gitignored).

## Build status

- [x] Phase 1 — Foundation: project setup, config, DB connection, error handling,
      response helpers, `User` model, auth (register/login/refresh/logout/me),
      role middleware, health check, Docker setup.
- [x] Phase 2 — Profiles & Schemes: `FarmerProfile`, `BuyerProfile`, `Scheme` model,
      scheme CRUD + soft delete + verify (admin), Scheme Matcher service + `/schemes/match`
      endpoint (logged-in or anonymous), farmer profile + saved/applied scheme routes,
      seed script (admin + 6 sample schemes, all unverified with placeholder amounts),
      unit + integration tests.
- [x] Phase 3 — Transition Core: Timeline generator (milestone creation, status
      progression, scheme re-linking) + daily 02:00 IST cron job, Verification
      Trail with Cloudinary photo uploads (EXIF/GPS stripped) and peer verification
      rules, Badge service (bronze/silver/gold), certification upload, public
      farmer trust summary, unit + integration tests.
- [x] Phase 4 — ML Service: FastAPI inference service (`/health`, `/predict`)
      with a deterministic mock mode, magic-byte + size validation, internal-key
      auth; training pipeline (prepare_dataset/train/evaluate/export) targeting
      MobileNetV3-Large; PestRemedy + PestDetection models; Node integration
      (Cloudinary upload, ML client with timeout/retry, confidence-threshold
      branching, KVK fallback messaging); 10 seeded organic remedies matching
      the model's label set; pytest + Jest tests.
- [x] Phase 5 — Market & Clusters: `Produce`, `Inquiry`, `Cluster` models and
      routes; server-computed badge/certification/transition-month on produce
      (never client-supplied); cluster join/approve/reject/leave with lead-transfer
      enforcement and a 3-cluster-per-farmer cap; cluster scheme eligibility using
      real aggregated member count/land; pooled listings badged with the lowest
      member badge, kept in sync as member badges change; buyer inquiries with
      phone-number reveal gated strictly on acceptance; sample seed data (5 farmers,
      1 cluster, verification logs, produce listings); unit + integration tests.
- [x] Phase 6 — Admin & Knowledge Base: `Article` model + CRUD (admin) and
      public listing (published-only, category/tag/text-search filters, bilingual);
      admin stats (farmers by district/transition status, detections per ISO week,
      active listings, cluster count); flagged-log review (resolve clears the flag
      and recounts it toward the farmer's badge); certification review (approval is
      the *only* path that sets `transitionStatus: certified`, matching Section 7.2);
      unverified-schemes report (never verified, or stale >12 months); pest-feedback
      report (detections marked `incorrect`); 4 seeded bilingual articles (2
      philosophy, 2 practice); unit + integration tests.
- [x] Phase 7 — Polish: Swagger completion (added missing request-body schemas for
      scheme/produce/cluster/article/pest-remedy/buyer create-update endpoints, with
      reusable example-bearing component schemas); localization audit (fixed two real
      gaps — Produce listings and pest-detection remedies/messages weren't running
      through the bilingual localizer); security review (RBAC, ownership checks,
      rate limits, no PII leaks, EXIF stripping — all confirmed sound, no issues found);
      coverage check (`services/` at ~83% statement coverage, up from a real gap where
      `buyer.service.js` had no tests at all). **130/130 tests passing.**
- [x] Phase 8 — WhatsApp channel (optional): `WhatsAppSession` model with a
      24-hour rolling TTL index; Meta webhook GET verification handshake and
      POST receiver with HMAC-SHA256 `X-Hub-Signature-256` verification;
      numbered-menu conversation state machine (scheme match asked step by
      step, pest detection via a sent photo, timeline lookup) that purely
      routes to the existing `schemeMatcher`/`timeline`/`pestDetection`
      services — no business logic duplicated; unregistered phone numbers are
      told to register on the app first. Caught and fixed a real bug in the
      process: `express-mongo-sanitize` was silently stripping Meta's mandatory
      dotted query keys (`hub.mode` etc.) on the verification handshake,
      exempted that one route since it never touches the database.
      **143/143 tests passing.**
- [x] Post-phase — Real model training: replaced `MOCK_MODEL` with an actually
      trained MobileNetV3-Large model, trained on a local GPU in two rounds.
      Round 1: 8 tomato leaf disease classes (PlantVillage) — 98.28% test
      accuracy / 97.72% macro-F1. Round 2: extended to 16 classes by adding
      8 real insect pests (Mendeley Data tomato-pest dataset, CC BY 4.0) —
      **95.23% overall test accuracy, but macro-F1 is only 84.04%**: the
      insect classes (24-131 training images each, vs 373-5357 for
      diseases) drag it down, especially three caterpillar species
      (`tomato_beet_armyworm`, `tomato_tobacco_cutworm`, `tomato_fruit_borer`)
      that the model confuses with each other — a genuine fine-grained
      visual distinction, confirmed via raw confusion-matrix counts, not a
      training bug. Verified end-to-end through the live `/predict`
      endpoint, including confirming the confidence threshold correctly
      demotes a hard real case to "uncertain" instead of a false-confident
      answer. Retired the original 10 insect-pest placeholder classes for
      non-tomato crops (never had real training data — IP102 remains
      unobtainable in this environment) rather than ship a mismatched
      `modelClassLabel` set; their content is preserved, unused, in
      `pestRemedies.retired-insect-placeholders.js`. Added 15 organic-remedy
      entries (7 diseases + 8 insects) with source citations. **Known open
      risk, not yet addressed**: this is a closed 16-way classifier with no
      "none of the above" — a photo of anything outside its training
      distribution (different crop, random object) can still get a
      confidently wrong answer; a disease-only precursor of this model was
      empirically shown doing exactly that on random noise (96% confidence).
      Full details, per-class numbers, and mitigation options in
      `ml-service/training/EXPERIMENT_NOTES.md`. **143/143 Node tests, 7/7
      Python tests passing.**
- [ ] In progress — Multi-crop expansion (33 classes, 5 crops): extends the
      above with potato (2 diseases), bell pepper (1 disease), paddy/rice
      (6 insect pests), and brinjal/eggplant (4 diseases + 1 generic
      insect-damage class) — all real, licensed (CC BY 4.0) datasets, full
      provenance in `EXPERIMENT_NOTES.md`. Training was moved off the local
      GPU to a self-contained Colab notebook
      (`ml-service/training/colab/manthulir_multicrop_training.ipynb`)
      at the user's request; **not yet deployed** — production is still
      running the 16-class tomato-only model above. The 14 new remedy
      entries are staged in `pestRemedies.pending-multicrop.js` rather than
      the active seed set, specifically so `modelClassLabel` never points at
      a class the deployed model can't actually output — merge that file in
      once the Colab run's model is copied into `ml-service/artifacts/`.
