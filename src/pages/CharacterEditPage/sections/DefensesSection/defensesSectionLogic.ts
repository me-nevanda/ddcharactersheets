import { CharacterClass, CharacterRace } from '../../../../types/character'
import type { CharacterAttributeBonuses, CharacterDefenses } from '../../../../types/character'
import type { DefenseValues } from '../../types'

export function clampDefenseValue(value: number): number {
  return Math.min(30, Math.max(0, Math.trunc(value)))
}

export function buildDefenseValues(
  attributeModifiers: CharacterAttributeBonuses,
  levelBonus: number,
  race: CharacterRace,
  characterClass: CharacterClass,
): DefenseValues {
  const humanDefenseBonus = race === CharacterRace.Human ? 1 : 0
  const fortitudeClassBonus =
    characterClass === CharacterClass.Fighter ||
    characterClass === CharacterClass.Barbarian ||
    characterClass === CharacterClass.Ranger
      ? 2
      : 0
  const warlordAndBardDefenseBonus =
    characterClass === CharacterClass.Warlord || characterClass === CharacterClass.Bard ? 1 : 0
  const paladinDefenseBonus = characterClass === CharacterClass.Paladin ? 1 : 0
  const rogueReflexBonus = characterClass === CharacterClass.Rogue ? 2 : 0
  const clericWillBonus = characterClass === CharacterClass.Cleric ? 2 : 0
  const wizardWillBonus = characterClass === CharacterClass.Wizard ? 2 : 0
  const warlockWillBonus = characterClass === CharacterClass.Warlock ? 1 : 0
  const warlockReflexBonus = characterClass === CharacterClass.Warlock ? 1 : 0

  console.log(
    Math.max(attributeModifiers.dexterity, attributeModifiers.intelligence),
    levelBonus,
    humanDefenseBonus,
    paladinDefenseBonus,
    warlockReflexBonus,
    rogueReflexBonus,)

  return {
    kp: clampDefenseValue(
      10 + Math.max(attributeModifiers.dexterity, attributeModifiers.intelligence) + levelBonus,
    ),
    fortitude: clampDefenseValue(
      10 +
        Math.max(attributeModifiers.strength, attributeModifiers.constitution) +
        levelBonus +
        humanDefenseBonus +
        fortitudeClassBonus +
        warlordAndBardDefenseBonus +
        paladinDefenseBonus,
    ),
    reflex: clampDefenseValue(
      10 +
        Math.max(attributeModifiers.dexterity, attributeModifiers.intelligence) +
        levelBonus +
        humanDefenseBonus +
        paladinDefenseBonus +
        warlockReflexBonus +
        rogueReflexBonus,
    ),
    will: clampDefenseValue(
      10 +
        Math.max(attributeModifiers.wisdom, attributeModifiers.charisma) +
        levelBonus +
        humanDefenseBonus +
        warlordAndBardDefenseBonus +
        clericWillBonus +
        wizardWillBonus +
        warlockWillBonus,
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
