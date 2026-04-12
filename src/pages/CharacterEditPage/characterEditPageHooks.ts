import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCharacter, saveCharacter } from '../../lib/api'
import { useI18n } from '../../i18n'
import { getErrorMessage } from '../../lib/errors'
import type {
  AttributeRow,
  CharacterAttributeFieldName,
  CharacterEditFormData,
  CharacterEditPageState,
  CharacterGeneralChangeEvent,
  CharacterGeneralFieldName,
  CharacterTrainingFieldName,
  DefenseValues,
  SkillModifierMap,
} from './types'
import type {
  CharacterAttributes,
  CharacterAttributeBonuses,
  CharacterBonuses,
  CharacterSkillBonuses,
  CharacterTraining,
} from '../../types/character'
import {
  attributeDefinitions,
  trainingDefinitions,
} from '@dictionaries/characterEditDefinitions'
import { CharacterClass, CharacterRace } from '../../types/character'

const emptyForm: CharacterEditFormData = {
  name: '',
  level: 1,
  race: CharacterRace.Human,
  class: CharacterClass.Warlock,
  speed: 6,
  attributes: {
    strength: 10,
    constitution: 10,
    dexterity: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  },
  defenses: {
    kp: 0,
    fortitude: 0,
    reflex: 0,
    will: 0,
  },
  training: {
    acrobatics: false,
    arcana: false,
    athletics: false,
    diplomacy: false,
    history: false,
    healing: false,
    deception: false,
    perception: false,
    endurance: false,
    dungeoneering: false,
    nature: false,
    religion: false,
    insight: false,
    stealth: false,
    streetwise: false,
    intimidation: false,
    thievery: false,
  },
}

function clampAttributeValue(value: number): number {
  return Math.min(40, Math.max(0, Math.trunc(value)))
}

function clampDefenseValue(value: number): number {
  return Math.min(30, Math.max(0, Math.trunc(value)))
}

function getAttributeModifier(value: number): number {
  return Math.floor((Math.min(40, Math.max(0, Math.trunc(value))) - 10) / 2)
}

function getLevelBonus(value: number): number {
  return Math.floor(Math.min(30, Math.max(1, Math.trunc(value))) / 2)
}

function formatModifier(value: number): string {
  if (value > 0) {
    return `+${value}`
  }

  return String(value)
}

function buildNormalizedAttributes(attributes: CharacterAttributes): CharacterAttributes {
  return attributeDefinitions.reduce((acc, { key }) => {
    acc[key] = clampAttributeValue(attributes[key])
    return acc
  }, {} as CharacterAttributes)
}

function buildAttributeModifierMap(attributes: CharacterAttributes): CharacterAttributeBonuses {
  return attributeDefinitions.reduce((acc, { key }) => {
    acc[key] = getAttributeModifier(attributes[key])
    return acc
  }, {} as CharacterAttributeBonuses)
}

function buildDefenseValues(
  attributeModifiers: CharacterAttributeBonuses,
  levelBonus: number,
  race: CharacterRace,
): DefenseValues {
  const humanDefenseBonus = race === CharacterRace.Human ? 1 : 0

  return {
    kp: clampDefenseValue(
      10 + Math.max(attributeModifiers.dexterity, attributeModifiers.intelligence) + levelBonus,
    ),
    fortitude: clampDefenseValue(
      10 +
        Math.max(attributeModifiers.strength, attributeModifiers.constitution) +
        levelBonus +
        humanDefenseBonus,
    ),
    reflex: clampDefenseValue(
      10 +
        Math.max(attributeModifiers.dexterity, attributeModifiers.intelligence) +
        levelBonus +
        humanDefenseBonus,
    ),
    will: clampDefenseValue(
      10 +
        Math.max(attributeModifiers.wisdom, attributeModifiers.charisma) +
        levelBonus +
        humanDefenseBonus,
    ),
  }
}

function clampLevelValue(value: number): number {
  return Math.min(30, Math.max(1, Math.trunc(value)))
}

function clampSpeedValue(value: number): number {
  return Math.min(12, Math.max(1, Math.trunc(value)))
}

function normalizeRaceValue(value: string): CharacterRace {
  if (Object.values(CharacterRace).includes(value as CharacterRace)) {
    return value as CharacterRace
  }

  return CharacterRace.Human
}

