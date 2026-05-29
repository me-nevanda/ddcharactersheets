const fs = require('node:fs')
const path = require('node:path')
const Database = require('better-sqlite3')

const dataDir = path.resolve(process.cwd(), 'data')
const db = new Database(path.join(dataDir, 'app.sqlite'))

const entityTables = [
  ['adventures', 'adventures'],
  ['characters', 'characters'],
  ['monsters', 'monsters'],
  ['npcs', 'npcs'],
]

const groupTables = [
  ['character_groups', 'character-groups', 'characterIds', 'characterFileNames', 'character_group_members', 'character_id', 'characters'],
  ['monster_groups', 'monster-groups', 'monsterIds', 'monsterFileNames', 'monster_group_members', 'monster_id', 'monsters'],
  ['npc_groups', 'npc-groups', 'npcIds', 'npcFileNames', 'npc_group_members', 'npc_id', 'npcs'],
]

const exec = (sql) => {
  db.exec(sql)
}

const createEntityTable = (tableName) => {
  exec(`
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id TEXT PRIMARY KEY,
      unique_id TEXT NOT NULL DEFAULT '',
      name TEXT NOT NULL DEFAULT '',
      payload_json TEXT NOT NULL CHECK (json_valid(payload_json)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_${tableName}_updated_at
      ON ${tableName} (updated_at DESC);

    CREATE INDEX IF NOT EXISTS idx_${tableName}_name
      ON ${tableName} (name COLLATE NOCASE);

    CREATE INDEX IF NOT EXISTS idx_${tableName}_unique_id
      ON ${tableName} (unique_id);
  `)
}

const createAreaTables = () => {
  exec(`
    CREATE TABLE IF NOT EXISTS areas (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_areas_updated_at
      ON areas (updated_at DESC);

    CREATE INDEX IF NOT EXISTS idx_areas_name
      ON areas (name COLLATE NOCASE);

    CREATE TABLE IF NOT EXISTS places (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS area_places (
      area_id TEXT NOT NULL,
      place_id TEXT NOT NULL,
      position INTEGER NOT NULL,
      PRIMARY KEY (area_id, place_id),
      FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE,
      FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_area_places_area
      ON area_places (area_id, position);

    CREATE INDEX IF NOT EXISTS idx_area_places_place
      ON area_places (place_id);
  `)
}

const createEventTables = () => {
  exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_events_updated_at
      ON events (updated_at DESC);

    CREATE INDEX IF NOT EXISTS idx_events_name
      ON events (name COLLATE NOCASE);
  `)
}

const createContextTables = () => {
  exec(`
    CREATE TABLE IF NOT EXISTS contexts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_contexts_updated_at
      ON contexts (updated_at DESC);

    CREATE INDEX IF NOT EXISTS idx_contexts_name
      ON contexts (name COLLATE NOCASE);

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

const createGroupTable = (tableName) => {
  exec(`
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_${tableName}_updated_at
      ON ${tableName} (updated_at DESC);

    CREATE INDEX IF NOT EXISTS idx_${tableName}_name
      ON ${tableName} (name COLLATE NOCASE);
  `)
}

const readJsonPayload = (filePath) => {
  return JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '') || '{}')
}

const clearGroupMembershipPayload = (tableName, payload) => {
  if (!tableName.endsWith('_groups')) {
    return payload
  }

  return {
    ...payload,
    ...(Object.hasOwn(payload, 'characterIds') ? { characterIds: [] } : {}),
    ...(Object.hasOwn(payload, 'monsterIds') ? { monsterIds: [] } : {}),
    ...(Object.hasOwn(payload, 'npcIds') ? { npcIds: [] } : {}),
  }
}

