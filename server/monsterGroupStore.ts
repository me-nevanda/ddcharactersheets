import { randomUUID } from 'node:crypto'
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { MonsterGroup, MonsterGroupData } from '../src/types/monster'

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

const parseMonsterGroup = (rawGroup: string): Partial<Record<keyof MonsterGroupData, unknown>> => {
  return JSON.parse(rawGroup.replace(/^\uFEFF/, '') || '{}') as Partial<Record<keyof MonsterGroupData, unknown>>
}

const ensureMonsterGroupsDirectory = async (): Promise<void> => {
  await mkdir(monsterGroupsDirectory, { recursive: true })
}

const getMonsterGroupFilePath = (groupId: string): string => {
  if (!isSafeMonsterGroupId(groupId)) {
    const error = new Error('Invalid monster group id') as ApiError
    error.statusCode = 400
    error.code = 'API_INVALID_MONSTER_GROUP_ID'
    throw error
  }

  return path.join(monsterGroupsDirectory, `${groupId}.json`)
}

const assertValidGroupName = (name: string): void => {
  if (!name) {
    const error = new Error('Invalid monster group name') as ApiError
    error.statusCode = 400
    error.code = 'API_INVALID_MONSTER_GROUP_NAME'
    throw error
  }
}

export const isSafeMonsterGroupId = (groupId: string): boolean => {
  return safeMonsterGroupIdPattern.test(groupId)
}

export const listMonsterGroups = async (): Promise<MonsterGroup[]> => {
  await ensureMonsterGroupsDirectory()
  const entries = await readdir(monsterGroupsDirectory, { withFileTypes: true })
  const groupFiles = entries.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.json'))
  const groups = await Promise.all(
    groupFiles.map(async (entry) => {
      const groupId = path.basename(entry.name, '.json')
      const filePath = getMonsterGroupFilePath(groupId)
      const [rawGroup, fileInfo] = await Promise.all([
        readFile(filePath, 'utf8'),
        stat(filePath),
      ])

      return {
        id: groupId,
        ...normalizeMonsterGroup(parseMonsterGroup(rawGroup)),
        updatedAt: fileInfo.mtime.toISOString(),
      }
    }),
  )

  return groups.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
}

export const readMonsterGroup = async (groupId: string): Promise<MonsterGroup> => {
  await ensureMonsterGroupsDirectory()
  const filePath = getMonsterGroupFilePath(groupId)
  const [rawGroup, fileInfo] = await Promise.all([
    readFile(filePath, 'utf8'),
    stat(filePath),
  ])

  return {
    id: groupId,
    ...normalizeMonsterGroup(parseMonsterGroup(rawGroup)),
    updatedAt: fileInfo.mtime.toISOString(),
  }
}

export const createMonsterGroup = async (data: unknown): Promise<MonsterGroup> => {
  await ensureMonsterGroupsDirectory()
  const source = typeof data === 'object' && data !== null ? (data as Partial<Record<keyof MonsterGroupData, unknown>>) : {}
  const group = normalizeMonsterGroup({
    uniqueId: randomUUID(),
    name: source.name,
    monsterFileNames: [],
  })

  assertValidGroupName(group.name)

  const groupId = `${Date.now()}-${randomUUID().slice(0, 8)}`
  const filePath = getMonsterGroupFilePath(groupId)
  await writeFile(filePath, `${JSON.stringify(group, null, 2)}\n`, 'utf8')

  const fileInfo = await stat(filePath)

  return {
    id: groupId,
    ...group,
    updatedAt: fileInfo.mtime.toISOString(),
  }
}

export const updateMonsterGroup = async (groupId: string, data: unknown): Promise<MonsterGroup> => {
  await ensureMonsterGroupsDirectory()
  const filePath = getMonsterGroupFilePath(groupId)
  const rawGroup = await readFile(filePath, 'utf8')
  const existingGroup = parseMonsterGroup(rawGroup)
  const nextGroup = normalizeMonsterGroup({
    ...existingGroup,
    ...(typeof data === 'object' && data !== null ? (data as Partial<Record<keyof MonsterGroupData, unknown>>) : {}),
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
