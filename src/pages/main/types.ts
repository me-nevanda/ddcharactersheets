export type MainTabKey = 'heroes' | 'monsters' | 'adventures'

export interface MainPageState {
  activeTab: MainTabKey
  handleTabChange: (tab: MainTabKey) => void
}
