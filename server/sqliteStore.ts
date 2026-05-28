import { randomUUID } from 'node:crypto'
import { mkdir, readdir, readFile, stat } from 'node:fs/promises'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'

interface ApiError extends Error {
  code?: string
  statusCode?: number
}

interface EntityRow {
  id: string
  payload_json: string
  updated_at: string
}

interface EntityExistsRow {
  id: string
}

interface GroupMemberRow {
  member_id: string
}

interface MigrationRow {
  entity_type: string
}

interface StoredEntityOptions<TData, TEntity> {
  entityType: string
  normalize: (data: Partial<Record<keyof TData, unknown>>) => TData
  validate?: (data: TData) => void
  imageUrl?: (id: string) => string
}

interface MigrationOptions {
  directory: string
  entityType: string
  isSafeId: (id: string) => boolean
}

interface GroupMemberRelationOptions<TData> {
  fileNamesKey: keyof TData & string
  groupEntityType: string
  memberEntityType: string
}

const databasePath = path.resolve(process.cwd(), 'data', 'app.sqlite')
const migratedTypes = new Set<string>()
let database: Database.Database | null = null

const getDatabase = (): Database.Database => {
  if (database) {
    return database
  }

  mkdirSync(path.dirname(databasePath), { recursive: true })
  database = new Database(databasePath)
  database.exec(`
    PRAGMA journal_mode = PERSIST;
    PRAGMA synchronous = NORMAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS entities (
      entity_type TEXT NOT NULL,
      id TEXT NOT NULL,
      unique_id TEXT NOT NULL DEFAULT '',
      name TEXT NOT NULL DEFAULT '',
      payload_json TEXT NOT NULL CHECK (json_valid(payload_json)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (entity_type, id)
    );

    CREATE INDEX IF NOT EXISTS idx_entities_type_updated_at
      ON entities (entity_type, updated_at DESC);

    CREATE INDEX IF NOT EXISTS idx_entities_type_name
      ON entities (entity_type, name COLLATE NOCASE);

    CREATE INDEX IF NOT EXISTS idx_entities_type_unique_id
      ON entities (entity_type, unique_id);

    CREATE TABLE IF NOT EXISTS file_migrations (
      entity_type TEXT PRIMARY KEY,
      migrated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS group_members (
      group_entity_type TEXT NOT NULL,
      group_id TEXT NOT NULL,
      member_entity_type TEXT NOT NULL,
      member_id TEXT NOT NULL,
      position INTEGER NOT NULL,
      PRIMARY KEY (group_entity_type, group_id, member_entity_type, member_id),
      FOREIGN KEY (group_entity_type, group_id)
        REFERENCES entities(entity_type, id)
        ON DELETE CASCADE,
      FOREIGN KEY (member_entity_type, member_id)
        REFERENCES entities(entity_type, id)
        ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_group_members_group
      ON group_members (group_entity_type, group_id, position);

    CREATE INDEX IF NOT EXISTS idx_group_members_member
      ON group_members (member_entity_type, member_id);

    CREATE TABLE IF NOT EXISTS group_member_migrations (
      group_entity_type TEXT NOT NULL,
      member_entity_type TEXT NOT NULL,
      migrated_at TEXT NOT NULL,
      PRIMARY KEY (group_entity_type, member_entity_type)
    );
  `)

  return database
}

const createNotFoundError = (): ApiError => {
  const error = new Error('Entity not found') as ApiError
  error.code = 'ENOENT'
  error.statusCode = 404
  return error
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const parsePayload = <TData>(payloadJson: string): Partial<Record<keyof TData, unknown>> => {
  const parsed = JSON.parse(payloadJson.replace(/^\uFEFF/, '') || '{}') as unknown
  return isRecord(parsed) ? (parsed as Partial<Record<keyof TData, unknown>>) : {}
}

const getPayloadMetadata = (payload: unknown): { name: string; uniqueId: string } => {
  if (!isRecord(payload)) {
    return { name: '', uniqueId: '' }
  }

  return {
    name: typeof payload.name === 'string' ? payload.name : '',
    uniqueId: typeof payload.uniqueId === 'string' ? payload.uniqueId : '',
  }
}

const getFileNameMemberId = (value: unknown): string => {
  if (typeof value !== 'string') {
    return ''
  }

  const trimmed = value.trim()
  if (!trimmed.toLowerCase().endsWith('.json')) {
    return ''
  }

  return trimmed.slice(0, -5)
}

const getMemberIdsFromFileNames = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return []
  }

  const seen = new Set<string>()
  const ids: string[] = []
  for (const item of value) {
    const id = getFileNameMemberId(item)
    if (!id || seen.has(id)) {
      continue
    }

    seen.add(id)
    ids.push(id)
  }

  return ids
}

