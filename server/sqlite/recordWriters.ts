import { getDatabase, mapTableName, quoteName } from './schema'
import { createNotFoundError, getMemberIds, isRecord, parseJsonValue } from './utils'
import { normalizeStoredText } from './builders'
import type { GroupMemberRow } from './types'

export const cleanupOrphanPlaces = (): void => {
  getDatabase().prepare(`
    DELETE FROM places
    WHERE NOT EXISTS (
      SELECT 1
      FROM area_places
      WHERE area_places.place_id = places.id
    )
  `).run()
}

export const replaceAreaPlaces = <TData>(areaId: string, data: TData): void => {
  const source = data as { places?: unknown }
  const places = Array.isArray(source.places) ? source.places : []
  const db = getDatabase()
  const deleteRelations = db.prepare('DELETE FROM area_places WHERE area_id = ?')
  const upsertPlace = db.prepare(`
    INSERT INTO places (id, name, description)
    VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      description = excluded.description
  `)
  const insertRelation = db.prepare(`
    INSERT OR REPLACE INTO area_places (area_id, place_id, position)
    VALUES (?, ?, ?)
  `)

  deleteRelations.run(areaId)
  places.forEach((place, index) => {
    if (!isRecord(place) || typeof place.id !== 'string' || place.id.trim().length === 0) {
      return
    }

    const placeId = place.id.trim()
    upsertPlace.run(
      placeId,
      normalizeStoredText(place.name),
      normalizeStoredText(place.description),
    )
    insertRelation.run(areaId, placeId, index)
  })
  cleanupOrphanPlaces()
}

