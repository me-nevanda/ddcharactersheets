---
name: did-print-pages-structure
description: Enforce print-page placement in the DID frontend. Use when creating, moving, or refactoring printable React pages in this repository so all print-oriented routes live under `src/pages/printPages/`, while normal interactive pages stay directly under `src/pages/`.
---

# DID print pages structure

Separate printable views from the main interactive page tree.

Use this directory split:
- `src/pages/`: standard app pages such as list, edit, create, dashboards, settings
- `src/pages/printPages/`: all pages whose primary purpose is printing or print-preview output

## Rules

- Place every print page under `src/pages/printPages/`.
- Keep each print page in its own folder, using the same local structure as other pages.
- Do not leave print pages mixed with standard pages directly under `src/pages/`.
- Keep route paths free to use `/print` in the URL, but map them to modules from `src/pages/printPages/...`.
- Preserve normal page conventions inside print pages: `index.tsx`, `use*.ts`, `types.ts`, `style.module.scss`.

## Print page pattern

Use this shape:

```text
src/pages/printPages/
  SomePrintPage/
    index.tsx
    useSomePrintPage.ts
    types.ts
    style.module.scss
```

## What counts as a print page

Treat a page as print-oriented when it:
- exists mainly to render printer-friendly output
- calls `window.print()` or exposes a print action as the main behavior
- removes interactive editing in favor of sheet, summary, or export layout
- serves routes like `/print`, `/print/items`, `/print/abilities`, or similar output-only views

Keep pages outside `src/pages/printPages/` when they are primarily interactive, even if they contain a secondary print button.

## Refactor checklist

- print folders live under `src/pages/printPages/`
- route imports point at `./pages/printPages/...`
- no duplicate print page folders remain directly under `src/pages/`
- internal page structure still follows the standard page split
