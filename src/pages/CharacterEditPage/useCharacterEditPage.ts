import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCharacter, saveCharacter } from '@lib/api'
import { useI18n } from '@i18n/index'
import { getErrorMessage } from '@lib/errors'
import {
  emptyForm,
  emptyTraining,
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
import { buildDefenseValues, normalizeDefenses } from './sections/DefensesSection/defensesSectionLogic'
import { buildSkillBonuses, buildSkillModifiers } from './sections/SkillSection/skillSectionLogic'
import {
  buildRaceAttributeBonuses,
  buildCharacterHp,
  buildCharacterSurge,
  clampLevelValue,
  clampSpeedValue,
  formatModifier,
  getLevelBonus,
  normalizeClassValue,
  normalizeRaceValue,
} from './sections/GeneralSection/generalSectionLogic'
import { CharacterClass, type CharacterBonuses } from '../../types/character'
import type {
  AttributeRow,
  CharacterAttributeFieldName,
  CharacterEditFormData,
  CharacterEditPageState,
  CharacterGeneralChangeEvent,
  CharacterGeneralFieldName,
  CharacterSkillFieldName,
  SkillModifierMap,
} from './types'

export function useCharacterEditPage(): CharacterEditPageState {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { characterId = '' } = useParams()
  const [form, setForm] = useState<CharacterEditFormData>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadCharacter() {
      try {
        const character = await getCharacter(characterId)

        if (!cancelled) {
          const { id, updatedAt, bonuses: characterBonuses, ...characterData } = character

          setForm({
            ...characterData,
            level: clampLevelValue(character.level),
            speed: clampSpeedValue(character.speed),
            hp: character.hp ?? 0,
            surge: character.surge ?? 0,
            attributes: buildNormalizedAttributes(character.attributes),
            attributesPlus: buildRaceAttributeBonuses(character.race),
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
          })
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

    if (fieldName === 'speed') {
      setForm((currentForm) => ({
        ...currentForm,
        speed: clampSpeedValue(Number.parseInt(value, 10) || 1),
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

  const normalizedAttributes = buildNormalizedAttributes(form.attributes)
  const effectiveAttributes = buildEffectiveAttributes(normalizedAttributes, form.attributesPlus)
  const attributeModifierMap = buildAttributeModifierMap(effectiveAttributes)
  const levelBonusValue = getLevelBonus(form.level)
  const levelBonusLabel = formatModifier(levelBonusValue)
  const hpValue = buildCharacterHp(form.class, form.level, effectiveAttributes.condition)
  const surgeValue = buildCharacterSurge(form.class, attributeModifierMap.condition)
  const defenseValues = buildDefenseValues(attributeModifierMap, levelBonusValue, form.race, form.class)
  const skillBonuses = buildSkillBonuses(form.level, attributeModifierMap, form.training, form.race)
  const skillModifiers = buildSkillModifiers(skillBonuses)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const bonuses: CharacterBonuses = {
        level: levelBonusValue,
        attributes: attributeModifierMap,
        skills: skillBonuses,
        defenses: defenseValues,
      }

      await saveCharacter(characterId, {
        ...form,
        name: form.name.trim(),
        level: clampLevelValue(form.level),
        speed: clampSpeedValue(form.speed),
        hp: hpValue,
        surge: surgeValue,
        attributes: normalizedAttributes,
        attributesPlus: form.attributesPlus,
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
      navigate('/')
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
    handleGeneralChange,
    handleAttributeChange,
    handleTrainingChange,
    handleSubmit,
    attributeRows,
    levelBonusLabel,
    skillModifiers,
    defenseValues,
    hpValue,
    surgeValue,
  }
}
