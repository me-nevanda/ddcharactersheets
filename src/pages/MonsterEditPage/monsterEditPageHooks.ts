import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { useI18n } from '@i18n/index'
import { deleteMonsterImage, getMonster, saveMonster, uploadMonsterImage } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import { normalizeItems } from '@pages/CharacterEditPage/characterEditPageLogic'
import { emptyArmor, emptyItems, emptyOtherItem, emptyWeapon } from '@pages/CharacterEditPage/characterEditPageUtils'
import type { CharacterArmorBonusFieldName, CharacterItemBonusFieldName, CharacterWeaponDamageDiceType, CharacterWeaponFieldName } from '@appTypes/character'
import type { MonsterAttack, MonsterAttackAction, MonsterAttackAreaType, MonsterAttackType, MonsterData, MonsterDefenses, MonsterRole, MonsterSuggestedStats, MonsterType } from '@appTypes/monster'
import type { CharacterItemFieldName, CharacterItemGroupKey } from '@pages/CharacterEditPage/types'
import { useMonsterAttributeGeneration } from './monsterAttributeGenerationHooks'
import type { MonsterEditPageState } from './types'

const emptyMonsterForm: MonsterData = {
  uniqueId: '',
  name: '',
  role: 'skirmisher',
  type: 'normal',
  description: '',
  resistances: '',
  special: '',
  attacks: [],
  items: emptyItems,
  defenses: {
    kp: 10,
    fortitude: 10,
    reflex: 10,
    will: 10,
  },
  suggested: {
    attackVsKp: '',
    attackVsOtherDefenses: '',
    lowDamage: '',
    mediumDamage: '',
    highDamage: '',
  },
  hp: 0,
  level: 1,
  speed: 6,
}

const defenseFields = ['kp', 'fortitude', 'reflex', 'will'] as const satisfies readonly (keyof MonsterDefenses)[]
const suggestedFields = ['attackVsKp', 'attackVsOtherDefenses', 'lowDamage', 'mediumDamage', 'highDamage'] as const satisfies readonly (keyof MonsterSuggestedStats)[]
const numericFields = ['hp', 'level', 'speed'] as const satisfies readonly (keyof Pick<MonsterData, 'hp' | 'level' | 'speed'>)[]
const monsterRoles = ['skirmisher', 'brute', 'soldier', 'lurker', 'controller', 'artillery'] as const satisfies readonly MonsterRole[]
const monsterTypes = ['minion', 'normal', 'solo', 'elite'] as const satisfies readonly MonsterType[]
const monsterAttackTypes = ['standard', 'unlimited', 'encounter', 'daily'] as const satisfies readonly MonsterAttackType[]
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

const isDefenseField = (name: string): name is keyof MonsterDefenses => {
  return defenseFields.includes(name as keyof MonsterDefenses)
}

const isSuggestedField = (name: string): name is keyof MonsterSuggestedStats => {
  return suggestedFields.includes(name as keyof MonsterSuggestedStats)
}

const isNumericField = (name: string): name is (typeof numericFields)[number] => {
  return numericFields.includes(name as (typeof numericFields)[number])
}

const normalizeMonsterType = (value: string): MonsterType => {
  return monsterTypes.includes(value as MonsterType) ? (value as MonsterType) : 'normal'
}

const normalizeMonsterRole = (value: string): MonsterRole => {
  return monsterRoles.includes(value as MonsterRole) ? (value as MonsterRole) : 'skirmisher'
}

