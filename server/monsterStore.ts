import { randomUUID } from 'node:crypto'
import { mkdir, readFile, readdir, stat, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { CharacterArmor, CharacterItems, CharacterOtherItem, CharacterWeapon, CharacterWeaponDamageDiceType } from '../src/types/character'
import type { Monster, MonsterAttack, MonsterAttackAction, MonsterAttackAreaType, MonsterAttackType, MonsterData, MonsterDefenses, MonsterRole, MonsterSuggestedStats, MonsterType } from '../src/types/monster'

interface ApiError extends Error {
  code?: string
  statusCode?: number
}

export interface MonsterImage {
  contentType: 'image/jpeg' | 'image/png'
  data: Buffer
}

const monstersDirectory = path.resolve(process.cwd(), 'data', 'monsters')
const safeMonsterIdPattern = /^[a-z0-9-]+$/i
const monsterImageExtensions = ['jpg', 'png'] as const
const monsterAttackTypes = ['standard', 'unlimited', 'encounter', 'daily'] as const satisfies readonly MonsterAttackType[]
const monsterRoles = ['skirmisher', 'brute', 'soldier', 'lurker', 'controller', 'artillery'] as const satisfies readonly MonsterRole[]
const monsterTypes = ['minion', 'normal', 'solo', 'elite'] as const satisfies readonly MonsterType[]
const monsterAttackActions = ['action', 'noAction'] as const satisfies readonly MonsterAttackAction[]
const monsterAttackAreas = [
  'point',
  'burst1',
  'burst2',
  'burst3',
  'burst4',
  'burst5',
  'burst6',
  'burst7',
  'burst8',
  'burst9',
  'burst10',
  'blast1',
  'blast2',
  'blast3',
  'blast4',
  'blast5',
  'blast6',
  'blast7',
  'blast8',
  'blast9',
  'blast10',
] as const satisfies readonly MonsterAttackAreaType[]

const emptyItems: CharacterItems = {
  armors: [],
  weapons: [],
  others: [],
}

const normalizeDefenseValue = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 10
  }

  return Math.min(50, Math.max(0, Math.trunc(value)))
}

const normalizeStatValue = (value: unknown, fallback: number): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback
  }

  return Math.min(999, Math.max(0, Math.trunc(value)))
}

const normalizeSuggestedStatValue = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : ''
}

const normalizeUniqueId = (value: unknown): string => {
  return typeof value === 'string' && value.trim().length > 0 ? value : randomUUID()
}

const normalizeLevelValue = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 1
  }

  return Math.min(30, Math.max(1, Math.trunc(value)))
}

const normalizeRangeValue = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0
  }

  return Math.min(30, Math.max(0, Math.trunc(value)))
}

const normalizeAttackBonusValue = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0
  }

  return Math.min(20, Math.max(0, Math.trunc(value)))
}

const normalizeItemBonusValue = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0
  }

  return Math.min(10, Math.max(-5, Math.trunc(value)))
}

const normalizeWeaponDamageNumber = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0
  }

  return Math.min(10, Math.max(0, Math.trunc(value)))
}

const normalizeWeaponRangeValue = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 1
  }

  return Math.min(20, Math.max(1, Math.trunc(value)))
}

const normalizeWeaponProficiencyBonusValue = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0
  }

  return Math.min(5, Math.max(0, Math.trunc(value)))
}

const normalizeWeaponDamageDiceType = (value: unknown): CharacterWeaponDamageDiceType => {
  return value === 'd4' || value === 'd6' || value === 'd8' || value === 'd10' || value === 'd12' || value === 'd20'
    ? value
    : 'd4'
}

const normalizeAttackAction = (value: unknown): MonsterAttackAction => {
  return monsterAttackActions.includes(value as MonsterAttackAction) ? (value as MonsterAttackAction) : 'action'
}

const normalizeAttackType = (value: unknown): MonsterAttackType => {
  return monsterAttackTypes.includes(value as MonsterAttackType) ? (value as MonsterAttackType) : 'unlimited'
}

const normalizeMonsterType = (value: unknown): MonsterType => {
  return monsterTypes.includes(value as MonsterType) ? (value as MonsterType) : 'normal'
}

