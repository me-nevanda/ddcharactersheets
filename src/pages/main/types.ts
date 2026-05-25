export type MainTabKey = 'heroes' | 'monsters' | 'npcs' | 'adventures' | 'areas' | 'events' | 'contexts'
export type MainCharacterListTabKey = 'groups' | 'list'
export type MainMonsterListTabKey = 'groups' | 'list'
export type MainNpcListTabKey = 'groups' | 'list'

export interface MainPageState {
  activeTab: MainTabKey
  activeCharacterListTab: MainCharacterListTabKey
  activeMonsterListTab: MainMonsterListTabKey
  activeNpcListTab: MainNpcListTabKey
  handleTabChange: (tab: MainTabKey) => void
  handleCharacterListTabChange: (tab: MainCharacterListTabKey) => void
  handleMonsterListTabChange: (tab: MainMonsterListTabKey) => void
  handleNpcListTabChange: (tab: MainNpcListTabKey) => void
}
