export type MainTabKey = 'heroes' | 'monsters' | 'adventures' | 'places'

export interface MainPageState {
  activeTab: MainTabKey
  handleTabChange: (tab: MainTabKey) => void
}