const importTableFromDirectory = (tableName, directoryName) => {
  const directory = path.join(dataDir, directoryName)
  fs.mkdirSync(directory, { recursive: true })

  const insert = db.prepare(`
    INSERT INTO ${tableName} (id, unique_id, name, payload_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  let count = 0

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.json')) {
      continue
    }

    const id = path.basename(entry.name, '.json')
    if (!/^[a-z0-9-]+$/i.test(id)) {
      continue
    }

    const filePath = path.join(directory, entry.name)
    const payload = clearGroupMembershipPayload(tableName, readJsonPayload(filePath))
    const fileInfo = fs.statSync(filePath)

    insert.run(
      id,
      typeof payload.uniqueId === 'string' ? payload.uniqueId : '',
      typeof payload.name === 'string' ? payload.name : '',
      JSON.stringify(payload),
      fileInfo.birthtime.toISOString(),
      fileInfo.mtime.toISOString(),
    )
    count += 1
  }

  return count
}

const importAreasFromDirectory = () => {
  const directory = path.join(dataDir, 'areas')
  fs.mkdirSync(directory, { recursive: true })

  const insertArea = db.prepare(`
    INSERT INTO areas (id, name, description, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `)
  const insertPlace = db.prepare(`
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
  let count = 0

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.json')) {
      continue
    }

    const id = path.basename(entry.name, '.json')
    if (!/^[a-z0-9-]+$/i.test(id)) {
      continue
    }

    const filePath = path.join(directory, entry.name)
    const payload = readJsonPayload(filePath)
    const fileInfo = fs.statSync(filePath)
    insertArea.run(
      id,
      typeof payload.name === 'string' ? payload.name : '',
      typeof payload.description === 'string' ? payload.description : '',
      fileInfo.birthtime.toISOString(),
      fileInfo.mtime.toISOString(),
    )

    const places = Array.isArray(payload.places) ? payload.places : []
    places.forEach((place, index) => {
      if (!place || typeof place.id !== 'string' || place.id.trim().length === 0) {
        return
      }

      insertPlace.run(
        place.id,
        typeof place.name === 'string' ? place.name : '',
        typeof place.description === 'string' ? place.description : '',
      )
      insertRelation.run(id, place.id, index)
    })
    count += 1
  }

  return count
}

const importEventsFromDirectory = () => {
  const directory = path.join(dataDir, 'events')
  fs.mkdirSync(directory, { recursive: true })

  const insertEvent = db.prepare(`
    INSERT INTO events (id, name, description, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `)
  let count = 0

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.json')) {
      continue
    }

    const id = path.basename(entry.name, '.json')
    if (!/^[a-z0-9-]+$/i.test(id)) {
      continue
    }

    const filePath = path.join(directory, entry.name)
    const payload = readJsonPayload(filePath)
    const fileInfo = fs.statSync(filePath)

    insertEvent.run(
      id,
      typeof payload.name === 'string' ? payload.name : '',
      typeof payload.description === 'string' ? payload.description : '',
      fileInfo.birthtime.toISOString(),
      fileInfo.mtime.toISOString(),
    )
    count += 1
  }

  return count
}

const getStringIds = (value) => {
  if (!Array.isArray(value)) {
    return []
  }

  const seen = new Set()
  const ids = []
  for (const item of value) {
    if (typeof item !== 'string') {
      continue
    }

    const trimmed = item.trim()
    const id = trimmed.toLowerCase().endsWith('.json') ? trimmed.slice(0, -5) : trimmed
    if (!id || seen.has(id)) {
      continue
    }

    seen.add(id)
    ids.push(id)
  }
  return ids
}

