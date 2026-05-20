import { AppIcon } from '@components/AppIcon'
import { useI18n } from '@i18n/index'
import { CharacterListHeader } from '@pages/CharacterListPage/CharacterListHeader'
import { useAdventureListPage } from './adventureListPageHooks'
import type { AdventureListCardViewModel } from './types'
import styles from './style.module.scss'

const AdventureListCard = ({ card }: { card: AdventureListCardViewModel }) => {
  const { t } = useI18n()

  return (
    <article className={styles.adventureCard} role="link" tabIndex={0} onClick={card.onOpen} onKeyDown={card.onKeyDown}>
      <div className={styles.cardIconFrame}>
        <AppIcon className={styles.cardIcon} name="document" />
      </div>
      <div className={styles.adventureSummary}>
        <h2 className={styles.adventureName}>{card.label}</h2>
        <p className={styles.cardMeta}>
          {t('pages.adventureList.updatedAt')} {card.updatedAtLabel}
        </p>
        {card.promptPreview ? <p className={styles.promptPreview}>{card.promptPreview}</p> : null}
      </div>
    </article>
  )
}

export const AdventureListPage = () => {
  const { t } = useI18n()
  const { cards, creating, error, handleCreateAdventure, loading, showAdventureGrid, showEmptyState } = useAdventureListPage()

  return (
    <>
      <CharacterListHeader actionLabel={t('pages.adventureList.actions.addAdventure')} creating={creating} onAction={() => void handleCreateAdventure()} subtitle={t('pages.main.subtitle')} title={t('pages.main.tabs.adventures')} />

      {error ? <p className={styles.status}>{error}</p> : null}

      {loading ? (
        <section className={styles.emptyState}>
          <p className={styles.emptyText}>{t('pages.adventureList.loading')}</p>
        </section>
      ) : null}

      {showEmptyState ? (
        <section className={styles.emptyState}>
          <p className={styles.emptyText}>{t('pages.adventureList.emptyState')}</p>
        </section>
      ) : null}

      {showAdventureGrid ? (
        <section className={styles.adventureGrid} aria-label={t('pages.main.tabs.adventures')}>
          {cards.map((card) => (
            <AdventureListCard key={card.id} card={card} />
          ))}
        </section>
      ) : null}
    </>
  )
}
