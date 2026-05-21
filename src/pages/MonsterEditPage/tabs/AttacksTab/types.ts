import type { MonsterAttack, MonsterAttackAreaType, MonsterAttackType, MonsterDefenses, MonsterSuggestedStats } from '@appTypes/monster'

export interface SelectOption<TValue extends string | number> {
  value: TValue
  label: string
}

export interface VisibleMonsterAttackEntry {
  attack: MonsterAttack
  index: number
}

export interface AttacksTabProps {
  attacks: MonsterAttack[]
  suggested: MonsterSuggestedStats
  onAttackAdd: (type: MonsterAttackType) => void
  onAttackChange: (index: number, fieldName: keyof MonsterAttack, value: string | number | boolean) => void
  onAttackRemove: (index: number) => void
}

export interface AttackCardProps {
  attack: MonsterAttack
  attackBonusOptions: number[]
  areaOptions: SelectOption<MonsterAttackAreaType>[]
  defenseOptions: SelectOption<keyof MonsterDefenses>[]
  getAttackHeaderClass: (type: MonsterAttackType) => string
  index: number
  suggested: MonsterSuggestedStats
  onAttackChange: (index: number, fieldName: keyof MonsterAttack, value: string | number | boolean) => void
  onAttackRemove: (index: number) => void
  t: (key: string, variables?: Record<string, string | number>) => string
}
