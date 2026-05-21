import { AppIcon } from '@components/AppIcon'
import { DeleteCharacterDialog } from '@components/DeleteCharacterDialog'
import { useI18n } from '@i18n/index'
import { CharacterListHeader } from '@pages/CharacterListPage/CharacterListHeader'
import { useEventsListPage } from './eventsListPageHooks'
import type { EventListCardViewModel } from './types'
import styles from './style.module.scss'

const EventListCard = ({ card }: { card: EventListCardViewModel }) => {
  const { t } = useI18n()

  return (
    <article className={styles.eventCard} role="link" tabIndex={0} onClick={card.onOpen} onKeyDown={card.onKeyDown}>
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
  const { cards, creating, deleteDialogEventName, deletingId, error, eventToDelete, handleCloseDeleteDialog, handleConfirmDeleteEvent, handleCreateEvent, loading, showEmptyState, showEventGrid } = useEventsListPage()

  return (
    <>
      <CharacterListHeader actionLabel={t('pages.eventList.actions.addEvent')} creating={creating} onAction={() => void handleCreateEvent()} subtitle={t('pages.main.subtitle')} title={t('pages.main.tabs.events')} />

      {error ? <p className={styles.status}>{error}</p> : null}

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

      {showEventGrid ? (
        <section className={styles.eventGrid}>
          {cards.map((card) => (
            <EventListCard key={card.id} card={card} />
          ))}
        </section>
      ) : null}

      <DeleteCharacterDialog bodyKey="pages.eventList.deleteDialog.body" characterName={deleteDialogEventName} deleting={deletingId === eventToDelete?.id} open={Boolean(eventToDelete)} titleKey="pages.eventList.deleteDialog.title" onCancel={handleCloseDeleteDialog} onConfirm={() => void handleConfirmDeleteEvent()} />
    </>
  )
}