const normalizeMonsterRole = (value: unknown): MonsterRole => {
  return monsterRoles.includes(value as MonsterRole) ? (value as MonsterRole) : 'skirmisher'
}

const normalizeAttackArea = (value: unknown): MonsterAttackAreaType => {
  return monsterAttackAreas.includes(value as MonsterAttackAreaType) ? (value as MonsterAttackAreaType) : 'point'
}

const normalizeAttackDefense = (value: unknown): keyof MonsterDefenses => {
  return typeof value === 'string' && ['kp', 'fortitude', 'reflex', 'will'].includes(value) ? (value as keyof MonsterDefenses) : 'kp'
}

const normalizeDefenses = (data: Partial<Record<keyof MonsterDefenses, unknown>> = {}): MonsterDefenses => {
  return {
    kp: normalizeDefenseValue(data.kp),
    fortitude: normalizeDefenseValue(data.fortitude),
    reflex: normalizeDefenseValue(data.reflex),
    will: normalizeDefenseValue(data.will),
  }
}

const normalizeSuggestedStats = (data: Partial<Record<keyof MonsterSuggestedStats, unknown>> = {}): MonsterSuggestedStats => {
  return {
    attackVsKp: normalizeSuggestedStatValue(data.attackVsKp),
    attackVsOtherDefenses: normalizeSuggestedStatValue(data.attackVsOtherDefenses),
    lowDamage: normalizeSuggestedStatValue(data.lowDamage),
    mediumDamage: normalizeSuggestedStatValue(data.mediumDamage),
    highDamage: normalizeSuggestedStatValue(data.highDamage),
  }
}

const normalizeAttack = (data: Partial<Record<keyof MonsterAttack, unknown>> = {}): MonsterAttack => {
  return {
    id: typeof data.id === 'string' && data.id.trim().length > 0 ? data.id : randomUUID(),
    name: typeof data.name === 'string' ? data.name.trim() : '',
    action: normalizeAttackAction(data.action),
    type: normalizeAttackType(data.type),
    range: normalizeRangeValue(data.range),
    area: normalizeAttackArea(data.area),
    attackBonusNumber: normalizeAttackBonusValue(data.attackBonusNumber),
    attackDefense: normalizeAttackDefense(data.attackDefense),
    attackNotApplicable: data.attackNotApplicable === true,
    description: typeof data.description === 'string' ? data.description.trim() : '',
  }
}

const normalizeAttacks = (attacks: unknown): MonsterAttack[] => {
  if (!Array.isArray(attacks)) {
    return []
  }

  return attacks
    .filter((attack): attack is Partial<Record<keyof MonsterAttack, unknown>> => typeof attack === 'object' && attack !== null)
    .map((attack) => normalizeAttack(attack))
}

const normalizeArmorGroup = (group: unknown): CharacterArmor[] => {
  if (!Array.isArray(group)) {
    return []
  }

  return group
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item) => ({
      id: typeof item.id === 'string' && item.id.trim().length > 0 ? item.id : randomUUID(),
      name: typeof item.name === 'string' ? item.name.trim() : '',
      description: typeof item.description === 'string' ? item.description.trim() : '',
      equipped: item.equipped === true,
      strengthBonusNumber: normalizeItemBonusValue(item.strengthBonusNumber),
      conditionBonusNumber: normalizeItemBonusValue(item.conditionBonusNumber),
      dexterityBonusNumber: normalizeItemBonusValue(item.dexterityBonusNumber),
      intelligenceBonusNumber: normalizeItemBonusValue(item.intelligenceBonusNumber),
      wisdomBonusNumber: normalizeItemBonusValue(item.wisdomBonusNumber),
      charismaBonusNumber: normalizeItemBonusValue(item.charismaBonusNumber),
      speedBonusNumber: normalizeItemBonusValue(item.speedBonusNumber),
      armorPenaltyNumber: normalizeItemBonusValue(item.armorPenaltyNumber),
      kpBonusNumber: normalizeItemBonusValue(item.kpBonusNumber),
      fortitudeBonusNumber: normalizeItemBonusValue(item.fortitudeBonusNumber),
      reflexBonusNumber: normalizeItemBonusValue(item.reflexBonusNumber),
      willBonusNumber: normalizeItemBonusValue(item.willBonusNumber),
    }))
}

