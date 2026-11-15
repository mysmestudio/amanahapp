# Granary

Family wealth planning: from surviving to building. A four-minute family check, a plan made together, a self-paced course ("From Surviving to Building") and practical tools. Launched at the MSMMI Marriage Workshop 2026.

## Stack
- React + Vite + TypeScript, React Router
- Supabase (anonymous check totals, reminder sign-ups)
- Cloudflare Pages hosting (`public/_redirects` handles app routes)

## Run
```
npm install
npm run dev
npm run build   # outputs dist/
```

## Routes
- `/` landing page · `/how-it-works` guide
- `/app` home and result · `/app/check` · `/app/plan` · `/app/learn` · `/app/tools`
- `/present` presenter slides (arrow keys, N for notes) · `/room` live room board

## Cloudflare Pages settings
Framework preset: Vite · Build command: `npm run build` · Output directory: `dist`
