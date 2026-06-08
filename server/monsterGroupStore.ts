import type { MonsterGroup, MonsterGroupData } from '@appTypes/monster'
import { createStoredGroupEntity, deleteStoredEntity, listStoredGroupEntities, readStoredGroupEntity, updateStoredGroupEntity } from './sqliteStore'

interface ApiError extends Error {
  code?: string
  statusCode?: number
}

const safeMonsterGroupIdPattern = /^[a-z0-9-]+$/i

const normalizeGroupName = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : ''
}

const normalizeMonsterIds = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return Array.from(new Set(value
    .filter((id): id is string => typeof id === 'string')
    .map((id) => id.trim())
    .filter(Boolean)))
}

const normalizeMonsterGroup = (data: Partial<Record<keyof MonsterGroupData, unknown>> = {}): MonsterGroupData => {
  return {
    name: normalizeGroupName(data.name),
    monsterIds: normalizeMonsterIds(data.monsterIds),
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
  tableName: 'monster_groups',
  normalize: normalizeMonsterGroup,
  validate: (group: MonsterGroupData): void => assertValidGroupName(group.name),
}

const monsterGroupRelationOptions = {
  idsKey: 'monsterIds',
  groupTableName: monsterGroupStoreOptions.tableName,
  memberTableName: 'monsters',
  relationTableName: 'monster_group_members',
  memberColumnName: 'monster_id',
} as const

const ensureMonsterGroupsStore = async (): Promise<void> => {}

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
    name: source.name,
    monsterIds: [],
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
  await deleteStoredEntity(monsterGroupStoreOptions.tableName, groupId)
}
