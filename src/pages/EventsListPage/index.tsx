import { AppIcon } from '@components/AppIcon'
import { DeleteCharacterDialog } from '@components/DeleteCharacterDialog'
import { useI18n } from '@i18n/index'
import { CharacterListHeader } from '@pages/CharacterListPage/CharacterListHeader'
import { useStickySentinel } from '@pages/useStickyStateHooks'
import { useEventsListPage } from './eventsListPageHooks'
import type { EventListCardViewModel } from './types'
import styles from './style.module.scss'

const EventListCard = ({ card }: { card: EventListCardViewModel }) => {
  const { t } = useI18n()

  return (
    <article className={styles.eventCard} role="link" tabIndex={0} onClick={card.onOpen} onKeyDown={card.onKeyDown}>
      <div className={styles.cardIconFrame}>
        {card.imageUrl ? (
          <img className={styles.cardImage} src={card.imageUrl} alt="" aria-hidden="true" />
        ) : (
          <AppIcon className={styles.cardIcon} name="event" />
        )}
      </div>
      <div className={styles.eventSummary}>
        <h2 className={styles.eventName}>{card.label}</h2>
        {card.description ? <p className={styles.eventDescription}>{card.description}</p> : null}
      </div>
      <div className={styles.cardActions}>
        <button aria-label={t('common.actions.delete')} className={styles.dangerButton} type="button" title={t('common.actions.delete')} onClick={card.onDeleteClick} disabled={card.deleting}>
          <AppIcon name="trash" />
        </button>
      </div>
    </article>
  )
}

export const EventsListPage = () => {
  const { t } = useI18n()
  const { isSticky, sentinelRef } = useStickySentinel()
  const { cards, creating, deleteDialogEventName, deletingId, error, eventToDelete, handleChangeListSearch, handleCloseDeleteDialog, handleConfirmDeleteEvent, handleCreateEvent, listSearch, loading, showEmptySearchState, showEmptyState, showEventGrid } = useEventsListPage()

  return (
    <>
      <CharacterListHeader actionLabel={t('pages.eventList.actions.addEvent')} creating={creating} onAction={() => void handleCreateEvent()} subtitle={t('pages.main.subtitle')} title={t('pages.main.tabs.events')} />

      {error ? <p className={styles.status}>{error}</p> : null}

      <div className={styles.listContainer}>
        <div ref={sentinelRef} className={styles.stickySentinel} aria-hidden="true" />
        {!loading ? (
          <label className={`${styles.searchField} ${isSticky ? styles.searchFieldSticky : ''}`} htmlFor="event-list-search">
            <span className={styles.visuallyHidden}>{t('pages.eventList.searchLabel')}</span>
            <input className={styles.searchInput} id="event-list-search" value={listSearch} placeholder={t('pages.eventList.searchPlaceholder')} autoComplete="off" onChange={(event) => handleChangeListSearch(event.target.value)} />
          </label>
        ) : null}

        {loading ? (
          <section className={styles.emptyState}>
            <p className={styles.emptyText}>{t('pages.eventList.loading')}</p>
          </section>
        ) : null}

        {showEmptyState ? (
          <section className={styles.emptyState}>
            <p className={styles.emptyText}>{t('pages.eventList.emptyState')}</p>
          </section>
        ) : null}

        {showEmptySearchState ? (
          <section className={styles.emptyState}>
            <p className={styles.emptyText}>{t('pages.eventList.emptySearchState')}</p>
          </section>
        ) : null}

        {showEventGrid ? (
          <section className={styles.eventGrid}>
            {cards.map((card) => (
              <EventListCard key={card.id} card={card} />
            ))}
          </section>
        ) : null}
      </div>

      <DeleteCharacterDialog bodyKey="pages.eventList.deleteDialog.body" characterName={deleteDialogEventName} deleting={deletingId === eventToDelete?.id} open={Boolean(eventToDelete)} titleKey="pages.eventList.deleteDialog.title" onCancel={handleCloseDeleteDialog} onConfirm={() => void handleConfirmDeleteEvent()} />
    </>
  )
}
