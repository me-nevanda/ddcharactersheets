---
name: did-import-aliases
description: Enforce import alias usage in the DID frontend. Use when creating or refactoring TypeScript files in this repository so imports use the aliases defined in `tsconfig.json` and `vite.config.ts` (`@pages`, `@lib`, `@i18n`, `@dictionaries`, `@components`) whenever they replace long cross-feature or root-relative paths.
---

# DID import aliases

Use the configured path aliases instead of long relative imports when the target lives under an aliased source root.

Available aliases:
- `@pages/*` -> `src/pages/*`
- `@lib/*` -> `src/lib/*`
- `@i18n/*` -> `src/i18n/*`
- `@dictionaries/*` -> `src/dictionaries/*`
- `@components/*` -> `src/components/*`

## Rules

- Prefer aliases for imports that cross page boundaries or jump multiple directories upward.
- Prefer aliases for imports from app entry files such as `src/App.tsx`.
- Keep same-folder imports relative, such as `./types`, `./style.module.scss`, `./useFeature`.
- Do not replace a short local relative import with a longer alias when the alias adds noise instead of clarity.
- Do not invent new aliases in code. Use only aliases already configured in `tsconfig.json` and `vite.config.ts` unless the task explicitly includes alias configuration work.

## Good patterns

- `@pages/CharacterEditPage`
- `@pages/printPages/CharacterPrintPage`
- `@pages/CharacterEditPage/sections/GeneralSection/generalSectionLogic`
- `@components/AppIcon`
- `@lib/api`
- `@i18n/index`

## Leave relative

- `./types`
- `./useCharacterListPage`
- `./style.module.scss`
- other imports that stay inside the same local feature folder and are already short

## Refactor checklist

- long `../../..` imports are replaced when an existing alias covers the destination
- cross-page imports use `@pages/...`
- shared component imports use `@components/...`
- shared library, dictionary, and i18n imports use their configured aliases
- short local imports remain relative
