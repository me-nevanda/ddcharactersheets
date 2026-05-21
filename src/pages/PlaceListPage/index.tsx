import { AppIcon } from '@components/AppIcon'
import { useI18n } from '@i18n/index'
import { CharacterListHeader } from '@pages/CharacterListPage/CharacterListHeader'
import { usePlaceListPage } from './placeListPageHooks'
import type { PlaceListCardViewModel } from './types'
import styles from './style.module.scss'

const PlaceListCard = ({ card }: { card: PlaceListCardViewModel }) => {
  const { t } = useI18n()

  return (
    <article className={styles.placeCard} role="link" tabIndex={0} onClick={card.onOpen} onKeyDown={card.onKeyDown}>
      <div className={styles.cardIconFrame}>
        <AppIcon className={styles.cardIcon} name="place" />
      </div>
      <div className={styles.placeSummary}>
        <h2 className={styles.placeName}>{card.label}</h2>
        <p className={styles.cardMeta}>
          {t('pages.placeList.updatedAt')} {card.updatedAtLabel}
        </p>
        {card.descriptionPreview ? <p className={styles.descriptionPreview}>{card.descriptionPreview}</p> : null}
      </div>
    </article>
  )
}

export const PlaceListPage = () => {
  const { t } = useI18n()
  const { cards, creating, error, handleCreatePlace, loading, showPlaceGrid, showEmptyState } = usePlaceListPage()

  return (
    <>
      <CharacterListHeader actionLabel={t('pages.placeList.actions.addPlace')} creating={creating} onAction={() => void handleCreatePlace()} subtitle={t('pages.main.subtitle')} title={t('pages.main.tabs.places')} />

      {error ? <p className={styles.status}>{error}</p> : null}

      {loading ? (
        <section className={styles.emptyState}>
          <p className={styles.emptyText}>{t('pages.placeList.loading')}</p>
        </section>
      ) : null}

      {showEmptyState ? (
        <section className={styles.emptyState}>
          <p className={styles.emptyText}>{t('pages.placeList.emptyState')}</p>
        </section>
      ) : null}

      {showPlaceGrid ? (
        <section className={styles.placeGrid} aria-label={t('pages.main.tabs.places')}>
          {cards.map((card) => (
            <PlaceListCard key={card.id} card={card} />
          ))}
        </section>
      ) : null}
    </>
  )
}