const importContextsFromDirectory = () => {
  const directory = path.join(dataDir, 'contexts')
  fs.mkdirSync(directory, { recursive: true })

  const insertContext = db.prepare(`
    INSERT INTO contexts (id, name, description, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `)
  const insertContextCharacter = db.prepare(`
    INSERT OR IGNORE INTO context_characters (context_id, character_id, position)
    VALUES (?, ?, ?)
  `)
  const insertCharacterGroup = db.prepare(`
    INSERT OR IGNORE INTO context_character_groups (context_id, group_id, position)
    VALUES (?, ?, ?)
  `)
  const insertCharacterGroupMember = db.prepare(`
    INSERT OR IGNORE INTO context_character_group_members (context_id, group_id, character_id, position)
    VALUES (?, ?, ?, ?)
  `)
  const insertNpcGroup = db.prepare(`
    INSERT OR IGNORE INTO context_npc_groups (context_id, group_id, position)
    VALUES (?, ?, ?)
  `)
  const insertNpcGroupMember = db.prepare(`
    INSERT OR IGNORE INTO context_npc_group_members (context_id, group_id, npc_id, position)
    VALUES (?, ?, ?, ?)
  `)
  const insertMonsterGroup = db.prepare(`
    INSERT OR IGNORE INTO context_monster_groups (context_id, group_id, position)
    VALUES (?, ?, ?)
  `)
  const insertMonsterGroupMember = db.prepare(`
    INSERT OR IGNORE INTO context_monster_group_members (context_id, group_id, monster_id, position)
    VALUES (?, ?, ?, ?)
  `)
  const insertArea = db.prepare(`
    INSERT OR IGNORE INTO context_areas (context_id, area_id, position)
    VALUES (?, ?, ?)
  `)
  const insertAreaPlace = db.prepare(`
    INSERT OR IGNORE INTO context_area_places (context_id, area_id, place_id, position)
    VALUES (?, ?, ?, ?)
  `)
  const insertEvent = db.prepare(`
    INSERT OR IGNORE INTO context_events (context_id, event_id, position)
    VALUES (?, ?, ?)
  `)
  const exists = {
    character: db.prepare('SELECT 1 FROM characters WHERE id = ?'),
    characterGroup: db.prepare('SELECT 1 FROM character_groups WHERE id = ?'),
    characterGroupMember: db.prepare('SELECT 1 FROM character_group_members WHERE group_id = ? AND character_id = ?'),
    npcGroup: db.prepare('SELECT 1 FROM npc_groups WHERE id = ?'),
    npcGroupMember: db.prepare('SELECT 1 FROM npc_group_members WHERE group_id = ? AND npc_id = ?'),
    monsterGroup: db.prepare('SELECT 1 FROM monster_groups WHERE id = ?'),
    monsterGroupMember: db.prepare('SELECT 1 FROM monster_group_members WHERE group_id = ? AND monster_id = ?'),
    area: db.prepare('SELECT 1 FROM areas WHERE id = ?'),
    areaPlace: db.prepare('SELECT 1 FROM area_places WHERE area_id = ? AND place_id = ?'),
    event: db.prepare('SELECT 1 FROM events WHERE id = ?'),
  }
  let count = 0

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.json')) {
      continue
    }

    const id = path.basename(entry.name, '.json')
    if (!/^[a-z0-9-]+$/i.test(id)) {
      continue
    }

    const filePath = path.join(directory, entry.name)
    const payload = readJsonPayload(filePath)
    const fileInfo = fs.statSync(filePath)
    insertContext.run(
      id,
      typeof payload.name === 'string' ? payload.name : '',
      typeof payload.description === 'string' ? payload.description : '',
      fileInfo.birthtime.toISOString(),
      fileInfo.mtime.toISOString(),
    )

    getStringIds(payload.characters).forEach((characterId, index) => {
      if (exists.character.get(characterId)) {
        insertContextCharacter.run(id, characterId, index)
      }
    })

    const importGroups = (groups, groupExists, memberExists, insertGroup, insertMember, idsKey) => {
      const list = Array.isArray(groups) ? groups : []
      list.forEach((group, groupIndex) => {
        if (!group || typeof group.id !== 'string' || !groupExists.get(group.id)) {
          return
        }

        insertGroup.run(id, group.id, groupIndex)
        getStringIds(group[idsKey]).forEach((memberId, memberIndex) => {
          if (memberExists.get(group.id, memberId)) {
            insertMember.run(id, group.id, memberId, memberIndex)
          }
        })
      })
    }

    importGroups(payload.characterGroups, exists.characterGroup, exists.characterGroupMember, insertCharacterGroup, insertCharacterGroupMember, 'characterIds')
    importGroups(payload.npcGroups, exists.npcGroup, exists.npcGroupMember, insertNpcGroup, insertNpcGroupMember, 'npcIds')
    importGroups(payload.monsterGroups, exists.monsterGroup, exists.monsterGroupMember, insertMonsterGroup, insertMonsterGroupMember, 'monsterIds')
    importGroups(payload.areas, exists.area, exists.areaPlace, insertArea, insertAreaPlace, 'placeIds')

    getStringIds(payload.events).forEach((eventId, index) => {
      if (exists.event.get(eventId)) {
        insertEvent.run(id, eventId, index)
      }
    })
    count += 1
  }

  return count
}

