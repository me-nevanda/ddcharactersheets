import { CharacterClass, CharacterRace } from '../../types/character'
import { buildCharacterSpeed } from './sections/GeneralSection/generalSectionLogic'
import type {
  CharacterArmor,
  CharacterAbility,
  CharacterAbilityAction,
  CharacterAbilityAreaType,
  CharacterAbilityKind,
  CharacterAbilityType,
  CharacterAttributeBonuses,
  CharacterBonuses,
  CharacterDefenses,
  CharacterWeapon,
  CharacterItems,
  CharacterOtherItem,
  CharacterSkillBonuses,
  CharacterTraining,
  CharacterWeaponDamageType,
} from '../../types/character'
import type { CharacterEditFormData } from './types'

export const zeroAttributeBonuses: CharacterAttributeBonuses = {
  strength: 0,
  condition: 0,
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

export const emptyAbilities: CharacterAbility[] = []
export const emptyItems: CharacterItems = {
  armors: [],
  weapons: [],
  others: [],
}

export const emptyArmor: CharacterArmor = {
  name: '',
  description: '',
  equipped: false,
  strengthBonusNumber: 0,
  conditionBonusNumber: 0,
  dexterityBonusNumber: 0,
  intelligenceBonusNumber: 0,
  wisdomBonusNumber: 0,
  charismaBonusNumber: 0,
  speedBonusNumber: 0,
  kpBonusNumber: 0,
  fortitudeBonusNumber: 0,
  reflexBonusNumber: 0,
  willBonusNumber: 0,
}

export const emptyOtherItem: CharacterOtherItem = {
  name: '',
  description: '',
  equipped: false,
  strengthBonusNumber: 0,
  conditionBonusNumber: 0,
  dexterityBonusNumber: 0,
  intelligenceBonusNumber: 0,
  wisdomBonusNumber: 0,
  charismaBonusNumber: 0,
  speedBonusNumber: 0,
  kpBonusNumber: 0,
  fortitudeBonusNumber: 0,
  reflexBonusNumber: 0,
  willBonusNumber: 0,
}

export const emptyWeapon: CharacterWeapon = {
  name: '',
  description: '',
  damageDiceCount: 1,
  damageDiceType: 'd4',
  damageBonusNumber: 0,
  range: 1,
  equipped: false,
  weaponProficiencyBonusNumber: 0,
  strengthBonusNumber: 0,
  conditionBonusNumber: 0,
  dexterityBonusNumber: 0,
  intelligenceBonusNumber: 0,
  wisdomBonusNumber: 0,
  charismaBonusNumber: 0,
  speedBonusNumber: 0,
  kpBonusNumber: 0,
  fortitudeBonusNumber: 0,
  reflexBonusNumber: 0,
  willBonusNumber: 0,
}

export const defaultAbilityAction: CharacterAbilityAction = 'action'
export const defaultAbilityType: CharacterAbilityType = 'unlimited'
export const defaultAbilityKind: CharacterAbilityKind = 'offensive'
export const defaultAbilityWeaponDamageDiceType = ''
export const defaultAbilityWeaponDamageDiceCount = 0
export const defaultAbilityWeaponDamageType: CharacterWeaponDamageType = 'normal'
export const defaultAbilityWeaponRecurringDamageCount = 0
export const defaultAbilityWeaponRecurringDamageType: CharacterWeaponDamageType = 'normal'
export const defaultAbilityWeaponAttackAttribute = ''
export const defaultAbilityWeaponAttackDefense = ''
export const defaultAbilityWeaponHit = ''
export const defaultAbilityWeaponMiss = ''
export const defaultAbilityWeaponProvocation = ''
export const defaultAbilityWeaponRange = 0
export const defaultAbilityWeaponArea: CharacterAbilityAreaType = 'point'

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
  hp: 0,
  surge: 0,
  speed: buildCharacterSpeed(CharacterRace.Human),
  attributes: {
    strength: 10,
    condition: 10,
    dexterity: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  },
  attributesPlus: zeroAttributeBonuses,
  abilities: emptyAbilities,
  items: emptyItems,
  defenses: zeroDefenses,
  bonuses: zeroBonuses,
  training: emptyTraining,
}
