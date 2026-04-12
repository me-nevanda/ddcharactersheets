import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCharacter, saveCharacter } from '../../lib/api'
import { useI18n } from '../../i18n'
import { getErrorMessage } from '../../lib/errors'
import { emptyForm, zeroAttributeBonuses, zeroDefenses, zeroDefenseBonuses } from './characterEditPageDefaults'
import { buildAttributeModifierMap, buildAttributeRows, buildNormalizedAttributes, clampAttributeValue } from './sections/AttributesSection/attributesSectionLogic'
import { buildDefenseValues, normalizeDefenses } from './sections/DefensesSection/defensesSectionLogic'
import { buildSkillBonuses, buildSkillModifiers } from './sections/SkillSection/skillSectionLogic'
import {
  buildRaceAttributeBonuses,
  clampLevelValue,
  clampSpeedValue,
  formatModifier,
  getLevelBonus,
  normalizeClassValue,
  normalizeRaceValue,
} from './sections/GeneralSection/generalSectionLogic'
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
import type { CharacterBonuses } from '../../types/character'

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
  const attributeModifierMap = buildAttributeModifierMap(normalizedAttributes)
  const levelBonusValue = getLevelBonus(form.level)
  const levelBonusLabel = formatModifier(levelBonusValue)
  const defenseValues = buildDefenseValues(attributeModifierMap, levelBonusValue, form.race)
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
  }
}
