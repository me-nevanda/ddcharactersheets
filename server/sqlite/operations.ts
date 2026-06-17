import { randomUUID } from 'node:crypto'
import { getDatabase, mapTableName, quoteName } from './schema'
import { buildArea, buildCharacter, buildCharacterPayload, buildContext, buildEntity, buildEvent, buildGroup, buildMap, buildMonster, buildMonsterPayload, buildNpc, buildNpcPayload, getAreaPlaces, getContextAreas, getContextCharacters, getContextEvents, getContextGroupedIds, normalizeStoredText } from './builders'
import { attachGroupIds, executeAreaInsert, executeAreaUpsert, executeCharacterInsert, executeCharacterUpsert, executeContextInsert, executeContextUpsert, executeEntityInsert, executeEntityUpsert, executeEventInsert, executeEventUpsert, executeGroupInsert, executeGroupUpsert, executeMapInsert, executeMapUpsert, executeMonsterInsert, executeMonsterUpsert, executeNpcInsert, executeNpcUpsert, getGroupMemberIds, replaceGroupMembers, stripGroupIds } from './writers'
import { createNotFoundError, getMemberIds, isRecord, parseJsonValue, parsePayload } from './utils'
import type { AreaRow, CharacterRow, ContextRow, EntityExistsRow, EntityRow, EventRow, GroupMemberRelationOptions, GroupRow, MapRow, MonsterRow, NpcRow, StoredAreaOptions, StoredCharacterHistoryEntry, StoredCharacterOptions, StoredContextOptions, StoredEntityOptions, StoredEventOptions, StoredGroupOptions, StoredMapOptions, StoredMonsterOptions, StoredNpcHistoryEntry, StoredNpcOptions } from './types'

export const listStoredEntities = async <TData, TEntity>(
  options: StoredEntityOptions<TData>,
): Promise<TEntity[]> => {
  const rows = getDatabase().prepare(`
    SELECT id, payload_json, updated_at
    FROM ${quoteName(options.tableName)}
    ORDER BY updated_at DESC, id DESC
  `).all() as EntityRow[]

  return rows.map((row) => buildEntity(row, options))
}

export const listStoredAreas = async <TData, TEntity>(
  options: StoredAreaOptions<TData>,
): Promise<TEntity[]> => {
  const rows = getDatabase().prepare(`
    SELECT id, name, description, updated_at
    FROM areas
    ORDER BY updated_at DESC, id DESC
  `).all() as AreaRow[]

  return rows.map((row) => buildArea(row, options))
}

export const listStoredEvents = async <TData, TEntity>(
  options: StoredEventOptions<TData>,
): Promise<TEntity[]> => {
  const rows = getDatabase().prepare(`
    SELECT id, name, description, updated_at
    FROM events
    ORDER BY updated_at DESC, id DESC
  `).all() as EventRow[]

  return rows.map((row) => buildEvent(row, options))
}

export const listStoredMaps = async <TData, TEntity>(
  options: StoredMapOptions<TData>,
): Promise<TEntity[]> => {
  const rows = getDatabase().prepare(`
    SELECT id, name, description, grid_json, updated_at
    FROM ${quoteName(mapTableName)}
    ORDER BY updated_at DESC, id DESC
  `).all() as MapRow[]

  return rows.map((row) => buildMap(row, options))
}

export const listStoredContexts = async <TData, TEntity>(
  options: StoredContextOptions<TData>,
): Promise<TEntity[]> => {
  const rows = getDatabase().prepare(`
    SELECT id, name, description, updated_at
    FROM contexts
    ORDER BY updated_at DESC, id DESC
  `).all() as ContextRow[]

  return rows.map((row) => buildContext(row, options))
}

export const listStoredCharacters = async <TData, TEntity>(
  options: StoredCharacterOptions<TData>,
): Promise<TEntity[]> => {
  const rows = getDatabase().prepare(`
    SELECT *
    FROM characters
    ORDER BY updated_at DESC, id DESC
  `).all() as CharacterRow[]

  return rows.map((row) => buildCharacter(row, options))
}

