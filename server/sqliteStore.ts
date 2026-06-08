import { randomUUID } from 'node:crypto'
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

interface AreaRow {
  id: string
  name: string
  description: string
  updated_at: string
}

interface EventRow {
  id: string
  name: string
  description: string
  updated_at: string
}

interface ContextRow {
  id: string
  name: string
  description: string
  updated_at: string
}

interface GroupRow {
  id: string
  name: string
  updated_at: string
}

interface PlaceRow {
  id: string
  name: string
  description: string
}

interface CharacterRow {
  id: string
  name: string
  short_description: string
  description: string
  level: number
  race: string
  class: string
  gender: string
  alignment: string
  hp: number
  surge: number
  speed: number
  bonus_level: number
  created_at: string
  updated_at: string
  [key: string]: unknown
}

interface NpcRow {
  id: string
  name: string
  role: string
  type: string
  description: string
  resistances: string
  special: string
  hp: number
  level: number
  speed: number
  is_story: number
  is_dead: number
  updated_at: string
  [key: string]: unknown
}

interface MonsterRow {
  id: string
  name: string
  role: string
  type: string
  description: string
  resistances: string
  special: string
  hp: number
  level: number
  speed: number
  updated_at: string
  [key: string]: unknown
}

interface EntityExistsRow {
  id: string
}

interface GroupMemberRow {
  member_id: string
}

export interface StoredCharacterHistoryEntry {
  id: string
  title: string
  content: string
}

export interface StoredNpcHistoryEntry {
  id: string
  title: string
  content: string
}

interface StoredEntityOptions<TData> {
  tableName: string
  normalize: (data: Partial<Record<keyof TData, unknown>>) => TData
  validate?: (data: TData) => void
  imageUrl?: (id: string) => string
}

interface StoredAreaOptions<TData> {
  normalize: (data: Partial<Record<keyof TData, unknown>>) => TData
  validate?: (data: TData) => void
  imageUrl?: (id: string) => string
}

interface StoredEventOptions<TData> {
  normalize: (data: Partial<Record<keyof TData, unknown>>) => TData
  validate?: (data: TData) => void
  imageUrl?: (id: string) => string
}

interface StoredContextOptions<TData> {
  normalize: (data: Partial<Record<keyof TData, unknown>>) => TData
  validate?: (data: TData) => void
  imageUrl?: (id: string) => string
}

interface StoredGroupOptions<TData> {
  tableName: string
  normalize: (data: Partial<Record<keyof TData, unknown>>) => TData
  validate?: (data: TData) => void
}

interface StoredCharacterOptions<TData> {
  normalize: (data: Partial<Record<keyof TData, unknown>>) => TData
  validate?: (data: TData) => void
  imageUrl?: (id: string) => string
}

interface StoredNpcOptions<TData> {
  normalize: (data: Partial<Record<keyof TData, unknown>>) => TData
  validate?: (data: TData) => void
  imageUrl?: (id: string) => string
}

interface StoredMonsterOptions<TData> {
  normalize: (data: Partial<Record<keyof TData, unknown>>) => TData
  validate?: (data: TData) => void
  imageUrl?: (id: string) => string
}

interface GroupMemberRelationOptions<TData> {
  idsKey: keyof TData & string
  groupTableName: string
  memberTableName: string
  relationTableName: string
  memberColumnName: string
}

const databasePath = path.resolve(process.cwd(), 'data', 'app.sqlite')
let database: Database.Database | null = null

const payloadEntityTables = [
  'adventures',
] as const

const groupTableConfigs = [
  {
    tableName: 'character_groups',
    memberTableName: 'characters',
    relationTableName: 'character_group_members',
    memberColumnName: 'character_id',
    idsKey: 'characterIds',
  },
  {
    tableName: 'monster_groups',
    memberTableName: 'monsters',
    relationTableName: 'monster_group_members',
    memberColumnName: 'monster_id',
    idsKey: 'monsterIds',
  },
  {
    tableName: 'npc_groups',
    memberTableName: 'npcs',
    relationTableName: 'npc_group_members',
    memberColumnName: 'npc_id',
    idsKey: 'npcIds',
  },
] as const

const characterAttributes = ['strength', 'condition', 'dexterity', 'intelligence', 'wisdom', 'charisma'] as const
const characterDefences = ['kp', 'fortitude', 'reflex', 'will'] as const
const characterSkills = ['acrobatics', 'arcana', 'athletics', 'diplomacy', 'history', 'healing', 'deception', 'perception', 'endurance', 'dungeons', 'nature', 'religion', 'insight', 'stealth', 'streetwise', 'intimidation', 'thievery'] as const

const assertSafeSqlName = (name: string): void => {
  if (!/^[a-z][a-z0-9_]*$/i.test(name)) {
    throw new Error(`Unsafe SQL identifier: ${name}`)
  }
}

const quoteName = (name: string): string => {
  assertSafeSqlName(name)
  return `"${name}"`
}

const createEntityTableSql = (tableName: string): string => {
  const quotedTable = quoteName(tableName)
  return `
    CREATE TABLE IF NOT EXISTS ${quotedTable} (
      id TEXT PRIMARY KEY,
      unique_id TEXT NOT NULL DEFAULT '',
      name TEXT NOT NULL DEFAULT '',
      payload_json TEXT NOT NULL CHECK (json_valid(payload_json)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS ${quoteName(`idx_${tableName}_updated_at`)}
      ON ${quotedTable} (updated_at DESC);

    CREATE INDEX IF NOT EXISTS ${quoteName(`idx_${tableName}_name`)}
      ON ${quotedTable} (name COLLATE NOCASE);
  `
}

const ensureEntityUniqueIdIndexes = (db: Database.Database): void => {
  for (const tableName of payloadEntityTables) {
    const columns = db.prepare(`PRAGMA table_info(${quoteName(tableName)})`).all() as { name: string }[]
    if (!columns.some((column) => column.name === 'unique_id')) {
      continue
    }

    db.exec(`
      CREATE INDEX IF NOT EXISTS ${quoteName(`idx_${tableName}_unique_id`)}
        ON ${quoteName(tableName)} (unique_id);
    `)
  }
}

const ensureColumn = (db: Database.Database, tableName: string, columnName: string, definition: string): void => {
  const columns = db.prepare(`PRAGMA table_info(${quoteName(tableName)})`).all() as { name: string }[]
  if (columns.some((column) => column.name === columnName)) {
    return
  }

  db.exec(`ALTER TABLE ${quoteName(tableName)} ADD COLUMN ${quoteName(columnName)} ${definition};`)
}

const ensureMonsterAndNpcSuggestedColumns = (db: Database.Database): void => {
  ensureColumn(db, 'monsters', 'suggested_custom_damage', "TEXT NOT NULL DEFAULT ''")
  ensureColumn(db, 'npcs', 'suggested_custom_damage', "TEXT NOT NULL DEFAULT ''")
}

