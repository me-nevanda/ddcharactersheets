import { randomUUID } from 'node:crypto'
import { mkdir, readFile, readdir, stat, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type {
  CharacterAbility,
  CharacterAbilityAreaType,
  Character,
  CharacterAbilityAction,
  CharacterAbilityKind,
  CharacterAbilityType,
  CharacterAttributeBonuses,
  CharacterAttributes,
  CharacterBonuses,
  CharacterData,
  CharacterDefenses,
  CharacterArmor,
  CharacterFeat,
  CharacterWeapon,
  CharacterOtherItem,
  CharacterWeaponDamageDiceType,
  CharacterWeaponDamageType,
  CharacterSkillBonuses,
  CharacterTraining,
  CharacterDefenseBonuses,
} from '../src/types/character'
import {
  CharacterAlignment,
  CharacterClass as CharacterClassValue,
  CharacterGender,
  CharacterRace as CharacterRaceValue,
} from '../src/types/character'
import { CharacterClass, CharacterRace } from '../src/types/character'

interface ApiError extends Error {
  code?: string
  statusCode?: number
}

interface LegacyCharacterBonuses extends CharacterBonuses {
  attributesPlus?: unknown
}

const charactersDirectory = path.resolve(process.cwd(), 'data', 'characters')
const safeCharacterIdPattern = /^[a-z0-9-]+$/i

function normalizeAttributeValue(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 10
  }

  return Math.min(40, Math.max(0, Math.trunc(value)))
}

function normalizeDefenseValue(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0
  }

  return Math.min(30, Math.max(0, Math.trunc(value)))
}

function normalizeLevelValue(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 1
  }

  return Math.min(30, Math.max(1, Math.trunc(value)))
}

function normalizeSpeedValue(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 6
  }

  return Math.min(12, Math.max(1, Math.trunc(value)))
}

function normalizeReadOnlyValue(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0
  }

  return Math.max(0, Math.trunc(value))
}

function normalizeAttributes(
  data: Partial<Record<keyof CharacterAttributes, unknown>> = {},
): CharacterAttributes {
  return {
    strength: normalizeAttributeValue(data.strength),
    condition: normalizeAttributeValue(data.condition),
    dexterity: normalizeAttributeValue(data.dexterity),
    intelligence: normalizeAttributeValue(data.intelligence),
    wisdom: normalizeAttributeValue(data.wisdom),
    charisma: normalizeAttributeValue(data.charisma),
  }
}

function normalizeDefenses(
  data: Partial<Record<keyof CharacterDefenses, unknown>> = {},
): CharacterDefenses {
  return {
    kp: normalizeDefenseValue(data.kp),
    fortitude: normalizeDefenseValue(data.fortitude),
    reflex: normalizeDefenseValue(data.reflex),
    will: normalizeDefenseValue(data.will),
  }
}

function normalizeTrainingValue(value: unknown): boolean {
  return value === true
}

function normalizeAbilityWeaponDamageDiceType(value: unknown): CharacterWeaponDamageDiceType | '' {
  if (
    value === '' ||
    value === 'd4' ||
    value === 'd6' ||
    value === 'd8' ||
    value === 'd10' ||
    value === 'd12' ||
    value === 'd20'
  ) {
    return value
  }

  return 'd4'
}

function normalizeAbilityWeaponDamageType(value: unknown): CharacterWeaponDamageType {
  if (
    value === 'normal' ||
    value === 'acid' ||
    value === 'cold' ||
    value === 'fire' ||
    value === 'force' ||
    value === 'lightning' ||
    value === 'necrotic' ||
    value === 'poison' ||
    value === 'psychic' ||
    value === 'radiant' ||
    value === 'thunder'
  ) {
    return value
  }

  return 'normal'
}

function normalizeAbilityWeaponAttackAttribute(value: unknown): CharacterAbility['weaponAttackAttribute'] {
  if (
    value === 'strength' ||
    value === 'condition' ||
    value === 'dexterity' ||
    value === 'intelligence' ||
    value === 'wisdom' ||
    value === 'charisma'
  ) {
    return value
  }

  return ''
}

function normalizeAbilityWeaponAttackBonusNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.min(10, Math.max(-5, Math.trunc(value)))
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)
    if (Number.isFinite(parsed)) {
      return Math.min(10, Math.max(-5, Math.trunc(parsed)))
    }
  }

  return 0
}

function normalizeAbilityWeaponAttackDefense(value: unknown): CharacterAbility['weaponAttackDefense'] {
  if (value === 'kp' || value === 'fortitude' || value === 'reflex' || value === 'will') {
    return value
  }

  return ''
}

