export type MainTabKey = 'heroes' | 'monsters' | 'npcs' | 'adventures' | 'areas' | 'events' | 'contexts'
export type MainMonsterListTabKey = 'groups' | 'list'
export type MainNpcListTabKey = 'groups' | 'list'

export interface MainPageState {
  activeTab: MainTabKey
  activeMonsterListTab: MainMonsterListTabKey
  activeNpcListTab: MainNpcListTabKey
  handleTabChange: (tab: MainTabKey) => void
  handleMonsterListTabChange: (tab: MainMonsterListTabKey) => void
  handleNpcListTabChange: (tab: MainNpcListTabKey) => void
}
