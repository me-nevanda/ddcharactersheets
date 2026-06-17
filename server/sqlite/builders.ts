import { characterAttributes, characterDefences, characterSkills, getDatabase, mapTableName, quoteName } from './schema'
import { getMemberIds, getPayloadMetadata, parseJsonValue, parsePayload } from './utils'
import type { AreaRow, CharacterRow, ContextRow, EntityRow, EventRow, GroupMemberRow, GroupRow, MapRow, MonsterRow, NpcRow, PlaceRow, StoredAreaOptions, StoredCharacterHistoryEntry, StoredCharacterOptions, StoredContextOptions, StoredEntityOptions, StoredEventOptions, StoredGroupOptions, StoredMapOptions, StoredMonsterOptions, StoredNpcHistoryEntry, StoredNpcOptions } from './types'

export const buildEntity = <TData, TEntity>(
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

export const normalizeStoredText = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : ''
}

export const getAreaPlaces = (areaId: string): PlaceRow[] => {
  return getDatabase().prepare(`
    SELECT places.id, places.name, places.description
    FROM area_places
    INNER JOIN places ON places.id = area_places.place_id
    WHERE area_places.area_id = ?
    ORDER BY area_places.position ASC, places.id ASC
  `).all(areaId) as PlaceRow[]
}

export const buildArea = <TData, TEntity>(
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

export const buildEvent = <TData, TEntity>(
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

export const buildMap = <TData, TEntity>(
  row: MapRow,
  options: StoredMapOptions<TData>,
): TEntity => {
  const grid = parseJsonValue(row.grid_json)
  const normalized = options.normalize({
    name: row.name,
    description: row.description,
    grid,
  } as Partial<Record<keyof TData, unknown>>)
  return {
    id: row.id,
    ...normalized,
    updatedAt: row.updated_at,
  } as TEntity
}

export const getContextCharacters = (contextId: string): string[] => {
  const rows = getDatabase().prepare(`
    SELECT character_id AS member_id
    FROM context_characters
    WHERE context_id = ?
    ORDER BY position ASC, character_id ASC
  `).all(contextId) as GroupMemberRow[]

  return rows.map((row) => row.member_id)
}

export const getContextEvents = (contextId: string): string[] => {
  const rows = getDatabase().prepare(`
    SELECT event_id AS member_id
    FROM context_events
    WHERE context_id = ?
    ORDER BY position ASC, event_id ASC
  `).all(contextId) as GroupMemberRow[]

  return rows.map((row) => row.member_id)
}

export const getContextGroupedIds = (
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

export const getContextAreas = (contextId: string): Record<string, unknown>[] => {
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

export const buildContext = <TData, TEntity>(
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

export const buildGroup = <TData, TEntity>(
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

export const rowNumber = (row: Record<string, unknown>, key: string): number => {
  const value = row[key]
  return typeof value === 'number' && Number.isFinite(value) ? Math.trunc(value) : 0
}

export const rowText = (row: Record<string, unknown>, key: string): string => {
  const value = row[key]
  return typeof value === 'string' ? value : ''
}

export const getCharacterAbilities = (characterId: string): Record<string, unknown>[] => {
  return getDatabase().prepare(`
    SELECT *
    FROM characters_abilities
    WHERE character_id = ?
    ORDER BY position ASC, id ASC
  `).all(characterId) as Record<string, unknown>[]
}

export const getCharacterFeats = (characterId: string): Record<string, unknown>[] => {
  return getDatabase().prepare(`
    SELECT *
    FROM characters_feats
    WHERE character_id = ?
    ORDER BY position ASC, id ASC
  `).all(characterId) as Record<string, unknown>[]
}

export const getCharacterItems = (characterId: string): Record<string, unknown>[] => {
  return getDatabase().prepare(`
    SELECT *
    FROM characters_items
    WHERE character_id = ?
    ORDER BY item_type ASC, position ASC, id ASC
  `).all(characterId) as Record<string, unknown>[]
}

export const mapStoredItem = (item: Record<string, unknown>): Record<string, unknown> => ({
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

export const buildCharacterPayload = (row: CharacterRow): Partial<Record<string, unknown>> => {
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

export const getNpcAttacks = (npcId: string): Record<string, unknown>[] => {
  return getDatabase().prepare(`
    SELECT *
    FROM npcs_attacks
    WHERE npc_id = ?
    ORDER BY position ASC, id ASC
  `).all(npcId) as Record<string, unknown>[]
}

export const getNpcItems = (npcId: string): Record<string, unknown>[] => {
  return getDatabase().prepare(`
    SELECT *
    FROM npcs_items
    WHERE npc_id = ?
    ORDER BY item_type ASC, position ASC, id ASC
  `).all(npcId) as Record<string, unknown>[]
}

export const getNpcHistoryEntries = (npcId: string): StoredNpcHistoryEntry[] => {
  return getDatabase().prepare(`
    SELECT id, title, content
    FROM npc_history_entries
    WHERE npc_id = ?
    ORDER BY position ASC, id ASC
  `).all(npcId) as StoredNpcHistoryEntry[]
}

export const getMonsterAttacks = (monsterId: string): Record<string, unknown>[] => {
  return getDatabase().prepare(`
    SELECT *
    FROM monsters_attacks
    WHERE monster_id = ?
    ORDER BY position ASC, id ASC
  `).all(monsterId) as Record<string, unknown>[]
}

export const getMonsterItems = (monsterId: string): Record<string, unknown>[] => {
  return getDatabase().prepare(`
    SELECT *
    FROM monsters_items
    WHERE monster_id = ?
    ORDER BY item_type ASC, position ASC, id ASC
  `).all(monsterId) as Record<string, unknown>[]
}

export const buildMonsterOrNpcItems = (rows: Record<string, unknown>[]): { armors: Record<string, unknown>[]; weapons: Record<string, unknown>[]; others: Record<string, unknown>[] } => {
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

export const buildNpcPayload = (row: NpcRow): Partial<Record<string, unknown>> => {
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

export const buildMonsterPayload = (row: MonsterRow): Partial<Record<string, unknown>> => {
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

export const buildNpc = <TData, TEntity>(
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

export const buildMonster = <TData, TEntity>(
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

export const buildCharacter = <TData, TEntity>(
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

