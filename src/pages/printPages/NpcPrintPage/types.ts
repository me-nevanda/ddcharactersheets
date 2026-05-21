import type { Npc, NpcAttack, NpcAttackAreaType, NpcAttackType } from '@appTypes/npc'

export type PrintNpcAttackType = NpcAttackType

export interface NpcPrintDetailRow {
  label: string
  value: string
}

export interface NpcPrintAttackRow extends NpcAttack {
  key: string
  meta: string[]
  areaLabel: string
  attackDisplay: string
}

export interface NpcPrintPageState {
  npc: Npc | null
  loading: boolean
  error: string
  title: string
  npcName: string
  bloodiedValue: number
  statRows: NpcPrintDetailRow[]
  defenseRows: NpcPrintDetailRow[]
  attackRows: NpcPrintAttackRow[]
}

export interface NpcPrintAreaOption {
  value: NpcAttackAreaType
  label: string
}