function normalizeAbilityWeaponRange(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.min(30, Math.max(0, Math.trunc(value)))
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)
    if (Number.isFinite(parsed)) {
      return Math.min(30, Math.max(0, Math.trunc(parsed)))
    }
  }

  return 0
}

function normalizeAbilityWeaponArea(value: unknown): CharacterAbilityAreaType {
  if (
    value === 'point' ||
    value === 'burst1' ||
    value === 'burst2' ||
    value === 'burst3' ||
    value === 'burst4' ||
    value === 'burst5' ||
    value === 'burst6' ||
    value === 'burst7' ||
    value === 'burst8' ||
    value === 'burst9' ||
    value === 'burst10' ||
    value === 'blast1' ||
    value === 'blast2' ||
    value === 'blast3' ||
    value === 'blast4' ||
    value === 'blast5' ||
    value === 'blast6' ||
    value === 'blast7' ||
    value === 'blast8' ||
    value === 'blast9' ||
    value === 'blast10'
  ) {
    return value
  }

  return 'point'
}

function normalizeAbilityType(value: unknown): CharacterAbilityType {
  if (
    value === 'standard' ||
    value === 'unlimited' ||
    value === 'encounter' ||
    value === 'daily'
  ) {
    return value
  }

  return 'unlimited'
}

function normalizeAbilities(
  data: unknown,
): CharacterAbility[] {
  if (!Array.isArray(data)) {
    return []
  }

  return data
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item) => ({
      id: typeof item.id === 'string' && item.id.length > 0 ? item.id : randomUUID(),
      name: typeof item.name === 'string' ? item.name : '',
      description: typeof item.description === 'string' ? item.description : '',
      action: (item.action === 'noAction' ? 'noAction' : 'action') as CharacterAbilityAction,
      type: normalizeAbilityType(item.type),
      kind: (item.kind === 'utility' ? 'utility' : 'offensive') as CharacterAbilityKind,
      weaponCount:
        typeof item.weaponCount === 'number' && Number.isFinite(item.weaponCount)
          ? Math.min(10, Math.max(1, Math.trunc(item.weaponCount)))
          : 1,
      weaponName: typeof item.weaponName === 'string' ? item.weaponName : '',
      weaponDamageDiceType: normalizeAbilityWeaponDamageDiceType(item.weaponDamageDiceType),
      weaponDamageDiceCount:
        typeof item.weaponDamageDiceCount === 'number' && Number.isFinite(item.weaponDamageDiceCount)
          ? Math.min(20, Math.max(0, Math.trunc(item.weaponDamageDiceCount)))
          : 0,
      weaponAttributeBonus: normalizeWeaponAttributeBonus(item.weaponAttributeBonus),
      weaponAttackBonusNumber: normalizeAbilityWeaponAttackBonusNumber(item.weaponAttackBonusNumber),
      weaponAttackAttribute: normalizeAbilityWeaponAttackAttribute(item.weaponAttackAttribute),
      weaponAttackDefense: normalizeAbilityWeaponAttackDefense(item.weaponAttackDefense),
      weaponDamageType: normalizeAbilityWeaponDamageType(item.weaponDamageType),
      weaponRecurringDamageCount:
        typeof item.weaponRecurringDamageCount === 'number' && Number.isFinite(item.weaponRecurringDamageCount)
          ? Math.min(10, Math.max(0, Math.trunc(item.weaponRecurringDamageCount)))
          : 0,
      weaponRecurringDamageType: normalizeAbilityWeaponDamageType(item.weaponRecurringDamageType),
      weaponHit: typeof item.weaponHit === 'string' ? item.weaponHit : '',
      weaponMiss: typeof item.weaponMiss === 'string' ? item.weaponMiss : '',
      weaponProvocation: typeof item.weaponProvocation === 'string' ? item.weaponProvocation : '',
      weaponRange: normalizeAbilityWeaponRange(item.weaponRange),
      weaponArea: normalizeAbilityWeaponArea(item.weaponArea),
    }))
    .filter((ability) => ability.name.length > 0 || ability.description.length > 0)
}

function hasFeatContent(feat: CharacterFeat): boolean {
  return (
    feat.name.length > 0 ||
    feat.description.length > 0 ||
    feat.speedBonusNumber !== 0 ||
    feat.hpBonusNumber !== 0 ||
    feat.kpBonusNumber !== 0 ||
    feat.fortitudeBonusNumber !== 0 ||
    feat.reflexBonusNumber !== 0 ||
    feat.willBonusNumber !== 0 ||
    feat.acrobaticsBonusNumber !== 0 ||
    feat.arcanaBonusNumber !== 0 ||
    feat.athleticsBonusNumber !== 0 ||
    feat.diplomacyBonusNumber !== 0 ||
    feat.historyBonusNumber !== 0 ||
    feat.healingBonusNumber !== 0 ||
    feat.deceptionBonusNumber !== 0 ||
    feat.perceptionBonusNumber !== 0 ||
    feat.enduranceBonusNumber !== 0 ||
    feat.dungeoneeringBonusNumber !== 0 ||
    feat.natureBonusNumber !== 0 ||
    feat.religionBonusNumber !== 0 ||
    feat.insightBonusNumber !== 0 ||
    feat.stealthBonusNumber !== 0 ||
    feat.streetwiseBonusNumber !== 0 ||
    feat.intimidationBonusNumber !== 0 ||
    feat.thieveryBonusNumber !== 0
  )
}

