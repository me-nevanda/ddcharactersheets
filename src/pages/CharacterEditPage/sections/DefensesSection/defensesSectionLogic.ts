import { CharacterClass, CharacterRace } from '../../../../types/character'
import type { CharacterAttributeBonuses, CharacterDefenses } from '../../../../types/character'
import type { DefenseValues } from '../../types'

export function clampDefenseValue(value: number): number {
  return Math.min(30, Math.max(0, Math.trunc(value)))
}

type DefenseKey = keyof CharacterDefenses
type AttributeKey = keyof CharacterAttributeBonuses

export interface DefenseBreakdown {
  value: number
  levelBonus: number
  classBonus: number
  attributeBonus: number
  attributeKeys: AttributeKey[]
}

export type DefenseBreakdowns = Record<DefenseKey, DefenseBreakdown>

export function buildDefenseValues(
  attributeModifiers: CharacterAttributeBonuses,
  levelBonus: number,
  race: CharacterRace,
  characterClass: CharacterClass,
): DefenseValues {
  const breakdowns = buildDefenseBreakdowns(attributeModifiers, levelBonus, race, characterClass)

  return {
    kp: breakdowns.kp.value,
    fortitude: breakdowns.fortitude.value,
    reflex: breakdowns.reflex.value,
    will: breakdowns.will.value,
  }
}

export function buildDefenseBreakdowns(
  attributeModifiers: CharacterAttributeBonuses,
  levelBonus: number,
  race: CharacterRace,
  characterClass: CharacterClass,
): DefenseBreakdowns {
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

  const fortitudeAttributeBonus = Math.max(attributeModifiers.strength, attributeModifiers.condition)
  const reflexAttributeBonus = Math.max(attributeModifiers.dexterity, attributeModifiers.intelligence)
  const willAttributeBonus = Math.max(attributeModifiers.wisdom, attributeModifiers.charisma)

  return {
    kp: {
      value: clampDefenseValue(10 + reflexAttributeBonus + levelBonus),
      levelBonus,
      classBonus: 0,
      attributeBonus: reflexAttributeBonus,
      attributeKeys: getMaxAttributeKeys(attributeModifiers.dexterity, attributeModifiers.intelligence, [
        'dexterity',
        'intelligence',
      ]),
    },
    fortitude: {
      value: clampDefenseValue(
        10 +
          fortitudeAttributeBonus +
          levelBonus +
          humanDefenseBonus +
          fortitudeClassBonus +
          warlordAndBardDefenseBonus +
          paladinDefenseBonus,
      ),
      levelBonus,
      classBonus: humanDefenseBonus + fortitudeClassBonus + warlordAndBardDefenseBonus + paladinDefenseBonus,
      attributeBonus: fortitudeAttributeBonus,
      attributeKeys: getMaxAttributeKeys(attributeModifiers.strength, attributeModifiers.condition, [
        'strength',
        'condition',
      ]),
    },
    reflex: {
      value: clampDefenseValue(
        10 + reflexAttributeBonus + levelBonus + humanDefenseBonus + paladinDefenseBonus + warlockReflexBonus + rogueReflexBonus,
      ),
      levelBonus,
      classBonus: humanDefenseBonus + paladinDefenseBonus + warlockReflexBonus + rogueReflexBonus,
      attributeBonus: reflexAttributeBonus,
      attributeKeys: getMaxAttributeKeys(attributeModifiers.dexterity, attributeModifiers.intelligence, [
        'dexterity',
        'intelligence',
      ]),
    },
    will: {
      value: clampDefenseValue(
        10 + willAttributeBonus + levelBonus + humanDefenseBonus + warlordAndBardDefenseBonus + clericWillBonus + wizardWillBonus + warlockWillBonus,
      ),
      levelBonus,
      classBonus:
        humanDefenseBonus + warlordAndBardDefenseBonus + clericWillBonus + wizardWillBonus + warlockWillBonus,
      attributeBonus: willAttributeBonus,
      attributeKeys: getMaxAttributeKeys(attributeModifiers.wisdom, attributeModifiers.charisma, [
        'wisdom',
        'charisma',
      ]),
    },
  }
}

function getMaxAttributeKeys(firstValue: number, secondValue: number, keys: [AttributeKey, AttributeKey]): AttributeKey[] {
  if (firstValue > secondValue) {
    return [keys[0]]
  }

  if (secondValue > firstValue) {
    return [keys[1]]
  }

  return keys
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
