export interface ApiError extends Error {
  code?: string
  statusCode?: number
}

export interface EntityRow {
  id: string
  payload_json: string
  updated_at: string
}

export interface AreaRow {
  id: string
  name: string
  description: string
  updated_at: string
}

export interface EventRow {
  id: string
  name: string
  description: string
  updated_at: string
}

export interface MapRow {
  id: string
  name: string
  description: string
  grid_json: string
  updated_at: string
}

export interface ContextRow {
  id: string
  name: string
  description: string
  updated_at: string
}

export interface GroupRow {
  id: string
  name: string
  updated_at: string
}

export interface PlaceRow {
  id: string
  name: string
  description: string
}

export interface CharacterRow {
  id: string
  name: string
  short_description: string
  description: string
  level: number
  race: string
  class: string
  gender: string
  alignment: string
  hp: number
  surge: number
  speed: number
  bonus_level: number
  created_at: string
  updated_at: string
  [key: string]: unknown
}

export interface NpcRow {
  id: string
  name: string
  role: string
  type: string
  description: string
  resistances: string
  special: string
  hp: number
  level: number
  speed: number
  is_story: number
  is_dead: number
  updated_at: string
  [key: string]: unknown
}

export interface MonsterRow {
  id: string
  name: string
  role: string
  type: string
  description: string
  resistances: string
  special: string
  hp: number
  level: number
  speed: number
  updated_at: string
  [key: string]: unknown
}

export interface EntityExistsRow {
  id: string
}

export interface GroupMemberRow {
  member_id: string
}

export interface StoredCharacterHistoryEntry {
  id: string
  title: string
  content: string
}

export interface StoredNpcHistoryEntry {
  id: string
  title: string
  content: string
}

export interface StoredEntityOptions<TData> {
  tableName: string
  normalize: (data: Partial<Record<keyof TData, unknown>>) => TData
  validate?: (data: TData) => void
  imageUrl?: (id: string) => string
}

export interface StoredAreaOptions<TData> {
  normalize: (data: Partial<Record<keyof TData, unknown>>) => TData
  validate?: (data: TData) => void
  imageUrl?: (id: string) => string
}

export interface StoredEventOptions<TData> {
  normalize: (data: Partial<Record<keyof TData, unknown>>) => TData
  validate?: (data: TData) => void
  imageUrl?: (id: string) => string
}

export interface StoredMapOptions<TData> {
  tableName: string
  normalize: (data: Partial<Record<keyof TData, unknown>>) => TData
  validate?: (data: TData) => void
}

export interface StoredContextOptions<TData> {
  normalize: (data: Partial<Record<keyof TData, unknown>>) => TData
  validate?: (data: TData) => void
  imageUrl?: (id: string) => string
}

export interface StoredGroupOptions<TData> {
  tableName: string
  normalize: (data: Partial<Record<keyof TData, unknown>>) => TData
  validate?: (data: TData) => void
}

export interface StoredCharacterOptions<TData> {
  normalize: (data: Partial<Record<keyof TData, unknown>>) => TData
  validate?: (data: TData) => void
  imageUrl?: (id: string) => string
}

export interface StoredNpcOptions<TData> {
  normalize: (data: Partial<Record<keyof TData, unknown>>) => TData
  validate?: (data: TData) => void
  imageUrl?: (id: string) => string
}

export interface StoredMonsterOptions<TData> {
  normalize: (data: Partial<Record<keyof TData, unknown>>) => TData
  validate?: (data: TData) => void
  imageUrl?: (id: string) => string
}

export interface GroupMemberRelationOptions<TData> {
  idsKey: keyof TData & string
  groupTableName: string
  memberTableName: string
  relationTableName: string
  memberColumnName: string
}
