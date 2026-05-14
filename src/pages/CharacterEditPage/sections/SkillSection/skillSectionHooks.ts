import { useI18n } from '@i18n/index'
import { skillDefinitions } from '@dictionaries/characterEditDefinitions'
import {
  CharacterClass,
  CharacterRace,
  type CharacterAttributeBonuses,
  type CharacterItems,
  type CharacterSkillBonuses,
  type CharacterTraining,
} from '@appTypes/character'
import { useCharacterEditPageContext } from '../../characterEditPageContext'
import { buildFeatBonusSources, type CharacterFeatBonusFieldName } from '../../featsLogic'
import type { CharacterAttributeFieldName, CharacterSkillFieldName } from '../../types'
import { buildAttributeModifierMap, buildEffectiveAttributes, buildNormalizedAttributes } from '../AttributesSection/attributesSectionHooks'
import { formatModifier, getLevelBonus } from '../GeneralSection/generalSectionHooks'
import type { SkillCardViewModel } from './types'

const armorPenaltySkillKeys = new Set<CharacterSkillFieldName>([
  'acrobatics',
  'athletics',
  'endurance',
  'stealth',
  'thievery',
])

const fighterAndBarbarianHighlightedSkillKeys = new Set<CharacterSkillFieldName>([
  'athletics',
  'endurance',
  'healing',
  'intimidation',
  'insight',
])

const paladinHighlightedSkillKeys = new Set<CharacterSkillFieldName>([
  'diplomacy',
  'endurance',
  'healing',
  'history',
  'insight',
  'intimidation',
  'religion',
])

const rangerHighlightedSkillKeys = new Set<CharacterSkillFieldName>([
  'acrobatics',
  'athletics',
  'dungeons',
  'endurance',
  'healing',
  'nature',
  'perception',
  'stealth',
])

const rogueHighlightedSkillKeys = new Set<CharacterSkillFieldName>([
  'acrobatics',
  'athletics',
  'deception',
  'dungeons',
  'insight',
  'intimidation',
  'perception',
  'stealth',
  'streetwise',
  'thievery',
])

const rogueForcedSkillKeys = new Set<CharacterSkillFieldName>(['stealth', 'thievery'])
const rangerForcedSkillKeys = new Set<CharacterSkillFieldName>(['nature'])
const paladinForcedSkillKeys = new Set<CharacterSkillFieldName>(['religion'])
const clericHighlightedSkillKeys = new Set<CharacterSkillFieldName>(['arcana', 'diplomacy', 'healing', 'history', 'insight'])
const clericForcedSkillKeys = new Set<CharacterSkillFieldName>(['religion'])
const wizardHighlightedSkillKeys = new Set<CharacterSkillFieldName>(['arcana', 'diplomacy', 'dungeons', 'history', 'insight', 'nature', 'religion'])
const wizardForcedSkillKeys = new Set<CharacterSkillFieldName>(['arcana'])
const warlockHighlightedSkillKeys = new Set<CharacterSkillFieldName>(['arcana', 'deception', 'history', 'insight', 'intimidation', 'religion', 'streetwise', 'thievery'])
const warlordAndBardHighlightedSkillKeys = new Set<CharacterSkillFieldName>([
  'athletics',
  'diplomacy',
  'endurance',
  'healing',
  'history',
  'intimidation',
])

export const buildSkillBonuses = (
  level: number,
  attributeBonuses: CharacterAttributeBonuses,
  training: CharacterTraining,
  race: CharacterRace,
  items: CharacterItems,
): CharacterSkillBonuses => {
  const levelBonus = getLevelBonus(level)
  const dwarfSkillBonus = race === CharacterRace.Dwarf ? 2 : 0
  const halflingSkillBonus = race === CharacterRace.Halfling ? 2 : 0
  const halfElfSkillBonus = race === CharacterRace.HalfElf ? 2 : 0
  const armorPenaltyBonus = items.armors
    .filter((armor) => armor.equipped)
    .reduce((total, armor) => total + armor.armorPenaltyNumber, 0)
  const racialSkillBonuses: Partial<Record<keyof CharacterSkillBonuses, number>> = {
    acrobatics: halflingSkillBonus,
    arcana: race === CharacterRace.Eladrin ? 2 : 0,
    athletics: 0,
    diplomacy: halfElfSkillBonus,
    history: race === CharacterRace.Eladrin || race === CharacterRace.Dragonborn ? 2 : 0,
    healing: 0,
    deception: race === CharacterRace.Tiefling ? 2 : 0,
    perception: race === CharacterRace.Elf ? 2 : 0,
    endurance: dwarfSkillBonus,
    dungeons: dwarfSkillBonus,
    nature: race === CharacterRace.Elf ? 2 : 0,
    religion: 0,
    insight: 0,
    stealth: race === CharacterRace.Tiefling ? 2 : 0,
    streetwise: halfElfSkillBonus,
    intimidation: race === CharacterRace.Dragonborn ? 2 : 0,
    thievery: halflingSkillBonus,
  }

  return skillDefinitions.reduce((acc, definition) => {
    const racialBonus = racialSkillBonuses[definition.key] ?? 0
    const armorPenalty = armorPenaltySkillKeys.has(definition.key) ? armorPenaltyBonus : 0

    acc[definition.key] =
      attributeBonuses[definition.attributeKey] +
      levelBonus +
      racialBonus +
      armorPenalty +
      (training[definition.key] ? 5 : 0)

    return acc
  }, {} as CharacterSkillBonuses)
}