export const listStoredNpcs = async <TData, TEntity>(
  options: StoredNpcOptions<TData>,
): Promise<TEntity[]> => {
  const rows = getDatabase().prepare(`
    SELECT *
    FROM npcs
    ORDER BY updated_at DESC, id DESC
  `).all() as NpcRow[]

  return rows.map((row) => buildNpc(row, options))
}

export const listStoredMonsters = async <TData, TEntity>(
  options: StoredMonsterOptions<TData>,
): Promise<TEntity[]> => {
  const rows = getDatabase().prepare(`
    SELECT *
    FROM monsters
    ORDER BY updated_at DESC, id DESC
  `).all() as MonsterRow[]

  return rows.map((row) => buildMonster(row, options))
}

export const listStoredGroupEntities = async <TData, TEntity>(
  entityOptions: StoredGroupOptions<TData>,
  relationOptions: GroupMemberRelationOptions<TData>,
): Promise<TEntity[]> => {
  const rows = getDatabase().prepare(`
    SELECT id, name, updated_at
    FROM ${quoteName(entityOptions.tableName)}
    ORDER BY updated_at DESC, id DESC
  `).all() as GroupRow[]
  const entities = rows.map((row) => buildGroup<TData, TEntity>(row, entityOptions))
  return entities.map((entity) => attachGroupIds<TData, TEntity>(entity, relationOptions))
}

export const readStoredEntity = async <TData, TEntity>(
  id: string,
  options: StoredEntityOptions<TData>,
): Promise<TEntity> => {
  const row = getDatabase().prepare(`
    SELECT id, payload_json, updated_at
    FROM ${quoteName(options.tableName)}
    WHERE id = ?
  `).get(id) as EntityRow | undefined

  if (!row) {
    throw createNotFoundError()
  }

  return buildEntity(row, options)
}

export const readStoredArea = async <TData, TEntity>(
  id: string,
  options: StoredAreaOptions<TData>,
): Promise<TEntity> => {
  const row = getDatabase().prepare(`
    SELECT id, name, description, updated_at
    FROM areas
    WHERE id = ?
  `).get(id) as AreaRow | undefined

  if (!row) {
    throw createNotFoundError()
  }

  return buildArea(row, options)
}

export const readStoredEvent = async <TData, TEntity>(
  id: string,
  options: StoredEventOptions<TData>,
): Promise<TEntity> => {
  const row = getDatabase().prepare(`
    SELECT id, name, description, updated_at
    FROM events
    WHERE id = ?
  `).get(id) as EventRow | undefined

  if (!row) {
    throw createNotFoundError()
  }

  return buildEvent(row, options)
}

export const readStoredMap = async <TData, TEntity>(
  id: string,
  options: StoredMapOptions<TData>,
): Promise<TEntity> => {
  const row = getDatabase().prepare(`
    SELECT id, name, description, grid_json, updated_at
    FROM ${quoteName(mapTableName)}
    WHERE id = ?
  `).get(id) as MapRow | undefined

  if (!row) {
    throw createNotFoundError()
  }

  return buildMap(row, options)
}

export const readStoredContext = async <TData, TEntity>(
  id: string,
  options: StoredContextOptions<TData>,
): Promise<TEntity> => {
  const row = getDatabase().prepare(`
    SELECT id, name, description, updated_at
    FROM contexts
    WHERE id = ?
  `).get(id) as ContextRow | undefined

  if (!row) {
    throw createNotFoundError()
  }

  return buildContext(row, options)
}

export const readStoredCharacter = async <TData, TEntity>(
  id: string,
  options: StoredCharacterOptions<TData>,
): Promise<TEntity> => {
  const row = getDatabase().prepare(`
    SELECT *
    FROM characters
    WHERE id = ?
  `).get(id) as CharacterRow | undefined

  if (!row) {
    throw createNotFoundError()
  }

  return buildCharacter(row, options)
}

export const readStoredNpc = async <TData, TEntity>(
  id: string,
  options: StoredNpcOptions<TData>,
): Promise<TEntity> => {
  const row = getDatabase().prepare(`
    SELECT *
    FROM npcs
    WHERE id = ?
  `).get(id) as NpcRow | undefined

  if (!row) {
    throw createNotFoundError()
  }

  return buildNpc(row, options)
}

