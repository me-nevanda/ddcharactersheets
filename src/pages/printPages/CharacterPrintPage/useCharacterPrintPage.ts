import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCharacter } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import { useI18n } from '@i18n/index'
import { attributeDefinitions, skillDefinitions } from '@dictionaries/characterEditDefinitions'
import {
  buildAttributeModifierMap,
  buildEffectiveAttributes,
  buildNormalizedAttributes,
} from '@pages/CharacterEditPage/sections/AttributesSection/attributesSectionLogic'
import { buildDefenseValues, clampDefenseValue } from '@pages/CharacterEditPage/sections/DefensesSection/defensesSectionLogic'
import { buildSkillBonuses } from '@pages/CharacterEditPage/sections/SkillSection/skillSectionLogic'
import {
  buildCharacterHp,
  buildCharacterSpeed,
  buildCharacterSurge,
  clampSpeedValue,
  getLevelBonus,
} from '@pages/CharacterEditPage/sections/GeneralSection/generalSectionLogic'
import { sumFeatBonus } from '@pages/CharacterEditPage/featsLogic'
import type {
  Character,
  CharacterItemBonusFieldName,
  CharacterItems,
  CharacterSkillBonuses,
  CharacterTraining,
} from '../../../types/character'
import type { CharacterPrintPageState } from './types'

function sumEquippedItemBonus(items: CharacterItems, fieldName: CharacterItemBonusFieldName): number {
  return [...items.armors, ...items.weapons, ...items.others]
    .filter((item) => item.equipped)
    .reduce((total, item) => total + item[fieldName], 0)
}

function buildEquippedItemAttributeBonuses(items: CharacterItems) {
  return {
    strength: sumEquippedItemBonus(items, 'strengthBonusNumber'),
    condition: sumEquippedItemBonus(items, 'conditionBonusNumber'),
    dexterity: sumEquippedItemBonus(items, 'dexterityBonusNumber'),
    intelligence: sumEquippedItemBonus(items, 'intelligenceBonusNumber'),
    wisdom: sumEquippedItemBonus(items, 'wisdomBonusNumber'),
    charisma: sumEquippedItemBonus(items, 'charismaBonusNumber'),
  }
}

function normalizeSkillTraining(training: Partial<CharacterTraining> | undefined): CharacterTraining {
  return {
    acrobatics: training?.acrobatics ?? false,
    arcana: training?.arcana ?? false,
    athletics: training?.athletics ?? false,
    diplomacy: training?.diplomacy ?? false,
    history: training?.history ?? false,
    healing: training?.healing ?? false,
    deception: training?.deception ?? false,
    perception: training?.perception ?? false,
    endurance: training?.endurance ?? false,
    dungeoneering: training?.dungeoneering ?? false,
    nature: training?.nature ?? false,
    religion: training?.religion ?? false,
    insight: training?.insight ?? false,
    stealth: training?.stealth ?? false,
    streetwise: training?.streetwise ?? false,
    intimidation: training?.intimidation ?? false,
    thievery: training?.thievery ?? false,
  }
}

