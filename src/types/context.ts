export interface ContextNpcGroupSnapshot {
  id: string
  name: string
  npcIds: string[]
}

export interface ContextMonsterGroupSnapshot {
  id: string
  name: string
  monsterIds: string[]
}

export interface ContextData {
  uniqueId: string
  name: string
  description: string
  characters: string[]
  npcGroups: ContextNpcGroupSnapshot[]
  monsterGroups: ContextMonsterGroupSnapshot[]
}

export interface Context extends ContextData {
  id: string
  updatedAt: string
}