function normalizeFeats(data: unknown): CharacterFeat[] {
  if (!Array.isArray(data)) {
    return []
  }

  return data
    .filter((item): item is Record<string, unknown> | string => typeof item === 'string' || (typeof item === 'object' && item !== null))
    .map((item) => {
      if (typeof item === 'string') {
        return {
          id: randomUUID(),
          name: item.trim(),
          description: item.trim(),
          visible: true,
          speedBonusNumber: 0,
          hpBonusNumber: 0,
          kpBonusNumber: 0,
          fortitudeBonusNumber: 0,
          reflexBonusNumber: 0,
          willBonusNumber: 0,
          acrobaticsBonusNumber: 0,
          arcanaBonusNumber: 0,
          athleticsBonusNumber: 0,
          diplomacyBonusNumber: 0,
          historyBonusNumber: 0,
          healingBonusNumber: 0,
          deceptionBonusNumber: 0,
          perceptionBonusNumber: 0,
          enduranceBonusNumber: 0,
          dungeoneeringBonusNumber: 0,
          natureBonusNumber: 0,
          religionBonusNumber: 0,
          insightBonusNumber: 0,
          stealthBonusNumber: 0,
          streetwiseBonusNumber: 0,
          intimidationBonusNumber: 0,
          thieveryBonusNumber: 0,
        }
      }

      return {
        id: typeof item.id === 'string' && item.id.length > 0 ? item.id : randomUUID(),
        name: typeof item.name === 'string' ? item.name.trim() : '',
        description: typeof item.description === 'string' ? item.description.trim() : '',
        visible: item.visible !== false,
        speedBonusNumber: normalizeWeaponBonusNumber(item.speedBonusNumber),
        hpBonusNumber: normalizeWeaponBonusNumber(item.hpBonusNumber),
        kpBonusNumber: normalizeWeaponBonusNumber(item.kpBonusNumber),
        fortitudeBonusNumber: normalizeWeaponBonusNumber(item.fortitudeBonusNumber),
        reflexBonusNumber: normalizeWeaponBonusNumber(item.reflexBonusNumber),
        willBonusNumber: normalizeWeaponBonusNumber(item.willBonusNumber),
        acrobaticsBonusNumber: normalizeWeaponBonusNumber(item.acrobaticsBonusNumber),
        arcanaBonusNumber: normalizeWeaponBonusNumber(item.arcanaBonusNumber),
        athleticsBonusNumber: normalizeWeaponBonusNumber(item.athleticsBonusNumber),
        diplomacyBonusNumber: normalizeWeaponBonusNumber(item.diplomacyBonusNumber),
        historyBonusNumber: normalizeWeaponBonusNumber(item.historyBonusNumber),
        healingBonusNumber: normalizeWeaponBonusNumber(item.healingBonusNumber),
        deceptionBonusNumber: normalizeWeaponBonusNumber(item.deceptionBonusNumber),
        perceptionBonusNumber: normalizeWeaponBonusNumber(item.perceptionBonusNumber),
        enduranceBonusNumber: normalizeWeaponBonusNumber(item.enduranceBonusNumber),
        dungeoneeringBonusNumber: normalizeWeaponBonusNumber(item.dungeoneeringBonusNumber),
        natureBonusNumber: normalizeWeaponBonusNumber(item.natureBonusNumber),
        religionBonusNumber: normalizeWeaponBonusNumber(item.religionBonusNumber),
        insightBonusNumber: normalizeWeaponBonusNumber(item.insightBonusNumber),
        stealthBonusNumber: normalizeWeaponBonusNumber(item.stealthBonusNumber),
        streetwiseBonusNumber: normalizeWeaponBonusNumber(item.streetwiseBonusNumber),
        intimidationBonusNumber: normalizeWeaponBonusNumber(item.intimidationBonusNumber),
        thieveryBonusNumber: normalizeWeaponBonusNumber(item.thieveryBonusNumber),
      }
    })
    .filter(hasFeatContent)
}