export function useCharacterPrintPage(): CharacterPrintPageState {
  const { t } = useI18n()
  const { characterId = '' } = useParams()
  const [character, setCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadCharacter() {
      try {
        const nextCharacter = await getCharacter(characterId)

        if (!cancelled) {
          setCharacter(nextCharacter)
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
    if (!character) {
      return
    }

    document.title = `${t('pages.characterPrint.title')} - ${character.name || t('pages.characterList.unnamedCharacter')}`
  }, [character, t])

  const computedState = useMemo<CharacterPrintPageState>(() => {
    if (!character) {
      return {
        loading,
        error,
        character,
        levelBonus: 0,
        speedValue: 0,
        hpValue: 0,
        surgeValue: 0,
        attributeRows: [],
        defenseRows: [],
        skillRows: [],
        abilityRows: [],
        itemRows: {
          armors: [],
          weapons: [],
          others: [],
        },
      }
    }

    const normalizedAttributes = buildNormalizedAttributes(character.attributes)
    const equippedAttributeBonuses = buildEquippedItemAttributeBonuses(character.items)
    const attributeBonuses = buildEffectiveAttributes(normalizedAttributes, {
      strength: character.attributesPlus.strength + equippedAttributeBonuses.strength,
      condition: character.attributesPlus.condition + equippedAttributeBonuses.condition,
      dexterity: character.attributesPlus.dexterity + equippedAttributeBonuses.dexterity,
      intelligence: character.attributesPlus.intelligence + equippedAttributeBonuses.intelligence,
      wisdom: character.attributesPlus.wisdom + equippedAttributeBonuses.wisdom,
      charisma: character.attributesPlus.charisma + equippedAttributeBonuses.charisma,
    })
    const attributeModifierMap = buildAttributeModifierMap(attributeBonuses)
    const levelBonus = getLevelBonus(character.level)
    const feats = character.feats ?? []
    const equippedSpeedBonus = sumEquippedItemBonus(character.items, 'speedBonusNumber')
    const equippedDefenseBonuses = {
      kp: sumEquippedItemBonus(character.items, 'kpBonusNumber'),
      fortitude: sumEquippedItemBonus(character.items, 'fortitudeBonusNumber'),
      reflex: sumEquippedItemBonus(character.items, 'reflexBonusNumber'),
      will: sumEquippedItemBonus(character.items, 'willBonusNumber'),
    }
    const featSpeedBonus = sumFeatBonus(feats, 'speedBonusNumber')
    const featHpBonus = sumFeatBonus(feats, 'hpBonusNumber')
    const featDefenseBonuses = {
      kp: sumFeatBonus(feats, 'kpBonusNumber'),
      fortitude: sumFeatBonus(feats, 'fortitudeBonusNumber'),
      reflex: sumFeatBonus(feats, 'reflexBonusNumber'),
      will: sumFeatBonus(feats, 'willBonusNumber'),
    }
    const skillTraining = normalizeSkillTraining(character.training)
    const skillBonuses = buildSkillBonuses(
      character.level,
      attributeModifierMap,
      skillTraining,
      character.race,
      character.items,
    )
    const skillBonusesWithFeats: CharacterSkillBonuses = {
      acrobatics: skillBonuses.acrobatics + sumFeatBonus(feats, 'acrobaticsBonusNumber'),
      arcana: skillBonuses.arcana + sumFeatBonus(feats, 'arcanaBonusNumber'),
      athletics: skillBonuses.athletics + sumFeatBonus(feats, 'athleticsBonusNumber'),
      diplomacy: skillBonuses.diplomacy + sumFeatBonus(feats, 'diplomacyBonusNumber'),
      history: skillBonuses.history + sumFeatBonus(feats, 'historyBonusNumber'),
      healing: skillBonuses.healing + sumFeatBonus(feats, 'healingBonusNumber'),
      deception: skillBonuses.deception + sumFeatBonus(feats, 'deceptionBonusNumber'),
      perception: skillBonuses.perception + sumFeatBonus(feats, 'perceptionBonusNumber'),
      endurance: skillBonuses.endurance + sumFeatBonus(feats, 'enduranceBonusNumber'),
      dungeoneering: skillBonuses.dungeoneering + sumFeatBonus(feats, 'dungeoneeringBonusNumber'),
      nature: skillBonuses.nature + sumFeatBonus(feats, 'natureBonusNumber'),
      religion: skillBonuses.religion + sumFeatBonus(feats, 'religionBonusNumber'),
      insight: skillBonuses.insight + sumFeatBonus(feats, 'insightBonusNumber'),
      stealth: skillBonuses.stealth + sumFeatBonus(feats, 'stealthBonusNumber'),
      streetwise: skillBonuses.streetwise + sumFeatBonus(feats, 'streetwiseBonusNumber'),
      intimidation: skillBonuses.intimidation + sumFeatBonus(feats, 'intimidationBonusNumber'),
      thievery: skillBonuses.thievery + sumFeatBonus(feats, 'thieveryBonusNumber'),
    }
    const defenseValues = buildDefenseValues(
      attributeModifierMap,
      levelBonus,
      character.race,
      character.class,
      equippedDefenseBonuses,
    )
    const hpCondition = attributeBonuses.condition
    const surgeCondition = attributeModifierMap.condition

    return {
      loading,
      error,
      character,
      levelBonus,
      speedValue: clampSpeedValue(buildCharacterSpeed(character.race) + equippedSpeedBonus + featSpeedBonus),
      hpValue: Math.max(0, buildCharacterHp(character.class, character.level, hpCondition) + featHpBonus),
      surgeValue: buildCharacterSurge(character.class, surgeCondition),
      attributeRows: attributeDefinitions.map((definition) => ({
        key: definition.key,
        label: t(definition.translationKey),
        value: attributeBonuses[definition.key],
        modifier: attributeModifierMap[definition.key],
      })),
      defenseRows: [
        { key: 'kp', label: t('pages.characterEdit.fields.kp'), value: clampDefenseValue(defenseValues.kp + featDefenseBonuses.kp) },
        {
          key: 'fortitude',
          label: t('pages.characterEdit.fields.fortitude'),
          value: clampDefenseValue(defenseValues.fortitude + featDefenseBonuses.fortitude),
        },
        {
          key: 'reflex',
          label: t('pages.characterEdit.fields.reflex'),
          value: clampDefenseValue(defenseValues.reflex + featDefenseBonuses.reflex),
        },
        {
          key: 'will',
          label: t('pages.characterEdit.fields.will'),
          value: clampDefenseValue(defenseValues.will + featDefenseBonuses.will),
        },
      ],
      skillRows: skillDefinitions.map((skill) => ({
        key: skill.key,
        label: t(skill.translationKey),
        value: skillBonusesWithFeats[skill.key],
        trained: skillTraining[skill.key],
      })),
      abilityRows: character.abilities ?? [],
      itemRows: {
        armors: character.items.armors.map((item, index) => ({
          key: `armor-${index}`,
          name: item.name,
          description: item.description,
        })),
        weapons: character.items.weapons.map((item, index) => ({
          key: `weapon-${index}`,
          name: item.name,
          description: item.description,
        })),
        others: character.items.others.map((item, index) => ({
          key: `other-${index}`,
          name: item.name,
          description: item.description,
        })),
      },
    }
  }, [character, error, loading, t])

  return computedState
}
