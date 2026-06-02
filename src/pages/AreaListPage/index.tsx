import { AppIcon } from '@components/AppIcon'
import { DeleteCharacterDialog } from '@components/DeleteCharacterDialog'
import { useI18n } from '@i18n/index'
import { CharacterListHeader } from '@pages/CharacterListPage/CharacterListHeader'
import { useStickySentinel } from '@pages/useStickyStateHooks'
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
      <div className={styles.cardActions}>
        <button aria-label={t('common.actions.delete')} className={styles.dangerButton} type="button" title={t('common.actions.delete')} onClick={card.onDeleteClick} disabled={card.deleting}>
          <AppIcon name="trash" />
        </button>
      </div>
    </article>
  )
}

export const AreaListPage = () => {
  const { t } = useI18n()
  const { isSticky, sentinelRef } = useStickySentinel()
  const { areaToDelete, cards, creating, deleteDialogAreaName, deletingId, error, handleChangeListSearch, handleCloseDeleteDialog, handleConfirmDeleteArea, handleCreateArea, listSearch, loading, showAreaGrid, showEmptySearchState, showEmptyState } = useAreaListPage()

  return (
    <>
      <CharacterListHeader actionLabel={t('pages.areaList.actions.addArea')} creating={creating} onAction={() => void handleCreateArea()} subtitle={t('pages.main.subtitle')} title={t('pages.main.tabs.areas')} />

      {error ? <p className={styles.status}>{error}</p> : null}

      <div className={styles.listContainer}>
        <div ref={sentinelRef} className={styles.stickySentinel} aria-hidden="true" />
        {!loading ? (
          <label className={`${styles.searchField} ${isSticky ? styles.searchFieldSticky : ''}`} htmlFor="area-list-search">
            <span className={styles.visuallyHidden}>{t('pages.areaList.searchLabel')}</span>
            <input className={styles.searchInput} id="area-list-search" value={listSearch} placeholder={t('pages.areaList.searchPlaceholder')} autoComplete="off" onChange={(event) => handleChangeListSearch(event.target.value)} />
          </label>
        ) : null}

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

        {showEmptySearchState ? (
          <section className={styles.emptyState}>
            <p className={styles.emptyText}>{t('pages.areaList.emptySearchState')}</p>
          </section>
        ) : null}

        {showAreaGrid ? (
          <section className={styles.areaGrid} aria-label={t('pages.main.tabs.areas')}>
            {cards.map((card) => (
              <AreaListCard key={card.id} card={card} />
            ))}
          </section>
        ) : null}
      </div>

      <DeleteCharacterDialog bodyKey="pages.areaList.deleteDialog.body" characterName={deleteDialogAreaName} deleting={deletingId === areaToDelete?.id} open={Boolean(areaToDelete)} titleKey="pages.areaList.deleteDialog.title" onCancel={handleCloseDeleteDialog} onConfirm={() => void handleConfirmDeleteArea()} />
    </>
  )
}
