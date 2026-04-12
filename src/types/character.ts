export enum CharacterRace {
  Human = 'human',
  Tiefling = 'tiefling',
  Dragonborn = 'dragonborn',
  Eladrin = 'eladrin',
  Elf = 'elf',
  Dwarf = 'dwarf',
  Halfling = 'halfling',
  HalfElf = 'halfElf',
}

export enum CharacterClass {
  Warlock = 'warlock',
  Wizard = 'wizard',
  Warlord = 'warlord',
  Bard = 'bard',
  Cleric = 'cleric',
  Rogue = 'rogue',
  Ranger = 'ranger',
  Paladin = 'paladin',
  Fighter = 'fighter',
  Barbarian = 'barbarian',
}

export interface CharacterAttributes {
  strength: number
  constitution: number
  dexterity: number
  intelligence: number
  wisdom: number
  charisma: number
}

export interface CharacterAttributeBonuses {
  strength: number
  constitution: number
  dexterity: number
  intelligence: number
  wisdom: number
  charisma: number
}

export interface CharacterBonuses {
  level: number
  attributes: CharacterAttributeBonuses
  skills: CharacterSkillBonuses
  defenses: CharacterDefenseBonuses
}

export interface CharacterDefenseBonuses {
  kp: number
  fortitude: number
  reflex: number
  will: number
}

export interface CharacterSkillBonuses {
  acrobatics: number
  arcana: number
  athletics: number
  diplomacy: number
  history: number
  healing: number
  deception: number
  perception: number
  endurance: number
  dungeoneering: number
  nature: number
  religion: number
  insight: number
  stealth: number
  streetwise: number
  intimidation: number
  thievery: number
}

export interface CharacterDefenses {
  kp: number
  fortitude: number
  reflex: number
  will: number
}

export interface CharacterTraining {
  acrobatics: boolean
  arcana: boolean
  athletics: boolean
  diplomacy: boolean
  history: boolean
  healing: boolean
  deception: boolean
  perception: boolean
  endurance: boolean
  dungeoneering: boolean
  nature: boolean
  religion: boolean
  insight: boolean
  stealth: boolean
  streetwise: boolean
  intimidation: boolean
  thievery: boolean
}

export interface CharacterData {
  name: string
  level: number
  race: CharacterRace
  class: CharacterClass
  hp: number
  surge: number
  attributes: CharacterAttributes
  attributesPlus: CharacterAttributeBonuses
  bonuses?: CharacterBonuses
  defenses: CharacterDefenses
  training: CharacterTraining
  speed: number
}

export interface Character extends CharacterData {
  id: string
  updatedAt: string
}
