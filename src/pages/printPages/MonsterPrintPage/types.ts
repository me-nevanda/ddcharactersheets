import type { Monster, MonsterAttack, MonsterAttackAreaType, MonsterAttackType } from '@appTypes/monster'

export type PrintMonsterAttackType = MonsterAttackType

export type PrintMonsterItemCategory = 'weapon' | 'armor' | 'other'

export interface MonsterPrintDetailRow {
  label: string
  value: string
}

export interface MonsterPrintAttackRow extends MonsterAttack {
  key: string
  meta: string[]
  areaLabel: string
  attackDisplay: string
}

export interface MonsterPrintItemRow {
  key: string
  name: string
  description: string
  category: PrintMonsterItemCategory
}

export interface MonsterPrintPageState {
  monster: Monster | null
  loading: boolean
  error: string
  title: string
  monsterName: string
  bloodiedValue: number
  statRows: MonsterPrintDetailRow[]
  defenseRows: MonsterPrintDetailRow[]
  attackRows: MonsterPrintAttackRow[]
  weapons: MonsterPrintItemRow[]
  armors: MonsterPrintItemRow[]
  others: MonsterPrintItemRow[]
  hasItems: boolean
}

export interface MonsterPrintAreaOption {
  value: MonsterAttackAreaType
  label: string
}
