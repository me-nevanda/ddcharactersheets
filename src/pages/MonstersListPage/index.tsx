import { useI18n } from '@i18n/index'
import { CharacterListHeader } from '@pages/CharacterListPage/CharacterListHeader'
import { useMonstersListPage } from './monstersListPageHooks'
import styles from './style.module.scss'

export const MonstersListPage = () => {
  const { t } = useI18n()
  const { handleCreateMinion } = useMonstersListPage()

  return (
    <>
      <CharacterListHeader actionLabel={t('pages.characterList.actions.addMinion')} creating={false} onAction={handleCreateMinion} />
      <section className={styles.emptyPanel} aria-label={t('pages.main.tabs.monsters')} />
    </>
  )
}
