import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react'
import type { MainMonsterListTabKey, MainNpcListTabKey, MainPageState, MainTabKey } from './types'

const mainTabStorageKey = 'did.main.activeTab'
const monsterListTabStorageKey = 'did.main.monsterList.activeTab'
const npcListTabStorageKey = 'did.main.npcList.activeTab'

const isMainTabKey = (value: string | null): value is MainTabKey => {
  return value === 'heroes' || value === 'monsters' || value === 'npcs' || value === 'adventures' || value === 'places'
}

const isMainMonsterListTabKey = (value: string | null): value is MainMonsterListTabKey => {
  return value === 'groups' || value === 'list'
}

const isMainNpcListTabKey = (value: string | null): value is MainNpcListTabKey => {
  return value === 'groups' || value === 'list'
}

const getInitialTab = (): MainTabKey => {
  if (typeof window === 'undefined') {
    return 'heroes'
  }

  const storedTab = window.sessionStorage.getItem(mainTabStorageKey)

  return isMainTabKey(storedTab) ? storedTab : 'heroes'
}

const getInitialMonsterListTab = (): MainMonsterListTabKey => {
  if (typeof window === 'undefined') {
    return 'groups'
  }

  const storedTab = window.sessionStorage.getItem(monsterListTabStorageKey)

  return isMainMonsterListTabKey(storedTab) ? storedTab : 'groups'
}

const getInitialNpcListTab = (): MainNpcListTabKey => {
  if (typeof window === 'undefined') {
    return 'groups'
  }

  const storedTab = window.sessionStorage.getItem(npcListTabStorageKey)

  return isMainNpcListTabKey(storedTab) ? storedTab : 'groups'
}

const MainPageContext = createContext<MainPageState | null>(null)

export const MainPageProvider = ({ children }: PropsWithChildren) => {
  const [activeTab, setActiveTab] = useState<MainTabKey>(getInitialTab)
  const [activeMonsterListTab, setActiveMonsterListTab] = useState<MainMonsterListTabKey>(getInitialMonsterListTab)
  const [activeNpcListTab, setActiveNpcListTab] = useState<MainNpcListTabKey>(getInitialNpcListTab)

  useEffect(() => {
    window.sessionStorage.setItem(mainTabStorageKey, activeTab)
  }, [activeTab])

  useEffect(() => {
    window.sessionStorage.setItem(monsterListTabStorageKey, activeMonsterListTab)
  }, [activeMonsterListTab])

  useEffect(() => {
    window.sessionStorage.setItem(npcListTabStorageKey, activeNpcListTab)
  }, [activeNpcListTab])

  return (
    <MainPageContext.Provider value={{ activeTab, activeMonsterListTab, activeNpcListTab, handleTabChange: setActiveTab, handleMonsterListTabChange: setActiveMonsterListTab, handleNpcListTabChange: setActiveNpcListTab }}>
      {children}
    </MainPageContext.Provider>
  )
}

export const useMainPageContext = (): MainPageState => {
  const context = useContext(MainPageContext)

  if (!context) {
    throw new Error('MainPageContext is not available')
  }

  return context
}
