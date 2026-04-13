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
  condition: number
  dexterity: number
  intelligence: number
  wisdom: number
  charisma: number
}

export interface CharacterAttributeBonuses {
  strength: number
  condition: number
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

export interface CharacterAbility {
  id: string
  name: string
  description: string
  action: CharacterAbilityAction
  type: CharacterAbilityType
  kind: CharacterAbilityKind
  weaponCount: number
  weaponName: string
  weaponDamageDiceType: CharacterWeaponDamageDiceType | ''
  weaponDamageDiceCount: number
  weaponAttributeBonus: string
  weaponAttackAttribute: keyof CharacterAttributes | ''
  weaponAttackDefense: keyof CharacterDefenses | ''
  weaponDamageType: CharacterWeaponDamageType
  weaponRecurringDamageCount: number
  weaponRecurringDamageType: CharacterWeaponDamageType
  weaponHit: string
  weaponMiss: string
  weaponProvocation: string
  weaponRange: number
  weaponArea: CharacterAbilityAreaType
}

export interface CharacterItemBase {
  name: string
  description: string
}

export interface CharacterArmor extends CharacterItemBase {
  equipped: boolean
  strengthBonusNumber: number
  conditionBonusNumber: number
  dexterityBonusNumber: number
  intelligenceBonusNumber: number
  wisdomBonusNumber: number
  charismaBonusNumber: number
  speedBonusNumber: number
  kpBonusNumber: number
  fortitudeBonusNumber: number
  reflexBonusNumber: number
  willBonusNumber: number
}

export interface CharacterWeapon extends CharacterItemBase {
  damageDiceCount: number
  damageDiceType: CharacterWeaponDamageDiceType
  damageBonusNumber: number
  range: number
  equipped: boolean
  weaponProficiencyBonusNumber: number
  strengthBonusNumber: number
  conditionBonusNumber: number
  dexterityBonusNumber: number
  intelligenceBonusNumber: number
  wisdomBonusNumber: number
  charismaBonusNumber: number
  speedBonusNumber: number
  kpBonusNumber: number
  fortitudeBonusNumber: number
  reflexBonusNumber: number
  willBonusNumber: number
}

export interface CharacterOtherItem extends CharacterItemBase {
  equipped: boolean
  strengthBonusNumber: number
  conditionBonusNumber: number
  dexterityBonusNumber: number
  intelligenceBonusNumber: number
  wisdomBonusNumber: number
  charismaBonusNumber: number
  speedBonusNumber: number
  kpBonusNumber: number
  fortitudeBonusNumber: number
  reflexBonusNumber: number
  willBonusNumber: number
}

export interface CharacterItems {
  armors: CharacterArmor[]
  weapons: CharacterWeapon[]
  others: CharacterOtherItem[]
}

export type CharacterItem = CharacterArmor | CharacterWeapon | CharacterOtherItem

export type CharacterWeaponDamageDiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20'
export type CharacterItemBonusFieldName =
  | 'strengthBonusNumber'
  | 'conditionBonusNumber'
  | 'dexterityBonusNumber'
  | 'intelligenceBonusNumber'
  | 'wisdomBonusNumber'
  | 'charismaBonusNumber'
  | 'speedBonusNumber'
  | 'kpBonusNumber'
  | 'fortitudeBonusNumber'
  | 'reflexBonusNumber'
  | 'willBonusNumber'

export type CharacterWeaponBonusFieldName = CharacterItemBonusFieldName

export type CharacterWeaponFieldName =
  | 'damageDiceCount'
  | 'damageDiceType'
  | 'damageBonusNumber'
  | 'range'
  | 'equipped'
  | 'weaponProficiencyBonusNumber'
  | CharacterWeaponBonusFieldName
export type CharacterWeaponDamageType =
  | 'normal'
  | 'acid'
  | 'cold'
  | 'fire'
  | 'force'
  | 'lightning'
  | 'necrotic'
  | 'poison'
  | 'psychic'
  | 'radiant'
  | 'thunder'

export type CharacterAbilityAction = 'action' | 'noAction'
export type CharacterAbilityType = 'unlimited' | 'encounter' | 'daily'
export type CharacterAbilityKind = 'offensive' | 'utility'
export type CharacterAbilityAreaType =
  | 'point'
  | 'burst1'
  | 'burst2'
  | 'burst3'
  | 'burst4'
  | 'burst5'
  | 'burst6'
  | 'burst7'
  | 'burst8'
  | 'burst9'
  | 'burst10'
  | 'blast1'
  | 'blast2'
  | 'blast3'
  | 'blast4'
  | 'blast5'
  | 'blast6'
  | 'blast7'
  | 'blast8'
  | 'blast9'
  | 'blast10'

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
  abilities: CharacterAbility[]
  items: CharacterItems
  bonuses?: CharacterBonuses
  defenses: CharacterDefenses
  training: CharacterTraining
  speed: number
}

export interface Character extends CharacterData {
  id: string
  updatedAt: string
}
