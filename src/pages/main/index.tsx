import { useI18n } from '@i18n/index'
import { AdventureListPage } from '@pages/AdventureListPage'
import { CharacterListPage } from '@pages/CharacterListPage'
import { ContextsListPage } from '@pages/ContextsListPage'
import { EventsListPage } from '@pages/EventsListPage'
import { MonstersListPage } from '@pages/MonstersListPage'
import { NpcsListPage } from '@pages/NpcsListPage'
import { AreaListPage } from '@pages/AreaListPage'
import { useMainPage } from './mainPageHooks'
import styles from './style.module.scss'

export const MainPage = () => {
  const { t } = useI18n()
  const { activeTab, handleTabChange } = useMainPage()

  return (
    <main className={styles.pageShell}>
      <div className={styles.listBody}>
        <aside className={styles.tabRail} aria-label={t('pages.main.tabsLabel')}>
          <button className={`${styles.tabButton} ${activeTab === 'heroes' ? styles.tabButtonActive : ''}`} type="button" onClick={() => handleTabChange('heroes')}>
            {t('pages.main.tabs.heroes')}
          </button>
          <button className={`${styles.tabButton} ${activeTab === 'monsters' ? styles.tabButtonActive : ''}`} type="button" onClick={() => handleTabChange('monsters')}>
            {t('pages.main.tabs.monsters')}
          </button>
          <button className={`${styles.tabButton} ${activeTab === 'npcs' ? styles.tabButtonActive : ''}`} type="button" onClick={() => handleTabChange('npcs')}>
            {t('pages.main.tabs.npcs')}
          </button>
          <button className={`${styles.tabButton} ${activeTab === 'areas' ? styles.tabButtonActive : ''}`} type="button" onClick={() => handleTabChange('areas')}>
            {t('pages.main.tabs.areas')}
          </button>
          <button className={`${styles.tabButton} ${activeTab === 'events' ? styles.tabButtonActive : ''}`} type="button" onClick={() => handleTabChange('events')}>
            {t('pages.main.tabs.events')}
          </button>
          <button className={`${styles.tabButton} ${activeTab === 'contexts' ? styles.tabButtonActive : ''}`} type="button" onClick={() => handleTabChange('contexts')}>
            {t('pages.main.tabs.contexts')}
          </button>
        </aside>

        <div className={styles.tabPanel}>
          {activeTab === 'heroes' ? <CharacterListPage /> : null}
          {activeTab === 'monsters' ? <MonstersListPage /> : null}
          {activeTab === 'npcs' ? <NpcsListPage /> : null}
          {activeTab === 'adventures' ? <AdventureListPage /> : null}
          {activeTab === 'areas' ? <AreaListPage /> : null}
          {activeTab === 'events' ? <EventsListPage /> : null}
          {activeTab === 'contexts' ? <ContextsListPage /> : null}
        </div>
      </div>
    </main>
  )
}
