import { useI18n } from '@i18n/index'
import { attributeDefinitions } from '@dictionaries/characterEditDefinitions'
import type { CharacterAttributeBonuses, CharacterAttributes } from '../../../../types/character'
import { useCharacterEditPageContext } from '../../characterEditPageContext'
import type { AttributeCardViewModel, AttributeRow } from './types'

const formatSignedValue = (value: number): string => {
  return value > 0 ? `+${value}` : String(value)
}

const formatModifier = (value: number): string => {
  if (value > 0) {
    return `+${value}`
  }

  return String(value)
}

export const clampAttributeValue = (value: number): number => {
  return Math.min(40, Math.max(0, Math.trunc(value)))
}

export const getAttributeModifier = (value: number): number => {
  return Math.floor((Math.min(40, Math.max(0, Math.trunc(value))) - 10) / 2)
}

export const buildNormalizedAttributes = (attributes: CharacterAttributes): CharacterAttributes => {
  return attributeDefinitions.reduce((acc, { key }) => {
    acc[key] = clampAttributeValue(attributes[key])
    return acc
  }, {} as CharacterAttributes)
}

export const buildEffectiveAttributes = (
  attributes: CharacterAttributes,
  attributeBonuses: CharacterAttributeBonuses,
): CharacterAttributes => {
  return attributeDefinitions.reduce((acc, { key }) => {
    acc[key] = clampAttributeValue(attributes[key] + attributeBonuses[key])
    return acc
  }, {} as CharacterAttributes)
}

export const buildAttributeModifierMap = (attributes: CharacterAttributes): CharacterAttributeBonuses => {
  return attributeDefinitions.reduce((acc, { key }) => {
    acc[key] = getAttributeModifier(attributes[key])
    return acc
  }, {} as CharacterAttributeBonuses)
}

export const buildAttributeRows = (
  attributes: CharacterAttributes,
  attributeModifiers: CharacterAttributeBonuses,
): AttributeRow[] => {
  return attributeDefinitions.map(({ key }) => ({
    key,
    value: attributes[key],
    modifierLabel: formatModifier(attributeModifiers[key]),
  }))
}

export const useAttributesSection = () => {
  const { t } = useI18n()
  const { attributeRows, attributeBonuses, attributeBonusTooltips, handleAttributeChange } = useCharacterEditPageContext()

  const attributeCards: AttributeCardViewModel[] = attributeDefinitions.map((definition, index) => {
    const row = attributeRows[index]

    return {
      bonusLabel: formatSignedValue(attributeBonuses[definition.key]),
      bonusTooltip: attributeBonusTooltips[definition.key],
      inputId: definition.key,
      label: t(definition.translationKey),
      modifierLabel: row.modifierLabel,
      value: row.value,
    }
  })

  return {
    attributeCards,
    handleAttributeChange,
    t,
  }
}
