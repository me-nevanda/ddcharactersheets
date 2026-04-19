import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { getCharacter, saveCharacter } from '@lib/api'
import { useI18n } from '@i18n/index'
import { getErrorMessage } from '@lib/errors'
import {
  emptyAbilities,
  emptyArmor,
  emptyFeat,
  emptyFeats,
  emptyOtherItem,
  emptyItems,
  emptyWeapon,
  emptyForm,
  emptyTraining,
  defaultAbilityAction,
  defaultAbilityKind,
  defaultAbilityType,
  defaultAbilityWeaponDamageDiceCount,
  defaultAbilityWeaponDamageDiceType,
  defaultAbilityWeaponDamageType,
  defaultAbilityWeaponRecurringDamageCount,
  defaultAbilityWeaponRecurringDamageType,
  defaultAbilityWeaponAttackAttribute,
  defaultAbilityWeaponAttackBonusNumber,
  defaultAbilityWeaponAttackDefense,
  defaultAbilityWeaponHit,
  defaultAbilityWeaponMiss,
  defaultAbilityWeaponProvocation,
  defaultAbilityWeaponRange,
  defaultAbilityWeaponArea,
  zeroAttributeBonuses,
  zeroDefenses,
  zeroDefenseBonuses,
} from './characterEditPageDefaults'
import {
  buildAttributeModifierMap,
  buildAttributeRows,
  buildEffectiveAttributes,
  buildNormalizedAttributes,
  clampAttributeValue,
} from './sections/AttributesSection/attributesSectionLogic'
import {
  buildDefenseBreakdowns,
  buildDefenseValues,
  normalizeDefenses,
} from './sections/DefensesSection/defensesSectionLogic'
import { buildSkillBonuses, buildSkillModifiers } from './sections/SkillSection/skillSectionLogic'
import {
  buildRaceAttributeBonuses,
  buildCharacterHp,
  buildCharacterSurge,
  buildCharacterSpeed,
  clampLevelValue,
  clampSpeedValue,
  formatModifier,
  getLevelBonus,
  normalizeClassValue,
  normalizeRaceValue,
} from './sections/GeneralSection/generalSectionLogic'
import { buildFeatBonusSources, sumFeatBonus, type CharacterFeatBonusFieldName } from './featsLogic'
import { skillDefinitions } from '@dictionaries/characterEditDefinitions'
import {
  CharacterAlignment,
  CharacterClass,
  type CharacterAbility,
  type CharacterAbilityAreaType,
  type CharacterAbilityType,
  type CharacterAttributeBonuses,
  type CharacterBonuses,
  type CharacterArmorBonusFieldName,
  type CharacterArmor,
  type CharacterDefenses,
  type CharacterFeat,
  CharacterGender,
  type CharacterWeapon,
  type CharacterOtherItem,
  type CharacterItems,
  type CharacterItemBonusFieldName,
  type CharacterWeaponFieldName,
  type CharacterWeaponDamageDiceType,
  type CharacterWeaponDamageType,
  type CharacterSkillBonuses,
} from '../../types/character'
import type {
  AttributeRow,
  CharacterAttributeFieldName,
  CharacterAbilityFieldName,
  CharacterFeatFieldName,
  CharacterItemGroupKey,
  CharacterItemFieldName,
  CharacterEditFormData,
  CharacterEditPageState,
  CharacterGeneralChangeEvent,
  CharacterGeneralFieldName,
  DefenseTooltipValues,
  CharacterSkillFieldName,
  SkillModifierMap,
} from './types'

function normalizeAbilityWeaponDamageDiceType(
  value: unknown,
  fallback: CharacterWeaponDamageDiceType | '',
): CharacterWeaponDamageDiceType | '' {
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

  return fallback
}

