import { useEffect, useState, type ChangeEvent, type SubmitEvent } from 'react'
import { useParams } from 'react-router-dom'
import { useI18n } from '@i18n/index'
import { deleteNpcImage, getNpc, saveNpc, uploadNpcImage } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import { normalizeItems } from '@pages/CharacterEditPage/characterEditPageLogic'
import { emptyArmor, emptyItems, emptyOtherItem, emptyWeapon } from '@pages/CharacterEditPage/characterEditPageUtils'
import type { CharacterArmorBonusFieldName, CharacterItemBonusFieldName, CharacterWeaponDamageDiceType, CharacterWeaponFieldName } from '@appTypes/character'
import type { NpcAttack, NpcAttackAction, NpcAttackAreaType, NpcAttackType, NpcData, NpcDefenses, NpcHistoryEntry, NpcRole, NpcSuggestedStats, NpcType } from '@appTypes/npc'
import type { CharacterItemFieldName, CharacterItemGroupKey } from '@pages/CharacterEditPage/types'
import { useNpcAttributeGeneration } from './npcAttributeGenerationHooks'
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
  suggested: {
    attackVsKp: '',
    attackVsOtherDefenses: '',
    lowDamage: '',
    mediumDamage: '',
    highDamage: '',
    customDamage: '',
  },
  hp: 0,
  level: 1,
  speed: 6,
  isStory: false,
  isDead: false,
  history: [],
}

const defenseFields = ['kp', 'fortitude', 'reflex', 'will'] as const satisfies readonly (keyof NpcDefenses)[]
const suggestedFields = ['attackVsKp', 'attackVsOtherDefenses', 'lowDamage', 'mediumDamage', 'highDamage', 'customDamage'] as const satisfies readonly (keyof NpcSuggestedStats)[]
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

