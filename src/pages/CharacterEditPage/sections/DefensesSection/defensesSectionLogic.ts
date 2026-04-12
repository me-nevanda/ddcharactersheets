import { CharacterRace } from '../../../../types/character'
import type { CharacterAttributeBonuses, CharacterDefenses } from '../../../../types/character'
import type { DefenseValues } from '../../types'

export function clampDefenseValue(value: number): number {
  return Math.min(30, Math.max(0, Math.trunc(value)))
}

export function buildDefenseValues(
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

export function normalizeDefenses(
  data: Partial<Record<keyof CharacterDefenses, unknown>> | undefined,
  fallback: CharacterDefenses,
): CharacterDefenses {
  return {
    kp: normalizeDefenseValue(data?.kp) ?? fallback.kp,
    fortitude: normalizeDefenseValue(data?.fortitude) ?? fallback.fortitude,
    reflex: normalizeDefenseValue(data?.reflex) ?? fallback.reflex,
    will: normalizeDefenseValue(data?.will) ?? fallback.will,
  }
}

function normalizeDefenseValue(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null
  }

  return Math.trunc(value)
}
