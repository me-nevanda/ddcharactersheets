---
name: did-frontend-structure
description: Enforce the frontend file structure for the DID project. Use when modifying pages, React components, hooks, local styles, or UI-related types in this repository. Keep pages split into `index.tsx`, `use*.ts`, `types.ts`, and `style.module.scss`; keep component props in local `types.ts`; keep local styles in `style.module.scss`; keep only reset and theme variables in `src/styles/global.scss`.
---

# DID frontend structure

Preserve the local structure and avoid collapsing page logic, types, and styles into unrelated files.

Follow the current project layout:
- app entry: [src/main.tsx](../../../src/main.tsx)
- global styles: [src/styles/global.scss](../../../src/styles/global.scss)
- shared SCSS mixins: [src/styles/_mixins.scss](../../../src/styles/_mixins.scss)
- page example: [src/pages/CharacterListPage](../../../src/pages/CharacterListPage)
- component example: [src/components/DeleteCharacterDialog](../../../src/components/DeleteCharacterDialog)

## Rules

- Keep each page in its own folder.
- Keep page orchestration and rendering in `index.tsx`.
- Keep page state, effects, and event handlers in `use*.ts`.
- Keep local interfaces and prop/state contracts in `types.ts`.
- Keep local visual styles in `style.module.scss`.
- Keep only app-wide reset, root variables, and generic document-level rules in `src/styles/global.scss`.
- Use shared SCSS partials only for cross-cutting helpers such as mixins or theme tokens, not for page-specific selectors.
- Prefer importing local folders through their `index.tsx` entry when consuming pages or components from outside.

## Page pattern

Use this shape for pages:

```text
PageName/
  index.tsx
  usePageName.ts
  types.ts
  style.module.scss
```

Responsibilities:
- `index.tsx`: own page markup and connect it to the hook
- `usePageName.ts`: own async loading, mutation logic, and local state
- `types.ts`: export props/state interfaces used by the page files
- `style.module.scss`: own selectors for that page only

## Component pattern

For components with non-trivial props or styles, use:

```text
ComponentName/
  index.tsx
  types.ts
  style.module.scss
```

If a component is trivial and has no dedicated types yet, keep it simple, but once props or styling complexity grows, split them out immediately.

## Styling rules

- Do not add new page or component selectors to `global.scss`.
- Do not use global class names for page-specific UI.
- Import CSS modules as `styles` and reference them with `styles.className`.
- Keep repeated visual primitives in SCSS mixins instead of copying large blocks across modules.
- Prefer local class names that describe role inside the module, such as `header`, `title`, `actions`, `input`.

## Completion checklist

- Touched pages still follow `index/hook/types/style` structure.
- Touched components keep props in `types.ts` when they have a dedicated folder.
- New selectors were added to a local `style.module.scss`, not to `global.scss`.
- `global.scss` still contains only app-wide rules and variables.
- Imports point to the new files and the old monolithic files were not reintroduced.