const createMonsterAttackId = (): string => {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const normalizeDefenseInputValue = (value: string): number => {
  const parsedValue = Number.parseInt(value, 10)

  if (!Number.isFinite(parsedValue)) {
    return 0
  }

  return Math.min(50, Math.max(0, Math.trunc(parsedValue)))
}

const normalizeStatInputValue = (value: string): number => {
  const parsedValue = Number.parseInt(value, 10)

  if (!Number.isFinite(parsedValue)) {
    return 0
  }

  return Math.min(999, Math.max(0, Math.trunc(parsedValue)))
}

const normalizeSuggestedInputValue = (value: string): string => {
  return value
}

const normalizeSuggestedStats = (suggested: Partial<Record<keyof MonsterSuggestedStats, unknown>> | undefined): MonsterSuggestedStats => {
  return {
    attackVsKp: typeof suggested?.attackVsKp === 'string' ? normalizeSuggestedInputValue(suggested.attackVsKp) : '',
    attackVsOtherDefenses: typeof suggested?.attackVsOtherDefenses === 'string' ? normalizeSuggestedInputValue(suggested.attackVsOtherDefenses) : '',
    lowDamage: typeof suggested?.lowDamage === 'string' ? normalizeSuggestedInputValue(suggested.lowDamage) : '',
    mediumDamage: typeof suggested?.mediumDamage === 'string' ? normalizeSuggestedInputValue(suggested.mediumDamage) : '',
    highDamage: typeof suggested?.highDamage === 'string' ? normalizeSuggestedInputValue(suggested.highDamage) : '',
  }
}

const normalizeLevelInputValue = (value: string): number => {
  const parsedValue = Number.parseInt(value, 10)

  if (!Number.isFinite(parsedValue)) {
    return 1
  }

  return Math.min(30, Math.max(1, Math.trunc(parsedValue)))
}

const normalizeAttackRangeValue = (value: string | number): number => {
  const parsedValue = typeof value === 'number' ? value : Number.parseInt(value, 10)

  if (!Number.isFinite(parsedValue)) {
    return 0
  }

  return Math.min(30, Math.max(0, Math.trunc(parsedValue)))
}

const normalizeAttackBonusValue = (value: string | number): number => {
  const parsedValue = typeof value === 'number' ? value : Number.parseInt(value, 10)

  if (!Number.isFinite(parsedValue)) {
    return 0
  }

  return Math.min(20, Math.max(0, Math.trunc(parsedValue)))
}

const normalizeAttackAction = (value: unknown): MonsterAttackAction => {
  return monsterAttackActions.includes(value as MonsterAttackAction) ? (value as MonsterAttackAction) : 'action'
}

const normalizeAttackType = (value: unknown): MonsterAttackType => {
  return monsterAttackTypes.includes(value as MonsterAttackType) ? (value as MonsterAttackType) : 'unlimited'
}

const normalizeAttackArea = (value: unknown): MonsterAttackAreaType => {
  return monsterAttackAreas.includes(value as MonsterAttackAreaType) ? (value as MonsterAttackAreaType) : 'point'
}

const normalizeAttackDefense = (value: unknown): keyof MonsterDefenses => {
  if (typeof value !== 'string') {
    return 'kp'
  }

  return isDefenseField(value) ? value : 'kp'
}

const createEmptyMonsterAttack = (type: MonsterAttackType): MonsterAttack => {
  return {
    id: createMonsterAttackId(),
    name: '',
    action: 'action',
    type,
    range: 0,
    area: 'point',
    attackBonusNumber: 0,
    attackDefense: 'kp',
    description: '',
  }
}

const normalizeMonsterAttack = (attack: Partial<Record<keyof MonsterAttack, unknown>>, fallbackType: MonsterAttackType = 'unlimited'): MonsterAttack => {
  return {
    id: typeof attack.id === 'string' && attack.id.trim().length > 0 ? attack.id : createMonsterAttackId(),
    name: typeof attack.name === 'string' ? attack.name : '',
    action: normalizeAttackAction(attack.action),
    type: attack.type === undefined ? fallbackType : normalizeAttackType(attack.type),
    range: normalizeAttackRangeValue(typeof attack.range === 'number' || typeof attack.range === 'string' ? attack.range : 0),
    area: normalizeAttackArea(attack.area),
    attackBonusNumber: normalizeAttackBonusValue(typeof attack.attackBonusNumber === 'number' || typeof attack.attackBonusNumber === 'string' ? attack.attackBonusNumber : 0),
    attackDefense: normalizeAttackDefense(attack.attackDefense),
    description: typeof attack.description === 'string' ? attack.description : '',
  }
}

const normalizeMonsterAttacks = (attacks: unknown): MonsterAttack[] => {
  if (!Array.isArray(attacks)) {
    return []
  }

  return attacks
    .filter((attack): attack is Partial<Record<keyof MonsterAttack, unknown>> => typeof attack === 'object' && attack !== null)
    .map((attack) => normalizeMonsterAttack(attack))
}

export const useMonsterEditPage = (): MonsterEditPageState => {
  const { t } = useI18n()
  const { generateMonsterAttributes } = useMonsterAttributeGeneration()
  const { monsterId = '' } = useParams()
  const [form, setForm] = useState<MonsterData>(emptyMonsterForm)
  const [initialForm, setInitialForm] = useState<MonsterData>(emptyMonsterForm)
  const [error, setError] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [removingImage, setRemovingImage] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [isGenerateAttributesDialogOpen, setGenerateAttributesDialogOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadMonster = async () => {
      try {
        const monster = await getMonster(monsterId)
        const nextForm = {
          uniqueId: monster.uniqueId,
          name: monster.name,
          role: normalizeMonsterRole(monster.role),
          type: normalizeMonsterType(monster.type),
          description: monster.description,
          resistances: monster.resistances ?? '',
          special: monster.special ?? '',
          attacks: normalizeMonsterAttacks(monster.attacks),
          items: normalizeItems(monster.items),
          defenses: monster.defenses,
          suggested: normalizeSuggestedStats(monster.suggested),
          hp: monster.hp,
          level: monster.level,
          speed: monster.speed,
        }
        if (!cancelled) {
          setForm(nextForm)
          setInitialForm(nextForm)
          setImageUrl(monster.imageUrl)
          setError('')
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(getErrorMessage(t, nextError))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadMonster()

    return () => {
      cancelled = true
    }
  }, [monsterId, t])

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target

    if (isDefenseField(name)) {
      setForm((current) => ({
        ...current,
        defenses: {
          ...current.defenses,
          [name]: normalizeDefenseInputValue(value),
        },
      }))
      return
    }

    if (isSuggestedField(name)) {
      setForm((current) => ({
        ...current,
        suggested: {
          ...current.suggested,
          [name]: normalizeSuggestedInputValue(value),
        },
      }))
      return
    }

    if (isNumericField(name)) {
      setForm((current) => ({
        ...current,
        [name]: name === 'level' ? normalizeLevelInputValue(value) : normalizeStatInputValue(value),
      }))
      return
    }

    if (name === 'type') {
      setForm((current) => ({
        ...current,
        type: normalizeMonsterType(value),
      }))
      return
    }

    if (name === 'role') {
      setForm((current) => ({
        ...current,
        role: normalizeMonsterRole(value),
      }))
      return
    }

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleDescriptionChange = (value: string) => {
    setForm((current) => ({
      ...current,
      description: value,
    }))
  }

  const handleGenerateAttributes = () => {
    setGenerateAttributesDialogOpen(true)
  }

  const handleCancelGenerateAttributes = () => {
    setGenerateAttributesDialogOpen(false)
  }

  const handleConfirmGenerateAttributes = () => {
    setForm((current) => ({
      ...current,
      ...generateMonsterAttributes(current.level, current.role, current.type),
    }))
    setGenerateAttributesDialogOpen(false)
  }

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const image = event.target.files?.[0]
    event.target.value = ''

    if (!image) {
      return
    }

    setUploadingImage(true)
    setError('')

    try {
      const monster = await uploadMonsterImage(monsterId, image)
      setImageUrl(monster.imageUrl ? `${monster.imageUrl}?v=${Date.now()}` : '')
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
    } finally {
      setUploadingImage(false)
    }
  }

  const handleImageRemove = async () => {
    if (!imageUrl || removingImage) {
      return
    }

    setRemovingImage(true)
    setError('')

    try {
      const monster = await deleteMonsterImage(monsterId)
      setImageUrl(monster.imageUrl)
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
    } finally {
      setRemovingImage(false)
    }
  }

  const handleResistancesChange = (value: string) => {
    setForm((current) => ({
      ...current,
      resistances: value,
    }))
  }

  const handlePrint = () => {
    if (!monsterId) {
      return
    }

    window.open(`/monsters/${monsterId}/print`, '_blank')
  }

  const handleSpecialChange = (value: string) => {
    setForm((current) => ({
      ...current,
      special: value,
    }))
  }

  const handleAttackAdd = (type: MonsterAttackType) => {
    setForm((current) => ({
      ...current,
      attacks: [...current.attacks, createEmptyMonsterAttack(type)],
    }))
  }

  const handleAttackChange = (index: number, fieldName: keyof MonsterAttack, value: string | number) => {
    setForm((current) => ({
      ...current,
      attacks: current.attacks.map((attack, attackIndex) => {
        if (attackIndex !== index) {
          return attack
        }

        if (fieldName === 'range') {
          return {
            ...attack,
            range: normalizeAttackRangeValue(value),
          }
        }

        if (fieldName === 'attackBonusNumber') {
          return {
            ...attack,
            attackBonusNumber: normalizeAttackBonusValue(value),
          }
        }

        if (fieldName === 'attackDefense') {
          return {
            ...attack,
            attackDefense: normalizeAttackDefense(value),
          }
        }

        if (fieldName === 'action') {
          return {
            ...attack,
            action: normalizeAttackAction(value),
          }
        }

        if (fieldName === 'area') {
          return {
            ...attack,
            area: normalizeAttackArea(value),
          }
        }

        if (fieldName === 'type') {
          return {
            ...attack,
            type: normalizeAttackType(value),
          }
        }

        return {
          ...attack,
          [fieldName]: value,
        }
      }),
    }))
  }

  const handleAttackRemove = (index: number) => {
    setForm((current) => ({
      ...current,
      attacks: current.attacks.filter((_, attackIndex) => attackIndex !== index),
    }))
  }

  const handleItemCreateEmpty = (group: CharacterItemGroupKey) => {
    const nextItemId = globalThis.crypto.randomUUID()

    setForm((current) => ({
      ...current,
      items: {
        ...current.items,
        [group]:
          group === 'weapons'
            ? [...current.items[group], { ...emptyWeapon, id: nextItemId }]
            : group === 'armors'
              ? [...current.items[group], { ...emptyArmor, id: nextItemId }]
              : [...current.items[group], { ...emptyOtherItem, id: nextItemId }],
      },
    }))
  }

  const handleItemChange = (
    group: CharacterItemGroupKey,
    index: number,
    fieldName: CharacterItemFieldName | CharacterItemBonusFieldName,
    value: string | number | boolean,
  ) => {
    setForm((current) => ({
      ...current,
      items: {
        ...current.items,
        [group]: current.items[group].map((item, itemIndex) => itemIndex === index
          ? {
              ...item,
              [fieldName]: value,
            }
          : item),
      },
    }))
  }

  const handleItemBonusFieldChange = (
    group: CharacterItemGroupKey,
    index: number,
    previousFieldName: CharacterArmorBonusFieldName,
    nextFieldName: CharacterArmorBonusFieldName,
  ) => {
    setForm((current) => ({
      ...current,
      items: {
        ...current.items,
        [group]: current.items[group].map((item, itemIndex) => {
          if (itemIndex !== index || previousFieldName === nextFieldName) {
            return item
          }

          const previousValue = item[previousFieldName as keyof typeof item]

          return {
            ...item,
            [previousFieldName]: 0,
            [nextFieldName]: typeof previousValue === 'number' ? previousValue : 0,
          }
        }),
      },
    }))
  }

  const handleArmorBonusChange = (index: number, fieldName: CharacterArmorBonusFieldName, value: number) => {
    setForm((current) => ({
      ...current,
      items: {
        ...current.items,
        armors: current.items.armors.map((armor, armorIndex) => armorIndex === index
          ? {
              ...armor,
              [fieldName]: value,
            }
          : armor),
      },
    }))
  }

  const handleWeaponDamageChange = (
    index: number,
    fieldName: CharacterWeaponFieldName,
    value: number | CharacterWeaponDamageDiceType | boolean,
  ) => {
    setForm((current) => ({
      ...current,
      items: {
        ...current.items,
        weapons: current.items.weapons.map((weapon, weaponIndex) => weaponIndex === index
          ? {
              ...weapon,
              [fieldName]: value,
            }
          : weapon),
      },
    }))
  }

  const handleItemRemove = (group: CharacterItemGroupKey, index: number) => {
    setForm((current) => ({
      ...current,
      items: {
        ...current.items,
        [group]: current.items[group].filter((_, itemIndex) => itemIndex !== index),
      },
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const nextForm = {
        uniqueId: form.uniqueId,
        name: form.name.trim(),
        role: form.role,
        type: form.type,
        description: form.description.trim(),
        resistances: form.resistances.trim(),
        special: form.special.trim(),
        attacks: form.attacks.map((attack) => ({
          ...attack,
          name: attack.name.trim(),
          description: attack.description.trim(),
        })),
        items: form.items,
        defenses: form.defenses,
        suggested: {
          attackVsKp: form.suggested.attackVsKp.trim(),
          attackVsOtherDefenses: form.suggested.attackVsOtherDefenses.trim(),
          lowDamage: form.suggested.lowDamage.trim(),
          mediumDamage: form.suggested.mediumDamage.trim(),
          highDamage: form.suggested.highDamage.trim(),
        },
        hp: form.hp,
        level: form.level,
        speed: form.speed,
      }
      await saveMonster(monsterId, nextForm)
      setForm(nextForm)
      setInitialForm(nextForm)
      setSaving(false)
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
      setSaving(false)
    }
  }

  return {
    error,
    form,
    handleAttackAdd,
    handleAttackChange,
    handleAttackRemove,
    handleCancelGenerateAttributes,
    handleConfirmGenerateAttributes,
    handleItemCreateEmpty,
    handleItemChange,
    handleItemBonusFieldChange,
    handleArmorBonusChange,
    handleWeaponDamageChange,
    handleItemRemove,
    handleChange,
    handleDescriptionChange,
    handleGenerateAttributes,
    handleImageChange,
    handleImageRemove,
    handlePrint,
    handleResistancesChange,
    handleSpecialChange,
    handleSubmit,
    hasChanges: JSON.stringify(form) !== JSON.stringify(initialForm),
    imageUrl,
    isGenerateAttributesDialogOpen,
    loading,
    removingImage,
    saving,
    uploadingImage,
  }
}