const isSuggestedField = (name: string): name is keyof NpcSuggestedStats => {
  return suggestedFields.includes(name as keyof NpcSuggestedStats)
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

const normalizeStatInputValue = (value: string, maxValue = 999): number => {
  const parsedValue = Number.parseInt(value, 10)

  if (!Number.isFinite(parsedValue)) {
    return 0
  }

  return Math.min(maxValue, Math.max(0, Math.trunc(parsedValue)))
}

const normalizeSuggestedInputValue = (value: string): string => {
  return value
}

const normalizeSuggestedStats = (suggested: Partial<Record<keyof NpcSuggestedStats, unknown>> | undefined): NpcSuggestedStats => {
  return {
    attackVsKp: typeof suggested?.attackVsKp === 'string' ? normalizeSuggestedInputValue(suggested.attackVsKp) : '',
    attackVsOtherDefenses: typeof suggested?.attackVsOtherDefenses === 'string' ? normalizeSuggestedInputValue(suggested.attackVsOtherDefenses) : '',
    lowDamage: typeof suggested?.lowDamage === 'string' ? normalizeSuggestedInputValue(suggested.lowDamage) : '',
    mediumDamage: typeof suggested?.mediumDamage === 'string' ? normalizeSuggestedInputValue(suggested.mediumDamage) : '',
    highDamage: typeof suggested?.highDamage === 'string' ? normalizeSuggestedInputValue(suggested.highDamage) : '',
    customDamage: typeof suggested?.customDamage === 'string' ? normalizeSuggestedInputValue(suggested.customDamage) : '',
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

  return Math.min(35, Math.max(0, Math.trunc(parsedValue)))
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
    attackNotApplicable: false,
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
    attackNotApplicable: attack.attackNotApplicable === true,
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

const createNpcHistoryEntryId = (): string => {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const normalizeNpcHistoryEntries = (history: unknown): NpcHistoryEntry[] => {
  if (!Array.isArray(history)) {
    return []
  }

  return history
    .filter((entry): entry is Partial<Record<keyof NpcHistoryEntry, unknown>> => typeof entry === 'object' && entry !== null)
    .map((entry) => ({
      id: typeof entry.id === 'string' && entry.id.trim().length > 0 ? entry.id : createNpcHistoryEntryId(),
      title: typeof entry.title === 'string' ? entry.title : '',
      content: typeof entry.content === 'string' ? entry.content : '',
    }))
}

export const useNpcEditPage = (): NpcEditPageState => {
  const { t } = useI18n()
  const { generateNpcAttributes } = useNpcAttributeGeneration()
  const { npcId = '' } = useParams()
  const [form, setForm] = useState<NpcData>(emptyNpcForm)
  const [initialForm, setInitialForm] = useState<NpcData>(emptyNpcForm)
  const [error, setError] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [removingImage, setRemovingImage] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [isGenerateAttributesDialogOpen, setGenerateAttributesDialogOpen] = useState(false)

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
          suggested: normalizeSuggestedStats(npc.suggested),
          hp: npc.hp,
          level: npc.level,
          speed: npc.speed,
          isStory: npc.isStory,
          isDead: npc.isDead,
          history: normalizeNpcHistoryEntries(npc.history),
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
        [name]: name === 'level' ? normalizeLevelInputValue(value) : normalizeStatInputValue(value, name === 'hp' ? 9999 : 999),
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
    setGenerateAttributesDialogOpen(true)
  }

  const handleCancelGenerateAttributes = () => {
    setGenerateAttributesDialogOpen(false)
  }

  const handleConfirmGenerateAttributes = () => {
    setForm((current) => {
      const generated = generateNpcAttributes(current.level, current.role, current.type)
      return {
        ...current,
        ...generated,
        suggested: {
          ...current.suggested,
          ...generated.suggested,
        },
      }
    })
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

  const handleIsStoryToggle = (event: ChangeEvent<HTMLInputElement>) => {
    const nextIsStory = event.target.checked
    setForm((current) => ({
      ...current,
      isStory: nextIsStory,
    }))
  }

  const handleIsDeadToggle = (event: ChangeEvent<HTMLInputElement>) => {
    const nextIsDead = event.target.checked
    setForm((current) => ({
      ...current,
      isDead: nextIsDead,
    }))
  }

  const handleHistoryEntryCreateEmpty = () => {
    setForm((current) => ({
      ...current,
      history: [
        ...current.history,
        {
          id: createNpcHistoryEntryId(),
          title: '',
          content: '',
        },
      ],
    }))
  }

  const handleHistoryEntryChange = (index: number, fieldName: keyof NpcHistoryEntry, value: string) => {
    setForm((current) => ({
      ...current,
      history: current.history.map((entry, entryIndex) => (entryIndex === index ? { ...entry, [fieldName]: value } : entry)),
    }))
  }

  const handleHistoryEntryRemove = (index: number) => {
    setForm((current) => ({
      ...current,
      history: current.history.filter((_entry, entryIndex) => entryIndex !== index),
    }))
  }

  const handleAttackAdd = (type: NpcAttackType) => {
    setForm((current) => ({
      ...current,
      attacks: [...current.attacks, createEmptyNpcAttack(type)],
    }))
  }

  const handleAttackChange = (index: number, fieldName: keyof NpcAttack, value: string | number | boolean) => {
    setForm((current) => ({
      ...current,
      attacks: current.attacks.map((attack, attackIndex) => {
        if (attackIndex !== index) {
          return attack
        }

        if (fieldName === 'attackNotApplicable') {
          return {
            ...attack,
            attackNotApplicable: value === true,
          }
        }

        if (typeof value === 'boolean') {
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

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
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
          customDamage: form.suggested.customDamage.trim(),
        },
        hp: form.hp,
        level: form.level,
        speed: form.speed,
        isStory: form.isStory,
        isDead: form.isDead,
        history: form.history.map((entry) => ({
          id: entry.id,
          title: entry.title.trim(),
          content: entry.content.trim(),
        })),
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
    handleHistoryEntryChange,
    handleHistoryEntryCreateEmpty,
    handleHistoryEntryRemove,
    handlePrint,
    handleResistancesChange,
    handleSpecialChange,
    handleIsStoryToggle,
    handleIsDeadToggle,
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
