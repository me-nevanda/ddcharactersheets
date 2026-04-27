import {
  defaultAbilityType,
  defaultAbilityWeaponArea,
  defaultAbilityWeaponAttackBonusNumber,
  defaultAbilityWeaponAttackDefense,
  defaultAbilityWeaponDamageDiceCount,
  defaultAbilityWeaponDamageDiceType,
  defaultAbilityWeaponDamageType,
  defaultAbilityWeaponRange,
  defaultAbilityWeaponRecurringDamageCount,
  defaultAbilityWeaponRecurringDamageType,
  emptyFeat,
  emptyItems,
} from './characterEditPageUtils'
import { formatModifier } from './sections/GeneralSection/generalSectionLogic'
import { CharacterAlignment, CharacterGender } from '../../types/character'
import type {
  CharacterAbility,
  CharacterAbilityAreaType,
  CharacterArmor,
  CharacterAttributeBonuses,
  CharacterDefenses,
  CharacterFeat,
  CharacterItemBonusFieldName,
  CharacterItems,
  CharacterOtherItem,
  CharacterWeapon,
  CharacterWeaponDamageDiceType,
  CharacterWeaponDamageType,
} from '../../types/character'
import type { CharacterItemGroupKey } from './types'

type EquippedItemBonusSource = {
  name: string
  bonus: number
}

export const normalizeAbilityWeaponDamageDiceType = (
  value: unknown,
  fallback: CharacterWeaponDamageDiceType | '',
): CharacterWeaponDamageDiceType | '' => {
  if (
    value === ''
    || value === 'd4'
    || value === 'd6'
    || value === 'd8'
    || value === 'd10'
    || value === 'd12'
    || value === 'd20'
  ) {
    return value
  }

  return fallback
}

export const normalizeAbilityWeaponDamageDiceCount = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.min(20, Math.max(0, Math.trunc(value)))
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)

    if (Number.isFinite(parsed)) {
      return Math.min(20, Math.max(0, Math.trunc(parsed)))
    }
  }

  return fallback
}

export const normalizeAbilityWeaponRecurringDamageCount = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.min(10, Math.max(0, Math.trunc(value)))
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)

    if (Number.isFinite(parsed)) {
      return Math.min(10, Math.max(0, Math.trunc(parsed)))
    }
  }

  return fallback
}

export const normalizeAbilityWeaponDamageType = (
  value: unknown,
  fallback: CharacterWeaponDamageType,
): CharacterWeaponDamageType => {
  if (
    value === 'normal'
    || value === 'acid'
    || value === 'cold'
    || value === 'fire'
    || value === 'force'
    || value === 'lightning'
    || value === 'necrotic'
    || value === 'poison'
    || value === 'psychic'
    || value === 'radiant'
    || value === 'thunder'
  ) {
    return value
  }

  return fallback
}

export const normalizeAbilityWeaponAttackAttribute = (
  value: unknown,
): CharacterAbility['weaponAttackAttribute'] => {
  if (
    value === 'strength'
    || value === 'condition'
    || value === 'dexterity'
    || value === 'intelligence'
    || value === 'wisdom'
    || value === 'charisma'
  ) {
    return value
  }

  return ''
}

export const normalizeAbilityWeaponAttackDefense = (
  value: unknown,
): CharacterAbility['weaponAttackDefense'] => {
  if (value === 'kp' || value === 'fortitude' || value === 'reflex' || value === 'will') {
    return value
  }

  return ''
}

export const normalizeGenderValue = (value: unknown): CharacterGender => {
  if (value === CharacterGender.Male || value === CharacterGender.Female || value === CharacterGender.Unspecified) {
    return value
  }

  return CharacterGender.Unspecified
}

export const normalizeAlignmentValue = (value: unknown): CharacterAlignment => {
  if (
    value === CharacterAlignment.LawfulGood
    || value === CharacterAlignment.LawfulNeutral
    || value === CharacterAlignment.LawfulEvil
    || value === CharacterAlignment.NeutralGood
    || value === CharacterAlignment.TrueNeutral
    || value === CharacterAlignment.NeutralEvil
    || value === CharacterAlignment.ChaoticGood
    || value === CharacterAlignment.ChaoticNeutral
    || value === CharacterAlignment.ChaoticEvil
  ) {
    return value
  }

  return CharacterAlignment.TrueNeutral
}

export const normalizeAbilityWeaponAttackBonusNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.min(10, Math.max(-5, Math.trunc(value)))
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)

    if (Number.isFinite(parsed)) {
      return Math.min(10, Math.max(-5, Math.trunc(parsed)))
    }
  }

  return defaultAbilityWeaponAttackBonusNumber
}

export const normalizeAbilityType = (value: unknown): CharacterAbility['type'] => {
  if (value === 'standard' || value === 'unlimited' || value === 'encounter' || value === 'daily') {
    return value
  }

  return defaultAbilityType
}

export const normalizeAbilityWeaponRange = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.min(30, Math.max(0, Math.trunc(value)))
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)

    if (Number.isFinite(parsed)) {
      return Math.min(30, Math.max(0, Math.trunc(parsed)))
    }
  }

  return defaultAbilityWeaponRange
}

export const normalizeAbilityWeaponArea = (value: unknown): CharacterAbilityAreaType => {
  if (
    value === 'point'
    || value === 'burst1'
    || value === 'burst2'
    || value === 'burst3'
    || value === 'burst4'
    || value === 'burst5'
    || value === 'burst6'
    || value === 'burst7'
    || value === 'burst8'
    || value === 'burst9'
    || value === 'burst10'
    || value === 'blast1'
    || value === 'blast2'
    || value === 'blast3'
    || value === 'blast4'
    || value === 'blast5'
    || value === 'blast6'
    || value === 'blast7'
    || value === 'blast8'
    || value === 'blast9'
    || value === 'blast10'
  ) {
    return value
  }

  return defaultAbilityWeaponArea
}

export const clampDefenseValue = (value: number): number => {
  return Math.min(30, Math.max(0, Math.trunc(value)))
}

export const hasFeatContent = (feat: CharacterFeat): boolean => {
  return (
    feat.name.length > 0
    || feat.description.length > 0
    || feat.speedBonusNumber !== 0
    || feat.hpBonusNumber !== 0
    || feat.kpBonusNumber !== 0
    || feat.fortitudeBonusNumber !== 0
    || feat.reflexBonusNumber !== 0
    || feat.willBonusNumber !== 0
    || feat.acrobaticsBonusNumber !== 0
    || feat.arcanaBonusNumber !== 0
    || feat.athleticsBonusNumber !== 0
    || feat.diplomacyBonusNumber !== 0
    || feat.historyBonusNumber !== 0
    || feat.healingBonusNumber !== 0
    || feat.deceptionBonusNumber !== 0
    || feat.perceptionBonusNumber !== 0
    || feat.enduranceBonusNumber !== 0
    || feat.dungeonsBonusNumber !== 0
    || feat.natureBonusNumber !== 0
    || feat.religionBonusNumber !== 0
    || feat.insightBonusNumber !== 0
    || feat.stealthBonusNumber !== 0
    || feat.streetwiseBonusNumber !== 0
    || feat.intimidationBonusNumber !== 0
    || feat.thieveryBonusNumber !== 0
  )
}

export const normalizeFeats = (data: unknown): CharacterFeat[] => {
  if (!Array.isArray(data)) {
    return []
  }

  return data
    .filter(
      (item): item is Record<string, unknown> | string => typeof item === 'string' || (typeof item === 'object' && item !== null),
    )
    .map((item) => {
      if (typeof item === 'string') {
        return {
          ...emptyFeat,
          id: globalThis.crypto.randomUUID(),
          name: item.trim(),
          description: item.trim(),
          visible: true,
        }
      }

      const nextFeat: CharacterFeat = {
        ...emptyFeat,
        id: typeof item.id === 'string' && item.id.length > 0 ? item.id : globalThis.crypto.randomUUID(),
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
        dungeonsBonusNumber: normalizeWeaponBonusNumber(item.dungeonsBonusNumber),
        natureBonusNumber: normalizeWeaponBonusNumber(item.natureBonusNumber),
        religionBonusNumber: normalizeWeaponBonusNumber(item.religionBonusNumber),
        insightBonusNumber: normalizeWeaponBonusNumber(item.insightBonusNumber),
        stealthBonusNumber: normalizeWeaponBonusNumber(item.stealthBonusNumber),
        streetwiseBonusNumber: normalizeWeaponBonusNumber(item.streetwiseBonusNumber),
        intimidationBonusNumber: normalizeWeaponBonusNumber(item.intimidationBonusNumber),
        thieveryBonusNumber: normalizeWeaponBonusNumber(item.thieveryBonusNumber),
      }

      return nextFeat
    })
    .filter(hasFeatContent)
}

