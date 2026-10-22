# Auralis frontend

The Auralis React/Vite client for the authenticated chat application. The complete application setup, backend/API documentation, admin seeding, environment variables, UTC reporting, and test instructions are in the [project README](../README.md).

## Local development

```powershell
npm install
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm run dev
```

`VITE_API_URL` defaults to `http://localhost:5000/api`. The Axios client sends credentialed requests for the backend's `httpOnly` session cookie; configure the matching frontend origin in the backend's `CLIENT_URLS`.

## Verification

```powershell
npm run lint
npm run build
```
