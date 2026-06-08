import type { NpcGroup, NpcGroupData } from '@appTypes/npc'
import { createStoredGroupEntity, deleteStoredEntity, listStoredGroupEntities, readStoredGroupEntity, updateStoredGroupEntity } from './sqliteStore'

interface ApiError extends Error {
  code?: string
  statusCode?: number
}

const safeNpcGroupIdPattern = /^[a-z0-9-]+$/i

const normalizeGroupName = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : ''
}

const normalizeNpcIds = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return Array.from(new Set(value
    .filter((id): id is string => typeof id === 'string')
    .map((id) => id.trim())
    .filter(Boolean)))
}

const normalizeNpcGroup = (data: Partial<Record<keyof NpcGroupData, unknown>> = {}): NpcGroupData => {
  return {
    name: normalizeGroupName(data.name),
    npcIds: normalizeNpcIds(data.npcIds),
  }
}

const assertValidGroupName = (name: string): void => {
  if (!name) {
    const error = new Error('Invalid npc group name') as ApiError
    error.statusCode = 400
    error.code = 'API_INVALID_NPC_GROUP_NAME'
    throw error
  }
}

const npcGroupStoreOptions = {
  tableName: 'npc_groups',
  normalize: normalizeNpcGroup,
  validate: (group: NpcGroupData): void => assertValidGroupName(group.name),
}

const npcGroupRelationOptions = {
  idsKey: 'npcIds',
  groupTableName: npcGroupStoreOptions.tableName,
  memberTableName: 'npcs',
  relationTableName: 'npc_group_members',
  memberColumnName: 'npc_id',
} as const

const ensureNpcGroupsStore = async (): Promise<void> => {}

export const isSafeNpcGroupId = (groupId: string): boolean => {
  return safeNpcGroupIdPattern.test(groupId)
}

export const listNpcGroups = async (): Promise<NpcGroup[]> => {
  await ensureNpcGroupsStore()
  return listStoredGroupEntities<NpcGroupData, NpcGroup>(npcGroupStoreOptions, npcGroupRelationOptions)
}

export const readNpcGroup = async (groupId: string): Promise<NpcGroup> => {
  await ensureNpcGroupsStore()
  return readStoredGroupEntity<NpcGroupData, NpcGroup>(groupId, npcGroupStoreOptions, npcGroupRelationOptions)
}

export const createNpcGroup = async (data: unknown): Promise<NpcGroup> => {
  await ensureNpcGroupsStore()
  const source = typeof data === 'object' && data !== null ? (data as Partial<Record<keyof NpcGroupData, unknown>>) : {}
  const group = normalizeNpcGroup({
    name: source.name,
    npcIds: [],
  })

  assertValidGroupName(group.name)
  return createStoredGroupEntity<NpcGroupData, NpcGroup>(npcGroupStoreOptions, npcGroupRelationOptions, group)
}

export const updateNpcGroup = async (groupId: string, data: unknown): Promise<NpcGroup> => {
  await ensureNpcGroupsStore()
  return updateStoredGroupEntity<NpcGroupData, NpcGroup>(groupId, data, npcGroupStoreOptions, npcGroupRelationOptions)
}

export const deleteNpcGroup = async (groupId: string): Promise<void> => {
  await ensureNpcGroupsStore()
  await deleteStoredEntity(npcGroupStoreOptions.tableName, groupId)
}