function normalizeAbilityWeaponDamageDiceCount(value: unknown, fallback: number): number {
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

function normalizeAbilityWeaponRecurringDamageCount(value: unknown, fallback: number): number {
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

function normalizeAbilityWeaponDamageType(value: unknown, fallback: CharacterWeaponDamageType): CharacterWeaponDamageType {
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

  return fallback
}

function normalizeAbilityWeaponAttackAttribute(
  value: unknown,
): CharacterAbility['weaponAttackAttribute'] {
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

function normalizeAbilityWeaponAttackDefense(
  value: unknown,
): CharacterAbility['weaponAttackDefense'] {
  if (value === 'kp' || value === 'fortitude' || value === 'reflex' || value === 'will') {
    return value
  }

  return ''
}

function normalizeGenderValue(value: unknown): CharacterGender {
  if (value === CharacterGender.Male || value === CharacterGender.Female || value === CharacterGender.Unspecified) {
    return value
  }

  return CharacterGender.Unspecified
}

function normalizeAlignmentValue(value: unknown): CharacterAlignment {
  if (
    value === CharacterAlignment.LawfulGood ||
    value === CharacterAlignment.LawfulNeutral ||
    value === CharacterAlignment.LawfulEvil ||
    value === CharacterAlignment.NeutralGood ||
    value === CharacterAlignment.TrueNeutral ||
    value === CharacterAlignment.NeutralEvil ||
    value === CharacterAlignment.ChaoticGood ||
    value === CharacterAlignment.ChaoticNeutral ||
    value === CharacterAlignment.ChaoticEvil
  ) {
    return value
  }

  return CharacterAlignment.TrueNeutral
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

  return defaultAbilityWeaponAttackBonusNumber
}

function normalizeAbilityType(value: unknown): CharacterAbility['type'] {
  if (value === 'standard' || value === 'unlimited' || value === 'encounter' || value === 'daily') {
    return value
  }

  return defaultAbilityType
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

  return defaultAbilityWeaponRange
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

  return defaultAbilityWeaponArea
}

function clampDefenseValue(value: number): number {
  return Math.min(30, Math.max(0, Math.trunc(value)))
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
        dungeoneeringBonusNumber: normalizeWeaponBonusNumber(item.dungeoneeringBonusNumber),
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

function normalizeArmorGroup(group: unknown): CharacterArmor[] {
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

type EquippedItemBonusSource = {
  name: string
  bonus: number
}

function buildEquippedItemBonusSources(
  items: CharacterItems,
  fieldName: CharacterItemBonusFieldName,
): EquippedItemBonusSource[] {
  return [...items.armors, ...items.weapons, ...items.others]
    .filter((item) => item.equipped)
    .map((item) => ({
      name: item.name.trim() || '—',
      bonus: item[fieldName],
    }))
    .filter((source) => source.bonus !== 0)
}

function buildItemAttributeBonuses(items: CharacterItems): CharacterAttributeBonuses {
  return {
    strength: sumEquippedItemBonus(items, 'strengthBonusNumber'),
    condition: sumEquippedItemBonus(items, 'conditionBonusNumber'),
    dexterity: sumEquippedItemBonus(items, 'dexterityBonusNumber'),
    intelligence: sumEquippedItemBonus(items, 'intelligenceBonusNumber'),
    wisdom: sumEquippedItemBonus(items, 'wisdomBonusNumber'),
    charisma: sumEquippedItemBonus(items, 'charismaBonusNumber'),
  }
}

function buildItemDefenseBonuses(items: CharacterItems): CharacterDefenses {
  return {
    kp: sumEquippedItemBonus(items, 'kpBonusNumber'),
    fortitude: sumEquippedItemBonus(items, 'fortitudeBonusNumber'),
    reflex: sumEquippedItemBonus(items, 'reflexBonusNumber'),
    will: sumEquippedItemBonus(items, 'willBonusNumber'),
  }
}

function buildItemSpeedBonus(items: CharacterItems): number {
  return sumEquippedItemBonus(items, 'speedBonusNumber')
}

function sumEquippedItemBonus(items: CharacterItems, fieldName: CharacterItemBonusFieldName): number {
  return [...items.armors, ...items.weapons, ...items.others]
    .filter((item) => item.equipped)
    .reduce((total, item) => total + item[fieldName], 0)
}

function buildSourceTooltipLine(
  label: string,
  sources: EquippedItemBonusSource[],
  formatter: (value: number) => string = formatModifier,
): string {
  if (sources.length === 0) {
    return ''
  }

  return [label, ...sources.map((source) => `${source.name}: ${formatter(source.bonus)}`)].join('\n')
}

export function useCharacterEditPage(): CharacterEditPageState {
  const { t } = useI18n()
  const { characterId = '' } = useParams()
  const [form, setForm] = useState<CharacterEditFormData>(emptyForm)
  const [initialForm, setInitialForm] = useState<CharacterEditFormData>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function normalizeItems(items: unknown): CharacterItems {
    function normalizeItemGroup<T extends CharacterOtherItem>(group: unknown): T[] {
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

    function normalizeWeaponGroup(group: unknown): CharacterWeapon[] {
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

  useEffect(() => {
    let cancelled = false

    async function loadCharacter() {
      try {
        const character = await getCharacter(characterId)

        if (!cancelled) {
          const { id, updatedAt, bonuses: characterBonuses, ...characterData } = character
          const nextForm: CharacterEditFormData = {
            ...characterData,
            level: clampLevelValue(character.level),
            speed: buildCharacterSpeed(character.race),
            hp: character.hp ?? 0,
            surge: character.surge ?? 0,
            attributes: buildNormalizedAttributes(character.attributes),
            attributesPlus: buildRaceAttributeBonuses(character.race),
            abilities: (character.abilities ?? emptyAbilities).map((ability) => ({
              ...ability,
              id: ability.id || globalThis.crypto.randomUUID(),
              action: ability.action ?? defaultAbilityAction,
              type: normalizeAbilityType(ability.type),
              kind: ability.kind ?? defaultAbilityKind,
              weaponCount: ability.weaponCount ?? 1,
              weaponName: ability.weaponName ?? '',
              weaponDamageDiceType: normalizeAbilityWeaponDamageDiceType(
                ability.weaponDamageDiceType,
                defaultAbilityWeaponDamageDiceType,
              ),
              weaponDamageDiceCount: normalizeAbilityWeaponDamageDiceCount(
                ability.weaponDamageDiceCount,
                defaultAbilityWeaponDamageDiceCount,
              ),
              weaponAttributeBonus: ability.weaponAttributeBonus ?? '',
              weaponAttackAttribute: normalizeAbilityWeaponAttackAttribute(ability.weaponAttackAttribute),
              weaponAttackDefense: normalizeAbilityWeaponAttackDefense(ability.weaponAttackDefense),
              weaponDamageType: normalizeAbilityWeaponDamageType(
                ability.weaponDamageType,
                defaultAbilityWeaponDamageType,
              ),
              weaponAttackBonusNumber: normalizeAbilityWeaponAttackBonusNumber(ability.weaponAttackBonusNumber),
              weaponRecurringDamageCount: normalizeAbilityWeaponRecurringDamageCount(
                ability.weaponRecurringDamageCount,
                defaultAbilityWeaponRecurringDamageCount,
              ),
              weaponRecurringDamageType: normalizeAbilityWeaponDamageType(
                ability.weaponRecurringDamageType,
                defaultAbilityWeaponRecurringDamageType,
              ),
              weaponHit: ability.weaponHit ?? '',
              weaponMiss: ability.weaponMiss ?? '',
              weaponProvocation: ability.weaponProvocation ?? '',
              weaponRange: normalizeAbilityWeaponRange(ability.weaponRange),
              weaponArea: normalizeAbilityWeaponArea(ability.weaponArea),
            })),
            feats: normalizeFeats(character.feats ?? emptyFeats),
            items: normalizeItems(character.items),
            defenses: character.defenses ?? zeroDefenses,
            training: {
              ...character.training,
              endurance: character.training.endurance ?? false,
            },
            bonuses: {
              level: characterBonuses?.level ?? 0,
              attributes: characterBonuses?.attributes ?? zeroAttributeBonuses,
              skills: characterBonuses?.skills ?? emptyForm.bonuses.skills,
              defenses: characterBonuses?.defenses ?? zeroDefenseBonuses,
            },
          }

          setForm(nextForm)
          setInitialForm(nextForm)
          setError('')
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(getErrorMessage(t, nextError))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadCharacter()

    return () => {
      cancelled = true
    }
  }, [characterId, t])

  useEffect(() => {
    if (
      form.class !== CharacterClass.Rogue &&
      form.class !== CharacterClass.Ranger &&
      form.class !== CharacterClass.Paladin &&
      form.class !== CharacterClass.Cleric &&
      form.class !== CharacterClass.Wizard
    ) {
      return
    }

    setForm((currentForm) => {
      const shouldForceRogueSkills =
        currentForm.class === CharacterClass.Rogue &&
        currentForm.training.stealth &&
        currentForm.training.thievery
      const shouldForceRangerSkill =
        currentForm.class === CharacterClass.Ranger && currentForm.training.nature
      const shouldForcePaladinSkill =
        currentForm.class === CharacterClass.Paladin && currentForm.training.religion
      const shouldForceClericSkill =
        currentForm.class === CharacterClass.Cleric && currentForm.training.religion
      const shouldForceWizardSkill =
        currentForm.class === CharacterClass.Wizard && currentForm.training.arcana

      if (
        shouldForceRogueSkills ||
        shouldForceRangerSkill ||
        shouldForcePaladinSkill ||
        shouldForceClericSkill ||
        shouldForceWizardSkill
      ) {
        return currentForm
      }

      return {
        ...currentForm,
        training: {
          ...currentForm.training,
          stealth: currentForm.class === CharacterClass.Rogue ? true : currentForm.training.stealth,
          thievery: currentForm.class === CharacterClass.Rogue ? true : currentForm.training.thievery,
          nature: currentForm.class === CharacterClass.Ranger ? true : currentForm.training.nature,
          religion:
            currentForm.class === CharacterClass.Paladin || currentForm.class === CharacterClass.Cleric
              ? true
              : currentForm.training.religion,
          arcana: currentForm.class === CharacterClass.Wizard ? true : currentForm.training.arcana,
        },
      }
    })
  }, [form.class])

  function handleGeneralChange(event: CharacterGeneralChangeEvent) {
    const { name, value } = event.target
    const fieldName = name as CharacterGeneralFieldName

    if (fieldName === 'level') {
      setForm((currentForm) => ({
        ...currentForm,
        level: clampLevelValue(Number.parseInt(value, 10) || 1),
      }))
      return
    }

    if (fieldName === 'race') {
      const nextRace = normalizeRaceValue(value)

      setForm((currentForm) => ({
        ...currentForm,
        race: nextRace,
        attributesPlus: buildRaceAttributeBonuses(nextRace),
      }))
      return
    }

    if (fieldName === 'class') {
      setForm((currentForm) => ({
        ...currentForm,
        class: normalizeClassValue(value),
        training: emptyTraining,
      }))
      return
    }

    if (fieldName === 'gender') {
      setForm((currentForm) => ({
        ...currentForm,
        gender: normalizeGenderValue(value),
      }))
      return
    }

    if (fieldName === 'alignment') {
      setForm((currentForm) => ({
        ...currentForm,
        alignment: normalizeAlignmentValue(value),
      }))
      return
    }

    setForm((currentForm) => ({
      ...currentForm,
      [fieldName]: value,
    }))
  }

  function handleAttributeChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    const fieldName = name as CharacterAttributeFieldName
    const nextValue = clampAttributeValue(Number.parseInt(value, 10) || 0)

    setForm((currentForm) => ({
      ...currentForm,
      attributes: {
        ...currentForm.attributes,
        [fieldName]: nextValue,
      },
    }))
  }

  function handleTrainingChange(event: ChangeEvent<HTMLInputElement>) {
    const { checked, name } = event.target
    const fieldName = name as CharacterSkillFieldName

    setForm((currentForm) => ({
      ...currentForm,
      training: {
        ...currentForm.training,
        [fieldName]: checked,
      },
    }))
  }

  function handleAbilityAdd(ability: CharacterAbility) {
    const nextAbility: CharacterAbility = {
      id: globalThis.crypto.randomUUID(),
      name: ability.name.trim(),
      description: ability.description.trim(),
      action: ability.action,
      type: normalizeAbilityType(ability.type),
      kind: ability.kind,
      weaponCount: ability.weaponCount,
      weaponName: ability.weaponName.trim(),
      weaponDamageDiceType: ability.weaponDamageDiceType,
      weaponDamageDiceCount: ability.weaponDamageDiceCount,
      weaponAttributeBonus: ability.weaponAttributeBonus,
      weaponAttackAttribute: normalizeAbilityWeaponAttackAttribute(ability.weaponAttackAttribute),
      weaponAttackDefense: normalizeAbilityWeaponAttackDefense(ability.weaponAttackDefense),
      weaponDamageType: ability.weaponDamageType,
      weaponAttackBonusNumber: normalizeAbilityWeaponAttackBonusNumber(ability.weaponAttackBonusNumber),
      weaponRecurringDamageCount: ability.weaponRecurringDamageCount,
      weaponRecurringDamageType: ability.weaponRecurringDamageType,
      weaponHit: ability.weaponHit,
      weaponMiss: ability.weaponMiss,
      weaponProvocation: ability.weaponProvocation,
      weaponRange: ability.weaponRange,
      weaponArea: ability.weaponArea,
    }

    if (!nextAbility.name && !nextAbility.description) {
      return
    }

    setForm((currentForm) => ({
      ...currentForm,
      abilities: [...currentForm.abilities, nextAbility],
    }))
  }

  function handleAbilityCreateEmpty(type: CharacterAbilityType = defaultAbilityType) {
    setForm((currentForm) => ({
      ...currentForm,
      abilities: [
        ...currentForm.abilities,
        {
          id: globalThis.crypto.randomUUID(),
          name: '',
          description: '',
          action: defaultAbilityAction,
          type,
          kind: defaultAbilityKind,
          weaponCount: 1,
          weaponName: '',
          weaponDamageDiceType: defaultAbilityWeaponDamageDiceType,
          weaponDamageDiceCount: defaultAbilityWeaponDamageDiceCount,
          weaponAttributeBonus: '',
          weaponAttackAttribute: 'strength',
          weaponAttackBonusNumber: defaultAbilityWeaponAttackBonusNumber,
          weaponAttackDefense: 'kp',
          weaponDamageType: defaultAbilityWeaponDamageType,
          weaponRecurringDamageCount: defaultAbilityWeaponRecurringDamageCount,
          weaponRecurringDamageType: defaultAbilityWeaponRecurringDamageType,
          weaponHit: defaultAbilityWeaponHit,
          weaponMiss: defaultAbilityWeaponMiss,
          weaponProvocation: defaultAbilityWeaponProvocation,
          weaponRange: defaultAbilityWeaponRange,
          weaponArea: defaultAbilityWeaponArea,
        },
      ],
    }))
  }

  function handleAbilityChange(index: number, fieldName: CharacterAbilityFieldName, value: string | number) {
    setForm((currentForm) => ({
      ...currentForm,
      abilities: currentForm.abilities.map((ability, abilityIndex) =>
        abilityIndex === index
          ? {
              ...ability,
              [fieldName]: value,
                ...(fieldName === 'kind' && value === 'utility'
                  ? {
                      weaponCount: 1,
                      weaponName: '',
                      weaponDamageDiceType: defaultAbilityWeaponDamageDiceType,
                      weaponDamageDiceCount: defaultAbilityWeaponDamageDiceCount,
                      weaponAttributeBonus: '',
                      weaponAttackAttribute: defaultAbilityWeaponAttackAttribute,
                      weaponAttackBonusNumber: defaultAbilityWeaponAttackBonusNumber,
                      weaponAttackDefense: defaultAbilityWeaponAttackDefense,
                      weaponDamageType: defaultAbilityWeaponDamageType,
                      weaponRecurringDamageCount: defaultAbilityWeaponRecurringDamageCount,
                      weaponRecurringDamageType: defaultAbilityWeaponRecurringDamageType,
                      weaponHit: defaultAbilityWeaponHit,
                      weaponMiss: defaultAbilityWeaponMiss,
                      weaponProvocation: defaultAbilityWeaponProvocation,
                    }
                  : fieldName === 'weaponName' && value === ''
                    ? {
                        weaponDamageDiceType: defaultAbilityWeaponDamageDiceType,
                        weaponDamageDiceCount: defaultAbilityWeaponDamageDiceCount,
                        weaponDamageType: defaultAbilityWeaponDamageType,
                        weaponAttackBonusNumber: defaultAbilityWeaponAttackBonusNumber,
                        weaponRecurringDamageCount: defaultAbilityWeaponRecurringDamageCount,
                        weaponRecurringDamageType: defaultAbilityWeaponRecurringDamageType,
                        weaponHit: defaultAbilityWeaponHit,
                        weaponMiss: defaultAbilityWeaponMiss,
                        weaponProvocation: defaultAbilityWeaponProvocation,
                      }
                    : null),
            }
          : ability,
      ),
    }))
  }

  function handleAbilityRemove(index: number) {
    setForm((currentForm) => ({
      ...currentForm,
      abilities: currentForm.abilities.filter((_, abilityIndex) => abilityIndex !== index),
    }))
  }

  function handleFeatCreateEmpty() {
    setForm((currentForm) => ({
      ...currentForm,
      feats: [
        ...currentForm.feats,
        {
          ...emptyFeat,
          id: globalThis.crypto.randomUUID(),
          visible: true,
        },
      ],
    }))
  }

  function handleFeatChange(index: number, fieldName: CharacterFeatFieldName, value: string | number | boolean) {
    setForm((currentForm) => ({
      ...currentForm,
      feats: currentForm.feats.map((feat, featIndex) =>
        featIndex === index
          ? {
              ...feat,
              [fieldName]: value,
            }
          : feat,
      ),
    }))
  }

  function handleFeatBonusFieldChange(
    index: number,
    previousFieldName: CharacterFeatBonusFieldName,
    nextFieldName: CharacterFeatBonusFieldName,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      feats: currentForm.feats.map((feat, featIndex) => {
        if (featIndex !== index || previousFieldName === nextFieldName) {
          return feat
        }

        return {
          ...feat,
          [previousFieldName]: 0,
          [nextFieldName]: feat[previousFieldName],
        }
      }),
    }))
  }

  function handleFeatRemove(index: number) {
    setForm((currentForm) => ({
      ...currentForm,
      feats: currentForm.feats.filter((_, featIndex) => featIndex !== index),
    }))
  }

  function handleItemCreateEmpty(group: CharacterItemGroupKey) {
    setForm((currentForm) => ({
      ...currentForm,
      items: {
        ...currentForm.items,
        [group]:
          group === 'weapons'
            ? [...currentForm.items[group], { ...emptyWeapon }]
            : group === 'armors'
              ? [...currentForm.items[group], { ...emptyArmor }]
            : [...currentForm.items[group], { ...emptyOtherItem }],
      },
    }))
  }

  function handleItemChange(
    group: CharacterItemGroupKey,
    index: number,
    fieldName: CharacterItemFieldName | CharacterItemBonusFieldName,
    value: string | number | boolean,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      items: {
        ...currentForm.items,
        [group]: currentForm.items[group].map((item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                [fieldName]: value,
              }
            : item,
        ),
      },
    }))
  }

  function handleItemBonusFieldChange(
    group: CharacterItemGroupKey,
    index: number,
    previousFieldName: CharacterArmorBonusFieldName,
    nextFieldName: CharacterArmorBonusFieldName,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      items: {
        ...currentForm.items,
        [group]: currentForm.items[group].map((item, itemIndex) => {
          if (itemIndex !== index || previousFieldName === nextFieldName) {
            return item
          }

          const previousValue = item[previousFieldName as keyof typeof item]

          return {
            ...item,
            [previousFieldName]: 0,
            [nextFieldName]: typeof previousValue === 'number' ? previousValue : 0,
          }
        }),
      },
    }))
  }

  function handleArmorBonusChange(
    index: number,
    fieldName: CharacterArmorBonusFieldName,
    value: number,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      items: {
        ...currentForm.items,
        armors: currentForm.items.armors.map((armor, armorIndex) =>
          armorIndex === index
            ? {
                ...armor,
                [fieldName]: value,
              }
            : armor,
        ),
      },
    }))
  }

  function handleWeaponDamageChange(
    index: number,
    fieldName: CharacterWeaponFieldName,
    value: number | CharacterWeaponDamageDiceType | boolean,
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      items: {
        ...currentForm.items,
        weapons: currentForm.items.weapons.map((weapon, weaponIndex) =>
          weaponIndex === index
            ? {
                ...weapon,
                [fieldName]: value,
              }
            : weapon,
        ),
      },
    }))
  }

  function handleItemRemove(group: CharacterItemGroupKey, index: number) {
    setForm((currentForm) => ({
      ...currentForm,
      items: {
        ...currentForm.items,
        [group]: currentForm.items[group].filter((_, itemIndex) => itemIndex !== index),
      },
    }))
  }

  const normalizedAttributes = buildNormalizedAttributes(form.attributes)
  const equippedItemAttributeBonuses = buildItemAttributeBonuses(form.items)
  const equippedItemDefenseBonuses = buildItemDefenseBonuses(form.items)
  const equippedItemSpeedBonus = buildItemSpeedBonus(form.items)
  const attributeBonuses = {
    strength: form.attributesPlus.strength + equippedItemAttributeBonuses.strength,
    condition: form.attributesPlus.condition + equippedItemAttributeBonuses.condition,
    dexterity: form.attributesPlus.dexterity + equippedItemAttributeBonuses.dexterity,
    intelligence: form.attributesPlus.intelligence + equippedItemAttributeBonuses.intelligence,
    wisdom: form.attributesPlus.wisdom + equippedItemAttributeBonuses.wisdom,
    charisma: form.attributesPlus.charisma + equippedItemAttributeBonuses.charisma,
  }
  const effectiveAttributes = buildEffectiveAttributes(normalizedAttributes, attributeBonuses)
  const attributeModifierMap = buildAttributeModifierMap(effectiveAttributes)
  const levelBonusValue = getLevelBonus(form.level)
  const levelBonusLabel = formatModifier(levelBonusValue)
  const featSpeedBonus = sumFeatBonus(form.feats, 'speedBonusNumber')
  const featHpBonus = sumFeatBonus(form.feats, 'hpBonusNumber')
  const featDefenseBonuses = {
    kp: sumFeatBonus(form.feats, 'kpBonusNumber'),
    fortitude: sumFeatBonus(form.feats, 'fortitudeBonusNumber'),
    reflex: sumFeatBonus(form.feats, 'reflexBonusNumber'),
    will: sumFeatBonus(form.feats, 'willBonusNumber'),
  }
  const featSkillBonuses = skillDefinitions.reduce<CharacterSkillBonuses>(
    (acc, skill) => {
      acc[skill.key] = sumFeatBonus(form.feats, `${skill.key}BonusNumber` as CharacterFeatBonusFieldName)
      return acc
    },
    {
      acrobatics: 0,
      arcana: 0,
      athletics: 0,
      diplomacy: 0,
      history: 0,
      healing: 0,
      deception: 0,
      perception: 0,
      endurance: 0,
      dungeoneering: 0,
      nature: 0,
      religion: 0,
      insight: 0,
      stealth: 0,
      streetwise: 0,
      intimidation: 0,
      thievery: 0,
    },
  )
  const baseHpValue = buildCharacterHp(form.class, form.level, effectiveAttributes.condition)
  const hpValue = Math.max(0, baseHpValue + featHpBonus)
  const surgeValue = buildCharacterSurge(form.class, attributeModifierMap.condition)
  const speedValue = clampSpeedValue(buildCharacterSpeed(form.race) + equippedItemSpeedBonus + featSpeedBonus)
  const baseDefenseValues = buildDefenseValues(
    attributeModifierMap,
    levelBonusValue,
    form.race,
    form.class,
    equippedItemDefenseBonuses,
  )
  const defenseValues = {
    kp: clampDefenseValue(baseDefenseValues.kp + featDefenseBonuses.kp),
    fortitude: clampDefenseValue(baseDefenseValues.fortitude + featDefenseBonuses.fortitude),
    reflex: clampDefenseValue(baseDefenseValues.reflex + featDefenseBonuses.reflex),
    will: clampDefenseValue(baseDefenseValues.will + featDefenseBonuses.will),
  }
  const defenseBreakdowns = buildDefenseBreakdowns(
    attributeModifierMap,
    levelBonusValue,
    form.race,
    form.class,
    equippedItemDefenseBonuses,
  )
  const skillBonuses = buildSkillBonuses(
    form.level,
    attributeModifierMap,
    form.training,
    form.race,
    form.items,
  )
  const skillBonusesWithFeats: CharacterSkillBonuses = {
    acrobatics: skillBonuses.acrobatics + featSkillBonuses.acrobatics,
    arcana: skillBonuses.arcana + featSkillBonuses.arcana,
    athletics: skillBonuses.athletics + featSkillBonuses.athletics,
    diplomacy: skillBonuses.diplomacy + featSkillBonuses.diplomacy,
    history: skillBonuses.history + featSkillBonuses.history,
    healing: skillBonuses.healing + featSkillBonuses.healing,
    deception: skillBonuses.deception + featSkillBonuses.deception,
    perception: skillBonuses.perception + featSkillBonuses.perception,
    endurance: skillBonuses.endurance + featSkillBonuses.endurance,
    dungeoneering: skillBonuses.dungeoneering + featSkillBonuses.dungeoneering,
    nature: skillBonuses.nature + featSkillBonuses.nature,
    religion: skillBonuses.religion + featSkillBonuses.religion,
    insight: skillBonuses.insight + featSkillBonuses.insight,
    stealth: skillBonuses.stealth + featSkillBonuses.stealth,
    streetwise: skillBonuses.streetwise + featSkillBonuses.streetwise,
    intimidation: skillBonuses.intimidation + featSkillBonuses.intimidation,
    thievery: skillBonuses.thievery + featSkillBonuses.thievery,
  }
  const skillModifiers = buildSkillModifiers(skillBonusesWithFeats)
  const hasChanges = JSON.stringify(form) !== JSON.stringify(initialForm)
  const attributeBonusTooltips = {
    strength: buildAttributeTooltip(
      t('pages.characterEdit.sourceTooltip.raceBonus'),
      t(`pages.characterEdit.options.race.${form.race}`),
      form.attributesPlus.strength,
      t('pages.characterEdit.sourceTooltip.itemBonus'),
      buildEquippedItemBonusSources(form.items, 'strengthBonusNumber'),
    ),
    condition: buildAttributeTooltip(
      t('pages.characterEdit.sourceTooltip.raceBonus'),
      t(`pages.characterEdit.options.race.${form.race}`),
      form.attributesPlus.condition,
      t('pages.characterEdit.sourceTooltip.itemBonus'),
      buildEquippedItemBonusSources(form.items, 'conditionBonusNumber'),
    ),
    dexterity: buildAttributeTooltip(
      t('pages.characterEdit.sourceTooltip.raceBonus'),
      t(`pages.characterEdit.options.race.${form.race}`),
      form.attributesPlus.dexterity,
      t('pages.characterEdit.sourceTooltip.itemBonus'),
      buildEquippedItemBonusSources(form.items, 'dexterityBonusNumber'),
    ),
    intelligence: buildAttributeTooltip(
      t('pages.characterEdit.sourceTooltip.raceBonus'),
      t(`pages.characterEdit.options.race.${form.race}`),
      form.attributesPlus.intelligence,
      t('pages.characterEdit.sourceTooltip.itemBonus'),
      buildEquippedItemBonusSources(form.items, 'intelligenceBonusNumber'),
    ),
    wisdom: buildAttributeTooltip(
      t('pages.characterEdit.sourceTooltip.raceBonus'),
      t(`pages.characterEdit.options.race.${form.race}`),
      form.attributesPlus.wisdom,
      t('pages.characterEdit.sourceTooltip.itemBonus'),
      buildEquippedItemBonusSources(form.items, 'wisdomBonusNumber'),
    ),
    charisma: buildAttributeTooltip(
      t('pages.characterEdit.sourceTooltip.raceBonus'),
      t(`pages.characterEdit.options.race.${form.race}`),
      form.attributesPlus.charisma,
      t('pages.characterEdit.sourceTooltip.itemBonus'),
      buildEquippedItemBonusSources(form.items, 'charismaBonusNumber'),
    ),
  } satisfies Record<keyof CharacterAttributeBonuses, string>
  const featSpeedSources = buildFeatBonusSources(form.feats, 'speedBonusNumber')
  const featHpSources = buildFeatBonusSources(form.feats, 'hpBonusNumber')
  const featDefenseSources = {
    kp: buildFeatBonusSources(form.feats, 'kpBonusNumber'),
    fortitude: buildFeatBonusSources(form.feats, 'fortitudeBonusNumber'),
    reflex: buildFeatBonusSources(form.feats, 'reflexBonusNumber'),
    will: buildFeatBonusSources(form.feats, 'willBonusNumber'),
  }
  const defenseTooltips: DefenseTooltipValues = {
    kp: buildDefenseTooltip(
      t('pages.characterEdit.fields.kp'),
      t('pages.characterEdit.defenseTooltip.levelBonus'),
      t('pages.characterEdit.sourceTooltip.raceBonus'),
      t('pages.characterEdit.defenseTooltip.classBonus'),
      t('pages.characterEdit.defenseTooltip.attributesBonus'),
      t('pages.characterEdit.defenseTooltip.itemsBonus'),
      t('pages.characterEdit.sourceTooltip.featBonuses'),
      t(`pages.characterEdit.options.race.${form.race}`),
      t(`pages.characterEdit.options.class.${form.class}`),
      defenseBreakdowns.kp.levelBonus,
      defenseBreakdowns.kp.raceBonus,
      defenseBreakdowns.kp.classBonus,
      defenseBreakdowns.kp.attributeBonus,
      buildEquippedItemBonusSources(form.items, 'kpBonusNumber'),
      featDefenseSources.kp,
      defenseBreakdowns.kp.attributeKeys.map((key) => t(`pages.characterEdit.fields.${key}`)),
    ),
    fortitude: buildDefenseTooltip(
      t('pages.characterEdit.fields.fortitude'),
      t('pages.characterEdit.defenseTooltip.levelBonus'),
      t('pages.characterEdit.sourceTooltip.raceBonus'),
      t('pages.characterEdit.defenseTooltip.classBonus'),
      t('pages.characterEdit.defenseTooltip.attributesBonus'),
      t('pages.characterEdit.defenseTooltip.itemsBonus'),
      t('pages.characterEdit.sourceTooltip.featBonuses'),
      t(`pages.characterEdit.options.race.${form.race}`),
      t(`pages.characterEdit.options.class.${form.class}`),
      defenseBreakdowns.fortitude.levelBonus,
      defenseBreakdowns.fortitude.raceBonus,
      defenseBreakdowns.fortitude.classBonus,
      defenseBreakdowns.fortitude.attributeBonus,
      buildEquippedItemBonusSources(form.items, 'fortitudeBonusNumber'),
      featDefenseSources.fortitude,
      defenseBreakdowns.fortitude.attributeKeys.map((key) => t(`pages.characterEdit.fields.${key}`)),
    ),
    reflex: buildDefenseTooltip(
      t('pages.characterEdit.fields.reflex'),
      t('pages.characterEdit.defenseTooltip.levelBonus'),
      t('pages.characterEdit.sourceTooltip.raceBonus'),
      t('pages.characterEdit.defenseTooltip.classBonus'),
      t('pages.characterEdit.defenseTooltip.attributesBonus'),
      t('pages.characterEdit.defenseTooltip.itemsBonus'),
      t('pages.characterEdit.sourceTooltip.featBonuses'),
      t(`pages.characterEdit.options.race.${form.race}`),
      t(`pages.characterEdit.options.class.${form.class}`),
      defenseBreakdowns.reflex.levelBonus,
      defenseBreakdowns.reflex.raceBonus,
      defenseBreakdowns.reflex.classBonus,
      defenseBreakdowns.reflex.attributeBonus,
      buildEquippedItemBonusSources(form.items, 'reflexBonusNumber'),
      featDefenseSources.reflex,
      defenseBreakdowns.reflex.attributeKeys.map((key) => t(`pages.characterEdit.fields.${key}`)),
    ),
    will: buildDefenseTooltip(
      t('pages.characterEdit.fields.will'),
      t('pages.characterEdit.defenseTooltip.levelBonus'),
      t('pages.characterEdit.sourceTooltip.raceBonus'),
      t('pages.characterEdit.defenseTooltip.classBonus'),
      t('pages.characterEdit.defenseTooltip.attributesBonus'),
      t('pages.characterEdit.defenseTooltip.itemsBonus'),
      t('pages.characterEdit.sourceTooltip.featBonuses'),
      t(`pages.characterEdit.options.race.${form.race}`),
      t(`pages.characterEdit.options.class.${form.class}`),
      defenseBreakdowns.will.levelBonus,
      defenseBreakdowns.will.raceBonus,
      defenseBreakdowns.will.classBonus,
      defenseBreakdowns.will.attributeBonus,
      buildEquippedItemBonusSources(form.items, 'willBonusNumber'),
      featDefenseSources.will,
      defenseBreakdowns.will.attributeKeys.map((key) => t(`pages.characterEdit.fields.${key}`)),
    ),
  }
  const speedTooltip = buildSpeedTooltip(
    t('pages.characterEdit.sourceTooltip.baseSpeed'),
    buildCharacterSpeed(form.race),
    t('pages.characterEdit.sourceTooltip.itemBonus'),
    buildEquippedItemBonusSources(form.items, 'speedBonusNumber'),
    t('pages.characterEdit.sourceTooltip.featBonuses'),
    featSpeedSources,
  )
  const hpTooltip = buildHpTooltip(
    t('pages.characterEdit.fields.hp'),
    hpValue,
    t('pages.characterEdit.sourceTooltip.featBonuses'),
    featHpSources,
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const bonuses: CharacterBonuses = {
        level: levelBonusValue,
        attributes: attributeModifierMap,
        skills: skillBonusesWithFeats,
        defenses: defenseValues,
      }

      await saveCharacter(characterId, {
        ...form,
        name: form.name.trim(),
        level: clampLevelValue(form.level),
        gender: normalizeGenderValue(form.gender),
        alignment: normalizeAlignmentValue(form.alignment),
        speed: buildCharacterSpeed(form.race),
        hp: hpValue,
        surge: surgeValue,
        attributes: normalizedAttributes,
        attributesPlus: form.attributesPlus,
        abilities: form.abilities.map((ability) =>
          ability.kind === 'utility'
            ? {
                id: ability.id,
                name: ability.name,
                description: ability.description,
                action: ability.action,
                type: ability.type,
                kind: ability.kind,
                weaponCount: 1,
                weaponName: '',
                weaponDamageDiceType: defaultAbilityWeaponDamageDiceType,
                weaponDamageDiceCount: defaultAbilityWeaponDamageDiceCount,
                weaponAttributeBonus: '',
                weaponAttackAttribute: defaultAbilityWeaponAttackAttribute,
                weaponAttackBonusNumber: defaultAbilityWeaponAttackBonusNumber,
                weaponAttackDefense: defaultAbilityWeaponAttackDefense,
                weaponDamageType: defaultAbilityWeaponDamageType,
                weaponRecurringDamageCount: defaultAbilityWeaponRecurringDamageCount,
                weaponRecurringDamageType: defaultAbilityWeaponRecurringDamageType,
                weaponHit: defaultAbilityWeaponHit,
                weaponMiss: defaultAbilityWeaponMiss,
                weaponProvocation: defaultAbilityWeaponProvocation,
                weaponRange: ability.weaponRange,
                weaponArea: ability.weaponArea,
              }
            : {
                id: ability.id,
                name: ability.name,
                description: ability.description,
                action: ability.action,
                type: ability.type,
                kind: ability.kind,
                weaponCount: ability.weaponCount,
                weaponName: ability.weaponName,
                weaponDamageDiceType: ability.weaponDamageDiceType,
                weaponDamageDiceCount: ability.weaponDamageDiceCount,
                weaponAttributeBonus: ability.weaponAttributeBonus,
                weaponAttackAttribute: ability.weaponAttackAttribute,
                weaponAttackBonusNumber: ability.weaponAttackBonusNumber,
                weaponAttackDefense: ability.weaponAttackDefense,
                weaponDamageType: ability.weaponDamageType,
                weaponRecurringDamageCount: ability.weaponRecurringDamageCount,
                weaponRecurringDamageType: ability.weaponRecurringDamageType,
                weaponHit: ability.weaponHit,
                weaponMiss: ability.weaponMiss,
                weaponProvocation: ability.weaponProvocation,
                weaponRange: ability.weaponRange,
                weaponArea: ability.weaponArea,
              },
        ),
        feats: form.feats.map((feat) => ({
          ...feat,
          name: feat.name.trim(),
          description: feat.description.trim(),
        })).filter(hasFeatContent),
        items: form.items,
        defenses: normalizeDefenses(
          {
            kp: defenseValues.kp,
            fortitude: defenseValues.fortitude,
            reflex: defenseValues.reflex,
            will: defenseValues.will,
          },
          zeroDefenses,
        ),
        bonuses: {
          ...form.bonuses,
          ...bonuses,
        },
      })
      setInitialForm(form)
      setSaving(false)
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
      setSaving(false)
    }
  }

  const attributeRows: AttributeRow[] = buildAttributeRows(normalizedAttributes, attributeModifierMap)

  return {
    error,
    form,
    loading,
    saving,
    attributeBonuses,
    attributeBonusTooltips,
    handleGeneralChange,
    handleAttributeChange,
    handleTrainingChange,
    handleAbilityCreateEmpty,
    handleAbilityAdd,
    handleAbilityChange,
    handleAbilityRemove,
    handleFeatCreateEmpty,
    handleFeatChange,
    handleFeatBonusFieldChange,
    handleFeatRemove,
    handleItemCreateEmpty,
    handleItemChange,
    handleItemBonusFieldChange,
    handleArmorBonusChange,
    handleWeaponDamageChange,
    handleItemRemove,
    handleSubmit,
    attributeRows,
    levelBonusLabel,
    speedValue,
    speedTooltip,
    hpTooltip,
    skillModifiers,
    defenseValues,
    defenseTooltips,
    hpValue,
    surgeValue,
    hasChanges,
  }
}

function buildAttributeTooltip(
  raceLabel: string,
  raceName: string,
  raceBonus: number,
  itemLabel: string,
  itemSources: EquippedItemBonusSource[],
): string {
  const lines = [`${raceLabel}: ${formatModifier(raceBonus)} (${raceName})`]

  if (itemSources.length > 0) {
    lines.push('', buildSourceTooltipLine(itemLabel, itemSources))
  }

  return lines.join('\n')
}

function buildSpeedTooltip(
  baseLabel: string,
  baseSpeed: number,
  itemLabel: string,
  itemSources: EquippedItemBonusSource[],
  featLabel: string,
  featSources: EquippedItemBonusSource[],
): string {
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

function buildHpTooltip(
  hpLabel: string,
  hpValue: number,
  featLabel: string,
  featSources: EquippedItemBonusSource[],
): string {
  const lines = [`${hpLabel}: ${hpValue}`]

  const featLine = buildSourceTooltipLine(featLabel, featSources)
  if (featLine) {
    lines.push('', featLine)
  }

  return lines.join('\n')
}

function buildDefenseTooltip(
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
): string {
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
