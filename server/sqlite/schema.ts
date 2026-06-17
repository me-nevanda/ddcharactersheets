import { mkdirSync } from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'

export const databasePath = path.resolve(process.cwd(), 'data', 'app.sqlite')
let database: Database.Database | null = null

export const payloadEntityTables = [
  'adventures',
] as const

export const mapTableName = 'maps'

export const groupTableConfigs = [
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

export const characterAttributes = ['strength', 'condition', 'dexterity', 'intelligence', 'wisdom', 'charisma'] as const
export const characterDefences = ['kp', 'fortitude', 'reflex', 'will'] as const
export const characterSkills = ['acrobatics', 'arcana', 'athletics', 'diplomacy', 'history', 'healing', 'deception', 'perception', 'endurance', 'dungeons', 'nature', 'religion', 'insight', 'stealth', 'streetwise', 'intimidation', 'thievery'] as const

export const assertSafeSqlName = (name: string): void => {
  if (!/^[a-z][a-z0-9_]*$/i.test(name)) {
    throw new Error(`Unsafe SQL identifier: ${name}`)
  }
}

export const quoteName = (name: string): string => {
  assertSafeSqlName(name)
  return `"${name}"`
}

export const createEntityTableSql = (tableName: string): string => {
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

export const ensureEntityUniqueIdIndexes = (db: Database.Database): void => {
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

export const ensureColumn = (db: Database.Database, tableName: string, columnName: string, definition: string): void => {
  const columns = db.prepare(`PRAGMA table_info(${quoteName(tableName)})`).all() as { name: string }[]
  if (columns.some((column) => column.name === columnName)) {
    return
  }

  db.exec(`ALTER TABLE ${quoteName(tableName)} ADD COLUMN ${quoteName(columnName)} ${definition};`)
}

export const ensureMonsterAndNpcSuggestedColumns = (db: Database.Database): void => {
  ensureColumn(db, 'monsters', 'suggested_custom_damage', "TEXT NOT NULL DEFAULT ''")
  ensureColumn(db, 'npcs', 'suggested_custom_damage', "TEXT NOT NULL DEFAULT ''")
}

export const ensureCharacterTables = (db: Database.Database): void => {
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

export const ensureCombatantTables = (db: Database.Database): void => {
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

export const ensureGroupTables = (db: Database.Database): void => {
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

export const ensureAreaTables = (db: Database.Database): void => {
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

export const ensureEventTables = (db: Database.Database): void => {
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

export const ensureMapTables = (db: Database.Database): void => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS ${quoteName(mapTableName)} (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      grid_json TEXT NOT NULL DEFAULT '{"width":34,"height":22,"lines":[]}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS ${quoteName('idx_maps_updated_at')} ON ${quoteName(mapTableName)} (updated_at DESC);
    CREATE INDEX IF NOT EXISTS ${quoteName('idx_maps_name')} ON ${quoteName(mapTableName)} (name COLLATE NOCASE);
  `)

  ensureColumn(db, mapTableName, 'grid_json', `TEXT NOT NULL DEFAULT '{"width":34,"height":22,"lines":[]}'`)
}

export const createContextRelationTables = (db: Database.Database): void => {
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

export const ensureContextTables = (db: Database.Database): void => {
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
export const getDatabase = (): Database.Database => {
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
  ensureMapTables(database)
  ensureContextTables(database)

  return database
}
