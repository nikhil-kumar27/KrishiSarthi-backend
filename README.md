# SIH Farming Recommendation API

Production-only backend for the frontend crop recommendation flow.

The application is a single deployable Node.js service. Member 1&2 crop recommendations and Member 3 market scoring are executed as in-process modules; no localhost upstream services, mock clients, test files, or development `.env` file are required.

## Run locally

```bash
npm ci
cp .env.example .env
npm start
```

The API listens on `PORT` (default `4004`).

Health check:

`GET /health`

Recommendation endpoint:

`POST /api/recommend`

Example request:

```json
{
  "farmSize": 2.5,
  "unit": "acre",
  "state": "Punjab",
  "district": "Ludhiana",
  "village": "ABC Village",
  "budget": 200000,
  "season": "Kharif"
}
```

Supported units: `acre`, `hectare`, `bigha`.

Supported seasons: `Kharif`, `Rabi`, `Zaid`.

## Deployment

Use a Node.js host such as Render, Railway, Fly.io, or another service that supports a persistent Node process.

Build/install command:

`npm ci`

Start command:

`npm start`

Environment variables:

- `PORT` — supplied by most hosting platforms; the application defaults to `4004`.
- `NODE_ENV` — set to `production`.

The frontend should call:

`https://<your-backend-domain>/api/recommend`

and use:

`https://<your-backend-domain>/health`

for a health check.

## Important data note

The recommendation, market, and cultivation-cost datasets are bundled in `src/data/` and are required at runtime. Do not remove them from the deployment artifact.

Market scores are currently available only for the states represented in the bundled market dataset: Punjab, Bihar, and Uttar Pradesh. A crop without market data is returned in `skippedCrops` rather than being assigned an artificial market score of zero.
"# KrishiSarthi-backend" 
