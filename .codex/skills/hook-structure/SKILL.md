---
name: hook-structure
description: Guidance for naming and building hook files in the DID repo.
---

# Hook structure guidelines

1. **Placement** – Keep hook files beside the feature they drive. If the page is `CharacterEditPage`, the hook file should sit at `src/pages/CharacterEditPage/characterEditPageHooks.ts`.
2. **Naming** – Use a descriptive file name ending in `Hooks` when exporting multiple helpers for a feature. Exported hooks inside still follow `useXxx` (e.g. `useCharacterEditPage`).
3. **Contents** – The hook file owns state, effects, and derived data shared across sections. Push presentation-specific helpers into `sections/…` directories and declare any prop/definition contracts in `types.ts`.
4. **Types** – Only keep interface/type/enum declarations inside page-level `types.ts`. Place dictionary-specific interfaces in the `src/dictionaries/types.ts` next to the data constants so anyone reading the dictionary file finds its shape in the same folder.
5. **Aliases** – Prefer the new path aliases (`@pages`, `@lib`, `@i18n`, `@dictionaries`, `@components`) defined in `tsconfig.json`/`vite.config.ts` so the code stays concise and consistent when importing across layers.
5. **Shared helpers** – Compute derived rows/modifiers once inside the hook, return them via props, and let sections stay purely render-layer components.

Following this pattern keeps hook files consistent, makes refactors predictable, and mirrors the new `characterEditPageHooks.ts` setup.
