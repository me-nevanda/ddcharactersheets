export type MainTabKey = 'heroes' | 'monsters' | 'npcs' | 'adventures' | 'places'

export interface MainPageState {
  activeTab: MainTabKey
  handleTabChange: (tab: MainTabKey) => void
}
