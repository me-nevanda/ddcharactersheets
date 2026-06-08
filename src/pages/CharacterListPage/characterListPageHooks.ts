import { useEffect, useState } from 'react'
import type { Dispatch, SubmitEventHandler, SetStateAction, SyntheticEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCharacter, createCharacterGroup, deleteCharacter, deleteCharacterGroup, listCharacterGroups, listCharacters } from '@lib/api'
import { getErrorMessage } from '@lib/errors'
import { useUnnamedCharacterImageFallback } from '@pages/characterPageHooks'
import { useCharacterPresentation } from '@pages/characterPresentationHooks'
import type { EditReturnState } from '@pages/useEditReturnNavigation'
import type { Character, CharacterGroup } from '@appTypes/character'
import type { CharacterGroupCardViewModel, CharacterListCardViewModel } from './types'

const getPlainTextDescription = (description: string): string => {
  if (!description) {
    return ''
  }
  if (typeof document === 'undefined') {
    return description
  }
  const template = document.createElement('template')
  template.innerHTML = description
  return (template.content.textContent ?? '').trim()
}

const normalizeSearchValue = (value: string): string => {
  return value.trim().toLocaleLowerCase()
}

const characterListReturnState: EditReturnState = {
  characterListTab: 'list',
  mainTab: 'heroes',
  returnTo: '/',
}

const characterGroupListReturnState: EditReturnState = {
  characterListTab: 'groups',
  mainTab: 'heroes',
  returnTo: '/',
}

export const useCharacterListData = (t: (key: string) => string) => {
  const [characters, setCharacters] = useState<Character[]>([])
  const [groups, setGroups] = useState<CharacterGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingGroups, setLoadingGroups] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const loadCharacters = async () => {
      try {
        const [nextCharacters, nextGroups] = await Promise.all([
          listCharacters(),
          listCharacterGroups(),
        ])
        if (!cancelled) {
          setCharacters(nextCharacters)
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
    void loadCharacters()
    return () => {
      cancelled = true
    }
  }, [t])

  return {
    characters,
    error,
    groups,
    loading,
    loadingGroups,
    setCharacters,
    setError,
    setGroups,
  }
}

export const useCharacterListActions = (
  t: (key: string) => string,
  setCharacters: Dispatch<SetStateAction<Character[]>>,
  setError: Dispatch<SetStateAction<string>>,
  setGroups: Dispatch<SetStateAction<CharacterGroup[]>>,
) => {
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)
  const [creatingGroup, setCreatingGroup] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [groupDeletingId, setGroupDeletingId] = useState('')
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null)
  const [groupToDelete, setGroupToDelete] = useState<CharacterGroup | null>(null)
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false)
  const [groupName, setGroupName] = useState('')

  const openCharacter = (characterId: string, returnState: EditReturnState = characterListReturnState) => {
    navigate(`/characters/${characterId}/edit`, { state: returnState })
  }

  const openGroup = (groupId: string) => {
    navigate(`/character-groups/${groupId}/edit`, { state: characterGroupListReturnState })
  }

  const handleCreateCharacter = async () => {
    setCreating(true)
    setError('')
    try {
      const character = await createCharacter()
      navigate(`/characters/${character.id}/edit`, { state: characterListReturnState })
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

  const handleCreateGroupSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()

    const nextName = groupName.trim()
    if (!nextName) {
      return
    }

    setCreatingGroup(true)
    setError('')

    try {
      const group = await createCharacterGroup(nextName)
      navigate(`/character-groups/${group.id}/edit`, { state: characterGroupListReturnState })
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
    } finally {
      setCreatingGroup(false)
    }
  }

  const handleOpenDeleteDialog = (character: Character) => {
    setCharacterToDelete(character)
  }

  const handleCloseDeleteDialog = () => {
    setCharacterToDelete(null)
  }

  const handleConfirmDeleteCharacter = async () => {
    if (!characterToDelete) {
      return
    }
    setDeletingId(characterToDelete.id)
    setError('')
    try {
      await deleteCharacter(characterToDelete.id)
      setCharacters((currentCharacters) => currentCharacters.filter((item) => item.id !== characterToDelete.id))
      setCharacterToDelete(null)
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
    } finally {
      setDeletingId('')
    }
  }

  const handleOpenDeleteGroupDialog = (group: CharacterGroup) => {
    setGroupToDelete(group)
  }

  const handleCloseDeleteGroupDialog = () => {
    setGroupToDelete(null)
  }

  const handleConfirmDeleteCharacterGroup = async () => {
    if (!groupToDelete) {
      return
    }

    setGroupDeletingId(groupToDelete.id)
    setError('')

    try {
      await deleteCharacterGroup(groupToDelete.id)
      setGroups((currentGroups) => currentGroups.filter((group) => group.id !== groupToDelete.id))
      setGroupToDelete(null)
    } catch (nextError) {
      setError(getErrorMessage(t, nextError))
    } finally {
      setGroupDeletingId('')
    }
  }

  return {
    characterToDelete,
    creating,
    creatingGroup,
    deletingId,
    groupDeletingId,
    groupName,
    groupToDelete,
    handleCancelCreateGroup,
    handleChangeGroupName,
    handleCloseDeleteDialog,
    handleCloseDeleteGroupDialog,
    handleConfirmDeleteCharacter,
    handleConfirmDeleteCharacterGroup,
    handleCreateCharacter,
    handleCreateGroupSubmit,
    handleOpenCreateGroupDialog,
    handleOpenDeleteDialog,
    handleOpenDeleteGroupDialog,
    openCharacter,
    openGroup,
    showCreateGroupDialog,
  }
}