function normalizeWeaponAttributeBonus(value: unknown): keyof CharacterAttributes | '' {
  if (
    value === 'strength' ||
    value === 'condition' ||
    value === 'dexterity' ||
    value === 'intelligence' ||
    value === 'wisdom' ||
    value === 'charisma'
  ) {
    return value
  }

  return ''
}

function normalizeItemGroup<T extends CharacterArmor | CharacterWeapon | CharacterOtherItem>(data: unknown): T[] {
  if (!Array.isArray(data)) {
    return []
  }

  const normalized = data
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item) => ({
      name: typeof item.name === 'string' ? item.name.trim() : '',
      description: typeof item.description === 'string' ? item.description.trim() : '',
      equipped: item.equipped === true,
      strengthBonusNumber: normalizeWeaponBonusNumber(item.strengthBonusNumber),
      conditionBonusNumber: normalizeWeaponBonusNumber(item.conditionBonusNumber),
      dexterityBonusNumber: normalizeWeaponBonusNumber(item.dexterityBonusNumber),
      intelligenceBonusNumber: normalizeWeaponBonusNumber(item.intelligenceBonusNumber),
      wisdomBonusNumber: normalizeWeaponBonusNumber(item.wisdomBonusNumber),
      charismaBonusNumber: normalizeWeaponBonusNumber(item.charismaBonusNumber),
      speedBonusNumber: normalizeWeaponBonusNumber(item.speedBonusNumber),
      kpBonusNumber: normalizeWeaponBonusNumber(item.kpBonusNumber),
      fortitudeBonusNumber: normalizeWeaponBonusNumber(item.fortitudeBonusNumber),
      reflexBonusNumber: normalizeWeaponBonusNumber(item.reflexBonusNumber),
      willBonusNumber: normalizeWeaponBonusNumber(item.willBonusNumber),
    })) as T[]

  return normalized.filter((item) => item.name.length > 0 || item.description.length > 0)
}

function normalizeWeaponDamageDiceType(value: unknown): CharacterWeaponDamageDiceType {
  if (
    value === 'd4' ||
    value === 'd6' ||
    value === 'd8' ||
    value === 'd10' ||
    value === 'd12' ||
    value === 'd20'
  ) {
    return value
  }

  return 'd4'
}

function normalizeWeaponDamageType(value: unknown): CharacterWeaponDamageType {
  if (
    value === 'normal' ||
    value === 'poison' ||
    value === 'radiant' ||
    value === 'necrotic' ||
    value === 'psychic'
  ) {
    return value
  }

  return 'normal'
}

function normalizeWeaponDamageNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.min(10, Math.max(0, Math.trunc(value)))
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)
    if (Number.isFinite(parsed)) {
      return Math.min(10, Math.max(0, Math.trunc(parsed)))
    }
  }

  return 0
}

function normalizeWeaponRange(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.min(20, Math.max(1, Math.trunc(value)))
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)
    if (Number.isFinite(parsed)) {
      return Math.min(20, Math.max(1, Math.trunc(parsed)))
    }
  }

  return 1
}

function normalizeWeaponBonusNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.min(10, Math.max(-5, Math.trunc(value)))
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)
    if (Number.isFinite(parsed)) {
      return Math.min(10, Math.max(-5, Math.trunc(parsed)))
    }
  }

  return 0
}

function normalizeArmorGroup(data: unknown): CharacterArmor[] {
  if (!Array.isArray(data)) {
    return []
  }

  return data
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item) => ({
      name: typeof item.name === 'string' ? item.name.trim() : '',
      description: typeof item.description === 'string' ? item.description.trim() : '',
      equipped: item.equipped === true,
      strengthBonusNumber: normalizeWeaponBonusNumber(item.strengthBonusNumber),
      conditionBonusNumber: normalizeWeaponBonusNumber(item.conditionBonusNumber),
      dexterityBonusNumber: normalizeWeaponBonusNumber(item.dexterityBonusNumber),
      intelligenceBonusNumber: normalizeWeaponBonusNumber(item.intelligenceBonusNumber),
      wisdomBonusNumber: normalizeWeaponBonusNumber(item.wisdomBonusNumber),
      charismaBonusNumber: normalizeWeaponBonusNumber(item.charismaBonusNumber),
      speedBonusNumber: normalizeWeaponBonusNumber(item.speedBonusNumber),
      armorPenaltyNumber: normalizeWeaponBonusNumber(item.armorPenaltyNumber),
      kpBonusNumber: normalizeWeaponBonusNumber(item.kpBonusNumber),
      fortitudeBonusNumber: normalizeWeaponBonusNumber(item.fortitudeBonusNumber),
      reflexBonusNumber: normalizeWeaponBonusNumber(item.reflexBonusNumber),
      willBonusNumber: normalizeWeaponBonusNumber(item.willBonusNumber),
    }))
    .filter((item) => item.name.length > 0 || item.description.length > 0)
}

function normalizeWeaponProficiencyBonusNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.min(5, Math.max(0, Math.trunc(value)))
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)
    if (Number.isFinite(parsed)) {
      return Math.min(5, Math.max(0, Math.trunc(parsed)))
    }
  }

  return 0
}

function normalizeWeaponGroup(data: unknown): CharacterWeapon[] {
  if (!Array.isArray(data)) {
    return []
  }

  return data
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item) => ({
      name: typeof item.name === 'string' ? item.name.trim() : '',
      description: typeof item.description === 'string' ? item.description.trim() : '',
      damageDiceCount:
        typeof item.damageDiceCount === 'number' && Number.isFinite(item.damageDiceCount)
          ? Math.min(5, Math.max(1, Math.trunc(item.damageDiceCount)))
          : 1,
      damageDiceType: normalizeWeaponDamageDiceType(item.damageDiceType),
      damageBonusNumber: normalizeWeaponDamageNumber(item.damageBonusNumber ?? item.damageBonus),
      range: normalizeWeaponRange(item.range),
      equipped: item.equipped === true,
      weaponProficiencyBonusNumber: normalizeWeaponProficiencyBonusNumber(item.weaponProficiencyBonusNumber),
      strengthBonusNumber: normalizeWeaponBonusNumber(item.strengthBonusNumber),
      conditionBonusNumber: normalizeWeaponBonusNumber(item.conditionBonusNumber),
      dexterityBonusNumber: normalizeWeaponBonusNumber(item.dexterityBonusNumber),
      intelligenceBonusNumber: normalizeWeaponBonusNumber(item.intelligenceBonusNumber),
      wisdomBonusNumber: normalizeWeaponBonusNumber(item.wisdomBonusNumber),
      charismaBonusNumber: normalizeWeaponBonusNumber(item.charismaBonusNumber),
      speedBonusNumber: normalizeWeaponBonusNumber(item.speedBonusNumber),
      kpBonusNumber: normalizeWeaponBonusNumber(item.kpBonusNumber),
      fortitudeBonusNumber: normalizeWeaponBonusNumber(item.fortitudeBonusNumber),
      reflexBonusNumber: normalizeWeaponBonusNumber(item.reflexBonusNumber),
      willBonusNumber: normalizeWeaponBonusNumber(item.willBonusNumber),
    }))
    .filter((item) => item.name.length > 0 || item.description.length > 0)
}

function normalizeItems(data: unknown): {
  armors: CharacterArmor[]
  weapons: CharacterWeapon[]
  others: CharacterOtherItem[]
} {
  if (Array.isArray(data)) {
    return {
      armors: [],
      weapons: [],
      others: normalizeItemGroup(data),
    }
  }

  if (!data || typeof data !== 'object') {
    return {
      armors: [],
      weapons: [],
      others: [],
    }
  }

  const source = data as Partial<Record<'armors' | 'weapons' | 'others', unknown>>

  return {
    armors: normalizeArmorGroup(source.armors),
    weapons: normalizeWeaponGroup(source.weapons),
    others: normalizeItemGroup(source.others),
  }
}

function getAttributeModifier(value: number): number {
  return Math.floor((normalizeAttributeValue(value) - 10) / 2)
}

function getLevelBonus(value: number): number {
  return Math.floor(normalizeLevelValue(value) / 2)
}

function buildAttributeBonuses(attributes: CharacterAttributes): CharacterAttributeBonuses {
  return {
    strength: getAttributeModifier(attributes.strength),
    condition: getAttributeModifier(attributes.condition),
    dexterity: getAttributeModifier(attributes.dexterity),
    intelligence: getAttributeModifier(attributes.intelligence),
    wisdom: getAttributeModifier(attributes.wisdom),
    charisma: getAttributeModifier(attributes.charisma),
  }
}

function buildZeroAttributeBonuses(): CharacterAttributeBonuses {
  return {
    strength: 0,
    condition: 0,
    dexterity: 0,
    intelligence: 0,
    wisdom: 0,
    charisma: 0,
  }
}

function normalizeAttributeBonusValue(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null
  }

  return Math.trunc(value)
}

