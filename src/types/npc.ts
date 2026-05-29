import type { CharacterItems } from './character'

export interface NpcDefenses {
  kp: number
  fortitude: number
  reflex: number
  will: number
}

export interface NpcSuggestedStats {
  attackVsKp: string
  attackVsOtherDefenses: string
  lowDamage: string
  mediumDamage: string
  highDamage: string
}

export type NpcType = 'minion' | 'normal' | 'solo' | 'elite'
export type NpcRole = 'skirmisher' | 'brute' | 'soldier' | 'lurker' | 'controller' | 'artillery'
export type NpcAttackAction = 'action' | 'noAction'
export type NpcAttackType = 'standard' | 'unlimited' | 'encounter' | 'daily'
export type NpcAttackAreaType =
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

export interface NpcAttack {
  id: string
  name: string
  action: NpcAttackAction
  type: NpcAttackType
  range: number
  area: NpcAttackAreaType
  attackBonusNumber: number
  attackDefense: keyof NpcDefenses
  attackNotApplicable: boolean
  description: string
}

export interface NpcData {
  uniqueId: string
  name: string
  role: NpcRole
  type: NpcType
  description: string
  resistances: string
  special: string
  attacks: NpcAttack[]
  items: CharacterItems
  defenses: NpcDefenses
  suggested: NpcSuggestedStats
  hp: number
  level: number
  speed: number
  isStory: boolean
  isDead: boolean
}

export interface Npc extends NpcData {
  id: string
  imageUrl: string
  updatedAt: string
}

export interface NpcGroupData {
  name: string
  npcIds: string[]
}

export interface NpcGroup extends NpcGroupData {
  id: string
  updatedAt: string
}
