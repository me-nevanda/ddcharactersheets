import { CharacterClass, CharacterRace } from '../../types/character'
import type {
  CharacterAttributeBonuses,
  CharacterBonuses,
  CharacterDefenses,
  CharacterSkillBonuses,
  CharacterTraining,
} from '../../types/character'
import type { CharacterEditFormData } from './types'

export const zeroAttributeBonuses: CharacterAttributeBonuses = {
  strength: 0,
  constitution: 0,
  dexterity: 0,
  intelligence: 0,
  wisdom: 0,
  charisma: 0,
}

export const zeroSkillBonuses: CharacterSkillBonuses = {
  acrobatics: 0,
  arcana: 0,
  athletics: 0,
  diplomacy: 0,
  history: 0,
  healing: 0,
  deception: 0,
  perception: 0,
  endurance: 0,
  dungeoneering: 0,
  nature: 0,
  religion: 0,
  insight: 0,
  stealth: 0,
  streetwise: 0,
  intimidation: 0,
  thievery: 0,
}

export const zeroDefenseBonuses: CharacterDefenses = {
  kp: 0,
  fortitude: 0,
  reflex: 0,
  will: 0,
}

export const zeroDefenses: CharacterDefenses = {
  kp: 0,
  fortitude: 0,
  reflex: 0,
  will: 0,
}

export const zeroBonuses: CharacterBonuses = {
  level: 0,
  attributes: zeroAttributeBonuses,
  skills: zeroSkillBonuses,
  defenses: {
    kp: 0,
    fortitude: 0,
    reflex: 0,
    will: 0,
  },
}

export const emptyTraining: CharacterTraining = {
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
}

export const emptyForm: CharacterEditFormData = {
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
  attributesPlus: zeroAttributeBonuses,
  defenses: zeroDefenses,
  bonuses: zeroBonuses,
  training: emptyTraining,
}
