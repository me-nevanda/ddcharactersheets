import { randomUUID } from 'node:crypto'
import { characterDefences, getDatabase, quoteName } from './schema'
import { isRecord, rowNumber } from './utils'
import { normalizeStoredText } from './builders'
import { insertStoredItems } from './characterWriters'

export const getNpcBaseParams = <TData>(id: string, payload: TData, createdAt: string, updatedAt: string): Record<string, unknown> => {
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

export const getMonsterBaseParams = <TData>(id: string, payload: TData, createdAt: string, updatedAt: string): Record<string, unknown> => {
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

export const insertStoredAttacks = (
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

export const insertStoredNpcHistoryEntries = (npcId: string, sourceEntries: unknown): void => {
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

export const replaceNpcRelations = <TData>(npcId: string, payload: TData): void => {
  const source = payload as Record<string, unknown>
  const db = getDatabase()
  db.prepare('DELETE FROM npcs_attacks WHERE npc_id = ?').run(npcId)
  db.prepare('DELETE FROM npcs_items WHERE npc_id = ?').run(npcId)
  db.prepare('DELETE FROM npc_history_entries WHERE npc_id = ?').run(npcId)

  insertStoredAttacks('npc_id', npcId, 'npcs_attacks', source.attacks)
  insertStoredItems('npc_id', npcId, 'npcs_items', source.items)
  insertStoredNpcHistoryEntries(npcId, source.history)
}

export const replaceMonsterRelations = <TData>(monsterId: string, payload: TData): void => {
  const source = payload as Record<string, unknown>
  const db = getDatabase()
  db.prepare('DELETE FROM monsters_attacks WHERE monster_id = ?').run(monsterId)
  db.prepare('DELETE FROM monsters_items WHERE monster_id = ?').run(monsterId)
  insertStoredAttacks('monster_id', monsterId, 'monsters_attacks', source.attacks)
  insertStoredItems('monster_id', monsterId, 'monsters_items', source.items)
}

export const executeNpcInsert = <TData>(
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

export const executeNpcUpsert = <TData>(
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

export const executeMonsterInsert = <TData>(
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

export const executeMonsterUpsert = <TData>(
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

