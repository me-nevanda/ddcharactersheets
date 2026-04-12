import { CharacterClass, CharacterRace } from '../../types/character'
import type { CharacterAttributeBonuses } from '../../types/character'

export function clampLevelValue(value: number): number {
  return Math.min(30, Math.max(1, Math.trunc(value)))
}

export function clampSpeedValue(value: number): number {
  return Math.min(12, Math.max(1, Math.trunc(value)))
}

export function getLevelBonus(value: number): number {
  return Math.floor(Math.min(30, Math.max(1, Math.trunc(value))) / 2)
}

export function formatModifier(value: number): string {
  if (value > 0) {
    return `+${value}`
  }

  return String(value)
}

export function normalizeRaceValue(value: string): CharacterRace {
  if (Object.values(CharacterRace).includes(value as CharacterRace)) {
    return value as CharacterRace
  }

  return CharacterRace.Human
}

export function normalizeClassValue(value: string): CharacterClass {
  if (Object.values(CharacterClass).includes(value as CharacterClass)) {
    return value as CharacterClass
  }

  return CharacterClass.Warlock
}

export function buildRaceAttributeBonuses(race: CharacterRace): CharacterAttributeBonuses {
  return {
    strength: 0,
    constitution: 0,
    dexterity: 0,
    intelligence: race === CharacterRace.Tiefling ? 2 : 0,
    wisdom: 0,
    charisma: race === CharacterRace.Tiefling ? 2 : 0,
  }
}
