import { randomUUID } from 'node:crypto'
import { mkdir, readFile, readdir, stat, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { CharacterArmor, CharacterItems, CharacterOtherItem, CharacterWeapon, CharacterWeaponDamageDiceType } from '../src/types/character'
import type { Npc, NpcAttack, NpcAttackAction, NpcAttackAreaType, NpcAttackType, NpcData, NpcDefenses, NpcRole, NpcSuggestedStats, NpcType } from '../src/types/npc'
import { assertStoredEntityExists, createStoredEntity, deleteStoredEntity, listStoredEntities, migrateJsonDirectoryToSqlite, readStoredEntity, updateStoredEntity } from './sqliteStore'

interface ApiError extends Error {
  code?: string
  statusCode?: number
}

export interface NpcImage {
  contentType: 'image/jpeg' | 'image/png'
  data: Buffer
}

const npcsDirectory = path.resolve(process.cwd(), 'data', 'npcs')
const safeNpcIdPattern = /^[a-z0-9-]+$/i
const npcImageExtensions = ['jpg', 'png'] as const
const npcAttackTypes = ['standard', 'unlimited', 'encounter', 'daily'] as const satisfies readonly NpcAttackType[]
const npcRoles = ['skirmisher', 'brute', 'soldier', 'lurker', 'controller', 'artillery'] as const satisfies readonly NpcRole[]
const npcTypes = ['minion', 'normal', 'solo', 'elite'] as const satisfies readonly NpcType[]
const npcAttackActions = ['action', 'noAction'] as const satisfies readonly NpcAttackAction[]
const npcAttackAreas = [
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
] as const satisfies readonly NpcAttackAreaType[]

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

const normalizeStatValue = (value: unknown, fallback: number, maxValue = 999): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback
  }

  return Math.min(maxValue, Math.max(0, Math.trunc(value)))
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

  return Math.min(35, Math.max(0, Math.trunc(value)))
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

const normalizeAttackAction = (value: unknown): NpcAttackAction => {
  return npcAttackActions.includes(value as NpcAttackAction) ? (value as NpcAttackAction) : 'action'
}

const normalizeAttackType = (value: unknown): NpcAttackType => {
  return npcAttackTypes.includes(value as NpcAttackType) ? (value as NpcAttackType) : 'unlimited'
}

const normalizeNpcType = (value: unknown): NpcType => {
  return npcTypes.includes(value as NpcType) ? (value as NpcType) : 'normal'
}

const normalizeNpcRole = (value: unknown): NpcRole => {
  return npcRoles.includes(value as NpcRole) ? (value as NpcRole) : 'skirmisher'
}

const normalizeAttackArea = (value: unknown): NpcAttackAreaType => {
  return npcAttackAreas.includes(value as NpcAttackAreaType) ? (value as NpcAttackAreaType) : 'point'
}

const normalizeAttackDefense = (value: unknown): keyof NpcDefenses => {
  return typeof value === 'string' && ['kp', 'fortitude', 'reflex', 'will'].includes(value) ? (value as keyof NpcDefenses) : 'kp'
}

const normalizeDefenses = (data: Partial<Record<keyof NpcDefenses, unknown>> = {}): NpcDefenses => {
  return {
    kp: normalizeDefenseValue(data.kp),
    fortitude: normalizeDefenseValue(data.fortitude),
    reflex: normalizeDefenseValue(data.reflex),
    will: normalizeDefenseValue(data.will),
  }
}

const normalizeSuggestedStats = (data: Partial<Record<keyof NpcSuggestedStats, unknown>> = {}): NpcSuggestedStats => {
  return {
    attackVsKp: normalizeSuggestedStatValue(data.attackVsKp),
    attackVsOtherDefenses: normalizeSuggestedStatValue(data.attackVsOtherDefenses),
    lowDamage: normalizeSuggestedStatValue(data.lowDamage),
    mediumDamage: normalizeSuggestedStatValue(data.mediumDamage),
    highDamage: normalizeSuggestedStatValue(data.highDamage),
  }
}

