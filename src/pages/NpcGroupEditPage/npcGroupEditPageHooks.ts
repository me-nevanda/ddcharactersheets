import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useI18n } from '@i18n/index'
import { getNpcGroup, listNpcs, saveNpcGroup } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import { getCurrentEditReturnState } from '@pages/useEditReturnNavigation'
import type { Npc, NpcGroup } from '@appTypes/npc'
import type { AssignedNpcGroupNpcViewModel, NpcGroupEditPageState, NpcGroupNpcOptionViewModel, NpcGroupNpcViewModel } from './types'

const emptyGroup: NpcGroup = {
  id: '',
  name: '',
  npcIds: [],
  updatedAt: '',
}

const buildTextPreview = (value: string): string => {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const buildNpcViewModel = (
  npc: Npc,
  t: ReturnType<typeof useI18n>['t'],
  openNpc: (npcId: string) => void,
): NpcGroupNpcViewModel => {
  const isStory = npc.isStory === true
  return {
    descriptionPreview: buildTextPreview(npc.description),
    fileName: npc.id,
    id: npc.id,
    imageSrc: npc.imageUrl || '/favicon.png',
    isDead: npc.isDead === true,
    isElite: !isStory && npc.type === 'elite',
    isMinion: !isStory && npc.type === 'minion',
    isNormal: !isStory && npc.type === 'normal',
    isSolo: !isStory && npc.type === 'solo',
    isStory,
    label: npc.name.trim() || t('pages.npcList.unnamedNpc'),
    level: npc.level,
    onKeyDown: (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        openNpc(npc.id)
      }
    },
    onOpen: () => {
      openNpc(npc.id)
    },
    roleLabel: t(`pages.npcEdit.roleOptions.${npc.role}`),
    storyLabel: t('pages.npcEdit.fields.isStory'),
    typeLabel: t(`pages.npcEdit.typeOptions.${npc.type}`),
  }
}

export const useNpcGroupEditPage = (): NpcGroupEditPageState => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const { groupId = '' } = useParams()
  const [form, setForm] = useState<NpcGroup>(emptyGroup)
  const [initialForm, setInitialForm] = useState<NpcGroup>(emptyGroup)
  const [npcs, setNpcs] = useState<Npc[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [npcSearch, setNpcSearch] = useState('')
  const [assignedNpcSearch, setAssignedNpcSearch] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadGroup = async () => {
      try {
        const [nextGroup, nextNpcs] = await Promise.all([
          getNpcGroup(groupId),
          listNpcs(),
        ])

        if (!cancelled) {
          setForm(nextGroup)
          setInitialForm(nextGroup)
          setNpcs(nextNpcs)
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

    void loadGroup()

    return () => {
      cancelled = true
    }
  }, [groupId, t])

  const handleChangeGroupName = (value: string) => {
    setForm((current) => ({
      ...current,
      name: value,
    }))
  }

  const handleChangeNpcSearch = (value: string) => {
    setNpcSearch(value)
  }

  const handleChangeAssignedNpcSearch = (value: string) => {
    setAssignedNpcSearch(value)
  }

  const handleAddNpc = (npcId: string) => {
    setForm((current) => {
      if (current.npcIds.includes(npcId)) {
        return current
      }

      return {
        ...current,
        npcIds: [...current.npcIds, npcId],
      }
    })
  }

  const handleRemoveNpc = (npcId: string) => {
    setForm((current) => ({
      ...current,
      npcIds: current.npcIds.filter((currentNpcId) => currentNpcId !== npcId),
    }))
  }

  const handleSubmit: NpcGroupEditPageState['handleSubmit'] = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const savedGroup = await saveNpcGroup(groupId, {
        ...form,
        name: form.name.trim(),
      })
      setForm(savedGroup)
      setInitialForm(savedGroup)
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
    } finally {
      setSaving(false)
    }
  }

  const openNpc = (npcId: string) => {
    navigate(`/npcs/${npcId}/edit`, {
      state: getCurrentEditReturnState(location, {
        mainTab: 'npcs',
        npcListTab: 'groups',
      }),
    })
  }

  const assignedNpcIds = new Set(form.npcIds)
  const normalizedAssignedNpcSearch = assignedNpcSearch.trim().toLocaleLowerCase()
  const allAssignedNpcs: AssignedNpcGroupNpcViewModel[] = form.npcIds
    .map((npcId) => npcs.find((npc) => npc.id === npcId))
    .filter((npc): npc is Npc => Boolean(npc))
    .map((npc) => ({
      ...buildNpcViewModel(npc, t, openNpc),
      onRemoveClick: (event) => {
        event.stopPropagation()
        handleRemoveNpc(npc.id)
      },
    }))
  const assignedNpcs = normalizedAssignedNpcSearch.length >= 3
    ? allAssignedNpcs.filter((npc) => npc.label.toLocaleLowerCase().includes(normalizedAssignedNpcSearch))
    : allAssignedNpcs

  const normalizedNpcSearch = npcSearch.trim().toLocaleLowerCase()
  const availableNpcs = npcs.filter((npc) => !assignedNpcIds.has(npc.id))
  const filteredNpcs = normalizedNpcSearch.length >= 3
    ? availableNpcs.filter((npc) => (npc.name.trim() || t('pages.npcList.unnamedNpc')).toLocaleLowerCase().includes(normalizedNpcSearch))
    : availableNpcs.slice(0, 8)
  const npcOptions: NpcGroupNpcOptionViewModel[] = filteredNpcs.map((npc) => ({
    ...buildNpcViewModel(npc, t, openNpc),
    onAddClick: (event) => {
      event.stopPropagation()
      handleAddNpc(npc.id)
    },
  }))

  return {
    assignedNpcs,
    assignedNpcSearch,
    error,
    groupName: form.name,
    handleChangeAssignedNpcSearch,
    handleChangeGroupName,
    handleChangeNpcSearch,
    handleSubmit,
    hasChanges: JSON.stringify(form) !== JSON.stringify(initialForm),
    loading,
    npcOptions,
    npcSearch,
    saving,
  }
}
