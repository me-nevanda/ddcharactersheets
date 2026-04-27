---
name: did-component-structure
description: Enforce component and page structure in the DID frontend. Use when creating or refactoring React pages, components, dialogs, sections, or tabs in this repository and the code should be split so rendering stays in `index.tsx`, state and behavior move to hooks, contracts live in `types.ts`, and local styles stay in `style.module.scss`.
---

# DID component structure

Keep render code thin. Move behavior out of JSX and keep file responsibilities explicit.

Follow this split:
- `index.tsx`: render markup, connect props/state to JSX, compose child components
- `use*.ts` or `*Hooks.ts`: own state, effects, async work, navigation, event handlers, derived data, and view models
- `types.ts`: own props, page state contracts, view-model types, and local helper types
- `style.module.scss`: own local selectors only

## Core rules

- Keep components and pages in dedicated folders when they have non-trivial logic or styles.
- Keep `index.tsx` focused on rendering. Avoid inline business logic, data shaping, or long handlers in JSX.
- Move stateful logic into hooks. This includes `useState`, `useEffect`, API calls, router actions, dialog orchestration, filtering, sorting, and computed labels used across the view.
- Put reusable view preparation in hooks. Return ready-to-render values instead of recalculating them in JSX.
- Keep local contracts in `types.ts`. Do not hide prop interfaces inside `index.tsx` or hook files unless the component is truly trivial.
- Keep styles in `style.module.scss`. Do not leak feature-specific selectors into global styles.

## Page pattern

Use this shape for pages:

```text
PageName/
  index.tsx
  usePageName.ts
  types.ts
  style.module.scss
```

Apply these responsibilities:
- `index.tsx`: page shell, sections, conditional rendering
- `usePageName.ts`: loading, mutations, side effects, routing, event handlers, derived state
- `types.ts`: page state and section prop contracts
- `style.module.scss`: page-only styles

## Component pattern

Use this shape for non-trivial components:

```text
ComponentName/
  index.tsx
  useComponentName.ts
  types.ts
  style.module.scss
```

Skip `useComponentName.ts` only when the component is purely presentational and has no local behavior beyond trivial prop forwarding.

If a component grows, split it immediately:
- move handlers and derived values from `index.tsx` to a hook
- move interfaces from inline declarations to `types.ts`
- move selectors from shared or global files to local `style.module.scss`

## What stays out of `index.tsx`

- API calls
- router navigation logic
- data normalization
- enum-to-label mapping
- asset lookup tables
- submit/delete/open/close handlers longer than a couple of lines
- keyboard interaction logic
- repeated fallback logic

If JSX needs the same expression more than once, or the expression obscures the markup, compute it in the hook.

## Hook output

Prefer returning render-ready data:
- booleans like `showEmptyState`
- formatted labels
- arrays of row/card/view-model objects
- stable handlers such as `handleOpen`, `handleSubmit`, `handleDelete`
- image or icon sources

Let the component consume those values directly instead of rebuilding them.

## Types

Keep these in `types.ts`:
- component props
- page state interfaces
- hook return contracts when they are shared
- view-model interfaces for cards, rows, tabs, sections, dialogs

Keep domain types near the domain, not in feature-local `types.ts`, if they are already defined elsewhere.

## Styling

- Import CSS modules as `styles`
- Use local class names based on role, not appearance
- Keep page/component selectors local
- Put only app-wide reset and theme primitives in global styles

## Refactor checklist

- `index.tsx` reads mostly like markup
- hook owns behavior and derived state
- `types.ts` contains the local contracts
- `style.module.scss` contains the touched selectors
- visible text still follows the repo i18n rules
- imports use repo aliases where appropriate
