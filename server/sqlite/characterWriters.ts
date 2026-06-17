import { randomUUID } from 'node:crypto'
import { characterAttributes, characterDefences, characterSkills, getDatabase, quoteName } from './schema'
import { isRecord, rowNumber } from './utils'
import { normalizeStoredText } from './builders'
import type { StoredCharacterHistoryEntry } from './types'

export const getCharacterBaseParams = <TData>(id: string, payload: TData, createdAt: string, updatedAt: string): Record<string, unknown> => {
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

export const replaceCharacterRelations = <TData>(characterId: string, payload: TData): void => {
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

export const insertStoredItems = (
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

export const executeCharacterInsert = <TData>(
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

export const executeCharacterUpsert = <TData>(
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