export const readStoredMonster = async <TData, TEntity>(
  id: string,
  options: StoredMonsterOptions<TData>,
): Promise<TEntity> => {
  const row = getDatabase().prepare(`
    SELECT *
    FROM monsters
    WHERE id = ?
  `).get(id) as MonsterRow | undefined

  if (!row) {
    throw createNotFoundError()
  }

  return buildMonster(row, options)
}

export const readStoredGroupEntity = async <TData, TEntity>(
  id: string,
  entityOptions: StoredGroupOptions<TData>,
  relationOptions: GroupMemberRelationOptions<TData>,
): Promise<TEntity> => {
  const row = getDatabase().prepare(`
    SELECT id, name, updated_at
    FROM ${quoteName(entityOptions.tableName)}
    WHERE id = ?
  `).get(id) as GroupRow | undefined

  if (!row) {
    throw createNotFoundError()
  }

  const entity = buildGroup<TData, TEntity>(row, entityOptions)
  return attachGroupIds(entity, relationOptions)
}

export const createStoredEntity = async <TData, TEntity>(
  options: StoredEntityOptions<TData>,
  data: Partial<Record<keyof TData, unknown>> = {},
): Promise<TEntity> => {
  const id = `${Date.now()}-${randomUUID().slice(0, 8)}`
  const payload = options.normalize({
    uniqueId: randomUUID(),
    ...data,
  } as Partial<Record<keyof TData, unknown>>)
  options.validate?.(payload)
  const now = new Date().toISOString()
  executeEntityInsert(options.tableName, id, payload, now, now)
  return readStoredEntity(id, options)
}

export const createStoredArea = async <TData, TEntity>(
  options: StoredAreaOptions<TData>,
  data: Partial<Record<keyof TData, unknown>> = {},
): Promise<TEntity> => {
  const id = `${Date.now()}-${randomUUID().slice(0, 8)}`
  const payload = options.normalize(data)
  options.validate?.(payload)
  const now = new Date().toISOString()
  executeAreaInsert(id, payload, now, now)
  return readStoredArea(id, options)
}

export const createStoredEvent = async <TData, TEntity>(
  options: StoredEventOptions<TData>,
  data: Partial<Record<keyof TData, unknown>> = {},
): Promise<TEntity> => {
  const id = `${Date.now()}-${randomUUID().slice(0, 8)}`
  const payload = options.normalize(data)
  options.validate?.(payload)
  const now = new Date().toISOString()
  executeEventInsert(id, payload, now, now)
  return readStoredEvent(id, options)
}

export const createStoredMap = async <TData, TEntity>(
  options: StoredMapOptions<TData>,
  data: Partial<Record<keyof TData, unknown>> = {},
): Promise<TEntity> => {
  const id = `${Date.now()}-${randomUUID().slice(0, 8)}`
  const payload = options.normalize(data)
  options.validate?.(payload)
  const now = new Date().toISOString()
  executeMapInsert(id, payload, now, now)
  return readStoredMap(id, options)
}

export const createStoredContext = async <TData, TEntity>(
  options: StoredContextOptions<TData>,
  data: Partial<Record<keyof TData, unknown>> = {},
): Promise<TEntity> => {
  const id = `${Date.now()}-${randomUUID().slice(0, 8)}`
  const payload = options.normalize(data)
  options.validate?.(payload)
  const now = new Date().toISOString()
  executeContextInsert(id, payload, now, now)
  return readStoredContext(id, options)
}

export const createStoredCharacter = async <TData, TEntity>(
  options: StoredCharacterOptions<TData>,
  data: Partial<Record<keyof TData, unknown>> = {},
): Promise<TEntity> => {
  const id = `${Date.now()}-${randomUUID().slice(0, 8)}`
  const payload = options.normalize(data)
  options.validate?.(payload)
  const now = new Date().toISOString()
  executeCharacterInsert(id, payload, now, now)
  return readStoredCharacter(id, options)
}