export const executeAreaInsert = <TData>(
  id: string,
  payload: TData,
  createdAt: string,
  updatedAt: string,
): void => {
  const db = getDatabase()
  db.transaction(() => {
    db.prepare(`
      INSERT INTO areas (id, name, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      id,
      normalizeStoredText((payload as { name?: unknown }).name),
      normalizeStoredText((payload as { description?: unknown }).description),
      createdAt,
      updatedAt,
    )
    replaceAreaPlaces(id, payload)
  })()
}

export const executeAreaUpsert = <TData>(
  id: string,
  payload: TData,
  updatedAt: string,
): void => {
  const db = getDatabase()
  db.transaction(() => {
    db.prepare(`
      INSERT INTO areas (id, name, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        updated_at = excluded.updated_at
    `).run(
      id,
      normalizeStoredText((payload as { name?: unknown }).name),
      normalizeStoredText((payload as { description?: unknown }).description),
      updatedAt,
      updatedAt,
    )
    replaceAreaPlaces(id, payload)
  })()
}

export const executeEventInsert = <TData>(
  id: string,
  payload: TData,
  createdAt: string,
  updatedAt: string,
): void => {
  getDatabase().prepare(`
    INSERT INTO events (id, name, description, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    id,
    normalizeStoredText((payload as { name?: unknown }).name),
    normalizeStoredText((payload as { description?: unknown }).description),
    createdAt,
    updatedAt,
  )
}

export const executeEventUpsert = <TData>(
  id: string,
  payload: TData,
  updatedAt: string,
): void => {
  const existing = getDatabase().prepare('SELECT created_at FROM events WHERE id = ?').get(id) as { created_at: string } | undefined
  getDatabase().prepare(`
    INSERT INTO events (id, name, description, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      description = excluded.description,
      updated_at = excluded.updated_at
  `).run(
    id,
    normalizeStoredText((payload as { name?: unknown }).name),
    normalizeStoredText((payload as { description?: unknown }).description),
    existing?.created_at ?? updatedAt,
    updatedAt,
  )
}

export const executeMapInsert = <TData>(
  id: string,
  payload: TData,
  createdAt: string,
  updatedAt: string,
): void => {
  getDatabase().prepare(`
    INSERT INTO ${quoteName(mapTableName)} (id, name, description, grid_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    id,
    normalizeStoredText((payload as { name?: unknown }).name),
    normalizeStoredText((payload as { description?: unknown }).description),
    JSON.stringify((payload as { grid?: unknown }).grid ?? {}),
    createdAt,
    updatedAt,
  )
}

export const executeMapUpsert = <TData>(
  id: string,
  payload: TData,
  updatedAt: string,
): void => {
  const existing = getDatabase().prepare(`SELECT created_at FROM ${quoteName(mapTableName)} WHERE id = ?`).get(id) as { created_at: string } | undefined
  getDatabase().prepare(`
    INSERT INTO ${quoteName(mapTableName)} (id, name, description, grid_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      description = excluded.description,
      grid_json = excluded.grid_json,
      updated_at = excluded.updated_at
  `).run(
    id,
    normalizeStoredText((payload as { name?: unknown }).name),
    normalizeStoredText((payload as { description?: unknown }).description),
    JSON.stringify((payload as { grid?: unknown }).grid ?? {}),
    existing?.created_at ?? updatedAt,
    updatedAt,
  )
}

export const getContextStringIds = (value: unknown): string[] => getMemberIds(value)

export const replaceContextSimpleRelations = (
  contextId: string,
  relationTableName: string,
  memberTableName: string,
  memberColumnName: string,
  ids: string[],
): void => {
  const db = getDatabase()
  const memberExists = db.prepare(`SELECT id FROM ${quoteName(memberTableName)} WHERE id = ?`)
  const deleteRelations = db.prepare(`DELETE FROM ${quoteName(relationTableName)} WHERE context_id = ?`)
  const insertRelation = db.prepare(`
    INSERT OR REPLACE INTO ${quoteName(relationTableName)} (context_id, ${quoteName(memberColumnName)}, position)
    VALUES (?, ?, ?)
  `)

  deleteRelations.run(contextId)
  ids.forEach((memberId, index) => {
    if (!memberExists.get(memberId)) {
      return
    }

    insertRelation.run(contextId, memberId, index)
  })
}

export const replaceContextGroupedRelations = (
  contextId: string,
  groups: unknown,
  groupTableName: string,
  contextGroupTableName: string,
  contextGroupColumnName: string,
  contextMemberTableName: string,
  sourceIdsKey: string,
  memberColumnName: string,
  membershipTableName: string,
  membershipGroupColumnName: string,
): void => {
  const db = getDatabase()
  const normalizedGroups = Array.isArray(groups) ? groups.filter(isRecord) : []
  const groupExists = db.prepare(`SELECT id FROM ${quoteName(groupTableName)} WHERE id = ?`)
  const membershipExists = db.prepare(`
    SELECT ${quoteName(membershipGroupColumnName)}
    FROM ${quoteName(membershipTableName)}
    WHERE ${quoteName(membershipGroupColumnName)} = ? AND ${quoteName(memberColumnName)} = ?
  `)
  const deleteGroups = db.prepare(`DELETE FROM ${quoteName(contextGroupTableName)} WHERE context_id = ?`)
  const insertGroup = db.prepare(`
    INSERT OR REPLACE INTO ${quoteName(contextGroupTableName)} (context_id, ${quoteName(contextGroupColumnName)}, position)
    VALUES (?, ?, ?)
  `)
  const insertMember = db.prepare(`
    INSERT OR REPLACE INTO ${quoteName(contextMemberTableName)} (context_id, ${quoteName(contextGroupColumnName)}, ${quoteName(memberColumnName)}, position)
    VALUES (?, ?, ?, ?)
  `)

  deleteGroups.run(contextId)
  normalizedGroups.forEach((group, groupIndex) => {
    const groupId = normalizeStoredText(group.id)
    if (!groupId || !groupExists.get(groupId)) {
      return
    }

    insertGroup.run(contextId, groupId, groupIndex)
    getContextStringIds(group[sourceIdsKey]).forEach((memberId, memberIndex) => {
      if (!membershipExists.get(groupId, memberId)) {
        return
      }

      insertMember.run(contextId, groupId, memberId, memberIndex)
    })
  })
}

export const replaceContextRelations = <TData>(contextId: string, payload: TData): void => {
  const source = payload as Record<string, unknown>
  replaceContextSimpleRelations(contextId, 'context_characters', 'characters', 'character_id', getContextStringIds(source.characters))
  replaceContextGroupedRelations(contextId, source.characterGroups, 'character_groups', 'context_character_groups', 'group_id', 'context_character_group_members', 'characterIds', 'character_id', 'character_group_members', 'group_id')
  replaceContextSimpleRelations(contextId, 'context_events', 'events', 'event_id', getContextStringIds(source.events))
  replaceContextGroupedRelations(contextId, source.npcGroups, 'npc_groups', 'context_npc_groups', 'group_id', 'context_npc_group_members', 'npcIds', 'npc_id', 'npc_group_members', 'group_id')
  replaceContextGroupedRelations(contextId, source.monsterGroups, 'monster_groups', 'context_monster_groups', 'group_id', 'context_monster_group_members', 'monsterIds', 'monster_id', 'monster_group_members', 'group_id')
  replaceContextGroupedRelations(contextId, source.areas, 'areas', 'context_areas', 'area_id', 'context_area_places', 'placeIds', 'place_id', 'area_places', 'area_id')
}

export const executeContextInsert = <TData>(
  id: string,
  payload: TData,
  createdAt: string,
  updatedAt: string,
): void => {
  const db = getDatabase()
  db.transaction(() => {
    db.prepare(`
      INSERT INTO contexts (id, name, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      id,
      normalizeStoredText((payload as { name?: unknown }).name),
      normalizeStoredText((payload as { description?: unknown }).description),
      createdAt,
      updatedAt,
    )
    replaceContextRelations(id, payload)
  })()
}

export const executeContextUpsert = <TData>(
  id: string,
  payload: TData,
  updatedAt: string,
): void => {
  const existing = getDatabase().prepare('SELECT created_at FROM contexts WHERE id = ?').get(id) as { created_at: string } | undefined
  const db = getDatabase()
  db.transaction(() => {
    db.prepare(`
      INSERT INTO contexts (id, name, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        updated_at = excluded.updated_at
    `).run(
      id,
      normalizeStoredText((payload as { name?: unknown }).name),
      normalizeStoredText((payload as { description?: unknown }).description),
      existing?.created_at ?? updatedAt,
      updatedAt,
    )
    replaceContextRelations(id, payload)
  })()
}

export const executeGroupInsert = <TData>(
  tableName: string,
  id: string,
  payload: TData,
  createdAt: string,
  updatedAt: string,
): void => {
  getDatabase().prepare(`
    INSERT INTO ${quoteName(tableName)} (id, name, created_at, updated_at)
    VALUES (?, ?, ?, ?)
  `).run(
    id,
    normalizeStoredText((payload as { name?: unknown }).name),
    createdAt,
    updatedAt,
  )
}

export const executeGroupUpsert = <TData>(
  tableName: string,
  id: string,
  payload: TData,
  updatedAt: string,
): void => {
  const existing = getDatabase().prepare(`SELECT created_at FROM ${quoteName(tableName)} WHERE id = ?`).get(id) as { created_at: string } | undefined
  getDatabase().prepare(`
    INSERT INTO ${quoteName(tableName)} (id, name, created_at, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      updated_at = excluded.updated_at
  `).run(
    id,
    normalizeStoredText((payload as { name?: unknown }).name),
    existing?.created_at ?? updatedAt,
    updatedAt,
  )
}