const normalizeWeaponGroup = (group: unknown): CharacterWeapon[] => {
  if (!Array.isArray(group)) {
    return []
  }

  return group
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item) => ({
      id: typeof item.id === 'string' && item.id.trim().length > 0 ? item.id : randomUUID(),
      name: typeof item.name === 'string' ? item.name.trim() : '',
      description: typeof item.description === 'string' ? item.description.trim() : '',
      damageDiceCount: typeof item.damageDiceCount === 'number' && Number.isFinite(item.damageDiceCount)
        ? Math.min(5, Math.max(1, Math.trunc(item.damageDiceCount)))
        : 1,
      damageDiceType: normalizeWeaponDamageDiceType(item.damageDiceType),
      damageBonusNumber: normalizeWeaponDamageNumber(item.damageBonusNumber),
      range: normalizeWeaponRangeValue(item.range),
      equipped: item.equipped === true,
      weaponProficiencyBonusNumber: normalizeWeaponProficiencyBonusValue(item.weaponProficiencyBonusNumber),
      strengthBonusNumber: normalizeItemBonusValue(item.strengthBonusNumber),
      conditionBonusNumber: normalizeItemBonusValue(item.conditionBonusNumber),
      dexterityBonusNumber: normalizeItemBonusValue(item.dexterityBonusNumber),
      intelligenceBonusNumber: normalizeItemBonusValue(item.intelligenceBonusNumber),
      wisdomBonusNumber: normalizeItemBonusValue(item.wisdomBonusNumber),
      charismaBonusNumber: normalizeItemBonusValue(item.charismaBonusNumber),
      speedBonusNumber: normalizeItemBonusValue(item.speedBonusNumber),
      kpBonusNumber: normalizeItemBonusValue(item.kpBonusNumber),
      fortitudeBonusNumber: normalizeItemBonusValue(item.fortitudeBonusNumber),
      reflexBonusNumber: normalizeItemBonusValue(item.reflexBonusNumber),
      willBonusNumber: normalizeItemBonusValue(item.willBonusNumber),
    }))
}

const normalizeOtherItemGroup = (group: unknown): CharacterOtherItem[] => {
  if (!Array.isArray(group)) {
    return []
  }

  return group
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item) => ({
      id: typeof item.id === 'string' && item.id.trim().length > 0 ? item.id : randomUUID(),
      name: typeof item.name === 'string' ? item.name.trim() : '',
      description: typeof item.description === 'string' ? item.description.trim() : '',
      equipped: item.equipped === true,
      strengthBonusNumber: normalizeItemBonusValue(item.strengthBonusNumber),
      conditionBonusNumber: normalizeItemBonusValue(item.conditionBonusNumber),
      dexterityBonusNumber: normalizeItemBonusValue(item.dexterityBonusNumber),
      intelligenceBonusNumber: normalizeItemBonusValue(item.intelligenceBonusNumber),
      wisdomBonusNumber: normalizeItemBonusValue(item.wisdomBonusNumber),
      charismaBonusNumber: normalizeItemBonusValue(item.charismaBonusNumber),
      speedBonusNumber: normalizeItemBonusValue(item.speedBonusNumber),
      kpBonusNumber: normalizeItemBonusValue(item.kpBonusNumber),
      fortitudeBonusNumber: normalizeItemBonusValue(item.fortitudeBonusNumber),
      reflexBonusNumber: normalizeItemBonusValue(item.reflexBonusNumber),
      willBonusNumber: normalizeItemBonusValue(item.willBonusNumber),
    }))
}

const normalizeItems = (items: unknown): CharacterItems => {
  if (Array.isArray(items)) {
    return {
      ...emptyItems,
      others: normalizeOtherItemGroup(items),
    }
  }

  if (!items || typeof items !== 'object') {
    return emptyItems
  }

  const source = items as Partial<Record<keyof CharacterItems, unknown>>

  return {
    armors: normalizeArmorGroup(source.armors),
    weapons: normalizeWeaponGroup(source.weapons),
    others: normalizeOtherItemGroup(source.others),
  }
}