export const createStoredNpc = async <TData, TEntity>(
  options: StoredNpcOptions<TData>,
  data: Partial<Record<keyof TData, unknown>> = {},
): Promise<TEntity> => {
  const id = `${Date.now()}-${randomUUID().slice(0, 8)}`
  const payload = options.normalize(data)
  options.validate?.(payload)
  const now = new Date().toISOString()
  executeNpcInsert(id, payload, now, now)
  return readStoredNpc(id, options)
}

export const createStoredMonster = async <TData, TEntity>(
  options: StoredMonsterOptions<TData>,
  data: Partial<Record<keyof TData, unknown>> = {},
): Promise<TEntity> => {
  const id = `${Date.now()}-${randomUUID().slice(0, 8)}`
  const payload = options.normalize(data)
  options.validate?.(payload)
  const now = new Date().toISOString()
  executeMonsterInsert(id, payload, now, now)
  return readStoredMonster(id, options)
}

export const createStoredGroupEntity = async <TData, TEntity>(
  entityOptions: StoredGroupOptions<TData>,
  relationOptions: GroupMemberRelationOptions<TData>,
  data: Partial<Record<keyof TData, unknown>>,
): Promise<TEntity> => {
  const id = `${Date.now()}-${randomUUID().slice(0, 8)}`
  const memberIds = getMemberIds(data[relationOptions.idsKey])
  const payload = entityOptions.normalize(stripGroupIds<TData>(data, relationOptions))
  entityOptions.validate?.(payload)
  const now = new Date().toISOString()
  executeGroupInsert(entityOptions.tableName, id, payload, now, now)
  replaceGroupMembers(id, memberIds, relationOptions)
  return readStoredGroupEntity<TData, TEntity>(id, entityOptions, relationOptions)
}

export const updateStoredEntity = async <TData, TEntity>(
  id: string,
  data: unknown,
  options: StoredEntityOptions<TData>,
): Promise<TEntity> => {
  const existing = getDatabase().prepare(`
    SELECT id, payload_json, updated_at
    FROM ${quoteName(options.tableName)}
    WHERE id = ?
  `).get(id) as EntityRow | undefined

  if (!existing) {
    throw createNotFoundError()
  }

  const payload = options.normalize({
    ...parsePayload<TData>(existing.payload_json),
    ...(typeof data === 'object' && data !== null ? (data as Partial<Record<keyof TData, unknown>>) : {}),
  })
  options.validate?.(payload)

  executeEntityUpsert(options.tableName, id, payload, new Date().toISOString())
  return readStoredEntity(id, options)
}

export const updateStoredArea = async <TData, TEntity>(
  id: string,
  data: unknown,
  options: StoredAreaOptions<TData>,
): Promise<TEntity> => {
  const existing = getDatabase().prepare(`
    SELECT id, name, description, updated_at
    FROM areas
    WHERE id = ?
  `).get(id) as AreaRow | undefined

  if (!existing) {
    throw createNotFoundError()
  }

  const payload = options.normalize({
    name: existing.name,
    description: existing.description,
    places: getAreaPlaces(id),
    ...(typeof data === 'object' && data !== null ? (data as Partial<Record<keyof TData, unknown>>) : {}),
  } as Partial<Record<keyof TData, unknown>>)
  options.validate?.(payload)

  executeAreaUpsert(id, payload, new Date().toISOString())
  return readStoredArea(id, options)
}

export const updateStoredEvent = async <TData, TEntity>(
  id: string,
  data: unknown,
  options: StoredEventOptions<TData>,
): Promise<TEntity> => {
  const existing = getDatabase().prepare(`
    SELECT id, name, description, updated_at
    FROM events
    WHERE id = ?
  `).get(id) as EventRow | undefined

  if (!existing) {
    throw createNotFoundError()
  }

  const payload = options.normalize({
    name: existing.name,
    description: existing.description,
    ...(typeof data === 'object' && data !== null ? (data as Partial<Record<keyof TData, unknown>>) : {}),
  } as Partial<Record<keyof TData, unknown>>)
  options.validate?.(payload)

  executeEventUpsert(id, payload, new Date().toISOString())
  return readStoredEvent(id, options)
}

