---
name: map-generator-workflow
description: "Use when modifying the DID map editor or map generator: map layers, grid interactions, line drawing modes, palette colors, JSON persistence, map API/store code, or related i18n and UI controls."
---

# Map Generator Workflow

## Core Context

Treat the map editor as a layered grid editor. The visual map stays visible across layers; only the right-side tools change by active layer.

Current layers:
- `lines`: existing line editor and all current drawing behavior.
- `ground`: placeholder for floor/terrain tools.
- `elements`: placeholder for placed objects such as trees.
- `labels`: placeholder for descriptions/callouts.

The grid is 34 cells wide and 22 cells high. Lines are drawn on grid edges and are persisted in one JSON field as `grid.lines`.

## Files To Check First

Read these before changing map behavior:
- `src/pages/MapEditPage/index.tsx` for rendering.
- `src/pages/MapEditPage/mapEditPageHooks.ts` for state and interaction logic.
- `src/pages/MapEditPage/types.ts` for page contracts and layer/color modes.
- `src/pages/MapEditPage/style.module.scss` for grid, line, palette, and toolbar styles.
- `src/types/map.ts` for persisted map/grid data types.
- `server/mapStore.ts` for JSON normalization and allowed persisted values.
- `src/i18n/locales/pl.ts`, `src/i18n/locales/en.ts`, and `src/i18n/types.ts` for visible labels and tooltips.

Also follow the repository skills for frontend structure, hooks, i18n, aliases, persistence, and arrow functions when they apply.

## Persistence Rules

Keep map editor data in `MapData.grid`. Persist grid data as JSON through the existing map store and SQLite map record.

When adding a persisted field:
- Update `src/types/map.ts`.
- Normalize old/missing data in `server/mapStore.ts`.
- Preserve backward compatibility with existing maps.
- Keep server responses language-neutral; translate UI text in i18n files.

When adding a line color:
- Extend `MapLineColor`.
- Extend `isMapLineColor`.
- Add palette option, SCSS line/palette classes, and PL/EN labels.

## Interaction Rules

For `lines` layer:
- `single`: line segments are clickable. Left click paints selected color. Right click removes.
- `range`: endpoints are intersection points. First point selects start, second point draws or erases a horizontal/vertical segment range.
- `rectangle`: endpoints are intersection points. First point selects one corner, second point draws the rectangle outline.
- Show preview outlines for range/rectangle after the first point.
- Do not highlight arbitrary line segments in point-based modes; keep segment hover highlighting for `single`.

For non-`lines` layers:
- Keep the map and existing line data visible.
- Disable line editing and point overlays.
- Change only right-side tools for the active layer.

## UI Rules

Use compact icon buttons with `aria-label` and `title` tooltips for tool modes and layer tabs. Prefer the project’s installed Hugeicons package for icons before creating CSS-only symbols.

Keep the layer tabs at the top of the right-side tool panel. Keep the map grid on the left visible for every layer.

The color palette should stay compact and predictable; if more colors are added, preserve the grid layout and add matching persisted color support.

## Verification

Run `npm run build` after changes to catch TypeScript, i18n shape, and SCSS module issues. Report existing Sass legacy API or Vite chunk-size warnings separately from real failures.
