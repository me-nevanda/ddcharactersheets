import { randomUUID } from 'node:crypto'
import path from 'node:path'
import type { MonsterGroup, MonsterGroupData } from '../src/types/monster'
import { createStoredGroupEntity, deleteStoredEntity, listStoredGroupEntities, migrateJsonDirectoryToSqlite, migrateStoredGroupMembers, readStoredGroupEntity, updateStoredGroupEntity } from './sqliteStore'

interface ApiError extends Error {
  code?: string
  statusCode?: number
}

const monsterGroupsDirectory = path.resolve(process.cwd(), 'data', 'monster-groups')
const safeMonsterGroupIdPattern = /^[a-z0-9-]+$/i

const normalizeUniqueId = (value: unknown): string => {
  return typeof value === 'string' && value.trim().length > 0 ? value : randomUUID()
}

const normalizeGroupName = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : ''
}

const normalizeMonsterFileNames = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return Array.from(new Set(value.filter((fileName): fileName is string => typeof fileName === 'string' && fileName.toLowerCase().endsWith('.json'))))
}

const normalizeMonsterGroup = (data: Partial<Record<keyof MonsterGroupData, unknown>> = {}): MonsterGroupData => {
  return {
    uniqueId: normalizeUniqueId(data.uniqueId),
    name: normalizeGroupName(data.name),
    monsterFileNames: normalizeMonsterFileNames(data.monsterFileNames),
  }
}

const assertValidGroupName = (name: string): void => {
  if (!name) {
    const error = new Error('Invalid monster group name') as ApiError
    error.statusCode = 400
    error.code = 'API_INVALID_MONSTER_GROUP_NAME'
    throw error
  }
}

const monsterGroupStoreOptions = {
  entityType: 'monster-group',
  normalize: normalizeMonsterGroup,
  validate: (group: MonsterGroupData): void => assertValidGroupName(group.name),
}

const monsterGroupRelationOptions = {
  fileNamesKey: 'monsterFileNames',
  groupEntityType: monsterGroupStoreOptions.entityType,
  memberEntityType: 'monster',
} as const

const ensureMonsterGroupsStore = async (): Promise<void> => {
  await migrateJsonDirectoryToSqlite({
    directory: monsterGroupsDirectory,
    entityType: monsterGroupStoreOptions.entityType,
    isSafeId: isSafeMonsterGroupId,
  })
  await migrateStoredGroupMembers<MonsterGroupData>(monsterGroupRelationOptions)
}

export const isSafeMonsterGroupId = (groupId: string): boolean => {
  return safeMonsterGroupIdPattern.test(groupId)
}

export const listMonsterGroups = async (): Promise<MonsterGroup[]> => {
  await ensureMonsterGroupsStore()
  return listStoredGroupEntities<MonsterGroupData, MonsterGroup>(monsterGroupStoreOptions, monsterGroupRelationOptions)
}

export const readMonsterGroup = async (groupId: string): Promise<MonsterGroup> => {
  await ensureMonsterGroupsStore()
  return readStoredGroupEntity<MonsterGroupData, MonsterGroup>(groupId, monsterGroupStoreOptions, monsterGroupRelationOptions)
}

export const createMonsterGroup = async (data: unknown): Promise<MonsterGroup> => {
  await ensureMonsterGroupsStore()
  const source = typeof data === 'object' && data !== null ? (data as Partial<Record<keyof MonsterGroupData, unknown>>) : {}
  const group = normalizeMonsterGroup({
    uniqueId: randomUUID(),
    name: source.name,
    monsterFileNames: [],
  })

  assertValidGroupName(group.name)
  return createStoredGroupEntity<MonsterGroupData, MonsterGroup>(monsterGroupStoreOptions, monsterGroupRelationOptions, group)
}

export const updateMonsterGroup = async (groupId: string, data: unknown): Promise<MonsterGroup> => {
  await ensureMonsterGroupsStore()
  return updateStoredGroupEntity<MonsterGroupData, MonsterGroup>(groupId, data, monsterGroupStoreOptions, monsterGroupRelationOptions)
}

export const deleteMonsterGroup = async (groupId: string): Promise<void> => {
  await ensureMonsterGroupsStore()
  await deleteStoredEntity(monsterGroupStoreOptions.entityType, groupId)
}
