---
name: arrow-functions
description: Enforce arrow function style in this repository. Use when creating or editing JavaScript, TypeScript, JSX, or TSX code and function syntax is involved. Prefer arrow functions over function declarations for exported helpers, local helpers, React components, hooks, callbacks, and event handlers unless the code is inside a legacy comment block or the user explicitly asks to keep function declarations.
---

# Arrow Functions

Use arrow functions as the default function style in touched code.

## Rules

- Write new named functions as `const name = (...) => {}`.
- Convert touched `function` declarations to arrow functions when the change is local and safe.
- Keep exported React components, hooks, utilities, and handlers in arrow form.
- Preserve `async`, generics, parameter types, and return types during conversion.
- Check hoisting-sensitive code after conversion. If a function is used before declaration, move the arrow function above the first use or keep behavior intact another safe way.
- Do not rewrite commented legacy examples unless the user asks.
- If a framework or library strictly requires another form, follow that requirement and note the exception.

## Preferred Patterns

Use:

```ts
const loadCharacter = async (): Promise<Character> => {
  return getCharacter(id)
}
```

```tsx
export const CharacterListPage = () => {
  return <div />
}
```

Avoid:

```ts
async function loadCharacter(): Promise<Character> {
  return getCharacter(id)
}
```

```tsx
export function CharacterListPage() {
  return <div />
}
```

## Completion Checklist

- No new `function` declarations were introduced in touched runtime code.
- Converted functions still compile and preserve behavior.
- Hoisting-related call sites were checked after conversion.
