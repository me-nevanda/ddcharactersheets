import { AppIcon } from '@components/AppIcon'
import { DeleteCharacterDialog } from '@components/DeleteCharacterDialog'
import { useI18n } from '@i18n/index'
import { CharacterListHeader } from '@pages/CharacterListPage/CharacterListHeader'
import { useContextsListPage } from './contextsListPageHooks'
import type { ContextListCardViewModel } from './types'
import styles from './style.module.scss'

const ContextListCard = ({ card }: { card: ContextListCardViewModel }) => {
  const { t } = useI18n()

  return (
    <article className={styles.contextCard} role="link" tabIndex={0} onClick={card.onOpen} onKeyDown={card.onKeyDown}>
      <div className={styles.cardIconFrame}>
        <AppIcon className={styles.cardIcon} name="context" />
      </div>
      <div className={styles.contextSummary}>
        <h2 className={styles.contextName}>{card.label}</h2>
        {card.description ? <p className={styles.contextDescription}>{card.description}</p> : null}
      </div>
      <div className={styles.cardActions}>
        <button aria-label={t('common.actions.delete')} className={styles.dangerButton} type="button" title={t('common.actions.delete')} onClick={card.onDeleteClick} disabled={card.deleting}>
          <AppIcon name="trash" />
        </button>
      </div>
    </article>
  )
}

export const ContextsListPage = () => {
  const { t } = useI18n()
  const { cards, creating, deleteDialogContextName, deletingId, error, contextToDelete, handleCloseDeleteDialog, handleConfirmDeleteContext, handleCreateContext, loading, showEmptyState, showContextGrid } = useContextsListPage()

  return (
    <>
      <CharacterListHeader actionLabel={t('pages.contextList.actions.addContext')} creating={creating} onAction={() => void handleCreateContext()} subtitle={t('pages.main.subtitle')} title={t('pages.main.tabs.contexts')} />

      {error ? <p className={styles.status}>{error}</p> : null}

      {loading ? (
        <section className={styles.emptyState}>
          <p className={styles.emptyText}>{t('pages.contextList.loading')}</p>
        </section>
      ) : null}

      {showEmptyState ? (
        <section className={styles.emptyState}>
          <p className={styles.emptyText}>{t('pages.contextList.emptyState')}</p>
        </section>
      ) : null}

      {showContextGrid ? (
        <section className={styles.contextGrid}>
          {cards.map((card) => (
            <ContextListCard key={card.id} card={card} />
          ))}
        </section>
      ) : null}

      <DeleteCharacterDialog bodyKey="pages.contextList.deleteDialog.body" characterName={deleteDialogContextName} deleting={deletingId === contextToDelete?.id} open={Boolean(contextToDelete)} titleKey="pages.contextList.deleteDialog.title" onCancel={handleCloseDeleteDialog} onConfirm={() => void handleConfirmDeleteContext()} />
    </>
  )
}
