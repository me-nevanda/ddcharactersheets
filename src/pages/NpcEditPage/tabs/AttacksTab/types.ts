import type { NpcAttack, NpcAttackAreaType, NpcAttackType, NpcDefenses, NpcSuggestedStats } from '@appTypes/npc'

export interface SelectOption<TValue extends string | number> {
  value: TValue
  label: string
}

export interface VisibleNpcAttackEntry {
  attack: NpcAttack
  index: number
}

export interface AttacksTabProps {
  attacks: NpcAttack[]
  suggested: NpcSuggestedStats
  onAttackAdd: (type: NpcAttackType) => void
  onAttackChange: (index: number, fieldName: keyof NpcAttack, value: string | number) => void
  onAttackRemove: (index: number) => void
}

export interface AttackCardProps {
  attack: NpcAttack
  attackBonusOptions: number[]
  areaOptions: SelectOption<NpcAttackAreaType>[]
  defenseOptions: SelectOption<keyof NpcDefenses>[]
  getAttackHeaderClass: (type: NpcAttackType) => string
  index: number
  suggested: NpcSuggestedStats
  onAttackChange: (index: number, fieldName: keyof NpcAttack, value: string | number) => void
  onAttackRemove: (index: number) => void
  t: (key: string, variables?: Record<string, string | number>) => string
}