const getGroupMemberIds = (groupEntityType: string, groupId: string, memberEntityType: string): string[] => {
  const rows = getDatabase().prepare(`
    SELECT member_id
    FROM group_members
    WHERE group_entity_type = ? AND group_id = ? AND member_entity_type = ?
    ORDER BY position ASC, member_id ASC
  `).all(groupEntityType, groupId, memberEntityType) as GroupMemberRow[]

  return rows.map((row) => row.member_id)
}

const replaceGroupMembers = (
  groupEntityType: string,
  groupId: string,
  memberEntityType: string,
  memberIds: string[],
): void => {
  const db = getDatabase()
  const memberExists = db.prepare('SELECT id FROM entities WHERE entity_type = ? AND id = ?')
  const deleteMembers = db.prepare('DELETE FROM group_members WHERE group_entity_type = ? AND group_id = ? AND member_entity_type = ?')
  const insertMember = db.prepare(`
    INSERT INTO group_members (group_entity_type, group_id, member_entity_type, member_id, position)
    VALUES (?, ?, ?, ?, ?)
  `)

  deleteMembers.run(groupEntityType, groupId, memberEntityType)
  memberIds.forEach((memberId, index) => {
    const existingMember = memberExists.get(memberEntityType, memberId) as EntityExistsRow | undefined
    if (!existingMember) {
      return
    }

    insertMember.run(groupEntityType, groupId, memberEntityType, memberId, index)
  })
}

const attachGroupFileNames = <TData, TEntity>(
  entity: TEntity,
  options: GroupMemberRelationOptions<TData>,
): TEntity => {
  const id = (entity as { id: string }).id
  const memberIds = getGroupMemberIds(options.groupEntityType, id, options.memberEntityType)
  return {
    ...entity,
    [options.fileNamesKey]: memberIds.map((memberId) => `${memberId}.json`),
  }
}

const stripGroupFileNames = <TData>(
  data: Partial<Record<keyof TData, unknown>>,
  options: GroupMemberRelationOptions<TData>,
): Partial<Record<keyof TData, unknown>> => {
  return {
    ...data,
    [options.fileNamesKey]: [],
  }
}

const buildEntity = <TData, TEntity>(
  row: EntityRow,
  options: StoredEntityOptions<TData, TEntity>,
): TEntity => {
  const normalized = options.normalize(parsePayload<TData>(row.payload_json))
  return {
    id: row.id,
    ...(options.imageUrl ? { imageUrl: options.imageUrl(row.id) } : {}),
    ...normalized,
    updatedAt: row.updated_at,
  } as TEntity
}