function normalizeClassValue(value: string): CharacterClass {
  if (Object.values(CharacterClass).includes(value as CharacterClass)) {
    return value as CharacterClass
  }

  return CharacterClass.Warlock
}

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
        setForm({
          name: character.name,
          level: clampLevelValue(character.level),
          speed: clampSpeedValue(character.speed),
          race: character.race,
          class: character.class,
            attributes: {
              strength: character.attributes.strength,
              constitution: character.attributes.constitution,
              dexterity: character.attributes.dexterity,
              intelligence: character.attributes.intelligence,
              wisdom: character.attributes.wisdom,
              charisma: character.attributes.charisma,
            },
            defenses: {
              kp: character.defenses.kp,
              fortitude: character.defenses.fortitude,
              reflex: character.defenses.reflex,
              will: character.defenses.will,
            },
            training: {
              acrobatics: character.training.acrobatics,
              arcana: character.training.arcana,
              athletics: character.training.athletics,
              diplomacy: character.training.diplomacy,
              history: character.training.history,
              healing: character.training.healing,
              deception: character.training.deception,
              perception: character.training.perception,
              endurance: character.training.endurance ?? false,
              dungeoneering: character.training.dungeoneering,
              nature: character.training.nature,
              religion: character.training.religion,
              insight: character.training.insight,
              stealth: character.training.stealth,
              streetwise: character.training.streetwise,
              intimidation: character.training.intimidation,
              thievery: character.training.thievery,
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
      setForm((currentForm) => ({
        ...currentForm,
        race: normalizeRaceValue(value),
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
    const fieldName = name as CharacterTrainingFieldName

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
  const dwarfSkillBonus = form.race === CharacterRace.Dwarf ? 2 : 0
  const halflingSkillBonus = form.race === CharacterRace.Halfling ? 2 : 0
  const halfElfSkillBonus = form.race === CharacterRace.HalfElf ? 2 : 0
  const racialSkillBonuses: Partial<Record<keyof CharacterSkillBonuses, number>> = {
    acrobatics: form.race === CharacterRace.Halfling ? 2 : 0,
    arcana: form.race === CharacterRace.Eladrin ? 2 : 0,
    athletics: 0,
    diplomacy: halfElfSkillBonus,
    history: form.race === CharacterRace.Eladrin || form.race === CharacterRace.Dragonborn ? 2 : 0,
    healing: 0,
    deception: form.race === CharacterRace.Tiefling ? 2 : 0,
    perception: form.race === CharacterRace.Elf ? 2 : 0,
    endurance: dwarfSkillBonus,
    dungeoneering: dwarfSkillBonus,
    nature: form.race === CharacterRace.Elf ? 2 : 0,
    religion: 0,
    insight: 0,
    stealth: form.race === CharacterRace.Tiefling ? 2 : 0,
    streetwise: halfElfSkillBonus,
    intimidation: form.race === CharacterRace.Dragonborn ? 2 : 0,
    thievery: halflingSkillBonus,
  }

  const skillBonuses: CharacterSkillBonuses = trainingDefinitions.reduce((acc, definition) => {
    const racialBonus = racialSkillBonuses[definition.key] ?? 0

    acc[definition.key] =
      attributeModifierMap[definition.attributeKey] +
      levelBonusValue +
      racialBonus +
      (form.training[definition.key] ? 5 : 0)
    return acc
  }, {} as CharacterSkillBonuses)

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
        name: form.name.trim(),
        level: clampLevelValue(form.level),
        race: form.race,
        class: form.class,
        speed: clampSpeedValue(form.speed),
        attributes: normalizedAttributes,
        defenses: defenseValues,
        training: form.training,
        bonuses,
      })
      navigate('/')
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
      setSaving(false)
    }
  }

  const attributeRows: AttributeRow[] = attributeDefinitions.map(({ key }) => ({
    key,
    value: normalizedAttributes[key],
    modifierLabel: formatModifier(attributeModifierMap[key]),
  }))

  const skillModifiers: SkillModifierMap = trainingDefinitions.reduce<SkillModifierMap>(
    (acc, training) => {
      acc[training.key] = formatModifier(skillBonuses[training.key])
      return acc
    },
    {} as SkillModifierMap,
  )

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