const normalizeMonster = (data: Partial<Record<keyof MonsterData, unknown>> = {}): MonsterData => {
  return {
    uniqueId: normalizeUniqueId(data.uniqueId),
    name: typeof data.name === 'string' ? data.name : '',
    role: normalizeMonsterRole(data.role),
    type: normalizeMonsterType(data.type),
    description: typeof data.description === 'string' ? data.description.trim() : '',
    resistances: typeof data.resistances === 'string' ? data.resistances.trim() : '',
    special: typeof data.special === 'string' ? data.special.trim() : '',
    attacks: normalizeAttacks(data.attacks),
    items: normalizeItems(data.items),
    defenses:
      typeof data.defenses === 'object' && data.defenses !== null
        ? normalizeDefenses(data.defenses as Partial<Record<keyof MonsterDefenses, unknown>>)
        : normalizeDefenses(),
    suggested:
      typeof data.suggested === 'object' && data.suggested !== null
        ? normalizeSuggestedStats(data.suggested as Partial<Record<keyof MonsterSuggestedStats, unknown>>)
        : normalizeSuggestedStats(),
    hp: normalizeStatValue(data.hp, 0),
    level: normalizeLevelValue(data.level),
    speed: normalizeStatValue(data.speed, 6),
  }
}

const parseMonster = (rawMonster: string): Partial<Record<keyof MonsterData, unknown>> => {
  return JSON.parse(rawMonster.replace(/^\uFEFF/, '') || '{}') as Partial<Record<keyof MonsterData, unknown>>
}

const ensureMonstersDirectory = async (): Promise<void> => {
  await mkdir(monstersDirectory, { recursive: true })
}

const getMonsterFilePath = (monsterId: string): string => {
  if (!isSafeMonsterId(monsterId)) {
    const error = new Error('Invalid monster id') as ApiError
    error.statusCode = 400
    error.code = 'API_INVALID_MONSTER_ID'
    throw error
  }

  return path.join(monstersDirectory, `${monsterId}.json`)
}

const getMonsterImageFilePath = (monsterId: string, extension: (typeof monsterImageExtensions)[number]): string => {
  if (!isSafeMonsterId(monsterId)) {
    const error = new Error('Invalid monster id') as ApiError
    error.statusCode = 400
    error.code = 'API_INVALID_MONSTER_ID'
    throw error
  }

  return path.join(monstersDirectory, `${monsterId}.${extension}`)
}

const getMonsterImageInfo = async (monsterId: string): Promise<{ contentType: MonsterImage['contentType']; filePath: string; imageUrl: string } | null> => {
  for (const extension of monsterImageExtensions) {
    const filePath = getMonsterImageFilePath(monsterId, extension)

    try {
      await stat(filePath)
      return {
        contentType: extension === 'png' ? 'image/png' : 'image/jpeg',
        filePath,
        imageUrl: `/api/monsters/${monsterId}/image`,
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error
      }
    }
  }

  return null
}

const normalizeImageExtension = (contentType: string | undefined): (typeof monsterImageExtensions)[number] => {
  if (contentType === 'image/png') {
    return 'png'
  }

  if (contentType === 'image/jpeg' || contentType === 'image/jpg') {
    return 'jpg'
  }

  const error = new Error('Invalid monster image') as ApiError
  error.statusCode = 400
  error.code = 'API_INVALID_MONSTER_IMAGE'
  throw error
}

export const isSafeMonsterId = (monsterId: string): boolean => {
  return safeMonsterIdPattern.test(monsterId)
}