const ensureCharacterTables = (db: Database.Database): void => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS characters (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT '',
      short_description TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      level INTEGER NOT NULL DEFAULT 1,
      race TEXT NOT NULL DEFAULT '',
      "class" TEXT NOT NULL DEFAULT '',
      gender TEXT NOT NULL DEFAULT '',
      alignment TEXT NOT NULL DEFAULT '',
      hp INTEGER NOT NULL DEFAULT 0,
      surge INTEGER NOT NULL DEFAULT 0,
      speed INTEGER NOT NULL DEFAULT 0,
      bonus_level INTEGER NOT NULL DEFAULT 0,
      ${characterAttributes.map((attribute) => `bonus_attribute_${attribute} INTEGER NOT NULL DEFAULT 0`).join(',\n      ')},
      ${characterSkills.map((skill) => `bonus_skill_${skill} INTEGER NOT NULL DEFAULT 0`).join(',\n      ')},
      ${characterDefences.map((defence) => `bonus_defence_${defence} INTEGER NOT NULL DEFAULT 0`).join(',\n      ')},
      ${characterDefences.map((defence) => `defence_${defence} INTEGER NOT NULL DEFAULT 0`).join(',\n      ')},
      ${characterSkills.map((skill) => `training_${skill} INTEGER NOT NULL DEFAULT 0`).join(',\n      ')},
      ${characterAttributes.map((attribute) => `attribute_${attribute} INTEGER NOT NULL DEFAULT 0`).join(',\n      ')},
      ${characterAttributes.map((attribute) => `attribute_${attribute}_plus INTEGER NOT NULL DEFAULT 0`).join(',\n      ')},
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_characters_updated_at ON characters (updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_characters_name ON characters (name COLLATE NOCASE);

    CREATE TABLE IF NOT EXISTS characters_abilities (
      character_id TEXT NOT NULL,
      id TEXT NOT NULL,
      position INTEGER NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      action TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL DEFAULT '',
      kind TEXT NOT NULL DEFAULT '',
      weapon_count INTEGER NOT NULL DEFAULT 0,
      weapon_id TEXT NOT NULL DEFAULT '',
      weapon_damage_dice_type TEXT NOT NULL DEFAULT '',
      weapon_damage_dice_count INTEGER NOT NULL DEFAULT 0,
      weapon_attribute_bonus TEXT NOT NULL DEFAULT '',
      weapon_attack_bonus_number INTEGER NOT NULL DEFAULT 0,
      weapon_attack_attribute TEXT NOT NULL DEFAULT '',
      weapon_attack_defence TEXT NOT NULL DEFAULT '',
      weapon_damage_type TEXT NOT NULL DEFAULT '',
      weapon_recurring_damage_count INTEGER NOT NULL DEFAULT 0,
      weapon_recurring_damage_type TEXT NOT NULL DEFAULT '',
      weapon_hit TEXT NOT NULL DEFAULT '',
      weapon_miss TEXT NOT NULL DEFAULT '',
      weapon_provocation TEXT NOT NULL DEFAULT '',
      weapon_range INTEGER NOT NULL DEFAULT 0,
      weapon_area TEXT NOT NULL DEFAULT '',
      PRIMARY KEY (character_id, id),
      FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS characters_feats (
      character_id TEXT NOT NULL,
      id TEXT NOT NULL,
      position INTEGER NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      visible INTEGER NOT NULL DEFAULT 1,
      speed_bonus INTEGER NOT NULL DEFAULT 0,
      hp_bonus INTEGER NOT NULL DEFAULT 0,
      ${characterDefences.map((defence) => `defence_${defence}_bonus INTEGER NOT NULL DEFAULT 0`).join(',\n      ')},
      ${characterSkills.map((skill) => `skill_${skill}_bonus INTEGER NOT NULL DEFAULT 0`).join(',\n      ')},
      PRIMARY KEY (character_id, id),
      FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS characters_items (
      character_id TEXT NOT NULL,
      id TEXT NOT NULL,
      position INTEGER NOT NULL,
      item_type TEXT NOT NULL DEFAULT '',
      name TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      equipped INTEGER NOT NULL DEFAULT 0,
      damage_dice_count INTEGER NOT NULL DEFAULT 0,
      damage_dice_type TEXT NOT NULL DEFAULT '',
      damage_bonus INTEGER NOT NULL DEFAULT 0,
      range INTEGER NOT NULL DEFAULT 0,
      weapon_proficiency_bonus INTEGER NOT NULL DEFAULT 0,
      ${characterAttributes.map((attribute) => `attribute_${attribute}_bonus INTEGER NOT NULL DEFAULT 0`).join(',\n      ')},
      speed_bonus INTEGER NOT NULL DEFAULT 0,
      armor_penalty INTEGER NOT NULL DEFAULT 0,
      ${characterDefences.map((defence) => `defence_${defence}_bonus INTEGER NOT NULL DEFAULT 0`).join(',\n      ')},
      PRIMARY KEY (character_id, id),
      FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
    );
  `)
}

const ensureCombatantTables = (db: Database.Database): void => {
  for (const tableName of ['npcs', 'monsters'] as const) {
    const isNpc = tableName === 'npcs'
    const ownerColumn = isNpc ? 'npc_id' : 'monster_id'
    const attacksTable = isNpc ? 'npcs_attacks' : 'monsters_attacks'
    const itemsTable = isNpc ? 'npcs_items' : 'monsters_items'

    db.exec(`
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL DEFAULT '',
        role TEXT NOT NULL DEFAULT '',
        type TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        resistances TEXT NOT NULL DEFAULT '',
        special TEXT NOT NULL DEFAULT '',
        hp INTEGER NOT NULL DEFAULT 0,
        level INTEGER NOT NULL DEFAULT 1,
        speed INTEGER NOT NULL DEFAULT 0,
        ${isNpc ? 'is_story INTEGER NOT NULL DEFAULT 0,\n        is_dead INTEGER NOT NULL DEFAULT 0,' : ''}
        ${characterDefences.map((defence) => `defence_${defence} INTEGER NOT NULL DEFAULT 0`).join(',\n        ')},
        suggested_attack_vs_kp TEXT NOT NULL DEFAULT '',
        suggested_attack_vs_other_defences TEXT NOT NULL DEFAULT '',
        suggested_low_damage TEXT NOT NULL DEFAULT '',
        suggested_medium_damage TEXT NOT NULL DEFAULT '',
        suggested_high_damage TEXT NOT NULL DEFAULT '',
        suggested_custom_damage TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS ${quoteName(`idx_${tableName}_updated_at`)} ON ${quoteName(tableName)} (updated_at DESC);
      CREATE INDEX IF NOT EXISTS ${quoteName(`idx_${tableName}_name`)} ON ${quoteName(tableName)} (name COLLATE NOCASE);

      CREATE TABLE IF NOT EXISTS ${attacksTable} (
        ${ownerColumn} TEXT NOT NULL,
        id TEXT NOT NULL,
        position INTEGER NOT NULL,
        name TEXT NOT NULL DEFAULT '',
        action TEXT NOT NULL DEFAULT '',
        type TEXT NOT NULL DEFAULT '',
        range INTEGER NOT NULL DEFAULT 0,
        area TEXT NOT NULL DEFAULT '',
        attack_bonus_number INTEGER NOT NULL DEFAULT 0,
        attack_defence TEXT NOT NULL DEFAULT '',
        attack_not_applicable INTEGER NOT NULL DEFAULT 0,
        description TEXT NOT NULL DEFAULT '',
        PRIMARY KEY (${ownerColumn}, id),
        FOREIGN KEY (${ownerColumn}) REFERENCES ${tableName}(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS ${itemsTable} (
        ${ownerColumn} TEXT NOT NULL,
        id TEXT NOT NULL,
        position INTEGER NOT NULL,
        item_type TEXT NOT NULL DEFAULT '',
        name TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        equipped INTEGER NOT NULL DEFAULT 0,
        damage_dice_count INTEGER NOT NULL DEFAULT 0,
        damage_dice_type TEXT NOT NULL DEFAULT '',
        damage_bonus INTEGER NOT NULL DEFAULT 0,
        range INTEGER NOT NULL DEFAULT 0,
        weapon_proficiency_bonus INTEGER NOT NULL DEFAULT 0,
        ${characterAttributes.map((attribute) => `attribute_${attribute}_bonus INTEGER NOT NULL DEFAULT 0`).join(',\n        ')},
        speed_bonus INTEGER NOT NULL DEFAULT 0,
        armor_penalty INTEGER NOT NULL DEFAULT 0,
        ${characterDefences.map((defence) => `defence_${defence}_bonus INTEGER NOT NULL DEFAULT 0`).join(',\n        ')},
        PRIMARY KEY (${ownerColumn}, id),
        FOREIGN KEY (${ownerColumn}) REFERENCES ${tableName}(id) ON DELETE CASCADE
      );
    `)
  }
}

const ensureGroupTables = (db: Database.Database): void => {
  for (const config of groupTableConfigs) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS ${quoteName(config.tableName)} (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS ${quoteName(`idx_${config.tableName}_updated_at`)}
        ON ${quoteName(config.tableName)} (updated_at DESC);

      CREATE INDEX IF NOT EXISTS ${quoteName(`idx_${config.tableName}_name`)}
        ON ${quoteName(config.tableName)} (name COLLATE NOCASE);
    `)
  }
}

const ensureAreaTables = (db: Database.Database): void => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS places (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS areas (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS area_places (
      area_id TEXT NOT NULL,
      place_id TEXT NOT NULL,
      position INTEGER NOT NULL,
      PRIMARY KEY (area_id, place_id),
      FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE,
      FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_area_places_area ON area_places (area_id, position);
    CREATE INDEX IF NOT EXISTS idx_area_places_place ON area_places (place_id);
    CREATE INDEX IF NOT EXISTS idx_areas_updated_at ON areas (updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_areas_name ON areas (name COLLATE NOCASE);
  `)
}

const ensureEventTables = (db: Database.Database): void => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_events_updated_at ON events (updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_events_name ON events (name COLLATE NOCASE);
  `)
}

const createContextRelationTables = (db: Database.Database): void => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS context_characters (
      context_id TEXT NOT NULL,
      character_id TEXT NOT NULL,
      position INTEGER NOT NULL,
      PRIMARY KEY (context_id, character_id),
      FOREIGN KEY (context_id) REFERENCES contexts(id) ON DELETE CASCADE,
      FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS context_character_groups (
      context_id TEXT NOT NULL,
      group_id TEXT NOT NULL,
      position INTEGER NOT NULL,
      PRIMARY KEY (context_id, group_id),
      FOREIGN KEY (context_id) REFERENCES contexts(id) ON DELETE CASCADE,
      FOREIGN KEY (group_id) REFERENCES character_groups(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS context_character_group_members (
      context_id TEXT NOT NULL,
      group_id TEXT NOT NULL,
      character_id TEXT NOT NULL,
      position INTEGER NOT NULL,
      PRIMARY KEY (context_id, group_id, character_id),
      FOREIGN KEY (context_id, group_id) REFERENCES context_character_groups(context_id, group_id) ON DELETE CASCADE,
      FOREIGN KEY (group_id, character_id) REFERENCES character_group_members(group_id, character_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS context_npc_groups (
      context_id TEXT NOT NULL,
      group_id TEXT NOT NULL,
      position INTEGER NOT NULL,
      PRIMARY KEY (context_id, group_id),
      FOREIGN KEY (context_id) REFERENCES contexts(id) ON DELETE CASCADE,
      FOREIGN KEY (group_id) REFERENCES npc_groups(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS context_npc_group_members (
      context_id TEXT NOT NULL,
      group_id TEXT NOT NULL,
      npc_id TEXT NOT NULL,
      position INTEGER NOT NULL,
      PRIMARY KEY (context_id, group_id, npc_id),
      FOREIGN KEY (context_id, group_id) REFERENCES context_npc_groups(context_id, group_id) ON DELETE CASCADE,
      FOREIGN KEY (group_id, npc_id) REFERENCES npc_group_members(group_id, npc_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS context_monster_groups (
      context_id TEXT NOT NULL,
      group_id TEXT NOT NULL,
      position INTEGER NOT NULL,
      PRIMARY KEY (context_id, group_id),
      FOREIGN KEY (context_id) REFERENCES contexts(id) ON DELETE CASCADE,
      FOREIGN KEY (group_id) REFERENCES monster_groups(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS context_monster_group_members (
      context_id TEXT NOT NULL,
      group_id TEXT NOT NULL,
      monster_id TEXT NOT NULL,
      position INTEGER NOT NULL,
      PRIMARY KEY (context_id, group_id, monster_id),
      FOREIGN KEY (context_id, group_id) REFERENCES context_monster_groups(context_id, group_id) ON DELETE CASCADE,
      FOREIGN KEY (group_id, monster_id) REFERENCES monster_group_members(group_id, monster_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS context_areas (
      context_id TEXT NOT NULL,
      area_id TEXT NOT NULL,
      position INTEGER NOT NULL,
      PRIMARY KEY (context_id, area_id),
      FOREIGN KEY (context_id) REFERENCES contexts(id) ON DELETE CASCADE,
      FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS context_area_places (
      context_id TEXT NOT NULL,
      area_id TEXT NOT NULL,
      place_id TEXT NOT NULL,
      position INTEGER NOT NULL,
      PRIMARY KEY (context_id, area_id, place_id),
      FOREIGN KEY (context_id, area_id) REFERENCES context_areas(context_id, area_id) ON DELETE CASCADE,
      FOREIGN KEY (area_id, place_id) REFERENCES area_places(area_id, place_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS context_events (
      context_id TEXT NOT NULL,
      event_id TEXT NOT NULL,
      position INTEGER NOT NULL,
      PRIMARY KEY (context_id, event_id),
      FOREIGN KEY (context_id) REFERENCES contexts(id) ON DELETE CASCADE,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    );
  `)
}

const ensureContextTables = (db: Database.Database): void => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS contexts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `)

  createContextRelationTables(db)

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_contexts_updated_at ON contexts (updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_contexts_name ON contexts (name COLLATE NOCASE);
    CREATE INDEX IF NOT EXISTS idx_context_characters_context ON context_characters (context_id, position);
    CREATE INDEX IF NOT EXISTS idx_context_character_groups_context ON context_character_groups (context_id, position);
    CREATE INDEX IF NOT EXISTS idx_context_character_group_members_group ON context_character_group_members (context_id, group_id, position);
    CREATE INDEX IF NOT EXISTS idx_context_npc_groups_context ON context_npc_groups (context_id, position);
    CREATE INDEX IF NOT EXISTS idx_context_npc_group_members_group ON context_npc_group_members (context_id, group_id, position);
    CREATE INDEX IF NOT EXISTS idx_context_monster_groups_context ON context_monster_groups (context_id, position);
    CREATE INDEX IF NOT EXISTS idx_context_monster_group_members_group ON context_monster_group_members (context_id, group_id, position);
    CREATE INDEX IF NOT EXISTS idx_context_areas_context ON context_areas (context_id, position);
    CREATE INDEX IF NOT EXISTS idx_context_area_places_area ON context_area_places (context_id, area_id, position);
    CREATE INDEX IF NOT EXISTS idx_context_events_context ON context_events (context_id, position);
  `)
}
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

    ${payloadEntityTables.map((tableName) => createEntityTableSql(tableName)).join('\n')}

  `)

  ensureEntityUniqueIdIndexes(database)
  ensureCharacterTables(database)
  ensureCombatantTables(database)
  ensureMonsterAndNpcSuggestedColumns(database)
  ensureGroupTables(database)
  database.exec(`
    CREATE TABLE IF NOT EXISTS character_group_members (
      group_id TEXT NOT NULL,
      character_id TEXT NOT NULL,
      position INTEGER NOT NULL,
      PRIMARY KEY (group_id, character_id),
      FOREIGN KEY (group_id) REFERENCES character_groups(id) ON DELETE CASCADE,
      FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_character_group_members_group
      ON character_group_members (group_id, position);

    CREATE INDEX IF NOT EXISTS idx_character_group_members_character
      ON character_group_members (character_id);

    CREATE TABLE IF NOT EXISTS monster_group_members (
      group_id TEXT NOT NULL,
      monster_id TEXT NOT NULL,
      position INTEGER NOT NULL,
      PRIMARY KEY (group_id, monster_id),
      FOREIGN KEY (group_id) REFERENCES monster_groups(id) ON DELETE CASCADE,
      FOREIGN KEY (monster_id) REFERENCES monsters(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_monster_group_members_group
      ON monster_group_members (group_id, position);

    CREATE INDEX IF NOT EXISTS idx_monster_group_members_monster
      ON monster_group_members (monster_id);

    CREATE TABLE IF NOT EXISTS npc_group_members (
      group_id TEXT NOT NULL,
      npc_id TEXT NOT NULL,
      position INTEGER NOT NULL,
      PRIMARY KEY (group_id, npc_id),
      FOREIGN KEY (group_id) REFERENCES npc_groups(id) ON DELETE CASCADE,
      FOREIGN KEY (npc_id) REFERENCES npcs(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_npc_group_members_group
      ON npc_group_members (group_id, position);

    CREATE INDEX IF NOT EXISTS idx_npc_group_members_npc
      ON npc_group_members (npc_id);

    CREATE TABLE IF NOT EXISTS character_history_entries (
      character_id TEXT NOT NULL,
      id TEXT NOT NULL,
      position INTEGER NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      PRIMARY KEY (character_id, id),
      FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_character_history_entries_character
      ON character_history_entries (character_id, position);

    CREATE TABLE IF NOT EXISTS npc_history_entries (
      npc_id TEXT NOT NULL,
      id TEXT NOT NULL,
      position INTEGER NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      PRIMARY KEY (npc_id, id),
      FOREIGN KEY (npc_id) REFERENCES npcs(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_npc_history_entries_npc
      ON npc_history_entries (npc_id, position);
  `)
  ensureAreaTables(database)
  ensureEventTables(database)
  ensureContextTables(database)

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

const getMemberId = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : ''
}

const getMemberIds = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return []
  }

  const seen = new Set<string>()
  const ids: string[] = []
  for (const item of value) {
    const id = getMemberId(item)
    if (!id || seen.has(id)) {
      continue
    }

    seen.add(id)
    ids.push(id)
  }

  return ids
}

const buildEntity = <TData, TEntity>(
  row: EntityRow,
  options: StoredEntityOptions<TData>,
): TEntity => {
  const normalized = options.normalize(parsePayload<TData>(row.payload_json))
  return {
    id: row.id,
    ...(options.imageUrl ? { imageUrl: options.imageUrl(row.id) } : {}),
    ...normalized,
    updatedAt: row.updated_at,
  } as TEntity
}

const normalizeStoredText = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : ''
}

const getAreaPlaces = (areaId: string): PlaceRow[] => {
  return getDatabase().prepare(`
    SELECT places.id, places.name, places.description
    FROM area_places
    INNER JOIN places ON places.id = area_places.place_id
    WHERE area_places.area_id = ?
    ORDER BY area_places.position ASC, places.id ASC
  `).all(areaId) as PlaceRow[]
}

const buildArea = <TData, TEntity>(
  row: AreaRow,
  options: StoredAreaOptions<TData>,
): TEntity => {
  const normalized = options.normalize({
    name: row.name,
    description: row.description,
    places: getAreaPlaces(row.id),
  } as Partial<Record<keyof TData, unknown>>)
  return {
    id: row.id,
    ...(options.imageUrl ? { imageUrl: options.imageUrl(row.id) } : {}),
    ...normalized,
    updatedAt: row.updated_at,
  } as TEntity
}

const buildEvent = <TData, TEntity>(
  row: EventRow,
  options: StoredEventOptions<TData>,
): TEntity => {
  const normalized = options.normalize({
    name: row.name,
    description: row.description,
  } as Partial<Record<keyof TData, unknown>>)
  return {
    id: row.id,
    ...(options.imageUrl ? { imageUrl: options.imageUrl(row.id) } : {}),
    ...normalized,
    updatedAt: row.updated_at,
  } as TEntity
}

const getContextCharacters = (contextId: string): string[] => {
  const rows = getDatabase().prepare(`
    SELECT character_id AS member_id
    FROM context_characters
    WHERE context_id = ?
    ORDER BY position ASC, character_id ASC
  `).all(contextId) as GroupMemberRow[]

  return rows.map((row) => row.member_id)
}

const getContextEvents = (contextId: string): string[] => {
  const rows = getDatabase().prepare(`
    SELECT event_id AS member_id
    FROM context_events
    WHERE context_id = ?
    ORDER BY position ASC, event_id ASC
  `).all(contextId) as GroupMemberRow[]

  return rows.map((row) => row.member_id)
}

const getContextGroupedIds = (
  contextId: string,
  groupTableName: string,
  contextGroupTableName: string,
  contextMemberTableName: string,
  memberColumnName: string,
  idsKey: string,
): Record<string, unknown>[] => {
  const groups = getDatabase().prepare(`
    SELECT ${quoteName(contextGroupTableName)}.group_id AS id, ${quoteName(groupTableName)}.name
    FROM ${quoteName(contextGroupTableName)}
    INNER JOIN ${quoteName(groupTableName)} ON ${quoteName(groupTableName)}.id = ${quoteName(contextGroupTableName)}.group_id
    WHERE ${quoteName(contextGroupTableName)}.context_id = ?
    ORDER BY ${quoteName(contextGroupTableName)}.position ASC, ${quoteName(contextGroupTableName)}.group_id ASC
  `).all(contextId) as { id: string; name: string }[]

  const selectMembers = getDatabase().prepare(`
    SELECT ${quoteName(memberColumnName)} AS member_id
    FROM ${quoteName(contextMemberTableName)}
    WHERE context_id = ? AND group_id = ?
    ORDER BY position ASC, ${quoteName(memberColumnName)} ASC
  `)

  return groups.map((group) => ({
    id: group.id,
    name: group.name,
    [idsKey]: (selectMembers.all(contextId, group.id) as GroupMemberRow[]).map((row) => row.member_id),
  }))
}

const getContextAreas = (contextId: string): Record<string, unknown>[] => {
  const areas = getDatabase().prepare(`
    SELECT context_areas.area_id AS id, areas.name
    FROM context_areas
    INNER JOIN areas ON areas.id = context_areas.area_id
    WHERE context_areas.context_id = ?
    ORDER BY context_areas.position ASC, context_areas.area_id ASC
  `).all(contextId) as { id: string; name: string }[]

  const selectPlaces = getDatabase().prepare(`
    SELECT place_id AS member_id
    FROM context_area_places
    WHERE context_id = ? AND area_id = ?
    ORDER BY position ASC, place_id ASC
  `)

  return areas.map((area) => ({
    id: area.id,
    name: area.name,
    placeIds: (selectPlaces.all(contextId, area.id) as GroupMemberRow[]).map((row) => row.member_id),
  }))
}

const buildContext = <TData, TEntity>(
  row: ContextRow,
  options: StoredContextOptions<TData>,
): TEntity => {
  const normalized = options.normalize({
    name: row.name,
    description: row.description,
    characters: getContextCharacters(row.id),
    characterGroups: getContextGroupedIds(row.id, 'character_groups', 'context_character_groups', 'context_character_group_members', 'character_id', 'characterIds'),
    events: getContextEvents(row.id),
    npcGroups: getContextGroupedIds(row.id, 'npc_groups', 'context_npc_groups', 'context_npc_group_members', 'npc_id', 'npcIds'),
    monsterGroups: getContextGroupedIds(row.id, 'monster_groups', 'context_monster_groups', 'context_monster_group_members', 'monster_id', 'monsterIds'),
    areas: getContextAreas(row.id),
  } as Partial<Record<keyof TData, unknown>>)
  return {
    id: row.id,
    ...(options.imageUrl ? { imageUrl: options.imageUrl(row.id) } : {}),
    ...normalized,
    updatedAt: row.updated_at,
  } as TEntity
}

const buildGroup = <TData, TEntity>(
  row: GroupRow,
  options: StoredGroupOptions<TData>,
): TEntity => {
  const normalized = options.normalize({
    name: row.name,
  } as Partial<Record<keyof TData, unknown>>)
  return {
    id: row.id,
    ...normalized,
    updatedAt: row.updated_at,
  } as TEntity
}

const rowNumber = (row: Record<string, unknown>, key: string): number => {
  const value = row[key]
  return typeof value === 'number' && Number.isFinite(value) ? Math.trunc(value) : 0
}

const rowText = (row: Record<string, unknown>, key: string): string => {
  const value = row[key]
  return typeof value === 'string' ? value : ''
}

const getCharacterAbilities = (characterId: string): Record<string, unknown>[] => {
  return getDatabase().prepare(`
    SELECT *
    FROM characters_abilities
    WHERE character_id = ?
    ORDER BY position ASC, id ASC
  `).all(characterId) as Record<string, unknown>[]
}

const getCharacterFeats = (characterId: string): Record<string, unknown>[] => {
  return getDatabase().prepare(`
    SELECT *
    FROM characters_feats
    WHERE character_id = ?
    ORDER BY position ASC, id ASC
  `).all(characterId) as Record<string, unknown>[]
}

const getCharacterItems = (characterId: string): Record<string, unknown>[] => {
  return getDatabase().prepare(`
    SELECT *
    FROM characters_items
    WHERE character_id = ?
    ORDER BY item_type ASC, position ASC, id ASC
  `).all(characterId) as Record<string, unknown>[]
}

const mapStoredItem = (item: Record<string, unknown>): Record<string, unknown> => ({
  id: rowText(item, 'id'),
  name: rowText(item, 'name'),
  description: rowText(item, 'description'),
  equipped: rowNumber(item, 'equipped') === 1,
  strengthBonusNumber: rowNumber(item, 'attribute_strength_bonus'),
  conditionBonusNumber: rowNumber(item, 'attribute_condition_bonus'),
  dexterityBonusNumber: rowNumber(item, 'attribute_dexterity_bonus'),
  intelligenceBonusNumber: rowNumber(item, 'attribute_intelligence_bonus'),
  wisdomBonusNumber: rowNumber(item, 'attribute_wisdom_bonus'),
  charismaBonusNumber: rowNumber(item, 'attribute_charisma_bonus'),
  speedBonusNumber: rowNumber(item, 'speed_bonus'),
  kpBonusNumber: rowNumber(item, 'defence_kp_bonus'),
  fortitudeBonusNumber: rowNumber(item, 'defence_fortitude_bonus'),
  reflexBonusNumber: rowNumber(item, 'defence_reflex_bonus'),
  willBonusNumber: rowNumber(item, 'defence_will_bonus'),
})

const buildCharacterPayload = (row: CharacterRow): Partial<Record<string, unknown>> => {
  const attributes: Record<string, number> = {}
  const attributesPlus: Record<string, number> = {}
  const bonusAttributes: Record<string, number> = {}
  for (const attribute of characterAttributes) {
    attributes[attribute] = rowNumber(row, `attribute_${attribute}`)
    attributesPlus[attribute] = rowNumber(row, `attribute_${attribute}_plus`)
    bonusAttributes[attribute] = rowNumber(row, `bonus_attribute_${attribute}`)
  }

  const training: Record<string, boolean> = {}
  const bonusSkills: Record<string, number> = {}
  for (const skill of characterSkills) {
    training[skill] = rowNumber(row, `training_${skill}`) === 1
    bonusSkills[skill] = rowNumber(row, `bonus_skill_${skill}`)
  }

  const defenses: Record<string, number> = {}
  const bonusDefenses: Record<string, number> = {}
  for (const defence of characterDefences) {
    defenses[defence] = rowNumber(row, `defence_${defence}`)
    bonusDefenses[defence] = rowNumber(row, `bonus_defence_${defence}`)
  }

  const abilities = getCharacterAbilities(row.id).map((ability) => ({
    id: rowText(ability, 'id'),
    name: rowText(ability, 'name'),
    description: rowText(ability, 'description'),
    action: rowText(ability, 'action'),
    type: rowText(ability, 'type'),
    kind: rowText(ability, 'kind'),
    weaponCount: rowNumber(ability, 'weapon_count'),
    weaponId: rowText(ability, 'weapon_id'),
    weaponDamageDiceType: rowText(ability, 'weapon_damage_dice_type'),
    weaponDamageDiceCount: rowNumber(ability, 'weapon_damage_dice_count'),
    weaponAttributeBonus: rowText(ability, 'weapon_attribute_bonus'),
    weaponAttackBonusNumber: rowNumber(ability, 'weapon_attack_bonus_number'),
    weaponAttackAttribute: rowText(ability, 'weapon_attack_attribute'),
    weaponAttackDefense: rowText(ability, 'weapon_attack_defence'),
    weaponDamageType: rowText(ability, 'weapon_damage_type'),
    weaponRecurringDamageCount: rowNumber(ability, 'weapon_recurring_damage_count'),
    weaponRecurringDamageType: rowText(ability, 'weapon_recurring_damage_type'),
    weaponHit: rowText(ability, 'weapon_hit'),
    weaponMiss: rowText(ability, 'weapon_miss'),
    weaponProvocation: rowText(ability, 'weapon_provocation'),
    weaponRange: rowNumber(ability, 'weapon_range'),
    weaponArea: rowText(ability, 'weapon_area'),
  }))

  const feats = getCharacterFeats(row.id).map((feat) => {
    const nextFeat: Record<string, unknown> = {
      id: rowText(feat, 'id'),
      name: rowText(feat, 'name'),
      description: rowText(feat, 'description'),
      visible: rowNumber(feat, 'visible') === 1,
      speedBonusNumber: rowNumber(feat, 'speed_bonus'),
      hpBonusNumber: rowNumber(feat, 'hp_bonus'),
    }
    for (const defence of characterDefences) {
      nextFeat[`${defence}BonusNumber`] = rowNumber(feat, `defence_${defence}_bonus`)
    }
    for (const skill of characterSkills) {
      nextFeat[`${skill}BonusNumber`] = rowNumber(feat, `skill_${skill}_bonus`)
    }
    return nextFeat
  })

  const items = { armors: [] as Record<string, unknown>[], weapons: [] as Record<string, unknown>[], others: [] as Record<string, unknown>[] }
  for (const item of getCharacterItems(row.id)) {
    const nextItem = mapStoredItem(item)
    const itemType = rowText(item, 'item_type')
    if (itemType === 'weapon') {
      items.weapons.push({
        ...nextItem,
        damageDiceCount: rowNumber(item, 'damage_dice_count'),
        damageDiceType: rowText(item, 'damage_dice_type'),
        damageBonusNumber: rowNumber(item, 'damage_bonus'),
        range: rowNumber(item, 'range'),
        weaponProficiencyBonusNumber: rowNumber(item, 'weapon_proficiency_bonus'),
      })
    } else if (itemType === 'armor') {
      items.armors.push({
        ...nextItem,
        armorPenaltyNumber: rowNumber(item, 'armor_penalty'),
      })
    } else {
      items.others.push(nextItem)
    }
  }

  return {
    uniqueId: row.id,
    name: row.name,
    shortDescription: row.short_description,
    description: row.description,
    level: row.level,
    race: row.race,
    class: row.class,
    gender: row.gender,
    alignment: row.alignment,
    hp: row.hp,
    surge: row.surge,
    speed: row.speed,
    attributes,
    attributesPlus,
    abilities,
    feats,
    items,
    bonuses: {
      level: row.bonus_level,
      attributes: bonusAttributes,
      skills: bonusSkills,
      defenses: bonusDefenses,
    },
    defenses,
    training,
  }
}

const getNpcAttacks = (npcId: string): Record<string, unknown>[] => {
  return getDatabase().prepare(`
    SELECT *
    FROM npcs_attacks
    WHERE npc_id = ?
    ORDER BY position ASC, id ASC
  `).all(npcId) as Record<string, unknown>[]
}

const getNpcItems = (npcId: string): Record<string, unknown>[] => {
  return getDatabase().prepare(`
    SELECT *
    FROM npcs_items
    WHERE npc_id = ?
    ORDER BY item_type ASC, position ASC, id ASC
  `).all(npcId) as Record<string, unknown>[]
}

const getNpcHistoryEntries = (npcId: string): StoredNpcHistoryEntry[] => {
  return getDatabase().prepare(`
    SELECT id, title, content
    FROM npc_history_entries
    WHERE npc_id = ?
    ORDER BY position ASC, id ASC
  `).all(npcId) as StoredNpcHistoryEntry[]
}

const getMonsterAttacks = (monsterId: string): Record<string, unknown>[] => {
  return getDatabase().prepare(`
    SELECT *
    FROM monsters_attacks
    WHERE monster_id = ?
    ORDER BY position ASC, id ASC
  `).all(monsterId) as Record<string, unknown>[]
}

const getMonsterItems = (monsterId: string): Record<string, unknown>[] => {
  return getDatabase().prepare(`
    SELECT *
    FROM monsters_items
    WHERE monster_id = ?
    ORDER BY item_type ASC, position ASC, id ASC
  `).all(monsterId) as Record<string, unknown>[]
}

const buildMonsterOrNpcItems = (rows: Record<string, unknown>[]): { armors: Record<string, unknown>[]; weapons: Record<string, unknown>[]; others: Record<string, unknown>[] } => {
  const items = { armors: [] as Record<string, unknown>[], weapons: [] as Record<string, unknown>[], others: [] as Record<string, unknown>[] }
  for (const item of rows) {
    const nextItem = mapStoredItem(item)
    const itemType = rowText(item, 'item_type')
    if (itemType === 'weapon') {
      items.weapons.push({
        ...nextItem,
        damageDiceCount: rowNumber(item, 'damage_dice_count'),
        damageDiceType: rowText(item, 'damage_dice_type'),
        damageBonusNumber: rowNumber(item, 'damage_bonus'),
        range: rowNumber(item, 'range'),
        weaponProficiencyBonusNumber: rowNumber(item, 'weapon_proficiency_bonus'),
      })
    } else if (itemType === 'armor') {
      items.armors.push({
        ...nextItem,
        armorPenaltyNumber: rowNumber(item, 'armor_penalty'),
      })
    } else {
      items.others.push(nextItem)
    }
  }
  return items
}

const buildNpcPayload = (row: NpcRow): Partial<Record<string, unknown>> => {
  const defenses: Record<string, number> = {}
  for (const defence of characterDefences) {
    defenses[defence] = rowNumber(row, `defence_${defence}`)
  }

  const attacks = getNpcAttacks(row.id).map((attack) => ({
    id: rowText(attack, 'id'),
    name: rowText(attack, 'name'),
    action: rowText(attack, 'action'),
    type: rowText(attack, 'type'),
    range: rowNumber(attack, 'range'),
    area: rowText(attack, 'area'),
    attackBonusNumber: rowNumber(attack, 'attack_bonus_number'),
    attackDefense: rowText(attack, 'attack_defence'),
    attackNotApplicable: rowNumber(attack, 'attack_not_applicable') === 1,
    description: rowText(attack, 'description'),
  }))

  const items = buildMonsterOrNpcItems(getNpcItems(row.id))

  return {
    uniqueId: row.id,
    name: row.name,
    role: row.role,
    type: row.type,
    description: row.description,
    resistances: row.resistances,
    special: row.special,
    attacks,
    items,
    defenses,
    suggested: {
      attackVsKp: rowText(row, 'suggested_attack_vs_kp'),
      attackVsOtherDefenses: rowText(row, 'suggested_attack_vs_other_defences'),
      lowDamage: rowText(row, 'suggested_low_damage'),
      mediumDamage: rowText(row, 'suggested_medium_damage'),
      highDamage: rowText(row, 'suggested_high_damage'),
      customDamage: rowText(row, 'suggested_custom_damage'),
    },
    hp: row.hp,
    level: row.level,
    speed: row.speed,
    isStory: row.is_story === 1,
    isDead: row.is_dead === 1,
    history: getNpcHistoryEntries(row.id),
  }
}

const buildMonsterPayload = (row: MonsterRow): Partial<Record<string, unknown>> => {
  const defenses: Record<string, number> = {}
  for (const defence of characterDefences) {
    defenses[defence] = rowNumber(row, `defence_${defence}`)
  }

  const attacks = getMonsterAttacks(row.id).map((attack) => ({
    id: rowText(attack, 'id'),
    name: rowText(attack, 'name'),
    action: rowText(attack, 'action'),
    type: rowText(attack, 'type'),
    range: rowNumber(attack, 'range'),
    area: rowText(attack, 'area'),
    attackBonusNumber: rowNumber(attack, 'attack_bonus_number'),
    attackDefense: rowText(attack, 'attack_defence'),
    attackNotApplicable: rowNumber(attack, 'attack_not_applicable') === 1,
    description: rowText(attack, 'description'),
  }))

  return {
    uniqueId: row.id,
    name: row.name,
    role: row.role,
    type: row.type,
    description: row.description,
    resistances: row.resistances,
    special: row.special,
    attacks,
    items: buildMonsterOrNpcItems(getMonsterItems(row.id)),
    defenses,
    suggested: {
      attackVsKp: rowText(row, 'suggested_attack_vs_kp'),
      attackVsOtherDefenses: rowText(row, 'suggested_attack_vs_other_defences'),
      lowDamage: rowText(row, 'suggested_low_damage'),
      mediumDamage: rowText(row, 'suggested_medium_damage'),
      highDamage: rowText(row, 'suggested_high_damage'),
      customDamage: rowText(row, 'suggested_custom_damage'),
    },
    hp: row.hp,
    level: row.level,
    speed: row.speed,
  }
}

const buildNpc = <TData, TEntity>(
  row: NpcRow,
  options: StoredNpcOptions<TData>,
): TEntity => {
  const normalized = options.normalize(buildNpcPayload(row) as Partial<Record<keyof TData, unknown>>)
  return {
    id: row.id,
    ...(options.imageUrl ? { imageUrl: options.imageUrl(row.id) } : {}),
    ...normalized,
    updatedAt: row.updated_at,
  } as TEntity
}

const buildMonster = <TData, TEntity>(
  row: MonsterRow,
  options: StoredMonsterOptions<TData>,
): TEntity => {
  const normalized = options.normalize(buildMonsterPayload(row) as Partial<Record<keyof TData, unknown>>)
  return {
    id: row.id,
    ...(options.imageUrl ? { imageUrl: options.imageUrl(row.id) } : {}),
    ...normalized,
    updatedAt: row.updated_at,
  } as TEntity
}

const buildCharacter = <TData, TEntity>(
  row: CharacterRow,
  options: StoredCharacterOptions<TData>,
): TEntity => {
  const normalized = options.normalize(buildCharacterPayload(row) as Partial<Record<keyof TData, unknown>>)
  return {
    id: row.id,
    ...(options.imageUrl ? { imageUrl: options.imageUrl(row.id) } : {}),
    ...normalized,
    updatedAt: row.updated_at,
  } as TEntity
}

const cleanupOrphanPlaces = (): void => {
  getDatabase().prepare(`
    DELETE FROM places
    WHERE NOT EXISTS (
      SELECT 1
      FROM area_places
      WHERE area_places.place_id = places.id
    )
  `).run()
}

const replaceAreaPlaces = <TData>(areaId: string, data: TData): void => {
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

const executeAreaInsert = <TData>(
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

const executeAreaUpsert = <TData>(
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

const executeEventInsert = <TData>(
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

const executeEventUpsert = <TData>(
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

const getContextStringIds = (value: unknown): string[] => getMemberIds(value)

const replaceContextSimpleRelations = (
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

const replaceContextGroupedRelations = (
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

const replaceContextRelations = <TData>(contextId: string, payload: TData): void => {
  const source = payload as Record<string, unknown>
  replaceContextSimpleRelations(contextId, 'context_characters', 'characters', 'character_id', getContextStringIds(source.characters))
  replaceContextGroupedRelations(contextId, source.characterGroups, 'character_groups', 'context_character_groups', 'group_id', 'context_character_group_members', 'characterIds', 'character_id', 'character_group_members', 'group_id')
  replaceContextSimpleRelations(contextId, 'context_events', 'events', 'event_id', getContextStringIds(source.events))
  replaceContextGroupedRelations(contextId, source.npcGroups, 'npc_groups', 'context_npc_groups', 'group_id', 'context_npc_group_members', 'npcIds', 'npc_id', 'npc_group_members', 'group_id')
  replaceContextGroupedRelations(contextId, source.monsterGroups, 'monster_groups', 'context_monster_groups', 'group_id', 'context_monster_group_members', 'monsterIds', 'monster_id', 'monster_group_members', 'group_id')
  replaceContextGroupedRelations(contextId, source.areas, 'areas', 'context_areas', 'area_id', 'context_area_places', 'placeIds', 'place_id', 'area_places', 'area_id')
}

const executeContextInsert = <TData>(
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

const executeContextUpsert = <TData>(
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

const executeGroupInsert = <TData>(
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

const executeGroupUpsert = <TData>(
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

const getCharacterBaseParams = <TData>(id: string, payload: TData, createdAt: string, updatedAt: string): Record<string, unknown> => {
  const source = payload as Record<string, unknown>
  const bonuses = (isRecord(source.bonuses) ? source.bonuses : {}) as Record<string, unknown>
  const bonusAttributes = (isRecord(bonuses.attributes) ? bonuses.attributes : {}) as Record<string, unknown>
  const bonusSkills = (isRecord(bonuses.skills) ? bonuses.skills : {}) as Record<string, unknown>
  const bonusDefenses = (isRecord(bonuses.defenses) ? bonuses.defenses : {}) as Record<string, unknown>
  const attributes = (isRecord(source.attributes) ? source.attributes : {}) as Record<string, unknown>
  const attributesPlus = (isRecord(source.attributesPlus) ? source.attributesPlus : {}) as Record<string, unknown>
  const defenses = (isRecord(source.defenses) ? source.defenses : {}) as Record<string, unknown>
  const training = (isRecord(source.training) ? source.training : {}) as Record<string, unknown>
  const params: Record<string, unknown> = {
    id,
    name: normalizeStoredText(source.name),
    short_description: normalizeStoredText(source.shortDescription),
    description: normalizeStoredText(source.description),
    level: rowNumber(source, 'level'),
    race: normalizeStoredText(source.race),
    class: normalizeStoredText(source.class),
    gender: normalizeStoredText(source.gender),
    alignment: normalizeStoredText(source.alignment),
    hp: rowNumber(source, 'hp'),
    surge: rowNumber(source, 'surge'),
    speed: rowNumber(source, 'speed'),
    bonus_level: rowNumber(bonuses, 'level'),
    created_at: createdAt,
    updated_at: updatedAt,
  }

  for (const attribute of characterAttributes) {
    params[`bonus_attribute_${attribute}`] = rowNumber(bonusAttributes, attribute)
    params[`attribute_${attribute}`] = rowNumber(attributes, attribute)
    params[`attribute_${attribute}_plus`] = rowNumber(attributesPlus, attribute)
  }
  for (const skill of characterSkills) {
    params[`bonus_skill_${skill}`] = rowNumber(bonusSkills, skill)
    params[`training_${skill}`] = training[skill] === true ? 1 : 0
  }
  for (const defence of characterDefences) {
    params[`bonus_defence_${defence}`] = rowNumber(bonusDefenses, defence)
    params[`defence_${defence}`] = rowNumber(defenses, defence)
  }
  return params
}

const replaceCharacterRelations = <TData>(characterId: string, payload: TData): void => {
  const source = payload as Record<string, unknown>
  const db = getDatabase()
  db.prepare('DELETE FROM characters_abilities WHERE character_id = ?').run(characterId)
  db.prepare('DELETE FROM characters_feats WHERE character_id = ?').run(characterId)
  db.prepare('DELETE FROM characters_items WHERE character_id = ?').run(characterId)

  const insertAbility = db.prepare(`
    INSERT INTO characters_abilities (
      character_id, id, position, name, description, action, type, kind, weapon_count, weapon_id,
      weapon_damage_dice_type, weapon_damage_dice_count, weapon_attribute_bonus, weapon_attack_bonus_number,
      weapon_attack_attribute, weapon_attack_defence, weapon_damage_type, weapon_recurring_damage_count,
      weapon_recurring_damage_type, weapon_hit, weapon_miss, weapon_provocation, weapon_range, weapon_area
    )
    VALUES (
      @character_id, @id, @position, @name, @description, @action, @type, @kind, @weapon_count, @weapon_id,
      @weapon_damage_dice_type, @weapon_damage_dice_count, @weapon_attribute_bonus, @weapon_attack_bonus_number,
      @weapon_attack_attribute, @weapon_attack_defence, @weapon_damage_type, @weapon_recurring_damage_count,
      @weapon_recurring_damage_type, @weapon_hit, @weapon_miss, @weapon_provocation, @weapon_range, @weapon_area
    )
  `)
  const abilities = Array.isArray(source.abilities) ? source.abilities : []
  abilities.forEach((ability, position) => {
    if (!isRecord(ability)) return
    insertAbility.run({
      character_id: characterId,
      id: normalizeStoredText(ability.id) || `${characterId}-ability-${position}`,
      position,
      name: normalizeStoredText(ability.name),
      description: normalizeStoredText(ability.description),
      action: normalizeStoredText(ability.action),
      type: normalizeStoredText(ability.type),
      kind: normalizeStoredText(ability.kind),
      weapon_count: rowNumber(ability, 'weaponCount'),
      weapon_id: normalizeStoredText(ability.weaponId),
      weapon_damage_dice_type: normalizeStoredText(ability.weaponDamageDiceType),
      weapon_damage_dice_count: rowNumber(ability, 'weaponDamageDiceCount'),
      weapon_attribute_bonus: normalizeStoredText(ability.weaponAttributeBonus),
      weapon_attack_bonus_number: rowNumber(ability, 'weaponAttackBonusNumber'),
      weapon_attack_attribute: normalizeStoredText(ability.weaponAttackAttribute),
      weapon_attack_defence: normalizeStoredText(ability.weaponAttackDefense),
      weapon_damage_type: normalizeStoredText(ability.weaponDamageType),
      weapon_recurring_damage_count: rowNumber(ability, 'weaponRecurringDamageCount'),
      weapon_recurring_damage_type: normalizeStoredText(ability.weaponRecurringDamageType),
      weapon_hit: normalizeStoredText(ability.weaponHit),
      weapon_miss: normalizeStoredText(ability.weaponMiss),
      weapon_provocation: normalizeStoredText(ability.weaponProvocation),
      weapon_range: rowNumber(ability, 'weaponRange'),
      weapon_area: normalizeStoredText(ability.weaponArea),
    })
  })

  const insertFeat = db.prepare(`
    INSERT INTO characters_feats (
      character_id, id, position, name, description, visible, speed_bonus, hp_bonus,
      defence_kp_bonus, defence_fortitude_bonus, defence_reflex_bonus, defence_will_bonus,
      skill_acrobatics_bonus, skill_arcana_bonus, skill_athletics_bonus, skill_diplomacy_bonus,
      skill_history_bonus, skill_healing_bonus, skill_deception_bonus, skill_perception_bonus,
      skill_endurance_bonus, skill_dungeons_bonus, skill_nature_bonus, skill_religion_bonus,
      skill_insight_bonus, skill_stealth_bonus, skill_streetwise_bonus, skill_intimidation_bonus,
      skill_thievery_bonus
    )
    VALUES (
      @character_id, @id, @position, @name, @description, @visible, @speed_bonus, @hp_bonus,
      @defence_kp_bonus, @defence_fortitude_bonus, @defence_reflex_bonus, @defence_will_bonus,
      @skill_acrobatics_bonus, @skill_arcana_bonus, @skill_athletics_bonus, @skill_diplomacy_bonus,
      @skill_history_bonus, @skill_healing_bonus, @skill_deception_bonus, @skill_perception_bonus,
      @skill_endurance_bonus, @skill_dungeons_bonus, @skill_nature_bonus, @skill_religion_bonus,
      @skill_insight_bonus, @skill_stealth_bonus, @skill_streetwise_bonus, @skill_intimidation_bonus,
      @skill_thievery_bonus
    )
  `)
  const feats = Array.isArray(source.feats) ? source.feats : []
  feats.forEach((feat, position) => {
    if (!isRecord(feat)) return
    const params: Record<string, unknown> = {
      character_id: characterId,
      id: normalizeStoredText(feat.id) || `${characterId}-feat-${position}`,
      position,
      name: normalizeStoredText(feat.name),
      description: normalizeStoredText(feat.description),
      visible: feat.visible === false ? 0 : 1,
      speed_bonus: rowNumber(feat, 'speedBonusNumber'),
      hp_bonus: rowNumber(feat, 'hpBonusNumber'),
    }
    for (const defence of characterDefences) params[`defence_${defence}_bonus`] = rowNumber(feat, `${defence}BonusNumber`)
    for (const skill of characterSkills) params[`skill_${skill}_bonus`] = rowNumber(feat, `${skill}BonusNumber`)
    insertFeat.run(params)
  })

  const insertItem = db.prepare(`
    INSERT INTO characters_items (
      character_id, id, position, item_type, name, description, equipped, damage_dice_count,
      damage_dice_type, damage_bonus, range, weapon_proficiency_bonus, attribute_strength_bonus,
      attribute_condition_bonus, attribute_dexterity_bonus, attribute_intelligence_bonus,
      attribute_wisdom_bonus, attribute_charisma_bonus, speed_bonus, armor_penalty,
      defence_kp_bonus, defence_fortitude_bonus, defence_reflex_bonus, defence_will_bonus
    )
    VALUES (
      @character_id, @id, @position, @item_type, @name, @description, @equipped, @damage_dice_count,
      @damage_dice_type, @damage_bonus, @range, @weapon_proficiency_bonus, @attribute_strength_bonus,
      @attribute_condition_bonus, @attribute_dexterity_bonus, @attribute_intelligence_bonus,
      @attribute_wisdom_bonus, @attribute_charisma_bonus, @speed_bonus, @armor_penalty,
      @defence_kp_bonus, @defence_fortitude_bonus, @defence_reflex_bonus, @defence_will_bonus
    )
  `)
  const items = isRecord(source.items) ? source.items : {}
  const groups: Array<[string, unknown]> = [['armor', items.armors], ['weapon', items.weapons], ['other', items.others]]
  for (const [itemType, value] of groups) {
    const groupItems = Array.isArray(value) ? value : []
    groupItems.forEach((item, position) => {
      if (!isRecord(item)) return
      insertItem.run({
        character_id: characterId,
        id: normalizeStoredText(item.id) || `${characterId}-${itemType}-${position}`,
        position,
        item_type: itemType,
        name: normalizeStoredText(item.name),
        description: normalizeStoredText(item.description),
        equipped: item.equipped === true ? 1 : 0,
        damage_dice_count: rowNumber(item, 'damageDiceCount'),
        damage_dice_type: normalizeStoredText(item.damageDiceType),
        damage_bonus: rowNumber(item, 'damageBonusNumber'),
        range: rowNumber(item, 'range'),
        weapon_proficiency_bonus: rowNumber(item, 'weaponProficiencyBonusNumber'),
        attribute_strength_bonus: rowNumber(item, 'strengthBonusNumber'),
        attribute_condition_bonus: rowNumber(item, 'conditionBonusNumber'),
        attribute_dexterity_bonus: rowNumber(item, 'dexterityBonusNumber'),
        attribute_intelligence_bonus: rowNumber(item, 'intelligenceBonusNumber'),
        attribute_wisdom_bonus: rowNumber(item, 'wisdomBonusNumber'),
        attribute_charisma_bonus: rowNumber(item, 'charismaBonusNumber'),
        speed_bonus: rowNumber(item, 'speedBonusNumber'),
        armor_penalty: rowNumber(item, 'armorPenaltyNumber'),
        defence_kp_bonus: rowNumber(item, 'kpBonusNumber'),
        defence_fortitude_bonus: rowNumber(item, 'fortitudeBonusNumber'),
        defence_reflex_bonus: rowNumber(item, 'reflexBonusNumber'),
        defence_will_bonus: rowNumber(item, 'willBonusNumber'),
      })
    })
  }
}

const insertStoredItems = (
  ownerColumn: 'character_id' | 'npc_id' | 'monster_id',
  ownerId: string,
  tableName: 'characters_items' | 'npcs_items' | 'monsters_items',
  sourceItems: unknown,
): void => {
  const db = getDatabase()
  const insertItem = db.prepare(`
    INSERT INTO ${quoteName(tableName)} (
      ${quoteName(ownerColumn)}, id, position, item_type, name, description, equipped, damage_dice_count,
      damage_dice_type, damage_bonus, range, weapon_proficiency_bonus, attribute_strength_bonus,
      attribute_condition_bonus, attribute_dexterity_bonus, attribute_intelligence_bonus,
      attribute_wisdom_bonus, attribute_charisma_bonus, speed_bonus, armor_penalty,
      defence_kp_bonus, defence_fortitude_bonus, defence_reflex_bonus, defence_will_bonus
    )
    VALUES (
      @owner_id, @id, @position, @item_type, @name, @description, @equipped, @damage_dice_count,
      @damage_dice_type, @damage_bonus, @range, @weapon_proficiency_bonus, @attribute_strength_bonus,
      @attribute_condition_bonus, @attribute_dexterity_bonus, @attribute_intelligence_bonus,
      @attribute_wisdom_bonus, @attribute_charisma_bonus, @speed_bonus, @armor_penalty,
      @defence_kp_bonus, @defence_fortitude_bonus, @defence_reflex_bonus, @defence_will_bonus
    )
  `)
  const items = isRecord(sourceItems) ? sourceItems : {}
  const groups: Array<[string, unknown]> = [['armor', items.armors], ['weapon', items.weapons], ['other', items.others]]
  for (const [itemType, value] of groups) {
    const groupItems = Array.isArray(value) ? value : []
    groupItems.forEach((item, position) => {
      if (!isRecord(item)) return
      insertItem.run({
        owner_id: ownerId,
        id: normalizeStoredText(item.id) || `${ownerId}-${itemType}-${position}`,
        position,
        item_type: itemType,
        name: normalizeStoredText(item.name),
        description: normalizeStoredText(item.description),
        equipped: item.equipped === true ? 1 : 0,
        damage_dice_count: rowNumber(item, 'damageDiceCount'),
        damage_dice_type: normalizeStoredText(item.damageDiceType),
        damage_bonus: rowNumber(item, 'damageBonusNumber'),
        range: rowNumber(item, 'range'),
        weapon_proficiency_bonus: rowNumber(item, 'weaponProficiencyBonusNumber'),
        attribute_strength_bonus: rowNumber(item, 'strengthBonusNumber'),
        attribute_condition_bonus: rowNumber(item, 'conditionBonusNumber'),
        attribute_dexterity_bonus: rowNumber(item, 'dexterityBonusNumber'),
        attribute_intelligence_bonus: rowNumber(item, 'intelligenceBonusNumber'),
        attribute_wisdom_bonus: rowNumber(item, 'wisdomBonusNumber'),
        attribute_charisma_bonus: rowNumber(item, 'charismaBonusNumber'),
        speed_bonus: rowNumber(item, 'speedBonusNumber'),
        armor_penalty: rowNumber(item, 'armorPenaltyNumber'),
        defence_kp_bonus: rowNumber(item, 'kpBonusNumber'),
        defence_fortitude_bonus: rowNumber(item, 'fortitudeBonusNumber'),
        defence_reflex_bonus: rowNumber(item, 'reflexBonusNumber'),
        defence_will_bonus: rowNumber(item, 'willBonusNumber'),
      })
    })
  }
}

const executeCharacterInsert = <TData>(
  id: string,
  payload: TData,
  createdAt: string,
  updatedAt: string,
): void => {
  const db = getDatabase()
  const params = getCharacterBaseParams(id, payload, createdAt, updatedAt)
  const columns = Object.keys(params)
  db.transaction(() => {
    db.prepare(`
      INSERT INTO characters (${columns.map(quoteName).join(', ')})
      VALUES (${columns.map((column) => `@${column}`).join(', ')})
    `).run(params)
    replaceCharacterRelations(id, payload)
  })()
}

const executeCharacterUpsert = <TData>(
  id: string,
  payload: TData,
  updatedAt: string,
): void => {
  const existing = getDatabase().prepare('SELECT created_at FROM characters WHERE id = ?').get(id) as { created_at: string } | undefined
  const createdAt = existing?.created_at ?? updatedAt
  const params = getCharacterBaseParams(id, payload, createdAt, updatedAt)
  const columns = Object.keys(params)
  const updateColumns = columns.filter((column) => column !== 'id' && column !== 'created_at')
  const db = getDatabase()
  db.transaction(() => {
    db.prepare(`
      INSERT INTO characters (${columns.map(quoteName).join(', ')})
      VALUES (${columns.map((column) => `@${column}`).join(', ')})
      ON CONFLICT(id) DO UPDATE SET
        ${updateColumns.map((column) => `${quoteName(column)} = excluded.${quoteName(column)}`).join(',\n        ')}
    `).run(params)
    replaceCharacterRelations(id, payload)
  })()
}

const getNpcBaseParams = <TData>(id: string, payload: TData, createdAt: string, updatedAt: string): Record<string, unknown> => {
  const source = payload as Record<string, unknown>
  const defenses = (isRecord(source.defenses) ? source.defenses : {}) as Record<string, unknown>
  const suggested = (isRecord(source.suggested) ? source.suggested : {}) as Record<string, unknown>
  const params: Record<string, unknown> = {
    id,
    name: normalizeStoredText(source.name),
    role: normalizeStoredText(source.role),
    type: normalizeStoredText(source.type),
    description: normalizeStoredText(source.description),
    resistances: normalizeStoredText(source.resistances),
    special: normalizeStoredText(source.special),
    hp: rowNumber(source, 'hp'),
    level: rowNumber(source, 'level'),
    speed: rowNumber(source, 'speed'),
    is_story: source.isStory === true ? 1 : 0,
    is_dead: source.isDead === true ? 1 : 0,
    suggested_attack_vs_kp: normalizeStoredText(suggested.attackVsKp),
    suggested_attack_vs_other_defences: normalizeStoredText(suggested.attackVsOtherDefenses),
    suggested_low_damage: normalizeStoredText(suggested.lowDamage),
    suggested_medium_damage: normalizeStoredText(suggested.mediumDamage),
    suggested_high_damage: normalizeStoredText(suggested.highDamage),
    suggested_custom_damage: normalizeStoredText(suggested.customDamage),
    created_at: createdAt,
    updated_at: updatedAt,
  }
  for (const defence of characterDefences) {
    params[`defence_${defence}`] = rowNumber(defenses, defence)
  }
  return params
}

const getMonsterBaseParams = <TData>(id: string, payload: TData, createdAt: string, updatedAt: string): Record<string, unknown> => {
  const source = payload as Record<string, unknown>
  const defenses = (isRecord(source.defenses) ? source.defenses : {}) as Record<string, unknown>
  const suggested = (isRecord(source.suggested) ? source.suggested : {}) as Record<string, unknown>
  const params: Record<string, unknown> = {
    id,
    name: normalizeStoredText(source.name),
    role: normalizeStoredText(source.role),
    type: normalizeStoredText(source.type),
    description: normalizeStoredText(source.description),
    resistances: normalizeStoredText(source.resistances),
    special: normalizeStoredText(source.special),
    hp: rowNumber(source, 'hp'),
    level: rowNumber(source, 'level'),
    speed: rowNumber(source, 'speed'),
    suggested_attack_vs_kp: normalizeStoredText(suggested.attackVsKp),
    suggested_attack_vs_other_defences: normalizeStoredText(suggested.attackVsOtherDefenses),
    suggested_low_damage: normalizeStoredText(suggested.lowDamage),
    suggested_medium_damage: normalizeStoredText(suggested.mediumDamage),
    suggested_high_damage: normalizeStoredText(suggested.highDamage),
    suggested_custom_damage: normalizeStoredText(suggested.customDamage),
    created_at: createdAt,
    updated_at: updatedAt,
  }
  for (const defence of characterDefences) {
    params[`defence_${defence}`] = rowNumber(defenses, defence)
  }
  return params
}

const insertStoredAttacks = (
  ownerColumn: 'npc_id' | 'monster_id',
  ownerId: string,
  tableName: 'npcs_attacks' | 'monsters_attacks',
  sourceAttacks: unknown,
): void => {
  const insertAttack = getDatabase().prepare(`
    INSERT INTO ${quoteName(tableName)} (
      ${quoteName(ownerColumn)}, id, position, name, action, type, range, area, attack_bonus_number,
      attack_defence, attack_not_applicable, description
    )
    VALUES (
      @owner_id, @id, @position, @name, @action, @type, @range, @area, @attack_bonus_number,
      @attack_defence, @attack_not_applicable, @description
    )
  `)
  const attacks = Array.isArray(sourceAttacks) ? sourceAttacks : []
  attacks.forEach((attack, position) => {
    if (!isRecord(attack)) return
    insertAttack.run({
      owner_id: ownerId,
      id: normalizeStoredText(attack.id) || `${ownerId}-attack-${position}`,
      position,
      name: normalizeStoredText(attack.name),
      action: normalizeStoredText(attack.action),
      type: normalizeStoredText(attack.type),
      range: rowNumber(attack, 'range'),
      area: normalizeStoredText(attack.area),
      attack_bonus_number: rowNumber(attack, 'attackBonusNumber'),
      attack_defence: normalizeStoredText(attack.attackDefense),
      attack_not_applicable: attack.attackNotApplicable === true ? 1 : 0,
      description: normalizeStoredText(attack.description),
    })
  })
}

const insertStoredNpcHistoryEntries = (npcId: string, sourceEntries: unknown): void => {
  const insertEntry = getDatabase().prepare(`
    INSERT INTO npc_history_entries (npc_id, id, position, title, content)
    VALUES (?, ?, ?, ?, ?)
  `)
  const entries = Array.isArray(sourceEntries) ? sourceEntries : []
  entries.forEach((entry, position) => {
    if (!isRecord(entry)) return

    const title = normalizeStoredText(entry.title)
    const content = normalizeStoredText(entry.content)
    if (title.length === 0 && content.length === 0) return

    insertEntry.run(npcId, normalizeStoredText(entry.id) || randomUUID(), position, title, content)
  })
}

const replaceNpcRelations = <TData>(npcId: string, payload: TData): void => {
  const source = payload as Record<string, unknown>
  const db = getDatabase()
  db.prepare('DELETE FROM npcs_attacks WHERE npc_id = ?').run(npcId)
  db.prepare('DELETE FROM npcs_items WHERE npc_id = ?').run(npcId)
  db.prepare('DELETE FROM npc_history_entries WHERE npc_id = ?').run(npcId)

  insertStoredAttacks('npc_id', npcId, 'npcs_attacks', source.attacks)
  insertStoredItems('npc_id', npcId, 'npcs_items', source.items)
  insertStoredNpcHistoryEntries(npcId, source.history)
}

const replaceMonsterRelations = <TData>(monsterId: string, payload: TData): void => {
  const source = payload as Record<string, unknown>
  const db = getDatabase()
  db.prepare('DELETE FROM monsters_attacks WHERE monster_id = ?').run(monsterId)
  db.prepare('DELETE FROM monsters_items WHERE monster_id = ?').run(monsterId)
  insertStoredAttacks('monster_id', monsterId, 'monsters_attacks', source.attacks)
  insertStoredItems('monster_id', monsterId, 'monsters_items', source.items)
}

const executeNpcInsert = <TData>(
  id: string,
  payload: TData,
  createdAt: string,
  updatedAt: string,
): void => {
  const db = getDatabase()
  const params = getNpcBaseParams(id, payload, createdAt, updatedAt)
  const columns = Object.keys(params)
  db.transaction(() => {
    db.prepare(`
      INSERT INTO npcs (${columns.map(quoteName).join(', ')})
      VALUES (${columns.map((column) => `@${column}`).join(', ')})
    `).run(params)
    replaceNpcRelations(id, payload)
  })()
}

const executeNpcUpsert = <TData>(
  id: string,
  payload: TData,
  updatedAt: string,
): void => {
  const existing = getDatabase().prepare('SELECT created_at FROM npcs WHERE id = ?').get(id) as { created_at: string } | undefined
  const createdAt = existing?.created_at ?? updatedAt
  const params = getNpcBaseParams(id, payload, createdAt, updatedAt)
  const columns = Object.keys(params)
  const updateColumns = columns.filter((column) => column !== 'id' && column !== 'created_at')
  const db = getDatabase()
  db.transaction(() => {
    db.prepare(`
      INSERT INTO npcs (${columns.map(quoteName).join(', ')})
      VALUES (${columns.map((column) => `@${column}`).join(', ')})
      ON CONFLICT(id) DO UPDATE SET
        ${updateColumns.map((column) => `${quoteName(column)} = excluded.${quoteName(column)}`).join(',\n        ')}
    `).run(params)
    replaceNpcRelations(id, payload)
  })()
}

const executeMonsterInsert = <TData>(
  id: string,
  payload: TData,
  createdAt: string,
  updatedAt: string,
): void => {
  const db = getDatabase()
  const params = getMonsterBaseParams(id, payload, createdAt, updatedAt)
  const columns = Object.keys(params)
  db.transaction(() => {
    db.prepare(`
      INSERT INTO monsters (${columns.map(quoteName).join(', ')})
      VALUES (${columns.map((column) => `@${column}`).join(', ')})
    `).run(params)
    replaceMonsterRelations(id, payload)
  })()
}

const executeMonsterUpsert = <TData>(
  id: string,
  payload: TData,
  updatedAt: string,
): void => {
  const existing = getDatabase().prepare('SELECT created_at FROM monsters WHERE id = ?').get(id) as { created_at: string } | undefined
  const createdAt = existing?.created_at ?? updatedAt
  const params = getMonsterBaseParams(id, payload, createdAt, updatedAt)
  const columns = Object.keys(params)
  const updateColumns = columns.filter((column) => column !== 'id' && column !== 'created_at')
  const db = getDatabase()
  db.transaction(() => {
    db.prepare(`
      INSERT INTO monsters (${columns.map(quoteName).join(', ')})
      VALUES (${columns.map((column) => `@${column}`).join(', ')})
      ON CONFLICT(id) DO UPDATE SET
        ${updateColumns.map((column) => `${quoteName(column)} = excluded.${quoteName(column)}`).join(',\n        ')}
    `).run(params)
    replaceMonsterRelations(id, payload)
  })()
}

const executeEntityInsert = (
  tableName: string,
  id: string,
  payload: unknown,
  createdAt: string,
  updatedAt: string,
): void => {
  const metadata = getPayloadMetadata(payload)
  getDatabase().prepare(`
    INSERT INTO ${quoteName(tableName)} (id, unique_id, name, payload_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    id,
    metadata.uniqueId,
    metadata.name,
    JSON.stringify(payload),
    createdAt,
    updatedAt,
  )
}

const executeEntityUpsert = (
  tableName: string,
  id: string,
  payload: unknown,
  updatedAt: string,
): void => {
  const metadata = getPayloadMetadata(payload)
  getDatabase().prepare(`
    INSERT INTO ${quoteName(tableName)} (id, unique_id, name, payload_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      unique_id = excluded.unique_id,
      name = excluded.name,
      payload_json = excluded.payload_json,
      updated_at = excluded.updated_at
  `).run(
    id,
    metadata.uniqueId,
    metadata.name,
    JSON.stringify(payload),
    updatedAt,
    updatedAt,
  )
}

const stripGroupIds = <TData>(
  data: Partial<Record<keyof TData, unknown>>,
  options: GroupMemberRelationOptions<TData>,
): Partial<Record<keyof TData, unknown>> => {
  return {
    ...data,
    [options.idsKey]: [],
  }
}

const getGroupMemberIds = <TData>(groupId: string, options: GroupMemberRelationOptions<TData>): string[] => {
  const rows = getDatabase().prepare(`
    SELECT ${quoteName(options.memberColumnName)} AS member_id
    FROM ${quoteName(options.relationTableName)}
    WHERE group_id = ?
    ORDER BY position ASC, ${quoteName(options.memberColumnName)} ASC
  `).all(groupId) as GroupMemberRow[]

  return rows.map((row) => row.member_id)
}

const replaceGroupMembers = <TData>(
  groupId: string,
  memberIds: string[],
  options: GroupMemberRelationOptions<TData>,
): void => {
  const db = getDatabase()
  const memberExists = db.prepare(`SELECT id FROM ${quoteName(options.memberTableName)} WHERE id = ?`)
  const deleteMembers = db.prepare(`DELETE FROM ${quoteName(options.relationTableName)} WHERE group_id = ?`)
  const insertMember = db.prepare(`
    INSERT INTO ${quoteName(options.relationTableName)} (group_id, ${quoteName(options.memberColumnName)}, position)
    VALUES (?, ?, ?)
  `)

  deleteMembers.run(groupId)
  memberIds.forEach((memberId, index) => {
    const existingMember = memberExists.get(memberId) as EntityExistsRow | undefined
    if (!existingMember) {
      return
    }

    insertMember.run(groupId, memberId, index)
  })
}

const attachGroupIds = <TData, TEntity>(
  entity: TEntity,
  options: GroupMemberRelationOptions<TData>,
): TEntity => {
  const id = (entity as { id: string }).id
  const memberIds = getGroupMemberIds(id, options)
  return {
    ...entity,
    [options.idsKey]: memberIds,
  }
}

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
