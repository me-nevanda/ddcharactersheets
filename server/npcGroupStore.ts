import { randomUUID } from 'node:crypto'
import { mkdir, readFile, readdir, stat, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { NpcGroup, NpcGroupData } from '../src/types/npc'

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

const parseNpcGroup = (rawGroup: string): Partial<Record<keyof NpcGroupData, unknown>> => {
  return JSON.parse(rawGroup.replace(/^\uFEFF/, '') || '{}') as Partial<Record<keyof NpcGroupData, unknown>>
}

const ensureNpcGroupsDirectory = async (): Promise<void> => {
  await mkdir(npcGroupsDirectory, { recursive: true })
}

const getNpcGroupFilePath = (groupId: string): string => {
  if (!isSafeNpcGroupId(groupId)) {
    const error = new Error('Invalid npc group id') as ApiError
    error.statusCode = 400
    error.code = 'API_INVALID_NPC_GROUP_ID'
    throw error
  }

  return path.join(npcGroupsDirectory, `${groupId}.json`)
}

const assertValidGroupName = (name: string): void => {
  if (!name) {
    const error = new Error('Invalid npc group name') as ApiError
    error.statusCode = 400
    error.code = 'API_INVALID_NPC_GROUP_NAME'
    throw error
  }
}

export const isSafeNpcGroupId = (groupId: string): boolean => {
  return safeNpcGroupIdPattern.test(groupId)
}

export const listNpcGroups = async (): Promise<NpcGroup[]> => {
  await ensureNpcGroupsDirectory()
  const entries = await readdir(npcGroupsDirectory, { withFileTypes: true })
  const groupFiles = entries.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.json'))
  const groups = await Promise.all(
    groupFiles.map(async (entry) => {
      const groupId = path.basename(entry.name, '.json')
      const filePath = getNpcGroupFilePath(groupId)
      const [rawGroup, fileInfo] = await Promise.all([
        readFile(filePath, 'utf8'),
        stat(filePath),
      ])

      return {
        id: groupId,
        ...normalizeNpcGroup(parseNpcGroup(rawGroup)),
        updatedAt: fileInfo.mtime.toISOString(),
      }
    }),
  )

  return groups.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
}

export const readNpcGroup = async (groupId: string): Promise<NpcGroup> => {
  await ensureNpcGroupsDirectory()
  const filePath = getNpcGroupFilePath(groupId)
  const [rawGroup, fileInfo] = await Promise.all([
    readFile(filePath, 'utf8'),
    stat(filePath),
  ])

  return {
    id: groupId,
    ...normalizeNpcGroup(parseNpcGroup(rawGroup)),
    updatedAt: fileInfo.mtime.toISOString(),
  }
}

export const createNpcGroup = async (data: unknown): Promise<NpcGroup> => {
  await ensureNpcGroupsDirectory()
  const source = typeof data === 'object' && data !== null ? (data as Partial<Record<keyof NpcGroupData, unknown>>) : {}
  const group = normalizeNpcGroup({
    uniqueId: randomUUID(),
    name: source.name,
    npcFileNames: [],
  })

  assertValidGroupName(group.name)

  const groupId = `${Date.now()}-${randomUUID().slice(0, 8)}`
  const filePath = getNpcGroupFilePath(groupId)
  await writeFile(filePath, `${JSON.stringify(group, null, 2)}\n`, 'utf8')

  const fileInfo = await stat(filePath)

  return {
    id: groupId,
    ...group,
    updatedAt: fileInfo.mtime.toISOString(),
  }
}

export const updateNpcGroup = async (groupId: string, data: unknown): Promise<NpcGroup> => {
  await ensureNpcGroupsDirectory()
  const filePath = getNpcGroupFilePath(groupId)
  const rawGroup = await readFile(filePath, 'utf8')
  const existingGroup = parseNpcGroup(rawGroup)
  const nextGroup = normalizeNpcGroup({
    ...existingGroup,
    ...(typeof data === 'object' && data !== null ? (data as Partial<Record<keyof NpcGroupData, unknown>>) : {}),
  })

  assertValidGroupName(nextGroup.name)
  await writeFile(filePath, `${JSON.stringify(nextGroup, null, 2)}\n`, 'utf8')

  const fileInfo = await stat(filePath)

  return {
    id: groupId,
    ...nextGroup,
    updatedAt: fileInfo.mtime.toISOString(),
  }
}

export const deleteNpcGroup = async (groupId: string): Promise<void> => {
  await ensureNpcGroupsDirectory()
  await unlink(getNpcGroupFilePath(groupId))
}
