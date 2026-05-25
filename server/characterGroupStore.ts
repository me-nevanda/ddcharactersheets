import { randomUUID } from 'node:crypto'
import { mkdir, readFile, readdir, stat, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { CharacterGroup, CharacterGroupData } from '../src/types/character'

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

const parseCharacterGroup = (rawGroup: string): Partial<Record<keyof CharacterGroupData, unknown>> => {
  return JSON.parse(rawGroup.replace(/^\uFEFF/, '') || '{}') as Partial<Record<keyof CharacterGroupData, unknown>>
}

const ensureCharacterGroupsDirectory = async (): Promise<void> => {
  await mkdir(characterGroupsDirectory, { recursive: true })
}

const getCharacterGroupFilePath = (groupId: string): string => {
  if (!isSafeCharacterGroupId(groupId)) {
    const error = new Error('Invalid character group id') as ApiError
    error.statusCode = 400
    error.code = 'API_INVALID_CHARACTER_GROUP_ID'
    throw error
  }

  return path.join(characterGroupsDirectory, `${groupId}.json`)
}

const assertValidGroupName = (name: string): void => {
  if (!name) {
    const error = new Error('Invalid character group name') as ApiError
    error.statusCode = 400
    error.code = 'API_INVALID_CHARACTER_GROUP_NAME'
    throw error
  }
}

export const isSafeCharacterGroupId = (groupId: string): boolean => {
  return safeCharacterGroupIdPattern.test(groupId)
}

export const listCharacterGroups = async (): Promise<CharacterGroup[]> => {
  await ensureCharacterGroupsDirectory()
  const entries = await readdir(characterGroupsDirectory, { withFileTypes: true })
  const groupFiles = entries.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.json'))
  const groups = await Promise.all(
    groupFiles.map(async (entry) => {
      const groupId = path.basename(entry.name, '.json')
      const filePath = getCharacterGroupFilePath(groupId)
      const [rawGroup, fileInfo] = await Promise.all([
        readFile(filePath, 'utf8'),
        stat(filePath),
      ])

      return {
        id: groupId,
        ...normalizeCharacterGroup(parseCharacterGroup(rawGroup)),
        updatedAt: fileInfo.mtime.toISOString(),
      }
    }),
  )

  return groups.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
}

export const readCharacterGroup = async (groupId: string): Promise<CharacterGroup> => {
  await ensureCharacterGroupsDirectory()
  const filePath = getCharacterGroupFilePath(groupId)
  const [rawGroup, fileInfo] = await Promise.all([
    readFile(filePath, 'utf8'),
    stat(filePath),
  ])

  return {
    id: groupId,
    ...normalizeCharacterGroup(parseCharacterGroup(rawGroup)),
    updatedAt: fileInfo.mtime.toISOString(),
  }
}

export const createCharacterGroup = async (data: unknown): Promise<CharacterGroup> => {
  await ensureCharacterGroupsDirectory()
  const source = typeof data === 'object' && data !== null ? (data as Partial<Record<keyof CharacterGroupData, unknown>>) : {}
  const group = normalizeCharacterGroup({
    uniqueId: randomUUID(),
    name: source.name,
    characterFileNames: [],
  })

  assertValidGroupName(group.name)

  const groupId = `${Date.now()}-${randomUUID().slice(0, 8)}`
  const filePath = getCharacterGroupFilePath(groupId)
  await writeFile(filePath, `${JSON.stringify(group, null, 2)}\n`, 'utf8')

  const fileInfo = await stat(filePath)

  return {
    id: groupId,
    ...group,
    updatedAt: fileInfo.mtime.toISOString(),
  }
}

export const updateCharacterGroup = async (groupId: string, data: unknown): Promise<CharacterGroup> => {
  await ensureCharacterGroupsDirectory()
  const filePath = getCharacterGroupFilePath(groupId)
  const rawGroup = await readFile(filePath, 'utf8')
  const existingGroup = parseCharacterGroup(rawGroup)
  const nextGroup = normalizeCharacterGroup({
    ...existingGroup,
    ...(typeof data === 'object' && data !== null ? (data as Partial<Record<keyof CharacterGroupData, unknown>>) : {}),
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

export const deleteCharacterGroup = async (groupId: string): Promise<void> => {
  await ensureCharacterGroupsDirectory()
  await unlink(getCharacterGroupFilePath(groupId))
}