export const useCharacterListCards = (characters: Character[], deletingId: string, listSearch: string, openCharacter: (characterId: string) => void, handleOpenDeleteDialog: (character: Character) => void): CharacterListCardViewModel[] => {
  const { getAlignmentLabel, getCharacterClassSrc, getCharacterLabel, getCharacterPortraitSrc, getClassLabel, getGenderLabel, getRaceLabel } = useCharacterPresentation()
  const normalizedListSearch = normalizeSearchValue(listSearch)
  const filteredCharacters = normalizedListSearch
    ? characters.filter((character) => normalizeSearchValue(getCharacterLabel(character.name)).includes(normalizedListSearch))
    : characters

  return filteredCharacters.map((character) => ({
    id: character.id,
    alignmentLabel: getAlignmentLabel(character.alignment),
    classLabel: getClassLabel(character.class),
    deleting: deletingId === character.id,
    description: getPlainTextDescription(character.description),
    genderLabel: getGenderLabel(character.gender),
    label: getCharacterLabel(character.name),
    level: character.level,
    onDeleteClick: (event) => {
      event.stopPropagation()
      handleOpenDeleteDialog(character)
    },
    onKeyDown: (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        openCharacter(character.id)
      }
    },
    onOpen: () => {
      openCharacter(character.id)
    },
    imageSrc: character.imageUrl,
    portraitSrc: getCharacterPortraitSrc(character.race, character.gender),
    raceLabel: getRaceLabel(character.race),
    classSrc: getCharacterClassSrc(character.class),
  }))
}

export const useCharacterGroupCards = (
  groups: CharacterGroup[],
  characters: Character[],
  groupDeletingId: string,
  groupSearch: string,
  openCharacter: (characterId: string, returnState?: EditReturnState) => void,
  openGroup: (groupId: string) => void,
  handleOpenDeleteGroupDialog: (group: CharacterGroup) => void,
  handleImageError: (event: SyntheticEvent<HTMLImageElement>) => void,
): CharacterGroupCardViewModel[] => {
  const { getCharacterClassSrc, getCharacterLabel, getCharacterPortraitSrc } = useCharacterPresentation()
  const normalizedGroupSearch = normalizeSearchValue(groupSearch)
  const filteredGroups = normalizedGroupSearch
    ? groups.filter((group) => {
      const groupNameMatches = normalizeSearchValue(group.name).includes(normalizedGroupSearch)
      const characterNameMatches = group.characterIds
        .map((characterId) => characters.find((character) => character.id === characterId))
        .filter((character): character is Character => Boolean(character))
        .some((character) => normalizeSearchValue(getCharacterLabel(character.name)).includes(normalizedGroupSearch))

      return groupNameMatches || characterNameMatches
    })
    : groups

  return filteredGroups.map((group) => ({
    characterCount: group.characterIds.length,
    characterThumbnails: group.characterIds
      .map((characterId) => characters.find((character) => character.id === characterId))
      .filter((character): character is Character => Boolean(character))
      .slice(0, 4)
      .map((character) => ({
        id: character.id,
        imageSrc: character.imageUrl,
        label: getCharacterLabel(character.name),
        onImageError: handleImageError,
        onKeyDown: (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            event.stopPropagation()
            openCharacter(character.id, characterGroupListReturnState)
          }
        },
        onOpen: (event) => {
          event.stopPropagation()
          openCharacter(character.id, characterGroupListReturnState)
        },
        portraitSrc: getCharacterPortraitSrc(character.race, character.gender),
        classSrc: getCharacterClassSrc(character.class),
      })),
    deleting: groupDeletingId === group.id,
    hasMoreCharacters: group.characterIds.length > 4,
    id: group.id,
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
}

export const useCharacterCardImageError = () => {
  return useUnnamedCharacterImageFallback()
}

export const useCharacterDialogLabel = (character: Character | null) => {
  const { getCharacterLabel } = useCharacterPresentation()
  return getCharacterLabel(character?.name)
}
