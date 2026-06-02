import { useMemo } from 'react'
import { useLocation, useNavigate, type Location } from 'react-router-dom'
import { useMainPageContext } from '@pages/main/mainPageContext'
import type { MainCharacterListTabKey, MainMonsterListTabKey, MainNpcListTabKey, MainTabKey } from '@pages/main/types'

export interface EditReturnState {
  characterListTab?: MainCharacterListTabKey
  mainTab?: MainTabKey
  monsterListTab?: MainMonsterListTabKey
  npcListTab?: MainNpcListTabKey
  returnTo: string
}

const isMainTabKey = (value: unknown): value is MainTabKey => {
  return value === 'heroes' || value === 'monsters' || value === 'npcs' || value === 'adventures' || value === 'areas' || value === 'events' || value === 'contexts'
}

const isListTabKey = (value: unknown): value is MainCharacterListTabKey | MainMonsterListTabKey | MainNpcListTabKey => {
  return value === 'groups' || value === 'list'
}

const isSafeReturnPath = (value: unknown): value is string => {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
}

export const getCurrentEditReturnState = (location: Location, overrides: Omit<EditReturnState, 'returnTo'> = {}): EditReturnState => {
  return {
    ...overrides,
    returnTo: `${location.pathname}${location.search}${location.hash}`,
  }
}

const readEditReturnState = (state: unknown, fallback: EditReturnState): EditReturnState => {
  if (!state || typeof state !== 'object') {
    return fallback
  }

  const source = state as Record<string, unknown>
  return {
    characterListTab: isListTabKey(source.characterListTab) ? source.characterListTab : fallback.characterListTab,
    mainTab: isMainTabKey(source.mainTab) ? source.mainTab : fallback.mainTab,
    monsterListTab: isListTabKey(source.monsterListTab) ? source.monsterListTab : fallback.monsterListTab,
    npcListTab: isListTabKey(source.npcListTab) ? source.npcListTab : fallback.npcListTab,
    returnTo: isSafeReturnPath(source.returnTo) ? source.returnTo : fallback.returnTo,
  }
}

export const useEditReturnNavigation = (fallback: EditReturnState) => {
  const location = useLocation()
  const navigate = useNavigate()
  const {
    handleCharacterListTabChange,
    handleMonsterListTabChange,
    handleNpcListTabChange,
    handleTabChange,
  } = useMainPageContext()

  const returnState = useMemo(() => readEditReturnState(location.state, fallback), [fallback, location.state])

  const applyReturnTabs = () => {
    if (returnState.mainTab) {
      handleTabChange(returnState.mainTab)
    }
    if (returnState.characterListTab) {
      handleCharacterListTabChange(returnState.characterListTab)
    }
    if (returnState.monsterListTab) {
      handleMonsterListTabChange(returnState.monsterListTab)
    }
    if (returnState.npcListTab) {
      handleNpcListTabChange(returnState.npcListTab)
    }
  }

  const navigateBack = () => {
    applyReturnTabs()
    navigate(returnState.returnTo)
  }

  return {
    applyReturnTabs,
    navigateBack,
    returnTo: returnState.returnTo,
  }
}