export const buildSkillModifiers = (
  skillBonuses: CharacterSkillBonuses,
): Record<keyof CharacterTraining, string> => {
  return skillDefinitions.reduce<Record<keyof CharacterTraining, string>>((acc, skill) => {
    acc[skill.key] = formatModifier(skillBonuses[skill.key])
    return acc
  }, {} as Record<keyof CharacterTraining, string>)
}

const getHighlightedSkillKeys = (characterClass: CharacterClass): Set<CharacterSkillFieldName> => {
  if (characterClass === CharacterClass.Paladin) {
    return paladinHighlightedSkillKeys
  }

  if (characterClass === CharacterClass.Cleric) {
    return clericHighlightedSkillKeys
  }

  if (characterClass === CharacterClass.Wizard) {
    return wizardHighlightedSkillKeys
  }

  if (characterClass === CharacterClass.Warlock) {
    return warlockHighlightedSkillKeys
  }

  if (characterClass === CharacterClass.Warlord || characterClass === CharacterClass.Bard) {
    return warlordAndBardHighlightedSkillKeys
  }

  if (characterClass === CharacterClass.Ranger) {
    return rangerHighlightedSkillKeys
  }

  if (characterClass === CharacterClass.Rogue) {
    return rogueHighlightedSkillKeys
  }

  return fighterAndBarbarianHighlightedSkillKeys
}

const getForcedSkillKeys = (characterClass: CharacterClass): Set<CharacterSkillFieldName> => {
  if (characterClass === CharacterClass.Rogue) {
    return rogueForcedSkillKeys
  }

  if (characterClass === CharacterClass.Ranger) {
    return rangerForcedSkillKeys
  }

  if (characterClass === CharacterClass.Paladin) {
    return paladinForcedSkillKeys
  }

  if (characterClass === CharacterClass.Cleric) {
    return clericForcedSkillKeys
  }

  if (characterClass === CharacterClass.Wizard) {
    return wizardForcedSkillKeys
  }

  return new Set<CharacterSkillFieldName>()
}

export const useSkillSection = () => {
  const { t } = useI18n()
  const { form, skillModifiers, handleTrainingChange } = useCharacterEditPageContext()

  const normalizedAttributes = buildNormalizedAttributes(form.attributes)
  const effectiveAttributes = buildEffectiveAttributes(normalizedAttributes, form.attributesPlus)
  const attributeModifierMap = buildAttributeModifierMap(effectiveAttributes)
  const levelBonusValue = getLevelBonus(form.level)
  const highlightedSkillKeys = getHighlightedSkillKeys(form.class)
  const forcedSkillKeys = getForcedSkillKeys(form.class)

  const buildSkillTooltip = (
    attributeKey: CharacterAttributeFieldName,
    skillKey: CharacterSkillFieldName,
    trained: boolean,
  ): string => {
    const lines: string[] = []

    if (levelBonusValue !== 0) {
      lines.push(`${t('pages.characterEdit.defenseTooltip.levelBonus')}: ${formatModifier(levelBonusValue)}`)
    }

    const attributeBonus = attributeModifierMap[attributeKey]

    if (attributeBonus !== 0) {
      lines.push(
        `${t('pages.characterEdit.defenseTooltip.attributesBonus')}: ${formatModifier(attributeBonus)} (${t(`pages.characterEdit.fields.${attributeKey}`)})`,
      )
    }

    if (trained) {
      lines.push(`${t('pages.characterEdit.skillTooltip.trainingBonus')}: +5`)
    }

    if (armorPenaltySkillKeys.has(skillKey)) {
      const armorPenaltySources = form.items.armors
        .filter((armor) => armor.equipped)
        .filter((armor) => armor.armorPenaltyNumber !== 0)

      if (armorPenaltySources.length > 0) {
        lines.push(
          '',
          [
            `${t('pages.characterEdit.skillTooltip.armorPenalty')}:`,
            ...armorPenaltySources.map((armor) => `${armor.name || '-'}: ${formatModifier(armor.armorPenaltyNumber)}`),
          ].join('\n'),
        )
      }
    }

    const featSources = buildFeatBonusSources(form.feats, `${skillKey}BonusNumber` as CharacterFeatBonusFieldName)

    if (featSources.length > 0) {
      lines.push(
        '',
        [
          t('pages.characterEdit.sourceTooltip.featBonuses'),
          ...featSources.map((feat) => `${feat.name}: ${formatModifier(feat.bonus)}`),
        ].join('\n'),
      )
    }

    return lines.join('\n')
  }

  const skillCards: SkillCardViewModel[] = skillDefinitions.map((skill) => {
    const forced = forcedSkillKeys.has(skill.key)
    const checked = forced ? true : form.training[skill.key]

    return {
      checked,
      disabled: forced,
      highlighted: highlightedSkillKeys.has(skill.key),
      key: skill.key,
      label: t(skill.translationKey),
      modifierLabel: skillModifiers[skill.key],
      tooltip: buildSkillTooltip(skill.attributeKey, skill.key, checked),
    }
  })

  return {
    handleTrainingChange,
    skillCards,
    t,
  }
}