export const updateStoredMap = async <TData, TEntity>(
  id: string,
  data: unknown,
  options: StoredMapOptions<TData>,
): Promise<TEntity> => {
  const existing = getDatabase().prepare(`
    SELECT id, name, description, grid_json, updated_at
    FROM ${quoteName(mapTableName)}
    WHERE id = ?
  `).get(id) as MapRow | undefined

  if (!existing) {
    throw createNotFoundError()
  }

  const payload = options.normalize({
    name: existing.name,
    description: existing.description,
    grid: parseJsonValue(existing.grid_json),
    ...(typeof data === 'object' && data !== null ? (data as Partial<Record<keyof TData, unknown>>) : {}),
  } as Partial<Record<keyof TData, unknown>>)
  options.validate?.(payload)

  executeMapUpsert(id, payload, new Date().toISOString())
  return readStoredMap(id, options)
}

export const updateStoredContext = async <TData, TEntity>(
  id: string,
  data: unknown,
  options: StoredContextOptions<TData>,
): Promise<TEntity> => {
  const existing = getDatabase().prepare(`
    SELECT id, name, description, updated_at
    FROM contexts
    WHERE id = ?
  `).get(id) as ContextRow | undefined

  if (!existing) {
    throw createNotFoundError()
  }

  const payload = options.normalize({
    name: existing.name,
    description: existing.description,
    characters: getContextCharacters(id),
    characterGroups: getContextGroupedIds(id, 'character_groups', 'context_character_groups', 'context_character_group_members', 'character_id', 'characterIds'),
    events: getContextEvents(id),
    npcGroups: getContextGroupedIds(id, 'npc_groups', 'context_npc_groups', 'context_npc_group_members', 'npc_id', 'npcIds'),
    monsterGroups: getContextGroupedIds(id, 'monster_groups', 'context_monster_groups', 'context_monster_group_members', 'monster_id', 'monsterIds'),
    areas: getContextAreas(id),
    ...(typeof data === 'object' && data !== null ? (data as Partial<Record<keyof TData, unknown>>) : {}),
  } as Partial<Record<keyof TData, unknown>>)
  options.validate?.(payload)

  executeContextUpsert(id, payload, new Date().toISOString())
  return readStoredContext(id, options)
}

export const updateStoredCharacter = async <TData, TEntity>(
  id: string,
  data: unknown,
  options: StoredCharacterOptions<TData>,
): Promise<TEntity> => {
  const existing = getDatabase().prepare(`
    SELECT *
    FROM characters
    WHERE id = ?
  `).get(id) as CharacterRow | undefined

  if (!existing) {
    throw createNotFoundError()
  }

  const payload = options.normalize({
    ...buildCharacterPayload(existing),
    ...(typeof data === 'object' && data !== null ? (data as Partial<Record<keyof TData, unknown>>) : {}),
  } as Partial<Record<keyof TData, unknown>>)
  options.validate?.(payload)

  executeCharacterUpsert(id, payload, new Date().toISOString())
  return readStoredCharacter(id, options)
}

const normalizeCharacterHistoryEntries = (entries: unknown): StoredCharacterHistoryEntry[] => {
  if (!Array.isArray(entries)) {
    return []
  }

  return entries
    .filter(isRecord)
    .map((entry, index) => ({
      id: normalizeStoredText(entry.id) || randomUUID(),
      title: normalizeStoredText(entry.title),
      content: normalizeStoredText(entry.content),
      position: index,
    }))
    .filter((entry) => entry.title.length > 0 || entry.content.length > 0)
    .map(({ position: _position, ...entry }) => entry)
}

export const listStoredCharacterHistory = async (characterId: string): Promise<StoredCharacterHistoryEntry[]> => {
  await assertStoredEntityExists('characters', characterId)
  return getDatabase().prepare(`
    SELECT id, title, content
    FROM character_history_entries
    WHERE character_id = ?
    ORDER BY position ASC, id ASC
  `).all(characterId) as StoredCharacterHistoryEntry[]
}

