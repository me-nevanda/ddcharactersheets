import { AppIcon } from '@components/AppIcon'
import { DeleteCharacterDialog } from '@components/DeleteCharacterDialog'
import { useI18n } from '@i18n/index'
import { CharacterListHeader } from '@pages/CharacterListPage/CharacterListHeader'
import { useStickySentinel } from '@pages/useStickyStateHooks'
import { useMapsListPage } from './mapsListPageHooks'
import type { MapListCardViewModel } from './types'
import styles from './style.module.scss'

const MapListCard = ({ card }: { card: MapListCardViewModel }) => {
  const { t } = useI18n()

  return (
    <article className={styles.mapCard} role="link" tabIndex={0} onClick={card.onOpen} onKeyDown={card.onKeyDown}>
      <div className={styles.cardIconFrame}>
        <AppIcon className={styles.cardIcon} name="map" />
      </div>
      <div className={styles.mapSummary}>
        <h2 className={styles.mapName}>{card.label}</h2>
        {card.description ? <p className={styles.mapDescription}>{card.description}</p> : null}
      </div>
      <div className={styles.cardActions}>
        <button aria-label={t('common.actions.delete')} className={styles.dangerButton} type="button" title={t('common.actions.delete')} onClick={card.onDeleteClick} disabled={card.deleting}>
          <AppIcon name="trash" />
        </button>
      </div>
    </article>
  )
}

export const MapsListPage = () => {
  const { t } = useI18n()
  const { isSticky, sentinelRef } = useStickySentinel()
  const { cards, creating, deleteDialogMapName, deletingId, error, handleChangeListSearch, handleCloseDeleteDialog, handleConfirmDeleteMap, handleCreateMap, listSearch, loading, mapToDelete, showEmptySearchState, showEmptyState, showMapGrid } = useMapsListPage()

  return (
    <>
      <CharacterListHeader actionLabel={t('pages.mapList.actions.addMap')} creating={creating} onAction={() => void handleCreateMap()} subtitle={t('pages.main.subtitle')} title={t('pages.main.tabs.maps')} />

      {error ? <p className={styles.status}>{error}</p> : null}

      <div className={styles.listContainer}>
        <div ref={sentinelRef} className={styles.stickySentinel} aria-hidden="true" />
        {!loading ? (
          <label className={`${styles.searchField} ${isSticky ? styles.searchFieldSticky : ''}`} htmlFor="map-list-search">
            <span className={styles.visuallyHidden}>{t('pages.mapList.searchLabel')}</span>
            <input className={styles.searchInput} id="map-list-search" value={listSearch} placeholder={t('pages.mapList.searchPlaceholder')} autoComplete="off" onChange={(event) => handleChangeListSearch(event.target.value)} />
          </label>
        ) : null}

        {loading ? (
          <section className={styles.emptyState}>
            <p className={styles.emptyText}>{t('pages.mapList.loading')}</p>
          </section>
        ) : null}

        {showEmptyState ? (
          <section className={styles.emptyState}>
            <p className={styles.emptyText}>{t('pages.mapList.emptyState')}</p>
          </section>
        ) : null}

        {showEmptySearchState ? (
          <section className={styles.emptyState}>
            <p className={styles.emptyText}>{t('pages.mapList.emptySearchState')}</p>
          </section>
        ) : null}

        {showMapGrid ? (
          <section className={styles.mapGrid}>
            {cards.map((card) => (
              <MapListCard key={card.id} card={card} />
            ))}
          </section>
        ) : null}
      </div>

      <DeleteCharacterDialog bodyKey="pages.mapList.deleteDialog.body" characterName={deleteDialogMapName} deleting={deletingId === mapToDelete?.id} open={Boolean(mapToDelete)} titleKey="pages.mapList.deleteDialog.title" onCancel={handleCloseDeleteDialog} onConfirm={() => void handleConfirmDeleteMap()} />
    </>
  )
}
