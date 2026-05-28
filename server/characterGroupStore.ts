import { randomUUID } from 'node:crypto'
import path from 'node:path'
import type { CharacterGroup, CharacterGroupData } from '../src/types/character'
import { createStoredGroupEntity, deleteStoredEntity, listStoredGroupEntities, migrateJsonDirectoryToSqlite, migrateStoredGroupMembers, readStoredGroupEntity, updateStoredGroupEntity } from './sqliteStore'

interface ApiError extends Error {
  code?: string
  statusCode?: number
}

const characterGroupsDirectory = path.resolve(process.cwd(), 'data', 'character-groups')
const safeCharacterGroupIdPattern = /^[a-z0-9-]+$/i

const normalizeUniqueId = (value: unknown): string => {
  return typeof value === 'string' && value.trim().length > 0 ? value : randomUUID()
}

const normalizeGroupName = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : ''
}

const normalizeCharacterFileNames = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return Array.from(new Set(value.filter((fileName): fileName is string => typeof fileName === 'string' && fileName.toLowerCase().endsWith('.json'))))
}

const normalizeCharacterGroup = (data: Partial<Record<keyof CharacterGroupData, unknown>> = {}): CharacterGroupData => {
  return {
    uniqueId: normalizeUniqueId(data.uniqueId),
    name: normalizeGroupName(data.name),
    characterFileNames: normalizeCharacterFileNames(data.characterFileNames),
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
  entityType: 'character-group',
  normalize: normalizeCharacterGroup,
  validate: (group: CharacterGroupData): void => assertValidGroupName(group.name),
}

const characterGroupRelationOptions = {
  fileNamesKey: 'characterFileNames',
  groupEntityType: characterGroupStoreOptions.entityType,
  memberEntityType: 'character',
} as const

const ensureCharacterGroupsStore = async (): Promise<void> => {
  await migrateJsonDirectoryToSqlite({
    directory: characterGroupsDirectory,
    entityType: characterGroupStoreOptions.entityType,
    isSafeId: isSafeCharacterGroupId,
  })
  await migrateStoredGroupMembers<CharacterGroupData>(characterGroupRelationOptions)
}

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
    uniqueId: randomUUID(),
    name: source.name,
    characterFileNames: [],
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
  await deleteStoredEntity(characterGroupStoreOptions.entityType, groupId)
}
