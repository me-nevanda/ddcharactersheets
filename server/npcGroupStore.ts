import { randomUUID } from 'node:crypto'
import path from 'node:path'
import type { NpcGroup, NpcGroupData } from '../src/types/npc'
import { createStoredGroupEntity, deleteStoredEntity, listStoredGroupEntities, migrateJsonDirectoryToSqlite, migrateStoredGroupMembers, readStoredGroupEntity, updateStoredGroupEntity } from './sqliteStore'

interface ApiError extends Error {
  code?: string
  statusCode?: number
}

const npcGroupsDirectory = path.resolve(process.cwd(), 'data', 'npc-groups')
const safeNpcGroupIdPattern = /^[a-z0-9-]+$/i

const normalizeUniqueId = (value: unknown): string => {
  return typeof value === 'string' && value.trim().length > 0 ? value : randomUUID()
}

const normalizeGroupName = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : ''
}

const normalizeNpcFileNames = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return Array.from(new Set(value.filter((fileName): fileName is string => typeof fileName === 'string' && fileName.toLowerCase().endsWith('.json'))))
}

const normalizeNpcGroup = (data: Partial<Record<keyof NpcGroupData, unknown>> = {}): NpcGroupData => {
  return {
    uniqueId: normalizeUniqueId(data.uniqueId),
    name: normalizeGroupName(data.name),
    npcFileNames: normalizeNpcFileNames(data.npcFileNames),
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
  entityType: 'npc-group',
  normalize: normalizeNpcGroup,
  validate: (group: NpcGroupData): void => assertValidGroupName(group.name),
}

const npcGroupRelationOptions = {
  fileNamesKey: 'npcFileNames',
  groupEntityType: npcGroupStoreOptions.entityType,
  memberEntityType: 'npc',
} as const

const ensureNpcGroupsStore = async (): Promise<void> => {
  await migrateJsonDirectoryToSqlite({
    directory: npcGroupsDirectory,
    entityType: npcGroupStoreOptions.entityType,
    isSafeId: isSafeNpcGroupId,
  })
  await migrateStoredGroupMembers<NpcGroupData>(npcGroupRelationOptions)
}

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
    uniqueId: randomUUID(),
    name: source.name,
    npcFileNames: [],
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
  await deleteStoredEntity(npcGroupStoreOptions.entityType, groupId)
}
