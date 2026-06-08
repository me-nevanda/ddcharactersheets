import type { CharacterGroup, CharacterGroupData } from '../src/types/character'
import { createStoredGroupEntity, deleteStoredEntity, listStoredGroupEntities, readStoredGroupEntity, updateStoredGroupEntity } from './sqliteStore'

interface ApiError extends Error {
  code?: string
  statusCode?: number
}

const safeCharacterGroupIdPattern = /^[a-z0-9-]+$/i

const normalizeGroupName = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : ''
}

const normalizeCharacterIds = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return Array.from(new Set(value
    .filter((id): id is string => typeof id === 'string')
    .map((id) => id.trim())
    .filter(Boolean)))
}

const normalizeCharacterGroup = (data: Partial<Record<keyof CharacterGroupData, unknown>> = {}): CharacterGroupData => {
  return {
    name: normalizeGroupName(data.name),
    characterIds: normalizeCharacterIds(data.characterIds),
  }
}

const assertValidGroupName = (name: string): void => {
  if (!name) {
    const error = new Error('Invalid character group name') as ApiError
    error.statusCode = 400
    error.code = 'API_INVALID_CHARACTER_GROUP_NAME'
    throw error
  }
}

const characterGroupStoreOptions = {
  tableName: 'character_groups',
  normalize: normalizeCharacterGroup,
  validate: (group: CharacterGroupData): void => assertValidGroupName(group.name),
}

const characterGroupRelationOptions = {
  idsKey: 'characterIds',
  groupTableName: characterGroupStoreOptions.tableName,
  memberTableName: 'characters',
  relationTableName: 'character_group_members',
  memberColumnName: 'character_id',
} as const

const ensureCharacterGroupsStore = async (): Promise<void> => {}

export const isSafeCharacterGroupId = (groupId: string): boolean => {
  return safeCharacterGroupIdPattern.test(groupId)
}

export const listCharacterGroups = async (): Promise<CharacterGroup[]> => {
  await ensureCharacterGroupsStore()
  return listStoredGroupEntities<CharacterGroupData, CharacterGroup>(characterGroupStoreOptions, characterGroupRelationOptions)
}

export const readCharacterGroup = async (groupId: string): Promise<CharacterGroup> => {
  await ensureCharacterGroupsStore()
  return readStoredGroupEntity<CharacterGroupData, CharacterGroup>(groupId, characterGroupStoreOptions, characterGroupRelationOptions)
}

export const createCharacterGroup = async (data: unknown): Promise<CharacterGroup> => {
  await ensureCharacterGroupsStore()
  const source = typeof data === 'object' && data !== null ? (data as Partial<Record<keyof CharacterGroupData, unknown>>) : {}
  const group = normalizeCharacterGroup({
    name: source.name,
    characterIds: [],
  })

  assertValidGroupName(group.name)
  return createStoredGroupEntity<CharacterGroupData, CharacterGroup>(characterGroupStoreOptions, characterGroupRelationOptions, group)
}

export const updateCharacterGroup = async (groupId: string, data: unknown): Promise<CharacterGroup> => {
  await ensureCharacterGroupsStore()
  return updateStoredGroupEntity<CharacterGroupData, CharacterGroup>(groupId, data, characterGroupStoreOptions, characterGroupRelationOptions)
}

export const deleteCharacterGroup = async (groupId: string): Promise<void> => {
  await ensureCharacterGroupsStore()
  await deleteStoredEntity(characterGroupStoreOptions.tableName, groupId)
}