const normalizeAttack = (data: Partial<Record<keyof NpcAttack, unknown>> = {}): NpcAttack => {
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

const normalizeAttacks = (attacks: unknown): NpcAttack[] => {
  if (!Array.isArray(attacks)) {
    return []
  }

  return attacks
    .filter((attack): attack is Partial<Record<keyof NpcAttack, unknown>> => typeof attack === 'object' && attack !== null)
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

const normalizeNpc = (data: Partial<Record<keyof NpcData, unknown>> = {}): NpcData => {
  return {
    uniqueId: normalizeUniqueId(data.uniqueId),
    name: typeof data.name === 'string' ? data.name : '',
    role: normalizeNpcRole(data.role),
    type: normalizeNpcType(data.type),
    description: typeof data.description === 'string' ? data.description.trim() : '',
    resistances: typeof data.resistances === 'string' ? data.resistances.trim() : '',
    special: typeof data.special === 'string' ? data.special.trim() : '',
    attacks: normalizeAttacks(data.attacks),
    items: normalizeItems(data.items),
    defenses:
      typeof data.defenses === 'object' && data.defenses !== null
        ? normalizeDefenses(data.defenses as Partial<Record<keyof NpcDefenses, unknown>>)
        : normalizeDefenses(),
    suggested:
      typeof data.suggested === 'object' && data.suggested !== null
        ? normalizeSuggestedStats(data.suggested as Partial<Record<keyof NpcSuggestedStats, unknown>>)
        : normalizeSuggestedStats(),
    hp: normalizeStatValue(data.hp, 0, 9999),
    level: normalizeLevelValue(data.level),
    speed: normalizeStatValue(data.speed, 6),
    isStory: data.isStory === true,
    isDead: data.isDead === true,
  }
}

const parseNpc = (rawNpc: string): Partial<Record<keyof NpcData, unknown>> => {
  return JSON.parse(rawNpc.replace(/^\uFEFF/, '') || '{}') as Partial<Record<keyof NpcData, unknown>>
}

const ensureNpcsDirectory = async (): Promise<void> => {
  await mkdir(npcsDirectory, { recursive: true })
}

const getNpcFilePath = (npcId: string): string => {
  if (!isSafeNpcId(npcId)) {
    const error = new Error('Invalid npc id') as ApiError
    error.statusCode = 400
    error.code = 'API_INVALID_NPC_ID'
    throw error
  }

  return path.join(npcsDirectory, `${npcId}.json`)
}

const getNpcImageFilePath = (npcId: string, extension: (typeof npcImageExtensions)[number]): string => {
  if (!isSafeNpcId(npcId)) {
    const error = new Error('Invalid npc id') as ApiError
    error.statusCode = 400
    error.code = 'API_INVALID_NPC_ID'
    throw error
  }

  return path.join(npcsDirectory, `${npcId}.${extension}`)
}

const getNpcImageInfo = async (npcId: string): Promise<{ contentType: NpcImage['contentType']; filePath: string; imageUrl: string } | null> => {
  for (const extension of npcImageExtensions) {
    const filePath = getNpcImageFilePath(npcId, extension)

    try {
      await stat(filePath)
      return {
        contentType: extension === 'png' ? 'image/png' : 'image/jpeg',
        filePath,
        imageUrl: `/api/npcs/${npcId}/image`,
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error
      }
    }
  }

  return null
}

const normalizeImageExtension = (contentType: string | undefined): (typeof npcImageExtensions)[number] => {
  if (contentType === 'image/png') {
    return 'png'
  }

  if (contentType === 'image/jpeg' || contentType === 'image/jpg') {
    return 'jpg'
  }

  const error = new Error('Invalid npc image') as ApiError
  error.statusCode = 400
  error.code = 'API_INVALID_NPC_IMAGE'
  throw error
}

const npcStoreOptions = {
  entityType: 'npc',
  imageUrl: (npcId: string): string => `/api/npcs/${npcId}/image`,
  normalize: normalizeNpc,
}

const ensureNpcsStore = async (): Promise<void> => {
  await migrateJsonDirectoryToSqlite({
    directory: npcsDirectory,
    entityType: npcStoreOptions.entityType,
    isSafeId: isSafeNpcId,
  })
}

export const isSafeNpcId = (npcId: string): boolean => {
  return safeNpcIdPattern.test(npcId)
}

export const listNpcs = async (): Promise<Npc[]> => {
  await ensureNpcsStore()
  const npcs = await listStoredEntities<NpcData, Npc>(npcStoreOptions)
  return Promise.all(npcs.map(async (npc) => ({
    ...npc,
    imageUrl: (await getNpcImageInfo(npc.id))?.imageUrl ?? '',
  })))
}

export const readNpc = async (npcId: string): Promise<Npc> => {
  await ensureNpcsStore()
  const [npc, imageInfo] = await Promise.all([
    readStoredEntity<NpcData, Npc>(npcId, npcStoreOptions),
    getNpcImageInfo(npcId),
  ])

  return {
    ...npc,
    imageUrl: imageInfo?.imageUrl ?? '',
  }
}

export const createNpc = async (): Promise<Npc> => {
  await ensureNpcsStore()
  return createStoredEntity<NpcData, Npc>(npcStoreOptions)
}

export const updateNpc = async (npcId: string, data: unknown): Promise<Npc> => {
  await ensureNpcsStore()
  return updateStoredEntity<NpcData, Npc>(npcId, data, npcStoreOptions)
}

export const deleteNpc = async (npcId: string): Promise<void> => {
  await ensureNpcsStore()
  await deleteStoredEntity(npcStoreOptions.entityType, npcId)

  await Promise.all(
    npcImageExtensions.map(async (extension) => {
      try {
        await unlink(getNpcImageFilePath(npcId, extension))
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw error
        }
      }
    }),
  )
}

export const readNpcImage = async (npcId: string): Promise<NpcImage> => {
  await ensureNpcsStore()
  const imageInfo = await getNpcImageInfo(npcId)

  if (!imageInfo) {
    const error = new Error('Npc image not found') as ApiError
    error.statusCode = 404
    error.code = 'ENOENT'
    throw error
  }

  return {
    contentType: imageInfo.contentType,
    data: await readFile(imageInfo.filePath),
  }
}

export const updateNpcImage = async (npcId: string, contentType: string | undefined, data: Buffer): Promise<Npc> => {
  await ensureNpcsStore()
  await assertStoredEntityExists(npcStoreOptions.entityType, npcId)

  const extension = normalizeImageExtension(contentType)
  const nextFilePath = getNpcImageFilePath(npcId, extension)
  const staleExtensions = npcImageExtensions.filter((imageExtension) => imageExtension !== extension)

  await Promise.all(
    staleExtensions.map(async (staleExtension) => {
      try {
        await unlink(getNpcImageFilePath(npcId, staleExtension))
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw error
        }
      }
    }),
  )

  await writeFile(nextFilePath, data)

  return readNpc(npcId)
}

export const deleteNpcImage = async (npcId: string): Promise<Npc> => {
  await ensureNpcsStore()
  await assertStoredEntityExists(npcStoreOptions.entityType, npcId)

  await Promise.all(
    npcImageExtensions.map(async (extension) => {
      try {
        await unlink(getNpcImageFilePath(npcId, extension))
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw error
        }
      }
    }),
  )

  return readNpc(npcId)
}
