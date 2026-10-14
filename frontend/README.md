# Frontend (Next.js + TypeScript)

App Router UI for the Meme'd payout tracker: login/signup, a brand dashboard (create campaigns, see budget spent vs remaining) and a creator dashboard (browse live campaigns, submit posts, see earnings).

## Run locally

```bash
cp .env.example .env.local      # point NEXT_PUBLIC_API_URL at the backend (must end in /api)
npm install
npm run dev                     # http://localhost:3000
```

The backend must be running and its `CORS_ORIGIN` must include the frontend's origin.

## Structure

```
src/
  app/            routes: /login, /signup, /brand, /creator
  components/     presentational + form components
  lib/api.ts      typed fetch wrapper (attaches the JWT, normalises errors)
  lib/auth.tsx    AuthProvider, useRequireRole (role-based redirects)
  lib/types.ts    DTO types mirroring the API
```

## Notes

- The JWT is kept in `localStorage` (simple, but readable by any script on the page; an httpOnly cookie would be the hardened option).
- "Update views" on the creator page is a demo control that calls the unauthenticated `PATCH /api/submissions/:id/views`, which simulates the platform reporting view counts.