export const replaceStoredCharacterHistory = async (characterId: string, entries: unknown): Promise<StoredCharacterHistoryEntry[]> => {
  await assertStoredEntityExists('characters', characterId)
  const normalizedEntries = normalizeCharacterHistoryEntries(entries)
  const db = getDatabase()
  db.transaction(() => {
    db.prepare('DELETE FROM character_history_entries WHERE character_id = ?').run(characterId)
    const insertEntry = db.prepare(`
      INSERT INTO character_history_entries (character_id, id, position, title, content)
      VALUES (?, ?, ?, ?, ?)
    `)
    normalizedEntries.forEach((entry, position) => {
      insertEntry.run(characterId, entry.id, position, entry.title, entry.content)
    })
  })()
  return listStoredCharacterHistory(characterId)
}

export const updateStoredNpc = async <TData, TEntity>(
  id: string,
  data: unknown,
  options: StoredNpcOptions<TData>,
): Promise<TEntity> => {
  const existing = getDatabase().prepare(`
    SELECT *
    FROM npcs
    WHERE id = ?
  `).get(id) as NpcRow | undefined

  if (!existing) {
    throw createNotFoundError()
  }

  const payload = options.normalize({
    ...buildNpcPayload(existing),
    ...(typeof data === 'object' && data !== null ? (data as Partial<Record<keyof TData, unknown>>) : {}),
  } as Partial<Record<keyof TData, unknown>>)
  options.validate?.(payload)

  executeNpcUpsert(id, payload, new Date().toISOString())
  return readStoredNpc(id, options)
}

export const updateStoredMonster = async <TData, TEntity>(
  id: string,
  data: unknown,
  options: StoredMonsterOptions<TData>,
): Promise<TEntity> => {
  const existing = getDatabase().prepare(`
    SELECT *
    FROM monsters
    WHERE id = ?
  `).get(id) as MonsterRow | undefined

  if (!existing) {
    throw createNotFoundError()
  }

  const payload = options.normalize({
    ...buildMonsterPayload(existing),
    ...(typeof data === 'object' && data !== null ? (data as Partial<Record<keyof TData, unknown>>) : {}),
  } as Partial<Record<keyof TData, unknown>>)
  options.validate?.(payload)

  executeMonsterUpsert(id, payload, new Date().toISOString())
  return readStoredMonster(id, options)
}

export const updateStoredGroupEntity = async <TData, TEntity>(
  id: string,
  data: unknown,
  entityOptions: StoredGroupOptions<TData>,
  relationOptions: GroupMemberRelationOptions<TData>,
): Promise<TEntity> => {
  const existing = getDatabase().prepare(`
    SELECT id, name, updated_at
    FROM ${quoteName(entityOptions.tableName)}
    WHERE id = ?
  `).get(id) as GroupRow | undefined

  if (!existing) {
    throw createNotFoundError()
  }

  const source = (typeof data === 'object' && data !== null ? data : {}) as Partial<Record<keyof TData, unknown>>
  const memberIds = getMemberIds(source[relationOptions.idsKey])
  const payload = entityOptions.normalize({
    name: existing.name,
    ...stripGroupIds<TData>(source, relationOptions),
  } as Partial<Record<keyof TData, unknown>>)
  entityOptions.validate?.(payload)
  executeGroupUpsert(entityOptions.tableName, id, payload, new Date().toISOString())
  replaceGroupMembers(id, memberIds, relationOptions)
  return readStoredGroupEntity<TData, TEntity>(id, entityOptions, relationOptions)
}

export const deleteStoredEntity = async (tableName: string, id: string): Promise<void> => {
  const result = getDatabase().prepare(`DELETE FROM ${quoteName(tableName)} WHERE id = ?`).run(id) as { changes: number }
  if (result.changes === 0) {
    throw createNotFoundError()
  }
}

export const assertStoredEntityExists = async (tableName: string, id: string): Promise<void> => {
  const row = getDatabase().prepare(`SELECT id FROM ${quoteName(tableName)} WHERE id = ?`).get(id) as EntityExistsRow | undefined
  if (!row) {
    throw createNotFoundError()
  }
}
