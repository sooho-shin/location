---
name: location-project
description: "Use for work in the LOCATION monorepo: Next.js frontend, Express backend, Yarn workspace commands, environment variables, place recommendation APIs, Leaflet map behavior, Gemini/Google Places integration, and deployment changes. Trigger when editing files under packages/frontend, packages/backend, README.md, DEPLOYMENT.md, package.json, or repo-specific CI/deploy/configuration."
---

# Location Project

## Core Workflow

- Treat this repository as a Yarn workspaces monorepo with `packages/frontend` and `packages/backend`.
- Read `README.md`, `package.json`, and the relevant package files before changing behavior.
- Keep frontend, backend, and deployment changes separated unless the user asks for an end-to-end change.
- Prefer existing project dependencies and local patterns before adding packages.
- Do not commit `.env`, `.env.local`, build outputs, `.next`, `dist`, or `node_modules`.

## Commands

- Use `yarn install` for dependencies.
- Use `yarn dev:frontend` or `yarn dev` for the frontend.
- Use `yarn dev:backend` for the backend.
- Use `yarn dev:all` only when both servers are needed.
- Use `yarn build:frontend`, `yarn build:backend`, or `yarn build` based on the touched package.
- Use `yarn lint` for frontend lint checks when frontend code changes.

## Architecture

- Frontend: Next.js 16, React 19, TypeScript, styled-components, Leaflet, react-leaflet.
- Backend: Express, TypeScript, Gemini API, optional Google Places API.
- Data flow: frontend sends geolocation/category data to backend; backend returns recommended places; frontend renders markers and details on OpenStreetMap/Leaflet.
- Frontend public API URL comes from `NEXT_PUBLIC_API_URL`.
- Backend requires `GEMINI_API_KEY`; `GOOGLE_PLACES_API_KEY` is optional.

## When Changing Frontend

- Check `packages/frontend/src/app`, `packages/frontend/src/components`, and `packages/frontend/src/lib` for existing patterns.
- Keep browser-only map code compatible with Next.js rendering constraints.
- Keep displayed place data aligned with backend response fields.
- Verify text and layout in Korean UI contexts when changing user-facing copy.

## When Changing Backend

- Check `packages/backend/src/server.ts` first for API behavior.
- Preserve `/health`, `POST /api/recommend`, and `GET /api/places/:placeId` contracts unless the user explicitly requests an API change.
- Handle missing `GOOGLE_PLACES_API_KEY` as a valid Gemini-only mode.
- Avoid logging secrets or raw API keys.

## References

- Read `references/project.md` when you need a compact project map, API contracts, or deployment reminders.