export const normalizeWeaponRange = (value: unknown): number => {
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

export const normalizeWeaponBonusNumber = (value: unknown): number => {
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

export const normalizeWeaponProficiencyBonusNumber = (value: unknown): number => {
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

export const normalizeArmorGroup = (group: unknown): CharacterArmor[] => {
  if (!Array.isArray(group)) {
    return []
  }

  return group
    .filter((entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null)
    .map((entry) => ({
      name: typeof entry.name === 'string' ? entry.name : '',
      description: typeof entry.description === 'string' ? entry.description : '',
      equipped: entry.equipped === true,
      strengthBonusNumber: normalizeWeaponBonusNumber(entry.strengthBonusNumber),
      conditionBonusNumber: normalizeWeaponBonusNumber(entry.conditionBonusNumber),
      dexterityBonusNumber: normalizeWeaponBonusNumber(entry.dexterityBonusNumber),
      intelligenceBonusNumber: normalizeWeaponBonusNumber(entry.intelligenceBonusNumber),
      wisdomBonusNumber: normalizeWeaponBonusNumber(entry.wisdomBonusNumber),
      charismaBonusNumber: normalizeWeaponBonusNumber(entry.charismaBonusNumber),
      speedBonusNumber: normalizeWeaponBonusNumber(entry.speedBonusNumber),
      armorPenaltyNumber: normalizeWeaponBonusNumber(entry.armorPenaltyNumber),
      kpBonusNumber: normalizeWeaponBonusNumber(entry.kpBonusNumber),
      fortitudeBonusNumber: normalizeWeaponBonusNumber(entry.fortitudeBonusNumber),
      reflexBonusNumber: normalizeWeaponBonusNumber(entry.reflexBonusNumber),
      willBonusNumber: normalizeWeaponBonusNumber(entry.willBonusNumber),
    }))
}

export const buildEquippedItemBonusSources = (
  items: CharacterItems,
  fieldName: CharacterItemBonusFieldName,
): EquippedItemBonusSource[] => {
  return [...items.armors, ...items.weapons, ...items.others]
    .filter((item) => item.equipped)
    .map((item) => ({
      name: item.name.trim() || '-',
      bonus: item[fieldName],
    }))
    .filter((source) => source.bonus !== 0)
}

export const buildItemAttributeBonuses = (items: CharacterItems): CharacterAttributeBonuses => {
  return {
    strength: sumEquippedItemBonus(items, 'strengthBonusNumber'),
    condition: sumEquippedItemBonus(items, 'conditionBonusNumber'),
    dexterity: sumEquippedItemBonus(items, 'dexterityBonusNumber'),
    intelligence: sumEquippedItemBonus(items, 'intelligenceBonusNumber'),
    wisdom: sumEquippedItemBonus(items, 'wisdomBonusNumber'),
    charisma: sumEquippedItemBonus(items, 'charismaBonusNumber'),
  }
}

export const buildItemDefenseBonuses = (items: CharacterItems): CharacterDefenses => {
  return {
    kp: sumEquippedItemBonus(items, 'kpBonusNumber'),
    fortitude: sumEquippedItemBonus(items, 'fortitudeBonusNumber'),
    reflex: sumEquippedItemBonus(items, 'reflexBonusNumber'),
    will: sumEquippedItemBonus(items, 'willBonusNumber'),
  }
}

export const buildItemSpeedBonus = (items: CharacterItems): number => {
  return sumEquippedItemBonus(items, 'speedBonusNumber')
}

export const normalizeItems = (items: unknown): CharacterItems => {
  const normalizeItemGroup = <T extends CharacterOtherItem>(group: unknown): T[] => {
    if (!Array.isArray(group)) {
      return []
    }

    return group
      .filter((entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null)
      .map((entry) => ({
        name: typeof entry.name === 'string' ? entry.name : '',
        description: typeof entry.description === 'string' ? entry.description : '',
        equipped: entry.equipped === true,
        strengthBonusNumber: normalizeWeaponBonusNumber(entry.strengthBonusNumber),
        conditionBonusNumber: normalizeWeaponBonusNumber(entry.conditionBonusNumber),
        dexterityBonusNumber: normalizeWeaponBonusNumber(entry.dexterityBonusNumber),
        intelligenceBonusNumber: normalizeWeaponBonusNumber(entry.intelligenceBonusNumber),
        wisdomBonusNumber: normalizeWeaponBonusNumber(entry.wisdomBonusNumber),
        charismaBonusNumber: normalizeWeaponBonusNumber(entry.charismaBonusNumber),
        speedBonusNumber: normalizeWeaponBonusNumber(entry.speedBonusNumber),
        kpBonusNumber: normalizeWeaponBonusNumber(entry.kpBonusNumber),
        fortitudeBonusNumber: normalizeWeaponBonusNumber(entry.fortitudeBonusNumber),
        reflexBonusNumber: normalizeWeaponBonusNumber(entry.reflexBonusNumber),
        willBonusNumber: normalizeWeaponBonusNumber(entry.willBonusNumber),
      })) as T[]
  }

  const normalizeWeaponDamageDiceType = (value: unknown): CharacterWeaponDamageDiceType => {
    if (
      value === 'd4'
      || value === 'd6'
      || value === 'd8'
      || value === 'd10'
      || value === 'd12'
      || value === 'd20'
    ) {
      return value
    }

    return 'd4'
  }

  const normalizeWeaponDamageNumber = (value: unknown): number => {
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

  const normalizeWeaponGroup = (group: unknown): CharacterWeapon[] => {
    if (!Array.isArray(group)) {
      return []
    }

    return group
      .filter((entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null)
      .map((entry) => ({
        name: typeof entry.name === 'string' ? entry.name : '',
        description: typeof entry.description === 'string' ? entry.description : '',
        damageDiceCount:
          typeof entry.damageDiceCount === 'number' && Number.isFinite(entry.damageDiceCount)
            ? Math.min(5, Math.max(1, Math.trunc(entry.damageDiceCount)))
            : 1,
        damageDiceType: normalizeWeaponDamageDiceType(entry.damageDiceType),
        damageBonusNumber: normalizeWeaponDamageNumber(entry.damageBonusNumber ?? entry.damageBonus),
        range: normalizeWeaponRange(entry.range),
        equipped: entry.equipped === true,
        weaponProficiencyBonusNumber: normalizeWeaponProficiencyBonusNumber(entry.weaponProficiencyBonusNumber),
        strengthBonusNumber: normalizeWeaponBonusNumber(entry.strengthBonusNumber),
        conditionBonusNumber: normalizeWeaponBonusNumber(entry.conditionBonusNumber),
        dexterityBonusNumber: normalizeWeaponBonusNumber(entry.dexterityBonusNumber),
        intelligenceBonusNumber: normalizeWeaponBonusNumber(entry.intelligenceBonusNumber),
        wisdomBonusNumber: normalizeWeaponBonusNumber(entry.wisdomBonusNumber),
        charismaBonusNumber: normalizeWeaponBonusNumber(entry.charismaBonusNumber),
        speedBonusNumber: normalizeWeaponBonusNumber(entry.speedBonusNumber),
        kpBonusNumber: normalizeWeaponBonusNumber(entry.kpBonusNumber),
        fortitudeBonusNumber: normalizeWeaponBonusNumber(entry.fortitudeBonusNumber),
        reflexBonusNumber: normalizeWeaponBonusNumber(entry.reflexBonusNumber),
        willBonusNumber: normalizeWeaponBonusNumber(entry.willBonusNumber),
      }))
  }

  if (Array.isArray(items)) {
    return {
      ...emptyItems,
      others: normalizeItemGroup(items),
    }
  }

  if (!items || typeof items !== 'object') {
    return emptyItems
  }

  const source = items as Partial<Record<CharacterItemGroupKey, unknown>>

  return {
    armors: normalizeArmorGroup(source.armors),
    weapons: normalizeWeaponGroup(source.weapons),
    others: normalizeItemGroup(source.others),
  }
}

export const buildAttributeTooltip = (
  raceLabel: string,
  raceName: string,
  raceBonus: number,
  itemLabel: string,
  itemSources: EquippedItemBonusSource[],
): string => {
  const lines = [`${raceLabel}: ${formatModifier(raceBonus)} (${raceName})`]

  if (itemSources.length > 0) {
    lines.push('', buildSourceTooltipLine(itemLabel, itemSources))
  }

  return lines.join('\n')
}

export const buildSpeedTooltip = (
  baseLabel: string,
  baseSpeed: number,
  itemLabel: string,
  itemSources: EquippedItemBonusSource[],
  featLabel: string,
  featSources: EquippedItemBonusSource[],
): string => {
  const lines = [`${baseLabel}: ${baseSpeed}`]

  if (itemSources.length > 0) {
    const itemLine = buildSourceTooltipLine(itemLabel, itemSources)

    if (itemLine) {
      lines.push('', itemLine)
    }
  }

  const featLine = buildSourceTooltipLine(featLabel, featSources)

  if (featLine) {
    lines.push('', featLine)
  }

  return lines.join('\n')
}

export const buildHpTooltip = (
  hpLabel: string,
  hpValue: number,
  featLabel: string,
  featSources: EquippedItemBonusSource[],
): string => {
  const lines = [`${hpLabel}: ${hpValue}`]
  const featLine = buildSourceTooltipLine(featLabel, featSources)

  if (featLine) {
    lines.push('', featLine)
  }

  return lines.join('\n')
}

export const buildDefenseTooltip = (
  defenseLabel: string,
  levelLabel: string,
  raceLabel: string,
  classLabel: string,
  attributesLabel: string,
  itemsLabel: string,
  featLabel: string,
  raceName: string,
  characterClassLabel: string,
  levelBonus: number,
  raceBonus: number,
  classBonus: number,
  attributeBonus: number,
  itemSources: EquippedItemBonusSource[],
  featSources: EquippedItemBonusSource[],
  attributeLabels: string[],
): string => {
  const lines = [
    defenseLabel,
    `${levelLabel}: ${formatModifier(levelBonus)}`,
    `${raceLabel}: ${formatModifier(raceBonus)} (${raceName})`,
    classBonus > 0
      ? `${classLabel}: ${formatModifier(classBonus)} (${characterClassLabel})`
      : `${classLabel}: ${formatModifier(classBonus)}`,
    `${attributesLabel}: ${formatModifier(attributeBonus)} (${attributeLabels.join(' / ')})`,
  ]

  const itemLine = buildSourceTooltipLine(itemsLabel, itemSources)

  if (itemLine) {
    lines.push('', itemLine)
  }

  const featLine = buildSourceTooltipLine(featLabel, featSources)

  if (featLine) {
    lines.push('', featLine)
  }

  return lines.join('\n')
}

const sumEquippedItemBonus = (items: CharacterItems, fieldName: CharacterItemBonusFieldName): number => {
  return [...items.armors, ...items.weapons, ...items.others]
    .filter((item) => item.equipped)
    .reduce((total, item) => total + item[fieldName], 0)
}

const buildSourceTooltipLine = (
  label: string,
  sources: EquippedItemBonusSource[],
  formatter: (value: number) => string = formatModifier,
): string => {
  if (sources.length === 0) {
    return ''
  }

  return [label, ...sources.map((source) => `${source.name}: ${formatter(source.bonus)}`)].join('\n')
}