const importGroupFromDirectory = (tableName, directoryName, idsKey, legacyFileNamesKey, relationTableName, memberColumnName, memberTableName) => {
  const directory = path.join(dataDir, directoryName)
  fs.mkdirSync(directory, { recursive: true })

  const insertGroup = db.prepare(`
    INSERT INTO ${tableName} (id, name, created_at, updated_at)
    VALUES (?, ?, ?, ?)
  `)
  const memberExists = db.prepare(`SELECT 1 FROM ${memberTableName} WHERE id = ?`)
  const insertRelation = db.prepare(`
    INSERT OR IGNORE INTO ${relationTableName} (group_id, ${memberColumnName}, position)
    VALUES (?, ?, ?)
  `)
  let count = 0

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.json')) {
      continue
    }

    const id = path.basename(entry.name, '.json')
    if (!/^[a-z0-9-]+$/i.test(id)) {
      continue
    }

    const filePath = path.join(directory, entry.name)
    const payload = readJsonPayload(filePath)
    const fileInfo = fs.statSync(filePath)

    insertGroup.run(
      id,
      typeof payload.name === 'string' ? payload.name : '',
      fileInfo.birthtime.toISOString(),
      fileInfo.mtime.toISOString(),
    )

    const memberValues = Array.isArray(payload[idsKey])
      ? payload[idsKey]
      : Array.isArray(payload[legacyFileNamesKey])
        ? payload[legacyFileNamesKey]
        : []
    const seen = new Set()
    let position = 0

    for (const rawMemberId of memberValues) {
      if (typeof rawMemberId !== 'string') {
        continue
      }

      const trimmedMemberId = rawMemberId.trim()
      const memberId = trimmedMemberId.toLowerCase().endsWith('.json')
        ? trimmedMemberId.slice(0, -5)
        : trimmedMemberId
      if (!memberId || seen.has(memberId) || !memberExists.get(memberId)) {
        continue
      }

      seen.add(memberId)
      insertRelation.run(id, memberId, position)
      position += 1
    }

    count += 1
  }

  return count
}

const importRelations = ({ directoryName, key, memberColumnName, memberTableName, relationTableName }) => {
  const directory = path.join(dataDir, directoryName)
  const memberExists = db.prepare(`SELECT 1 FROM ${memberTableName} WHERE id = ?`)
  const insert = db.prepare(`
    INSERT OR IGNORE INTO ${relationTableName} (group_id, ${memberColumnName}, position)
    VALUES (?, ?, ?)
  `)
  const missing = []
  let count = 0

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.json')) {
      continue
    }

    const groupId = path.basename(entry.name, '.json')
    const payload = readJsonPayload(path.join(directory, entry.name))
    const fileNames = Array.isArray(payload[key]) ? payload[key] : []
    const seen = new Set()
    let position = 0

    for (const fileName of fileNames) {
      if (typeof fileName !== 'string' || !fileName.toLowerCase().endsWith('.json')) {
        continue
      }

      const memberId = fileName.slice(0, -5)
      if (!memberId || seen.has(memberId)) {
        continue
      }

      seen.add(memberId)
      if (!memberExists.get(memberId)) {
        missing.push({ groupId, memberId })
        continue
      }

      insert.run(groupId, memberId, position)
      position += 1
      count += 1
    }
  }

  return { count, missing }
}

db.pragma('journal_mode = PERSIST')
db.pragma('synchronous = NORMAL')
db.pragma('foreign_keys = ON')

for (const [tableName] of entityTables) {
  createEntityTable(tableName)
}
createAreaTables()
createEventTables()
for (const [tableName] of groupTables) {
  createGroupTable(tableName)
}

