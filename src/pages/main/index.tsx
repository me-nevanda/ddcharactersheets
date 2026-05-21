import { useI18n } from '@i18n/index'
import { AdventureListPage } from '@pages/AdventureListPage'
import { CharacterListPage } from '@pages/CharacterListPage'
import { MonstersListPage } from '@pages/MonstersListPage'
import { PlaceListPage } from '@pages/PlaceListPage'
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
          <button className={`${styles.tabButton} ${activeTab === 'adventures' ? styles.tabButtonActive : ''}`} type="button" onClick={() => handleTabChange('adventures')}>
            {t('pages.main.tabs.adventures')}
          </button>
          <button className={`${styles.tabButton} ${activeTab === 'places' ? styles.tabButtonActive : ''}`} type="button" onClick={() => handleTabChange('places')}>
            {t('pages.main.tabs.places')}
          </button>
        </aside>

        <div className={styles.tabPanel}>
          {activeTab === 'heroes' ? <CharacterListPage /> : null}
          {activeTab === 'monsters' ? <MonstersListPage /> : null}
          {activeTab === 'adventures' ? <AdventureListPage /> : null}
          {activeTab === 'places' ? <PlaceListPage /> : null}
        </div>
      </div>
    </main>
  )
}
