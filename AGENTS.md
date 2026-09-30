# Cost - Agent Configuration

## Root Configuration

Inherits all behavior from `/AGENTS.md` at the monorepo root. Local rules extend or override the root file for this repository.

## Project Context

This repository is the AI application cost evaluation site at [cost.hagicode.com](https://cost.hagicode.com), built as a static Astro site with one SSR-capable React island and generated i18n resources.

## Working Directory

Run commands from `repos/cost/`.

## Key Commands

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm test
npm run i18n:check
npm run build
npm run preview
```

## Key Paths

- `src/`: application source
- `src/pages/`: Astro file-based routes
- `src/layouts/`: Astro document layout and static metadata
- `src/components/IncomeTokenExperienceIsland.tsx`: server-rendered and hydrated calculator experience
- `src/i18n/locales/`: i18n locale files (managed via `hagi18n`)
- `hagi18n.yaml`: i18n configuration
- `dist/`: static publication output

## Agent Guidelines

- Astro 7 and Vite 8 require Node.js 22.12 or later.
- Astro owns routes, document structure, build-time metadata, and static output. Keep browser interactions in the React island.
- Keep the React island's initial render deterministic: default locale, light theme, and default form values. Apply URL, stored, browser language, theme, and region preferences after hydration.
- Keep locale-sensitive content together when extracting a section would break client-side language switching or duplicate copy.
- Route all user-facing copy through the `hagi18n` i18n flow.
- Use `npm run i18n:check` to validate locale consistency before committing.
- Treat this as a static site; do not add an application server. Keep `VITE_BASE_PATH`, `VITE_SITE_URL`, `VITE_APP_VERSION`, and `dist/` compatible with publication.

## References

- `README.md`
- `hagi18n.yaml`
