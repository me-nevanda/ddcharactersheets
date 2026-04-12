import { CharacterClass, CharacterRace } from '../../../../types/character'
import type { CharacterAttributeBonuses } from '../../../../types/character'

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
    strength: race === CharacterRace.Dragonborn ? 2 : 0,
    constitution: race === CharacterRace.Dwarf || race === CharacterRace.HalfElf ? 2 : 0,
    dexterity: race === CharacterRace.Eladrin || race === CharacterRace.Elf || race === CharacterRace.Halfling ? 2 : 0,
    intelligence: race === CharacterRace.Tiefling || race === CharacterRace.Eladrin ? 2 : 0,
    wisdom: race === CharacterRace.Elf || race === CharacterRace.Dwarf ? 2 : 0,
    charisma:
      race === CharacterRace.Tiefling ||
      race === CharacterRace.Dragonborn ||
      race === CharacterRace.Halfling ||
      race === CharacterRace.HalfElf
        ? 2
      : 0,
  }
}

export function buildCharacterHp(
  characterClass: CharacterClass,
  level: number,
  constitution: number,
): number {
  if (characterClass === CharacterClass.Warlock || characterClass === CharacterClass.Rogue || characterClass === CharacterClass.Ranger) {
    return 7 + constitution + 5 * level
  }

  if (characterClass === CharacterClass.Wizard) {
    return 6 + constitution + 4 * level
  }

  if (characterClass === CharacterClass.Paladin || characterClass === CharacterClass.Fighter || characterClass === CharacterClass.Barbarian) {
    return 9 + constitution + 6 * level
  }

  if (characterClass === CharacterClass.Warlord || characterClass === CharacterClass.Bard || characterClass === CharacterClass.Cleric) {
    return 7 + constitution + 5 * level
  }

  return 0
}

export function buildCharacterSurge(
  characterClass: CharacterClass,
  constitutionBonus: number,
): number {
  if (characterClass === CharacterClass.Warlock || characterClass === CharacterClass.Rogue || characterClass === CharacterClass.Ranger) {
    return 6 + constitutionBonus
  }

  if (characterClass === CharacterClass.Wizard) {
    return 6 + constitutionBonus
  }

  if (characterClass === CharacterClass.Paladin || characterClass === CharacterClass.Fighter || characterClass === CharacterClass.Barbarian) {
    return 10 + constitutionBonus
  }

  if (characterClass === CharacterClass.Warlord || characterClass === CharacterClass.Bard || characterClass === CharacterClass.Cleric) {
    return 7 + constitutionBonus
  }

  return 0
}