const executeEntityInsert = (
  entityType: string,
  id: string,
  payload: unknown,
  createdAt: string,
  updatedAt: string,
): void => {
  const db = getDatabase()
  const metadata = getPayloadMetadata(payload)
  db.prepare(`
    INSERT INTO entities (entity_type, id, unique_id, name, payload_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    entityType,
    id,
    metadata.uniqueId,
    metadata.name,
    JSON.stringify(payload),
    createdAt,
    updatedAt,
  )
}

const executeEntityUpsert = (
  entityType: string,
  id: string,
  payload: unknown,
  updatedAt: string,
): void => {
  const db = getDatabase()
  const metadata = getPayloadMetadata(payload)
  db.prepare(`
    INSERT INTO entities (entity_type, id, unique_id, name, payload_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(entity_type, id) DO UPDATE SET
      unique_id = excluded.unique_id,
      name = excluded.name,
      payload_json = excluded.payload_json,
      updated_at = excluded.updated_at
  `).run(
    entityType,
    id,
    metadata.uniqueId,
    metadata.name,
    JSON.stringify(payload),
    updatedAt,
    updatedAt,
  )
}

export const migrateJsonDirectoryToSqlite = async (options: MigrationOptions): Promise<void> => {
  if (migratedTypes.has(options.entityType)) {
    return
  }

  const db = getDatabase()
  const migration = db.prepare('SELECT entity_type FROM file_migrations WHERE entity_type = ?').get(options.entityType) as MigrationRow | undefined
  if (migration) {
    migratedTypes.add(options.entityType)
    return
  }

  await mkdir(options.directory, { recursive: true })
  const entries = await readdir(options.directory, { withFileTypes: true })
  const files = entries.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.json'))
  const rows = await Promise.all(files.map(async (entry) => {
    const id = path.basename(entry.name, '.json')
    if (!options.isSafeId(id)) {
      return null
    }

    const filePath = path.join(options.directory, entry.name)
    const [rawPayload, fileInfo] = await Promise.all([
      readFile(filePath, 'utf8'),
      stat(filePath),
    ])

    return {
      id,
      payload: parsePayload(rawPayload),
      createdAt: fileInfo.birthtime.toISOString(),
      updatedAt: fileInfo.mtime.toISOString(),
    }
  }))

  db.exec('BEGIN')
  try {
    for (const row of rows) {
      if (!row) {
        continue
      }

      const exists = db.prepare('SELECT id FROM entities WHERE entity_type = ? AND id = ?').get(options.entityType, row.id) as EntityExistsRow | undefined
      if (!exists) {
        executeEntityInsert(options.entityType, row.id, row.payload, row.createdAt, row.updatedAt)
      }
    }
    db.prepare('INSERT INTO file_migrations (entity_type, migrated_at) VALUES (?, ?)').run(options.entityType, new Date().toISOString())
    db.exec('COMMIT')
    migratedTypes.add(options.entityType)
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}

export const listStoredEntities = async <TData, TEntity>(
  options: StoredEntityOptions<TData, TEntity>,
): Promise<TEntity[]> => {
  const rows = getDatabase().prepare(`
    SELECT id, payload_json, updated_at
    FROM entities
    WHERE entity_type = ?
    ORDER BY updated_at DESC, id DESC
  `).all(options.entityType) as unknown as EntityRow[]

  return rows.map((row) => buildEntity(row, options))
}

export const migrateStoredGroupMembers = async <TData>(
  options: GroupMemberRelationOptions<TData>,
): Promise<void> => {
  const db = getDatabase()
  const migration = db.prepare(`
    SELECT group_entity_type AS entity_type
    FROM group_member_migrations
    WHERE group_entity_type = ? AND member_entity_type = ?
  `).get(options.groupEntityType, options.memberEntityType) as MigrationRow | undefined

  if (migration) {
    return
  }

  const groups = db.prepare(`
    SELECT id, payload_json, updated_at
    FROM entities
    WHERE entity_type = ?
    ORDER BY updated_at DESC, id DESC
  `).all(options.groupEntityType) as EntityRow[]

  const migrate = db.transaction(() => {
    for (const group of groups) {
      const payload = parsePayload<TData>(group.payload_json)
      replaceGroupMembers(
        options.groupEntityType,
        group.id,
        options.memberEntityType,
        getMemberIdsFromFileNames(payload[options.fileNamesKey]),
      )
      executeEntityUpsert(
        options.groupEntityType,
        group.id,
        stripGroupFileNames<TData>(payload, options),
        group.updated_at,
      )
    }

    db.prepare(`
      INSERT INTO group_member_migrations (group_entity_type, member_entity_type, migrated_at)
      VALUES (?, ?, ?)
    `).run(options.groupEntityType, options.memberEntityType, new Date().toISOString())
  })

  migrate()
}

export const listStoredGroupEntities = async <TData, TEntity>(
  entityOptions: StoredEntityOptions<TData, TEntity>,
  relationOptions: GroupMemberRelationOptions<TData>,
): Promise<TEntity[]> => {
  const entities = await listStoredEntities<TData, TEntity>(entityOptions)
  return entities.map((entity) => attachGroupFileNames(entity, relationOptions))
}

export const readStoredGroupEntity = async <TData, TEntity>(
  id: string,
  entityOptions: StoredEntityOptions<TData, TEntity>,
  relationOptions: GroupMemberRelationOptions<TData>,
): Promise<TEntity> => {
  const entity = await readStoredEntity<TData, TEntity>(id, entityOptions)
  return attachGroupFileNames(entity, relationOptions)
}

export const createStoredGroupEntity = async <TData, TEntity>(
  entityOptions: StoredEntityOptions<TData, TEntity>,
  relationOptions: GroupMemberRelationOptions<TData>,
  data: Partial<Record<keyof TData, unknown>>,
): Promise<TEntity> => {
  const memberIds = getMemberIdsFromFileNames(data[relationOptions.fileNamesKey])
  const entity = await createStoredEntity<TData, TEntity>(entityOptions, stripGroupFileNames<TData>(data, relationOptions))
  replaceGroupMembers(relationOptions.groupEntityType, (entity as { id: string }).id, relationOptions.memberEntityType, memberIds)
  return readStoredGroupEntity<TData, TEntity>((entity as { id: string }).id, entityOptions, relationOptions)
}

export const updateStoredGroupEntity = async <TData, TEntity>(
  id: string,
  data: unknown,
  entityOptions: StoredEntityOptions<TData, TEntity>,
  relationOptions: GroupMemberRelationOptions<TData>,
): Promise<TEntity> => {
  const source = (typeof data === 'object' && data !== null ? data : {}) as Partial<Record<keyof TData, unknown>>
  const memberIds = getMemberIdsFromFileNames(source[relationOptions.fileNamesKey])
  await updateStoredEntity<TData, TEntity>(id, stripGroupFileNames<TData>(source, relationOptions), entityOptions)
  replaceGroupMembers(relationOptions.groupEntityType, id, relationOptions.memberEntityType, memberIds)
  return readStoredGroupEntity<TData, TEntity>(id, entityOptions, relationOptions)
}

export const readStoredEntity = async <TData, TEntity>(
  id: string,
  options: StoredEntityOptions<TData, TEntity>,
): Promise<TEntity> => {
  const row = getDatabase().prepare(`
    SELECT id, payload_json, updated_at
    FROM entities
    WHERE entity_type = ? AND id = ?
  `).get(options.entityType, id) as EntityRow | undefined

  if (!row) {
    throw createNotFoundError()
  }

  return buildEntity(row, options)
}

export const createStoredEntity = async <TData, TEntity>(
  options: StoredEntityOptions<TData, TEntity>,
  data: Partial<Record<keyof TData, unknown>> = {},
): Promise<TEntity> => {
  const id = `${Date.now()}-${randomUUID().slice(0, 8)}`
  const payload = options.normalize({
    uniqueId: randomUUID(),
    ...data,
  } as Partial<Record<keyof TData, unknown>>)
  options.validate?.(payload)
  const now = new Date().toISOString()
  executeEntityInsert(options.entityType, id, payload, now, now)
  return readStoredEntity(id, options)
}

export const updateStoredEntity = async <TData, TEntity>(
  id: string,
  data: unknown,
  options: StoredEntityOptions<TData, TEntity>,
): Promise<TEntity> => {
  const existing = getDatabase().prepare(`
    SELECT id, payload_json, updated_at
    FROM entities
    WHERE entity_type = ? AND id = ?
  `).get(options.entityType, id) as EntityRow | undefined

  if (!existing) {
    throw createNotFoundError()
  }

  const payload = options.normalize({
    ...parsePayload<TData>(existing.payload_json),
    ...(typeof data === 'object' && data !== null ? (data as Partial<Record<keyof TData, unknown>>) : {}),
  })
  options.validate?.(payload)

  executeEntityUpsert(options.entityType, id, payload, new Date().toISOString())
  return readStoredEntity(id, options)
}

export const deleteStoredEntity = async (entityType: string, id: string): Promise<void> => {
  const result = getDatabase().prepare('DELETE FROM entities WHERE entity_type = ? AND id = ?').run(entityType, id) as { changes: number }
  if (result.changes === 0) {
    throw createNotFoundError()
  }
}

export const assertStoredEntityExists = async (entityType: string, id: string): Promise<void> => {
  const row = getDatabase().prepare('SELECT id FROM entities WHERE entity_type = ? AND id = ?').get(entityType, id) as EntityExistsRow | undefined
  if (!row) {
    throw createNotFoundError()
  }
}
