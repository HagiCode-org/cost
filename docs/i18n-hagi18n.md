# Cost i18n Maintenance

This guide is for Cost maintainers who need to update translations, regenerate runtime resources, or verify the hagi18n workflow.

## What lives where

Cost uses a source/runtime split:

- Source of truth: `src/i18n/locales/<locale>/translation.yml`
- Generated runtime artifacts: `src/i18n/generated-locales/<locale>/translation.json`
- Runtime config and locale metadata: `src/i18n/config.ts`
- Generator script: `scripts/generate-i18n-resources.mjs`
- hagi18n project config: `hagi18n.yaml`

Editable translations live in YAML. Generated JSON is runtime input for Vite and `i18next`; it is not the place to make manual translation edits.

## Locale policy

Cost aligns with the Desktop locale set:

- `en-US`
- `zh-CN`
- `zh-Hant`
- `ja-JP`
- `ko-KR`
- `de-DE`
- `fr-FR`
- `es-ES`
- `pt-BR`
- `ru-RU`

Two defaults matter, and they are intentionally different:

- hagi18n base locale: `en-US`
- runtime fallback / default display language: `zh-CN`

That means key parity is checked against `en-US`, while the site still opens in `zh-CN` when no explicit supported language is resolved from the URL, stored preference, or browser language.

## Standard workflow

1. Edit the YAML source files under `src/i18n/locales/<locale>/`.
2. Regenerate runtime JSON with `npm run i18n:generate`.
3. Validate hagi18n health and stale artifacts with `npm run i18n:check`.
4. Run `npm run test`.
5. Run `npm run build`.

If you only changed runtime code and want the usual local setup, `npm run dev`, `npm run test`, and `npm run build` already call `prepare:i18n` first.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run i18n:audit` | Check locale parity from the hagi18n source tree |
| `npm run i18n:report` | Print hagi18n findings in report form |
| `npm run i18n:doctor` | Scan for legacy or problematic i18n usage |
| `npm run i18n:sync` | Preview key synchronization changes |
| `npm run i18n:sync:write` | Apply synchronization changes |
| `npm run i18n:prune` | Preview removal of obsolete keys |
| `npm run i18n:prune:write` | Apply pruning changes |
| `npm run i18n:generate` | Generate `src/i18n/generated-locales/**` from YAML |
| `npm run prepare:i18n` | Alias used before dev, test, and build flows |
| `npm run i18n:check` | Run `doctor` plus generated-resource stale checks |

## Generated artifact policy

Cost keeps YAML source files in Git and treats `src/i18n/generated-locales/**` as disposable runtime output.

- Do regenerate the JSON when YAML changes.
- Do let `npm run dev`, `npm run test`, and `npm run build` regenerate it through `prepare:i18n`.
- Do not hand-edit generated JSON.
- Do not commit generated JSON.

## Runtime behavior to keep in mind

- The runtime loads generated JSON through `import.meta.glob`.
- Supported locale metadata and namespace metadata live in `src/i18n/config.ts`.
- URL `?lang=` has the highest priority.
- Stored language preference is next.
- Browser language comes after that.
- `zh-CN` is the final fallback.

When a language changes, Cost updates:

- `i18next` language
- persisted language preference
- the `lang` query parameter
- document metadata
- JSON-LD schema
- share URLs built from the current page state

## Common mistakes

- Editing `src/i18n/generated-locales/**` instead of YAML source files
- Adding a key to one locale without adding it to every supported locale
- Forgetting to rerun `npm run i18n:generate`
- Changing locale files without rerunning `npm run i18n:check`
- Assuming `en-US` as hagi18n base locale also means the site should default to English at runtime
