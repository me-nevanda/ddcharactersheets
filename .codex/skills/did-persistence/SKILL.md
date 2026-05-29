---
name: did-persistence
description: Enforce the DID repository persistence workflow. Use when creating, editing, reviewing, or migrating server-side reads, writes, deletes, SQLite schema, data migrations, image storage, group assignments, or any code in server/*Store.ts and server/sqliteStore.ts.
---

# DID Persistence

Use this skill for backend persistence work in this repository.

## Storage Model

- Use SQLite for structured application data.
- Keep the database at `data/app.sqlite`.
- Keep uploaded images as files on disk in the existing `data/<entity>/` folders.
- Keep `data/` ignored by git; do not commit local database files, journals, or uploaded data.
- Use `better-sqlite3`; do not use `node:sqlite` in this repo.
- Keep `PRAGMA journal_mode = PERSIST`, `PRAGMA synchronous = NORMAL`, and `PRAGMA foreign_keys = ON`.

## File Structure

- Put shared persistence code in `server/sqliteStore.ts`.
- Keep entity-specific normalization, validation, image path rules, and public store exports in `server/*Store.ts`.
- Keep API routing in `vite.config.ts` using the existing store exports.
- Do not move persistence logic into frontend code.
- Do not add database access to `src/lib/api.ts`; it should continue to call HTTP API endpoints.

## Entity Records

Store each domain in its own table. Do not use a shared `entities(entity_type, ...)` table.

Current entity tables:

- `adventures`
- `areas`
- `characters`
- `character_groups`
- `contexts`
- `events`
- `monsters`
- `monster_groups`
- `npcs`
- `npc_groups`

Each entity table uses this common shape:

- `id`: stable route/API id.
- `unique_id`: copied from payload for lookup/indexing.
- `name`: copied from payload for lookup/indexing.
- `payload_json`: normalized entity JSON without relational group membership data.
- `created_at`, `updated_at`: ISO timestamps.

Use the shared helpers in `server/sqliteStore.ts`:

- `listStoredEntities`
- `readStoredEntity`
- `createStoredEntity`
- `updateStoredEntity`
- `deleteStoredEntity`
- `assertStoredEntityExists`

Preserve the public API shape returned by existing store functions unless the user explicitly asks for an API migration.

## Normalization And Validation

- Keep existing `normalize*` functions in each store as the boundary for incoming data.
- Always normalize before writing to SQLite.
- Keep stable API error codes and status behavior.
- Keep group-name validation in group stores.
- Preserve `updatedAt` as an ISO string.

## Images

- Do not store images as SQLite BLOBs.
- Keep image file helpers in entity stores.
- Before image upload/delete, assert that the parent entity exists in SQLite with `assertStoredEntityExists`.
- Image URLs should remain `/api/<entity-route>/<id>/image`.

## Group Relations

Use dedicated relation tables as the source of truth for group assignments.

Supported relations:

- `character_group_members`: `character_groups` -> `characters`
- `monster_group_members`: `monster_groups` -> `monsters`
- `npc_group_members`: `npc_groups` -> `npcs`

Use the group helpers in `server/sqliteStore.ts`:

- `migrateStoredGroupMembers`
- `listStoredGroupEntities`
- `readStoredGroupEntity`
- `createStoredGroupEntity`
- `updateStoredGroupEntity`

Keep frontend compatibility by returning existing fields:

- `characterFileNames`
- `monsterFileNames`
- `npcFileNames`

Generate those arrays from the dedicated relation table as `${member_id}.json`. Do not store memberships in `payload_json` except as empty arrays for compatibility.

When migrating or saving group assignments:

- Convert `*.json` names to member ids.
- Preserve order with `position`.
- Skip missing members instead of creating dangling rows.
- Let foreign keys cascade when groups or members are deleted.
- Check `PRAGMA foreign_key_check` after migration changes.

## Schema Changes

- Add schema changes in `server/sqliteStore.ts` inside the initialization block.
- Add indexes when a query needs them; avoid speculative indexes.
- Prefer indexes that match access patterns, e.g. `updated_at DESC`, `name COLLATE NOCASE`, `unique_id`, or `(group_id, position)` for group relation tables.
- Make migrations idempotent with marker tables when importing from old file data.

## Verification

After persistence changes, run:

```powershell
npm run build
```

For data migrations, also verify counts and referential integrity with a short `better-sqlite3` query:

```powershell
node -e "const Database=require('better-sqlite3'); const db=new Database('data/app.sqlite',{readonly:true}); console.log(db.prepare('pragma foreign_key_check').all()); db.close();"
```

`npm run lint` may fail on the existing missing `react-hooks/exhaustive-deps` rule unless that configuration is fixed separately. Report that as unrelated when it happens.