function normalizeAttributeBonuses(
  data: Partial<Record<keyof CharacterAttributeBonuses, unknown>> | undefined,
  fallback: CharacterAttributeBonuses,
): CharacterAttributeBonuses {
  return {
    strength: normalizeAttributeBonusValue(data?.strength) ?? fallback.strength,
    condition: normalizeAttributeBonusValue(data?.condition) ?? fallback.condition,
    dexterity: normalizeAttributeBonusValue(data?.dexterity) ?? fallback.dexterity,
    intelligence: normalizeAttributeBonusValue(data?.intelligence) ?? fallback.intelligence,
    wisdom: normalizeAttributeBonusValue(data?.wisdom) ?? fallback.wisdom,
    charisma: normalizeAttributeBonusValue(data?.charisma) ?? fallback.charisma,
  }
}

function normalizeDefenseBonusValue(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null
  }

  return Math.trunc(value)
}

function normalizeDefenseBonuses(
  data: Partial<Record<keyof CharacterDefenseBonuses, unknown>> | undefined,
  fallback: CharacterDefenseBonuses,
): CharacterDefenseBonuses {
  return {
    kp: normalizeDefenseBonusValue(data?.kp) ?? fallback.kp,
    fortitude: normalizeDefenseBonusValue(data?.fortitude) ?? fallback.fortitude,
    reflex: normalizeDefenseBonusValue(data?.reflex) ?? fallback.reflex,
    will: normalizeDefenseBonusValue(data?.will) ?? fallback.will,
  }
}

function buildSkillBonuses(
  level: number,
  attributeBonuses: CharacterAttributeBonuses,
  training: CharacterTraining,
): CharacterSkillBonuses {
  const levelBonus = getLevelBonus(level)

  function withTraining(baseBonus: number, trained: boolean): number {
    return baseBonus + levelBonus + (trained ? 5 : 0)
  }

  return {
    acrobatics: withTraining(attributeBonuses.dexterity, training.acrobatics),
    arcana: withTraining(attributeBonuses.intelligence, training.arcana),
    athletics: withTraining(attributeBonuses.strength, training.athletics),
    diplomacy: withTraining(attributeBonuses.charisma, training.diplomacy),
    history: withTraining(attributeBonuses.intelligence, training.history),
    healing: withTraining(attributeBonuses.wisdom, training.healing),
    deception: withTraining(attributeBonuses.charisma, training.deception),
    perception: withTraining(attributeBonuses.wisdom, training.perception),
    endurance: withTraining(attributeBonuses.condition, training.endurance),
    dungeoneering: withTraining(attributeBonuses.intelligence, training.dungeoneering),
    nature: withTraining(attributeBonuses.wisdom, training.nature),
    religion: withTraining(attributeBonuses.intelligence, training.religion),
    insight: withTraining(attributeBonuses.charisma, training.insight),
    stealth: withTraining(attributeBonuses.dexterity, training.stealth),
    streetwise: withTraining(attributeBonuses.wisdom, training.streetwise),
    intimidation: withTraining(attributeBonuses.charisma, training.intimidation),
    thievery: withTraining(attributeBonuses.dexterity, training.thievery),
  }
}

function normalizeSkillBonusValue(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null
  }

  return Math.trunc(value)
}

function normalizeSkillBonuses(
  data: Partial<Record<keyof CharacterSkillBonuses, unknown>> | undefined,
  fallback: CharacterSkillBonuses,
): CharacterSkillBonuses {
  return {
    acrobatics: normalizeSkillBonusValue(data?.acrobatics) ?? fallback.acrobatics,
    arcana: normalizeSkillBonusValue(data?.arcana) ?? fallback.arcana,
    athletics: normalizeSkillBonusValue(data?.athletics) ?? fallback.athletics,
    diplomacy: normalizeSkillBonusValue(data?.diplomacy) ?? fallback.diplomacy,
    history: normalizeSkillBonusValue(data?.history) ?? fallback.history,
    healing: normalizeSkillBonusValue(data?.healing) ?? fallback.healing,
    deception: normalizeSkillBonusValue(data?.deception) ?? fallback.deception,
    perception: normalizeSkillBonusValue(data?.perception) ?? fallback.perception,
    endurance: normalizeSkillBonusValue(data?.endurance) ?? fallback.endurance,
    dungeoneering: normalizeSkillBonusValue(data?.dungeoneering) ?? fallback.dungeoneering,
    nature: normalizeSkillBonusValue(data?.nature) ?? fallback.nature,
    religion: normalizeSkillBonusValue(data?.religion) ?? fallback.religion,
    insight: normalizeSkillBonusValue(data?.insight) ?? fallback.insight,
    stealth: normalizeSkillBonusValue(data?.stealth) ?? fallback.stealth,
    streetwise: normalizeSkillBonusValue(data?.streetwise) ?? fallback.streetwise,
    intimidation: normalizeSkillBonusValue(data?.intimidation) ?? fallback.intimidation,
    thievery: normalizeSkillBonusValue(data?.thievery) ?? fallback.thievery,
  }
}

