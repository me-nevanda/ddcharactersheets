import { skillDefinitions } from '@dictionaries/characterEditDefinitions'
import {
  CharacterRace,
  type CharacterAttributeBonuses,
  type CharacterSkillBonuses,
  type CharacterTraining,
} from '../../types/character'
import { formatModifier, getLevelBonus } from './generalSectionLogic'

export function buildSkillBonuses(
  level: number,
  attributeBonuses: CharacterAttributeBonuses,
  training: CharacterTraining,
  race: CharacterRace,
): CharacterSkillBonuses {
  const levelBonus = getLevelBonus(level)
  const dwarfSkillBonus = race === CharacterRace.Dwarf ? 2 : 0
  const halflingSkillBonus = race === CharacterRace.Halfling ? 2 : 0
  const halfElfSkillBonus = race === CharacterRace.HalfElf ? 2 : 0

  const racialSkillBonuses: Partial<Record<keyof CharacterSkillBonuses, number>> = {
    acrobatics: halflingSkillBonus,
    arcana: race === CharacterRace.Eladrin ? 2 : 0,
    athletics: 0,
    diplomacy: halfElfSkillBonus,
    history: race === CharacterRace.Eladrin || race === CharacterRace.Dragonborn ? 2 : 0,
    healing: 0,
    deception: race === CharacterRace.Tiefling ? 2 : 0,
    perception: race === CharacterRace.Elf ? 2 : 0,
    endurance: dwarfSkillBonus,
    dungeoneering: dwarfSkillBonus,
    nature: race === CharacterRace.Elf ? 2 : 0,
    religion: 0,
    insight: 0,
    stealth: race === CharacterRace.Tiefling ? 2 : 0,
    streetwise: halfElfSkillBonus,
    intimidation: race === CharacterRace.Dragonborn ? 2 : 0,
    thievery: halflingSkillBonus,
  }

  return skillDefinitions.reduce((acc, definition) => {
    const racialBonus = racialSkillBonuses[definition.key] ?? 0

    acc[definition.key] =
      attributeBonuses[definition.attributeKey] +
      levelBonus +
      racialBonus +
      (training[definition.key] ? 5 : 0)
    return acc
  }, {} as CharacterSkillBonuses)
}

export function buildSkillModifiers(skillBonuses: CharacterSkillBonuses): Record<keyof CharacterTraining, string> {
  return skillDefinitions.reduce<Record<keyof CharacterTraining, string>>((acc, skill) => {
    acc[skill.key] = formatModifier(skillBonuses[skill.key])
    return acc
  }, {} as Record<keyof CharacterTraining, string>)
}
