# Cost - Agent Configuration

## Root Configuration

Inherits all behavior from `/AGENTS.md` at the monorepo root. Local rules extend or override the root file for this repository.

## Project Context

This repository is the AI application cost evaluation site at [cost.hagicode.com](https://cost.hagicode.com), built with Vite and i18n-aware tooling.

## Working Directory

Run commands from `repos/cost/`.

## Key Commands

```bash
npm install
npm run dev
npm run build
npm test
npm run i18n:check
```

## Key Paths

- `src/`: application source
- `locales/`: i18n locale files (managed via `hagi18n`)
- `hagi18n.yaml`: i18n configuration

## Agent Guidelines

- Keep UI changes aligned with the existing Vite + i18n patterns.
- Route all user-facing copy through the `hagi18n` i18n flow.
- Use `npm run i18n:check` to validate locale consistency before committing.
- Treat this as a static site; avoid adding server-side logic.

## References

- `README.md`
- `hagi18n.yaml`
