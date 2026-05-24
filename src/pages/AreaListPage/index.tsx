import { AppIcon } from '@components/AppIcon'
import { useI18n } from '@i18n/index'
import { CharacterListHeader } from '@pages/CharacterListPage/CharacterListHeader'
import { useAreaListPage } from './areaListPageHooks'
import type { AreaListCardViewModel } from './types'
import styles from './style.module.scss'

const AreaListCard = ({ card }: { card: AreaListCardViewModel }) => {
  const { t } = useI18n()

  return (
    <article className={styles.areaCard} role="link" tabIndex={0} onClick={card.onOpen} onKeyDown={card.onKeyDown}>
      <div className={styles.cardIconFrame}>
        {card.imageUrl ? (
          <img className={styles.cardImage} src={card.imageUrl} alt="" aria-hidden="true" />
        ) : (
          <AppIcon className={styles.cardIcon} name="area" />
        )}
      </div>
      <div className={styles.areaSummary}>
        <h2 className={styles.areaName}>{card.label}</h2>
        <p className={styles.cardMeta}>
          {t('pages.areaList.updatedAt')} {card.updatedAtLabel}
        </p>
        {card.descriptionPreview ? <p className={styles.descriptionPreview}>{card.descriptionPreview}</p> : null}
      </div>
    </article>
  )
}

export const AreaListPage = () => {
  const { t } = useI18n()
  const { cards, creating, error, handleCreateArea, loading, showAreaGrid, showEmptyState } = useAreaListPage()

  return (
    <>
      <CharacterListHeader actionLabel={t('pages.areaList.actions.addArea')} creating={creating} onAction={() => void handleCreateArea()} subtitle={t('pages.main.subtitle')} title={t('pages.main.tabs.areas')} />

      {error ? <p className={styles.status}>{error}</p> : null}

      {loading ? (
        <section className={styles.emptyState}>
          <p className={styles.emptyText}>{t('pages.areaList.loading')}</p>
        </section>
      ) : null}

      {showEmptyState ? (
        <section className={styles.emptyState}>
          <p className={styles.emptyText}>{t('pages.areaList.emptyState')}</p>
        </section>
      ) : null}

      {showAreaGrid ? (
        <section className={styles.areaGrid} aria-label={t('pages.main.tabs.areas')}>
          {cards.map((card) => (
            <AreaListCard key={card.id} card={card} />
          ))}
        </section>
      ) : null}
    </>
  )
}
