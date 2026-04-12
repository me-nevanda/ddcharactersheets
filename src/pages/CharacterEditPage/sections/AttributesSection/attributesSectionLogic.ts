import { attributeDefinitions } from '@dictionaries/characterEditDefinitions'
import type { CharacterAttributeBonuses, CharacterAttributes } from '../../../../types/character'
import type { AttributeRow } from '../../types'

export function clampAttributeValue(value: number): number {
  return Math.min(40, Math.max(0, Math.trunc(value)))
}

export function getAttributeModifier(value: number): number {
  return Math.floor((Math.min(40, Math.max(0, Math.trunc(value))) - 10) / 2)
}

export function buildNormalizedAttributes(attributes: CharacterAttributes): CharacterAttributes {
  return attributeDefinitions.reduce((acc, { key }) => {
    acc[key] = clampAttributeValue(attributes[key])
    return acc
  }, {} as CharacterAttributes)
}

export function buildAttributeModifierMap(attributes: CharacterAttributes): CharacterAttributeBonuses {
  return attributeDefinitions.reduce((acc, { key }) => {
    acc[key] = getAttributeModifier(attributes[key])
    return acc
  }, {} as CharacterAttributeBonuses)
}

export function buildAttributeRows(
  attributes: CharacterAttributes,
  attributeModifiers: CharacterAttributeBonuses,
): AttributeRow[] {
  return attributeDefinitions.map(({ key }) => ({
    key,
    value: attributes[key],
    modifierLabel: formatModifier(attributeModifiers[key]),
  }))
}

function formatModifier(value: number): string {
  if (value > 0) {
    return `+${value}`
  }

  return String(value)
}
