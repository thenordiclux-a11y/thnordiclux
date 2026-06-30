# Nordic Lux

E-commerce site built with **Next.js 15** (App Router).

**Repository:** [github.com/hashanthawic/thenordiclux](https://github.com/hashanthawic/thenordiclux)

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |

## Project layout

- `app/` — pages, components, API routes, CMS admin
- `app/assets/` — images and hero video (served from `/assets/…` in `public` via Next)
- `public/` — static files (`/images/…`, favicon)
- `supabase/` — database migrations

Copy `.env.example` to `.env.local` and set Supabase keys for CMS and data features.
