# Frontend (Next.js + TypeScript + Tailgrids)

App Router UI for the Meme'd payout tracker: login/signup, a brand dashboard (create campaigns, see budget spent vs remaining) and a creator dashboard (browse live campaigns, submit posts, see earnings, sortable posts table).

Styled with [Tailgrids](https://tailgrids.com/docs/components), an open-source React + Tailwind CSS v4 component library. Its components are copied into `src/components/tailgrids/core/` by the Tailgrids CLI, so they're ordinary source files in this repo (no runtime dependency on the library).

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
  app/                       routes: /login, /signup, /brand, /creator
  components/                app components (cards, forms, table rows, layout)
  components/tailgrids/core/ vendored Tailgrids components (Button, Card, Input, Badge, Table, Progress, Alert, ...)
  lib/api.ts                 typed fetch wrapper (attaches the JWT, normalises errors)
  lib/auth.tsx               AuthProvider, useRequireRole (role-based redirects)
  lib/milestones.ts          next/reached milestone helpers for the progress hints
  utils/cn.ts                class-name merge helper (clsx + tailwind-merge)
```

## Design system

- Light, warm "cream" theme: Tailgrids' official light tokens, retuned in `src/app/globals.css` (primary blue button, dark-outline secondary buttons, grey inputs).
- App-level layer at the bottom of `globals.css`: `.card` (dark-outlined card), `.panel` (soft table container), page background.
- Typography: Inter (loaded from Google Fonts at runtime), 15px base.
- Layout is fluid up to a 1360px content width and responsive down to phones; the page background always fills the viewport.

## Tailgrids setup (for reference)

```bash
npx @tailgrids/cli@latest init
npx @tailgrids/cli@latest add button card badge input native-select label alert progress table avatar spinner
```

## Notes

- Tailgrids' Button and Input are built on `react-aria-components`, so buttons take `onPress` (not `onClick`) and a `pending` prop.
- The theme file uses `@theme inline`, so token values are baked into utilities: change colours by editing the token values in `globals.css`, not by overriding CSS variables.
- The JWT is kept in `localStorage` (simple, but readable by any script on the page; an httpOnly cookie would be the hardened option).
- "Update views" on the creator page is a demo control that calls the unauthenticated `PATCH /api/submissions/:id/views`, which simulates the platform reporting view counts.
- The vendored Tailgrids folder is excluded from ESLint (generated code).