exec(`
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
`)
createContextTables()

exec(`
  DELETE FROM context_area_places;
  DELETE FROM context_areas;
  DELETE FROM context_monster_group_members;
  DELETE FROM context_monster_groups;
  DELETE FROM context_npc_group_members;
  DELETE FROM context_npc_groups;
  DELETE FROM context_character_group_members;
  DELETE FROM context_character_groups;
  DELETE FROM context_characters;
  DELETE FROM context_events;
  DELETE FROM contexts;
  DELETE FROM character_group_members;
  DELETE FROM monster_group_members;
  DELETE FROM npc_group_members;
  DELETE FROM area_places;
  DELETE FROM places;
  DELETE FROM areas;
  DELETE FROM events;
  DELETE FROM character_groups;
  DELETE FROM monster_groups;
  DELETE FROM npc_groups;
`)

for (const [tableName] of entityTables) {
  db.prepare(`DELETE FROM ${tableName}`).run()
}

const counts = {}
for (const [tableName, directoryName] of entityTables) {
  counts[tableName] = importTableFromDirectory(tableName, directoryName)
}
counts.areas = importAreasFromDirectory()
counts.events = importEventsFromDirectory()
const relationCounts = {}
for (const [tableName, directoryName, idsKey, legacyFileNamesKey, relationTableName, memberColumnName, memberTableName] of groupTables) {
  counts[tableName] = importGroupFromDirectory(tableName, directoryName, idsKey, legacyFileNamesKey, relationTableName, memberColumnName, memberTableName)
  relationCounts[relationTableName] = db.prepare(`SELECT COUNT(*) AS count FROM ${relationTableName}`).get().count
}
counts.contexts = importContextsFromDirectory()
for (const relationTableName of [
  'context_characters',
  'context_character_groups',
  'context_character_group_members',
  'context_npc_groups',
  'context_npc_group_members',
  'context_monster_groups',
  'context_monster_group_members',
  'context_areas',
  'context_area_places',
  'context_events',
]) {
  relationCounts[relationTableName] = db.prepare(`SELECT COUNT(*) AS count FROM ${relationTableName}`).get().count
}

const result = {
  counts,
  relationCounts,
  missing: {},
  foreignKeyCheck: db.prepare('PRAGMA foreign_key_check').all(),
}

const now = new Date().toISOString()
const fileMigration = db.prepare('INSERT OR REPLACE INTO file_migrations (entity_type, migrated_at) VALUES (?, ?)')
for (const [tableName] of entityTables) {
  fileMigration.run(tableName, now)
}
fileMigration.run('areas', now)
fileMigration.run('events', now)
fileMigration.run('contexts', now)
for (const [tableName] of groupTables) {
  fileMigration.run(tableName, now)
}

const groupMigration = db.prepare(`
  INSERT OR REPLACE INTO group_member_migrations (group_entity_type, member_entity_type, migrated_at)
  VALUES (?, ?, ?)
`)
groupMigration.run('character_groups', 'characters', now)
groupMigration.run('monster_groups', 'monsters', now)
groupMigration.run('npc_groups', 'npcs', now)

const staleFileMigration = db.prepare('DELETE FROM file_migrations WHERE entity_type = ?')
for (const staleName of ['adventure', 'area', 'character', 'character-group', 'context', 'event', 'monster', 'monster-group', 'npc', 'npc-group']) {
  staleFileMigration.run(staleName)
}

const staleGroupMigration = db.prepare('DELETE FROM group_member_migrations WHERE group_entity_type = ? AND member_entity_type = ?')
staleGroupMigration.run('character-group', 'character')
staleGroupMigration.run('monster-group', 'monster')
staleGroupMigration.run('npc-group', 'npc')

db.pragma('foreign_keys = OFF')
exec(`
  DROP TABLE IF EXISTS group_members;
  DROP TABLE IF EXISTS entities;
`)
db.pragma('foreign_keys = ON')

console.log(JSON.stringify(result, null, 2))
db.close()