export const listMonsters = async (): Promise<Monster[]> => {
  await ensureMonstersDirectory()
  const entries = await readdir(monstersDirectory, { withFileTypes: true })
  const monsterFiles = entries.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.json'))
  const monsters = await Promise.all(
    monsterFiles.map(async (entry) => {
      const monsterId = path.basename(entry.name, '.json')
      const filePath = getMonsterFilePath(monsterId)
      const [rawMonster, fileInfo, imageInfo] = await Promise.all([
        readFile(filePath, 'utf8'),
        stat(filePath),
        getMonsterImageInfo(monsterId),
      ])

      return {
        id: monsterId,
        imageUrl: imageInfo?.imageUrl ?? '',
        ...normalizeMonster(parseMonster(rawMonster)),
        updatedAt: fileInfo.mtime.toISOString(),
      }
    }),
  )

  return monsters.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
}

export const readMonster = async (monsterId: string): Promise<Monster> => {
  await ensureMonstersDirectory()
  const filePath = getMonsterFilePath(monsterId)
  const [rawMonster, fileInfo, imageInfo] = await Promise.all([
    readFile(filePath, 'utf8'),
    stat(filePath),
    getMonsterImageInfo(monsterId),
  ])

  return {
    id: monsterId,
    imageUrl: imageInfo?.imageUrl ?? '',
    ...normalizeMonster(parseMonster(rawMonster)),
    updatedAt: fileInfo.mtime.toISOString(),
  }
}

export const createMonster = async (): Promise<Monster> => {
  await ensureMonstersDirectory()
  const monsterId = `${Date.now()}-${randomUUID().slice(0, 8)}`
  const filePath = getMonsterFilePath(monsterId)
  await writeFile(filePath, `${JSON.stringify({ uniqueId: randomUUID() }, null, 2)}\n`, 'utf8')

  return readMonster(monsterId)
}

export const updateMonster = async (monsterId: string, data: unknown): Promise<Monster> => {
  await ensureMonstersDirectory()
  const filePath = getMonsterFilePath(monsterId)
  const rawMonster = await readFile(filePath, 'utf8')
  const existingMonster = parseMonster(rawMonster)
  const nextMonster = {
    ...normalizeMonster({
      ...existingMonster,
      ...(typeof data === 'object' && data !== null ? (data as Partial<Record<keyof MonsterData, unknown>>) : {}),
    }),
  }

  await writeFile(filePath, `${JSON.stringify(nextMonster, null, 2)}\n`, 'utf8')

  return readMonster(monsterId)
}

export const deleteMonster = async (monsterId: string): Promise<void> => {
  await ensureMonstersDirectory()
  const filePath = getMonsterFilePath(monsterId)
  await unlink(filePath)

  await Promise.all(
    monsterImageExtensions.map(async (extension) => {
      try {
        await unlink(getMonsterImageFilePath(monsterId, extension))
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw error
        }
      }
    }),
  )
}

export const readMonsterImage = async (monsterId: string): Promise<MonsterImage> => {
  await ensureMonstersDirectory()
  const imageInfo = await getMonsterImageInfo(monsterId)

  if (!imageInfo) {
    const error = new Error('Monster image not found') as ApiError
    error.statusCode = 404
    error.code = 'ENOENT'
    throw error
  }

  return {
    contentType: imageInfo.contentType,
    data: await readFile(imageInfo.filePath),
  }
}

export const updateMonsterImage = async (monsterId: string, contentType: string | undefined, data: Buffer): Promise<Monster> => {
  await ensureMonstersDirectory()
  await stat(getMonsterFilePath(monsterId))

  const extension = normalizeImageExtension(contentType)
  const nextFilePath = getMonsterImageFilePath(monsterId, extension)
  const staleExtensions = monsterImageExtensions.filter((imageExtension) => imageExtension !== extension)

  await Promise.all(
    staleExtensions.map(async (staleExtension) => {
      try {
        await unlink(getMonsterImageFilePath(monsterId, staleExtension))
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw error
        }
      }
    }),
  )

  await writeFile(nextFilePath, data)

  return readMonster(monsterId)
}

export const deleteMonsterImage = async (monsterId: string): Promise<Monster> => {
  await ensureMonstersDirectory()
  await stat(getMonsterFilePath(monsterId))

  await Promise.all(
    monsterImageExtensions.map(async (extension) => {
      try {
        await unlink(getMonsterImageFilePath(monsterId, extension))
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw error
        }
      }
    }),
  )

  return readMonster(monsterId)
}