function buildDefenseBonuses(
  level: number,
  attributeBonuses: CharacterAttributeBonuses,
): CharacterDefenseBonuses {
  const levelBonus = getLevelBonus(level)

  return {
    kp: 10 + Math.max(attributeBonuses.dexterity, attributeBonuses.intelligence) + levelBonus,
    fortitude: 10 + Math.max(attributeBonuses.strength, attributeBonuses.condition) + levelBonus,
    reflex: 10 + Math.max(attributeBonuses.dexterity, attributeBonuses.intelligence) + levelBonus,
    will: 10 + Math.max(attributeBonuses.wisdom, attributeBonuses.charisma) + levelBonus,
  }
}

function normalizeTraining(
  data: Partial<Record<keyof CharacterTraining, unknown>> = {},
): CharacterTraining {
  return {
    acrobatics: normalizeTrainingValue(data.acrobatics),
    arcana: normalizeTrainingValue(data.arcana),
    athletics: normalizeTrainingValue(data.athletics),
    diplomacy: normalizeTrainingValue(data.diplomacy),
    history: normalizeTrainingValue(data.history),
    healing: normalizeTrainingValue(data.healing),
    deception: normalizeTrainingValue(data.deception),
    perception: normalizeTrainingValue(data.perception),
    endurance: normalizeTrainingValue(data.endurance),
    dungeoneering: normalizeTrainingValue(data.dungeoneering),
    nature: normalizeTrainingValue(data.nature),
    religion: normalizeTrainingValue(data.religion),
    insight: normalizeTrainingValue(data.insight),
    stealth: normalizeTrainingValue(data.stealth),
    streetwise: normalizeTrainingValue(data.streetwise),
    intimidation: normalizeTrainingValue(data.intimidation),
    thievery: normalizeTrainingValue(data.thievery),
  }
}

function normalizeRaceValue(value: unknown): CharacterRace {
  if (typeof value === 'string') {
    if (Object.values(CharacterRace).includes(value as CharacterRace)) {
      return value as CharacterRace
    }
  }

  return CharacterRace.Human
}

function normalizeClassValue(value: unknown): CharacterClass {
  if (typeof value === 'string') {
    if (Object.values(CharacterClass).includes(value as CharacterClass)) {
      return value as CharacterClass
    }
  }

  return CharacterClass.Warlock
}

function normalizeGenderValue(value: unknown): CharacterGender {
  if (typeof value === 'string') {
    if (Object.values(CharacterGender).includes(value as CharacterGender)) {
      return value as CharacterGender
    }
  }

  return CharacterGender.Unspecified
}

function normalizeAlignmentValue(value: unknown): CharacterAlignment {
  if (typeof value === 'string') {
    if (Object.values(CharacterAlignment).includes(value as CharacterAlignment)) {
      return value as CharacterAlignment
    }
  }

  return CharacterAlignment.TrueNeutral
}

function normalizeCharacter(
  data: Partial<Record<keyof CharacterData, unknown>> = {},
): CharacterData {
  const level = normalizeLevelValue(data.level)
  const attributes =
    typeof data.attributes === 'object' && data.attributes !== null
      ? normalizeAttributes(data.attributes as Partial<Record<keyof CharacterAttributes, unknown>>)
      : normalizeAttributes()
  const training =
    typeof data.training === 'object' && data.training !== null
      ? normalizeTraining(data.training as Partial<Record<keyof CharacterTraining, unknown>>)
      : normalizeTraining()
  const abilities = normalizeAbilities((data as Record<string, unknown>).abilities)
  const feats = normalizeFeats((data as Record<string, unknown>).feats)
  const items = normalizeItems((data as Record<string, unknown>).items)
  const attributeBonuses = buildAttributeBonuses(attributes)
  const race =
    typeof data.race === 'string'
      ? normalizeRaceValue(data.race)
      : CharacterRaceValue.Human
  const clazz =
    typeof data.class === 'string'
      ? normalizeClassValue(data.class)
      : CharacterClassValue.Warlock

  const speed = normalizeSpeedValue(data.speed)
  const computedSkillBonuses = buildSkillBonuses(level, attributeBonuses, training)
  const computedAttributeBonuses = buildAttributeBonuses(attributes)
  const computedDefenseBonuses = buildDefenseBonuses(level, attributeBonuses)
  const bonusData =
    typeof data.bonuses === 'object' && data.bonuses !== null
      ? (data.bonuses as LegacyCharacterBonuses)
      : undefined
  const attributesPlusData =
    typeof data.attributesPlus === 'object' && data.attributesPlus !== null
      ? (data.attributesPlus as Partial<Record<keyof CharacterAttributeBonuses, unknown>>)
      : (bonusData?.attributesPlus as Partial<Record<keyof CharacterAttributeBonuses, unknown>> | undefined)

  const bonuses: CharacterBonuses = {
    level: getLevelBonus(level),
    attributes: normalizeAttributeBonuses(
      bonusData?.attributes as Partial<Record<keyof CharacterAttributeBonuses, unknown>> | undefined,
      computedAttributeBonuses,
    ),
    skills: normalizeSkillBonuses(
      bonusData?.skills as Partial<Record<keyof CharacterSkillBonuses, unknown>> | undefined,
      computedSkillBonuses,
    ),
    defenses: normalizeDefenseBonuses(
      bonusData?.defenses as Partial<Record<keyof CharacterDefenseBonuses, unknown>> | undefined,
      computedDefenseBonuses,
    ),
  }

  return {
    name: typeof data.name === 'string' ? data.name : '',
    level,
    race,
    class: clazz,
    gender: normalizeGenderValue(data.gender),
    alignment: normalizeAlignmentValue(data.alignment),
    hp: normalizeReadOnlyValue(data.hp),
    surge: normalizeReadOnlyValue(data.surge),
    speed,
    attributes,
    attributesPlus: normalizeAttributeBonuses(attributesPlusData, buildZeroAttributeBonuses()),
    abilities,
    feats,
    items,
    bonuses,
    defenses:
      typeof data.defenses === 'object' && data.defenses !== null
        ? normalizeDefenses(data.defenses as Partial<Record<keyof CharacterDefenses, unknown>>)
        : normalizeDefenses(),
    training,
  }
}

