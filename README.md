# Auralis frontend

The Auralis React/Vite client for the authenticated chat application. The complete application setup, backend/API documentation, admin seeding, environment variables, UTC reporting, and test instructions are in the [project README](../README.md).

## Local development

```powershell
npm install
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm run dev
```

`VITE_API_URL` defaults to `http://localhost:5000/api`. The Axios client sends credentialed requests for the backend's `httpOnly` session cookie; configure the matching frontend origin in the backend's `CLIENT_URLS`.

For production, set `VITE_API_URL` in the frontend hosting provider's build
environment to the deployed backend's `/api` URL. Do not use `localhost` in a
production build. The backend must allow the exact deployed frontend origin in
`CLIENT_URLS` and, when the frontend and API are on different sites, use
`COOKIE_SAME_SITE=none` over HTTPS.

The signed-in user's profile is held only in the in-memory Redux store. It is
not persisted to `localStorage` or `sessionStorage`, so a page reload restores
the session by requesting `/auth/me` with the backend's `httpOnly` cookie.

## Verification

```powershell
npm run lint
npm run build
```
