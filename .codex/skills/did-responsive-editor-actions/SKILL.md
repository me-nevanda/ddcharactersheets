---
name: did-responsive-editor-actions
description: Enforce responsive duplicated editor action placement in the DID frontend. Use when adding or changing header action buttons on edit pages that have fixed desktop actions and in-header responsive actions, such as print, save, copy, export, or similar command buttons.
---

# DID Responsive Editor Actions

When adding a header-level command to an edit page, check whether the page has two action placements:

- fixed desktop actions for wide viewports
- normal in-header actions enabled by a breakpoint such as `@media (max-width: 1800px)`

If both placements exist, add the command to both placements and control visibility with CSS.

## Rules

- Keep one handler/state source in the page hook or context, shared by both buttons.
- Give both buttons the same label, disabled state, icon, and behavior.
- Use clear CSS role names such as `floatingCopyAction`, `headerCopyAction`, `desktopOnlyAction`, or `responsiveOnlyAction`.
- Hide the desktop/fixed copy at the same breakpoint where fixed print/save actions become static.
- Show the in-header copy at that breakpoint.
- Keep new selectors in the page's local `style.module.scss`.
- Route button text and toast copy through i18n.

## Checklist

- Wide viewport has fixed action placement with the new command in the intended order.
- Narrow viewport has in-header placement with the same command in the intended order.
- Both copies call the same handler and share disabled/loading state.
- Build or typecheck passes.
