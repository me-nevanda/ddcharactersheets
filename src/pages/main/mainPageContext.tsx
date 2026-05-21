import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react'
import type { MainPageState, MainTabKey } from './types'

const mainTabStorageKey = 'did.main.activeTab'

const isMainTabKey = (value: string | null): value is MainTabKey => {
  return value === 'heroes' || value === 'monsters' || value === 'adventures' || value === 'places'
}

const getInitialTab = (): MainTabKey => {
  if (typeof window === 'undefined') {
    return 'heroes'
  }

  const storedTab = window.sessionStorage.getItem(mainTabStorageKey)

  return isMainTabKey(storedTab) ? storedTab : 'heroes'
}

const MainPageContext = createContext<MainPageState | null>(null)

export const MainPageProvider = ({ children }: PropsWithChildren) => {
  const [activeTab, setActiveTab] = useState<MainTabKey>(getInitialTab)

  useEffect(() => {
    window.sessionStorage.setItem(mainTabStorageKey, activeTab)
  }, [activeTab])

  return (
    <MainPageContext.Provider value={{ activeTab, handleTabChange: setActiveTab }}>
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
