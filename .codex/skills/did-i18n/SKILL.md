---
name: did-i18n
description: Enforce the i18n workflow for the DID project. Use when modifying React pages, components, dialogs, form labels, placeholders, error messages, API-facing frontend logic, or any user-facing copy in this repository. Always route visible text through `src/i18n/locales/pl.ts` and `src/i18n/locales/en.ts`, use `useI18n()` in UI code, and keep server responses as stable error codes rather than localized prose.
---

# DID i18n

Keep all user-facing text in the locale dictionaries. Do not leave visible literals in components, pages, or frontend helpers.

When a task also changes page or component structure, combine this skill with `$did-frontend-structure`.

Follow the current project structure:
- i18n core: [src/i18n/index.tsx](../../../src/i18n/index.tsx)
- Polish locale: [src/i18n/locales/pl.ts](../../../src/i18n/locales/pl.ts)
- English locale: [src/i18n/locales/en.ts](../../../src/i18n/locales/en.ts)
- frontend error mapping: [src/lib/errors.ts](../../../src/lib/errors.ts)

## Workflow

1. Identify every new or changed user-facing string.
2. Add matching keys to both locale files.
3. Use `useI18n()` and `t('path.to.key')` in React code.
4. Use `getIntlLocale(locale)` for locale-sensitive formatting such as dates.
5. Keep backend/API responses language-agnostic by returning error codes, then translate those codes in the frontend.
6. Before finishing, scan the touched frontend files and remove any newly introduced hardcoded UI text.

## Rules

- Never add direct user-facing strings in JSX except translation keys.
- Always add both Polish and English entries in the same change.
- Reuse existing namespaces before creating new top-level groups.
- Prefer stable dotted keys such as `pages.characterList.title` over ad hoc names.
- Translate button labels, headings, helper text, dialog copy, placeholders, empty states, loading states, validation messages, toast text, and accessibility labels.
- If a string comes from the backend and reaches the UI, send a stable error code like `errors.api.notFound`, not localized server text.
- Keep fallback copy in locales, not in components.

## UI Pattern

Use this pattern in React files:

```tsx
import { useI18n } from '../../i18n'

export function Example() {
  const { locale, t } = useI18n()

  return (
    <>
      <h1>{t('pages.example.title')}</h1>
      <p>{t('pages.example.subtitle')}</p>
    </>
  )
}
```

Use this pattern for locale-sensitive formatting:

```tsx
import { getIntlLocale, useI18n } from '../../i18n'

const { locale } = useI18n()
const formatted = new Intl.DateTimeFormat(getIntlLocale(locale), {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date(value))
```

## Backend Pattern

When changing API handlers, prefer:

```ts
sendError(response, 404, 'errors.api.characterNotFound')
```

Do not hardcode localized response text in the server for UI consumption.

## Completion Checklist

- New keys exist in both `pl.ts` and `en.ts`.
- Touched components use `t(...)` instead of hardcoded copy.
- Locale-sensitive formatting uses the current locale.
- API changes expose translation keys or error codes, not localized server strings.
- No new visible UI text remains outside [src/i18n/locales](../../../src/i18n/locales).
