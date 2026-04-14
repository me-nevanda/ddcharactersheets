import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCharacter } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import { useI18n } from '@i18n/index'
import { attributeDefinitions, skillDefinitions } from '@dictionaries/characterEditDefinitions'
import {
  buildAttributeModifierMap,
  buildEffectiveAttributes,
  buildNormalizedAttributes,
} from '../CharacterEditPage/sections/AttributesSection/attributesSectionLogic'
import { buildDefenseValues } from '../CharacterEditPage/sections/DefensesSection/defensesSectionLogic'
import { buildSkillBonuses } from '../CharacterEditPage/sections/SkillSection/skillSectionLogic'
import {
  buildCharacterHp,
  buildCharacterSpeed,
  buildCharacterSurge,
  getLevelBonus,
} from '../CharacterEditPage/sections/GeneralSection/generalSectionLogic'
import type { Character, CharacterItemBonusFieldName, CharacterItems, CharacterTraining } from '../../types/character'
import type { CharacterPrintPageState } from './types'

function sumEquippedItemBonus(items: CharacterItems, fieldName: CharacterItemBonusFieldName): number {
  return [...items.armors, ...items.weapons, ...items.others]
    .filter((item) => item.equipped)
    .reduce((total, item) => total + item[fieldName], 0)
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
  const printedRef = useRef(false)

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
    if (!character || loading || error || printedRef.current) {
      return
    }

    printedRef.current = true

    window.setTimeout(() => {
      window.print()
    }, 250)
  }, [character, loading, error])

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
    const attributeBonuses = buildEffectiveAttributes(normalizedAttributes, character.attributesPlus)
    const attributeModifierMap = buildAttributeModifierMap(attributeBonuses)
    const levelBonus = getLevelBonus(character.level)
    const equippedSpeedBonus = sumEquippedItemBonus(character.items, 'speedBonusNumber')
    const equippedDefenseBonuses = {
      kp: sumEquippedItemBonus(character.items, 'kpBonusNumber'),
      fortitude: sumEquippedItemBonus(character.items, 'fortitudeBonusNumber'),
      reflex: sumEquippedItemBonus(character.items, 'reflexBonusNumber'),
      will: sumEquippedItemBonus(character.items, 'willBonusNumber'),
    }
    const skillTraining = normalizeSkillTraining(character.training)
    const skillBonuses = buildSkillBonuses(
      character.level,
      attributeModifierMap,
      skillTraining,
      character.race,
      character.items,
    )
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
      speedValue: buildCharacterSpeed(character.race) + equippedSpeedBonus,
      hpValue: buildCharacterHp(character.class, character.level, hpCondition),
      surgeValue: buildCharacterSurge(character.class, surgeCondition),
      attributeRows: attributeDefinitions.map((definition) => ({
        key: definition.key,
        label: t(definition.translationKey),
        value: attributeBonuses[definition.key],
        modifier: attributeModifierMap[definition.key],
      })),
      defenseRows: [
        { key: 'kp', label: t('pages.characterEdit.fields.kp'), value: defenseValues.kp },
        { key: 'fortitude', label: t('pages.characterEdit.fields.fortitude'), value: defenseValues.fortitude },
        { key: 'reflex', label: t('pages.characterEdit.fields.reflex'), value: defenseValues.reflex },
        { key: 'will', label: t('pages.characterEdit.fields.will'), value: defenseValues.will },
      ],
      skillRows: skillDefinitions.map((skill) => ({
        key: skill.key,
        label: t(skill.translationKey),
        value: skillBonuses[skill.key],
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
