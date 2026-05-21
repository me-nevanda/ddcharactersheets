import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '@i18n/index'
import { createNpc, createNpcGroup, deleteNpc, deleteNpcGroup, listNpcGroups, listNpcs } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import { useMainPageContext } from '@pages/main/mainPageContext'
import type { Npc, NpcGroup } from '@appTypes/npc'
import type { NpcGroupCardViewModel, NpcListCardViewModel, NpcListTabKey, NpcsListPageState } from './types'

const buildTextPreview = (value: string): string => {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const getNpcFileName = (npcId: string): string => {
  return `${npcId}.json`
}

export const useNpcsListPage = (): NpcsListPageState => {
  const { t } = useI18n()
  const { activeNpcListTab, handleNpcListTabChange } = useMainPageContext()
  const navigate = useNavigate()
  const [npcs, setNpcs] = useState<Npc[]>([])
  const [groups, setGroups] = useState<NpcGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingGroups, setLoadingGroups] = useState(true)
  const [creating, setCreating] = useState(false)
  const [creatingGroup, setCreatingGroup] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [groupDeletingId, setGroupDeletingId] = useState('')
  const [npcToDelete, setNpcToDelete] = useState<Npc | null>(null)
  const [groupToDelete, setGroupToDelete] = useState<NpcGroup | null>(null)
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadNpcs = async () => {
      try {
        const [nextNpcs, nextGroups] = await Promise.all([
          listNpcs(),
          listNpcGroups(),
        ])
        if (!cancelled) {
          setNpcs(nextNpcs)
          setGroups(nextGroups)
          setError('')
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(getErrorMessage(t, nextError))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
          setLoadingGroups(false)
        }
      }
    }

    void loadNpcs()

    return () => {
      cancelled = true
    }
  }, [t])

  const openNpc = (npcId: string) => {
    navigate(`/npcs/${npcId}/edit`)
  }

  const openGroup = (groupId: string) => {
    navigate(`/npc-groups/${groupId}/edit`)
  }

  const handleCreateNpc = async () => {
    setCreating(true)
    setError('')
    try {
      const npc = await createNpc()
      navigate(`/npcs/${npc.id}/edit`)
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
      setCreating(false)
    }
  }

  const handleOpenCreateGroupDialog = () => {
    setGroupName('')
    setShowCreateGroupDialog(true)
  }

  const handleCancelCreateGroup = () => {
    if (creatingGroup) {
      return
    }

    setGroupName('')
    setShowCreateGroupDialog(false)
  }

  const handleChangeGroupName = (value: string) => {
    setGroupName(value)
  }

  const handleCreateGroupSubmit: NpcsListPageState['handleCreateGroupSubmit'] = async (event) => {
    event.preventDefault()

    const nextName = groupName.trim()
    if (!nextName) {
      return
    }

    setCreatingGroup(true)
    setError('')

    try {
      const group = await createNpcGroup(nextName)
      navigate(`/npc-groups/${group.id}/edit`)
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
    } finally {
      setCreatingGroup(false)
    }
  }

  const handleOpenDeleteDialog = (npc: Npc) => {
    setNpcToDelete(npc)
  }

  const handleCloseDeleteDialog = () => {
    setNpcToDelete(null)
  }

  const handleConfirmDeleteNpc = async () => {
    if (!npcToDelete) {
      return
    }

    setDeletingId(npcToDelete.id)
    setError('')

    try {
      await deleteNpc(npcToDelete.id)
      setNpcs((currentNpcs) => currentNpcs.filter((npc) => npc.id !== npcToDelete.id))
      setNpcToDelete(null)
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
    } finally {
      setDeletingId('')
    }
  }

  const handleOpenDeleteGroupDialog = (group: NpcGroup) => {
    setGroupToDelete(group)
  }

  const handleCloseDeleteGroupDialog = () => {
    setGroupToDelete(null)
  }

  const handleConfirmDeleteNpcGroup = async () => {
    if (!groupToDelete) {
      return
    }

    setGroupDeletingId(groupToDelete.id)
    setError('')

    try {
      await deleteNpcGroup(groupToDelete.id)
      setGroups((currentGroups) => currentGroups.filter((group) => group.id !== groupToDelete.id))
      setGroupToDelete(null)
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
    } finally {
      setGroupDeletingId('')
    }
  }

  const cards: NpcListCardViewModel[] = npcs.map((npc) => ({
    deleting: deletingId === npc.id,
    descriptionPreview: buildTextPreview(npc.description),
    id: npc.id,
    imageSrc: npc.imageUrl || '/favicon.png',
    isElite: npc.type === 'elite',
    isMinion: npc.type === 'minion',
    isNormal: npc.type === 'normal',
    isSolo: npc.type === 'solo',
    label: npc.name.trim() || t('pages.npcList.unnamedNpc'),
    level: npc.level,
    onDeleteClick: (event) => {
      event.stopPropagation()
      handleOpenDeleteDialog(npc)
    },
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
    typeLabel: t(`pages.npcEdit.typeOptions.${npc.type}`),
  }))

  const groupCards: NpcGroupCardViewModel[] = groups.map((group) => ({
    deleting: groupDeletingId === group.id,
    hasMoreNpcs: group.npcFileNames.length > 4,
    id: group.id,
    npcCount: group.npcFileNames.length,
    npcThumbnails: group.npcFileNames
      .map((fileName) => npcs.find((npc) => getNpcFileName(npc.id) === fileName))
      .filter((npc): npc is Npc => Boolean(npc))
      .slice(0, 4)
      .map((npc) => ({
        imageSrc: npc.imageUrl || '/favicon.png',
        label: npc.name.trim() || t('pages.npcList.unnamedNpc'),
      })),
    name: group.name,
    onDeleteClick: (event) => {
      event.stopPropagation()
      handleOpenDeleteGroupDialog(group)
    },
    onKeyDown: (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        openGroup(group.id)
      }
    },
    onOpen: () => {
      openGroup(group.id)
    },
  }))

  return {
    activeTab: activeNpcListTab,
    cards,
    creating,
    creatingGroup,
    deletingId,
    deleteDialogNpcName: npcToDelete?.name.trim() || t('pages.npcList.unnamedNpc'),
    deleteDialogGroupName: groupToDelete?.name.trim() || t('pages.npcList.groups.unnamedGroup'),
    error,
    groupDeletingId,
    groupName,
    groupToDelete,
    groups: groupCards,
    handleCancelCreateGroup,
    handleChangeGroupName,
    handleCloseDeleteDialog,
    handleCloseDeleteGroupDialog,
    handleConfirmDeleteNpc,
    handleConfirmDeleteNpcGroup,
    handleCreateGroupSubmit,
    handleCreateNpc,
    handleOpenCreateGroupDialog,
    loading,
    loadingGroups,
    npcToDelete,
    setActiveTab: handleNpcListTabChange as (tab: NpcListTabKey) => void,
    showCreateGroupDialog,
    showEmptyState: !loading && cards.length === 0,
    showEmptyGroupsState: !loadingGroups && groupCards.length === 0,
    showGroupList: !loadingGroups && groupCards.length > 0,
    showNpcGrid: !loading && cards.length > 0,
  }
}
