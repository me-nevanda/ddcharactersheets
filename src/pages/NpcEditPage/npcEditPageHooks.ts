import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { useI18n } from '@i18n/index'
import { deleteNpcImage, getNpc, saveNpc, uploadNpcImage } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import { normalizeItems } from '@pages/CharacterEditPage/characterEditPageLogic'
import { emptyArmor, emptyItems, emptyOtherItem, emptyWeapon } from '@pages/CharacterEditPage/characterEditPageUtils'
import type { CharacterArmorBonusFieldName, CharacterItemBonusFieldName, CharacterWeaponDamageDiceType, CharacterWeaponFieldName } from '@appTypes/character'
import type { NpcAttack, NpcAttackAction, NpcAttackAreaType, NpcAttackType, NpcData, NpcDefenses, NpcRole, NpcType } from '@appTypes/npc'
import type { CharacterItemFieldName, CharacterItemGroupKey } from '@pages/CharacterEditPage/types'
import type { NpcEditPageState } from './types'

const emptyNpcForm: NpcData = {
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
  hp: 0,
  level: 1,
  speed: 6,
}

const defenseFields = ['kp', 'fortitude', 'reflex', 'will'] as const satisfies readonly (keyof NpcDefenses)[]
const numericFields = ['hp', 'level', 'speed'] as const satisfies readonly (keyof Pick<NpcData, 'hp' | 'level' | 'speed'>)[]
const npcRoles = ['skirmisher', 'brute', 'soldier', 'lurker', 'controller', 'artillery'] as const satisfies readonly NpcRole[]
const npcTypes = ['minion', 'normal', 'solo', 'elite'] as const satisfies readonly NpcType[]
const npcAttackTypes = ['standard', 'unlimited', 'encounter', 'daily'] as const satisfies readonly NpcAttackType[]
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

const isDefenseField = (name: string): name is keyof NpcDefenses => {
  return defenseFields.includes(name as keyof NpcDefenses)
}

const isNumericField = (name: string): name is (typeof numericFields)[number] => {
  return numericFields.includes(name as (typeof numericFields)[number])
}

const normalizeNpcType = (value: string): NpcType => {
  return npcTypes.includes(value as NpcType) ? (value as NpcType) : 'normal'
}

const normalizeNpcRole = (value: string): NpcRole => {
  return npcRoles.includes(value as NpcRole) ? (value as NpcRole) : 'skirmisher'
}

const createNpcAttackId = (): string => {
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

const normalizeLevelInputValue = (value: string): number => {
  const parsedValue = Number.parseInt(value, 10)

  if (!Number.isFinite(parsedValue)) {
    return 1
  }

  return Math.min(30, Math.max(1, Math.trunc(parsedValue)))
}

const buildGeneratedNpcAttributes = (level: number, type: NpcType): Pick<NpcData, 'defenses' | 'hp'> => {
  const normalizedLevel = Math.min(30, Math.max(1, Math.trunc(level)))
  const baseHp = 24 + normalizedLevel * 8
  const hp = type === 'minion' ? 1 : type === 'solo' ? baseHp * 4 : type === 'elite' ? baseHp * 2 : baseHp

  return {
    defenses: {
      kp: Math.min(50, 14 + normalizedLevel),
      fortitude: Math.min(50, 12 + normalizedLevel),
      reflex: Math.min(50, 12 + normalizedLevel),
      will: Math.min(50, 12 + normalizedLevel),
    },
    hp,
  }
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

const normalizeAttackAction = (value: unknown): NpcAttackAction => {
  return npcAttackActions.includes(value as NpcAttackAction) ? (value as NpcAttackAction) : 'action'
}

const normalizeAttackType = (value: unknown): NpcAttackType => {
  return npcAttackTypes.includes(value as NpcAttackType) ? (value as NpcAttackType) : 'unlimited'
}

const normalizeAttackArea = (value: unknown): NpcAttackAreaType => {
  return npcAttackAreas.includes(value as NpcAttackAreaType) ? (value as NpcAttackAreaType) : 'point'
}

const normalizeAttackDefense = (value: unknown): keyof NpcDefenses => {
  if (typeof value !== 'string') {
    return 'kp'
  }

  return isDefenseField(value) ? value : 'kp'
}

const createEmptyNpcAttack = (type: NpcAttackType): NpcAttack => {
  return {
    id: createNpcAttackId(),
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

const normalizeNpcAttack = (attack: Partial<Record<keyof NpcAttack, unknown>>, fallbackType: NpcAttackType = 'unlimited'): NpcAttack => {
  return {
    id: typeof attack.id === 'string' && attack.id.trim().length > 0 ? attack.id : createNpcAttackId(),
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

const normalizeNpcAttacks = (attacks: unknown): NpcAttack[] => {
  if (!Array.isArray(attacks)) {
    return []
  }

  return attacks
    .filter((attack): attack is Partial<Record<keyof NpcAttack, unknown>> => typeof attack === 'object' && attack !== null)
    .map((attack) => normalizeNpcAttack(attack))
}

export const useNpcEditPage = (): NpcEditPageState => {
  const { t } = useI18n()
  const { npcId = '' } = useParams()
  const [form, setForm] = useState<NpcData>(emptyNpcForm)
  const [initialForm, setInitialForm] = useState<NpcData>(emptyNpcForm)
  const [error, setError] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [removingImage, setRemovingImage] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadNpc = async () => {
      try {
        const npc = await getNpc(npcId)
        const nextForm = {
          uniqueId: npc.uniqueId,
          name: npc.name,
          role: normalizeNpcRole(npc.role),
          type: normalizeNpcType(npc.type),
          description: npc.description,
          resistances: npc.resistances ?? '',
          special: npc.special ?? '',
          attacks: normalizeNpcAttacks(npc.attacks),
          items: normalizeItems(npc.items),
          defenses: npc.defenses,
          hp: npc.hp,
          level: npc.level,
          speed: npc.speed,
        }
        if (!cancelled) {
          setForm(nextForm)
          setInitialForm(nextForm)
          setImageUrl(npc.imageUrl)
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

    void loadNpc()

    return () => {
      cancelled = true
    }
  }, [npcId, t])

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
        type: normalizeNpcType(value),
      }))
      return
    }

    if (name === 'role') {
      setForm((current) => ({
        ...current,
        role: normalizeNpcRole(value),
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
    setForm((current) => ({
      ...current,
      ...buildGeneratedNpcAttributes(current.level, current.type),
    }))
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
      const npc = await uploadNpcImage(npcId, image)
      setImageUrl(npc.imageUrl ? `${npc.imageUrl}?v=${Date.now()}` : '')
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
      const npc = await deleteNpcImage(npcId)
      setImageUrl(npc.imageUrl)
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
    if (!npcId) {
      return
    }

    window.open(`/npcs/${npcId}/print`, '_blank')
  }

  const handleSpecialChange = (value: string) => {
    setForm((current) => ({
      ...current,
      special: value,
    }))
  }

  const handleAttackAdd = (type: NpcAttackType) => {
    setForm((current) => ({
      ...current,
      attacks: [...current.attacks, createEmptyNpcAttack(type)],
    }))
  }

  const handleAttackChange = (index: number, fieldName: keyof NpcAttack, value: string | number) => {
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
        hp: form.hp,
        level: form.level,
        speed: form.speed,
      }
      await saveNpc(npcId, nextForm)
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
    loading,
    removingImage,
    saving,
    uploadingImage,
  }
}
