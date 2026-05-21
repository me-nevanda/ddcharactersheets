import type { CharacterItems } from './character'

export interface MonsterDefenses {
  kp: number
  fortitude: number
  reflex: number
  will: number
}

export interface MonsterSuggestedStats {
  attackVsKp: string
  attackVsOtherDefenses: string
  lowDamage: string
  mediumDamage: string
  highDamage: string
}

export type MonsterType = 'minion' | 'normal' | 'solo' | 'elite'
export type MonsterRole = 'skirmisher' | 'brute' | 'soldier' | 'lurker' | 'controller' | 'artillery'
export type MonsterAttackAction = 'action' | 'noAction'
export type MonsterAttackType = 'standard' | 'unlimited' | 'encounter' | 'daily'
export type MonsterAttackAreaType =
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

export interface MonsterAttack {
  id: string
  name: string
  action: MonsterAttackAction
  type: MonsterAttackType
  range: number
  area: MonsterAttackAreaType
  attackBonusNumber: number
  attackDefense: keyof MonsterDefenses
  description: string
}

export interface MonsterData {
  uniqueId: string
  name: string
  role: MonsterRole
  type: MonsterType
  description: string
  resistances: string
  special: string
  attacks: MonsterAttack[]
  items: CharacterItems
  defenses: MonsterDefenses
  suggested: MonsterSuggestedStats
  hp: number
  level: number
  speed: number
}

export interface Monster extends MonsterData {
  id: string
  imageUrl: string
  updatedAt: string
}

export interface MonsterGroupData {
  uniqueId: string
  name: string
  monsterFileNames: string[]
}

export interface MonsterGroup extends MonsterGroupData {
  id: string
  updatedAt: string
}