function parseCharacter(rawCharacter: string): Partial<Record<keyof CharacterData, unknown>> {
  return JSON.parse(rawCharacter || '{}') as Partial<Record<keyof CharacterData, unknown>>
}

async function ensureCharactersDirectory(): Promise<void> {
  await mkdir(charactersDirectory, { recursive: true })
}

function getCharacterFilePath(characterId: string): string {
  if (!isSafeCharacterId(characterId)) {
    const error = new Error('Invalid character id') as ApiError
    error.statusCode = 400
    error.code = 'API_INVALID_CHARACTER_ID'
    throw error
  }

  return path.join(charactersDirectory, `${characterId}.json`)
}

export function isSafeCharacterId(characterId: string): boolean {
  return safeCharacterIdPattern.test(characterId)
}

export async function listCharacters(): Promise<Character[]> {
  await ensureCharactersDirectory()

  const entries = await readdir(charactersDirectory, { withFileTypes: true })
  const characterFiles = entries.filter(
    (entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.json'),
  )

  const characters = await Promise.all(
    characterFiles.map(async (entry) => {
      const characterId = path.basename(entry.name, '.json')
      const filePath = getCharacterFilePath(characterId)
      const [rawCharacter, fileInfo] = await Promise.all([
        readFile(filePath, 'utf8'),
        stat(filePath),
      ])

      return {
        id: characterId,
        ...normalizeCharacter(parseCharacter(rawCharacter)),
        updatedAt: fileInfo.mtime.toISOString(),
      }
    }),
  )

  return characters.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
}

export async function readCharacter(characterId: string): Promise<Character> {
  await ensureCharactersDirectory()

  const filePath = getCharacterFilePath(characterId)
  const rawCharacter = await readFile(filePath, 'utf8')
  const fileInfo = await stat(filePath)

  return {
    id: characterId,
    ...normalizeCharacter(parseCharacter(rawCharacter)),
    updatedAt: fileInfo.mtime.toISOString(),
  }
}

export async function createCharacter(): Promise<Character> {
  await ensureCharactersDirectory()

  const characterId = `${Date.now()}-${randomUUID().slice(0, 8)}`
  const filePath = getCharacterFilePath(characterId)

  await writeFile(filePath, '{}\n', 'utf8')

  return readCharacter(characterId)
}

export async function updateCharacter(characterId: string, data: unknown): Promise<Character> {
  await ensureCharactersDirectory()

  const filePath = getCharacterFilePath(characterId)
  const rawCharacter = await readFile(filePath, 'utf8')
  const existingCharacter = parseCharacter(rawCharacter)
  const nextCharacter = {
    ...existingCharacter,
    ...normalizeCharacter(
      typeof data === 'object' && data !== null
        ? (data as Partial<Record<keyof CharacterData, unknown>>)
        : {},
    ),
  }

  await writeFile(filePath, `${JSON.stringify(nextCharacter, null, 2)}\n`, 'utf8')

  return readCharacter(characterId)
}

export async function deleteCharacter(characterId: string): Promise<void> {
  await ensureCharactersDirectory()

  const filePath = getCharacterFilePath(characterId)
  await unlink(filePath)
}
