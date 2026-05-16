import { useState } from 'react'
import type { MainPageState, MainTabKey } from './types'

export const useMainPage = (): MainPageState => {
  const [activeTab, setActiveTab] = useState<MainTabKey>('heroes')

  return {
    activeTab,
    handleTabChange: setActiveTab,
  }
}
