# LOCATION Project Reference

## Purpose

LOCATION recommends Korean places based on the user's current location and selected category, then shows them on a Leaflet/OpenStreetMap map.

## Repository Shape

- Root package: `location-monorepo`
- Workspaces: `packages/*`
- Frontend: `packages/frontend`
- Backend: `packages/backend`
- Deployment guide: `DEPLOYMENT.md`

## Root Commands

- `yarn dev` or `yarn dev:frontend`: start the frontend.
- `yarn dev:backend`: start the backend.
- `yarn dev:all`: start frontend and backend together.
- `yarn build` or `yarn build:frontend`: build the frontend.
- `yarn build:backend`: build the backend.
- `yarn lint`: run frontend linting.

## Runtime Configuration

Frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Backend:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_PLACES_API_KEY=your_google_places_key_here
PORT=3001
NODE_ENV=development
```

`GOOGLE_PLACES_API_KEY` is optional. The backend should still work in Gemini-only mode when it is missing.

## API Contracts

`GET /health`

- Return backend health.

`POST /api/recommend`

- Accept category, keyword, latitude, and longitude.
- Return a `places` array and a source indicator.
- Prefer Google Places candidates when `GOOGLE_PLACES_API_KEY` is configured, then use Gemini to rank/explain them.

`GET /api/places/:placeId`

- Fetch Google Place Details for a selected place.
- Requires `GOOGLE_PLACES_API_KEY`.

## Deployment

- Frontend: Vercel with Root Directory `packages/frontend`.
- Backend: Railway, Render, Fly.io, or Docker.
- Frontend deployment needs `NEXT_PUBLIC_API_URL` set to the deployed backend URL.
- Backend deployment needs `GEMINI_API_KEY`; `GOOGLE_PLACES_API_KEY` is optional.
- Confirm `/health` and `POST /api/recommend` after deployment.
