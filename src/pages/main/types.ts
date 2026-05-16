export type MainTabKey = 'heroes' | 'monsters'

export interface MainPageState {
  activeTab: MainTabKey
  handleTabChange: (tab: MainTabKey) => void
}
