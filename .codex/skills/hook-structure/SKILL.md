---
name: hook-structure
description: Enforce hook file naming and structure in the DID repo. Use when creating, renaming, or refactoring React/TypeScript hook files so files that contain hooks are named with the `Hooks.ts` suffix and stay colocated with the feature they drive.
---

# Hook structure guidelines

1. Keep hook files beside the feature they drive.
   Example: for `CharacterEditPage`, place the page hook file in `src/pages/CharacterEditPage/`.
2. Name every file that contains hook logic with the `Hooks.ts` suffix.
   Use names like `characterEditPageHooks.ts`, `abilitiesTabHooks.ts`, `characterPresentationHooks.ts`.
3. Apply the `Hooks.ts` suffix even when the file exports only one hook.
   Do not name hook files `useCharacterEditPage.ts` or `useFeatsTab.ts`.
4. Keep exported hooks named in the standard `useXxx` form.
   Example: `characterEditPageHooks.ts` may export `useCharacterEditPage`.
5. Keep hook files responsible for state, effects, handlers, and derived data shared by the feature.
   Move presentation-only helpers into `sections/`, `tabs/`, or other render-layer files when that keeps responsibilities clearer.
6. Keep interface/type/enum declarations in the local page or component `types.ts` unless the type belongs to a shared dictionary module.
7. Prefer the path aliases defined in `tsconfig.json` and `vite.config.ts` (`@pages`, `@lib`, `@i18n`, `@dictionaries`, `@components`) for cross-feature imports.

Following this pattern keeps hook discovery predictable and makes hook-bearing files easy to spot in the repo.
