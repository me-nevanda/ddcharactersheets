export interface ContextCharacterGroupSnapshot {
  id: string
  name: string
  characterIds: string[]
}

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

export interface ContextAreaSnapshot {
  id: string
  name: string
  placeIds: string[]
}

export interface ContextData {
  name: string
  description: string
  characters: string[]
  characterGroups: ContextCharacterGroupSnapshot[]
  events: string[]
  npcGroups: ContextNpcGroupSnapshot[]
  monsterGroups: ContextMonsterGroupSnapshot[]
  areas: ContextAreaSnapshot[]
}

export interface Context extends ContextData {
  id: string
  imageUrl: string
  updatedAt: string
}
