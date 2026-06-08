import { useState } from 'react'
import { AppIcon } from '@components/AppIcon'
import { SimpleWysiwygEditor } from '@components/SimpleWysiwygEditor'
import styles from '../../style.module.scss'
import localStyles from './style.module.scss'
import { useHistoryTab } from './historyTabHooks'

export const HistoryTab = () => {
  const {
    handleAddHistoryEntry,
    handleHistoryEntryChange,
    handleHistoryEntryRemove,
    historyEntries,
    t,
  } = useHistoryTab()
  const [pendingRemovalIndex, setPendingRemovalIndex] = useState<number | null>(null)
  const visibleHistoryEntries = historyEntries
    .map((entry, index) => ({ entry, index }))
    .reverse()
  const pendingRemovalEntry = pendingRemovalIndex === null ? null : historyEntries[pendingRemovalIndex] ?? null
  const handleConfirmRemoveHistoryEntry = () => {
    if (pendingRemovalIndex === null) {
      return
    }

    handleHistoryEntryRemove(pendingRemovalIndex)
    setPendingRemovalIndex(null)
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t('pages.characterEdit.history.title')}</h2>
        <button className={styles.primaryButton} type="button" onClick={handleAddHistoryEntry}>
          <span className={styles.buttonContent}>
            <AppIcon name="plus" />
            <span>{t('pages.characterEdit.history.addButton')}</span>
          </span>
        </button>
      </div>

      {historyEntries.length === 0 ? <p className={styles.loadingText}>{t('pages.characterEdit.history.emptyState')}</p> : null}

      {historyEntries.length > 0 ? (
        <div className={localStyles.historyGrid}>
          {visibleHistoryEntries.map(({ entry, index }) => (
            <article key={entry.id} className={styles.abilityCard}>
              <div className={`${styles.abilityCardHeader} ${styles.itemCardHeader}`}>
                <input
                  className={styles.abilityCardTitleInput}
                  id={`history-title-${index}`}
                  value={entry.title}
                  placeholder={t('pages.characterEdit.history.titlePlaceholder')}
                  onChange={(event) => handleHistoryEntryChange(index, 'title', event.target.value)}
                />
                <div className={styles.itemCardActions}>
                  <button
                    className={styles.abilityRemoveButton}
                    type="button"
                    aria-label={t('pages.characterEdit.history.removeButton')}
                    title={t('pages.characterEdit.history.removeButton')}
                    onClick={() => setPendingRemovalIndex(index)}
                  >
                    <AppIcon name="delete" />
                  </button>
                </div>
              </div>

              <div className={localStyles.historyCardBody}>
                <div className={styles.divider} data-label={t('pages.characterEdit.history.contentLabel')} />
                <SimpleWysiwygEditor
                  ariaLabel={t('pages.characterEdit.history.contentLabel')}
                  minHeightClassName={localStyles.historyEditor}
                  name={`history-content-${entry.id}`}
                  pasteAsPlainText
                  placeholder={t('pages.characterEdit.history.contentPlaceholder')}
                  toolbar={false}
                  value={entry.content}
                  onChange={(value) => handleHistoryEntryChange(index, 'content', value)}
                />
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {pendingRemovalEntry ? (
        <div className={styles.deleteBackdrop} role="presentation">
          <div className={styles.deleteDialog} role="dialog" aria-modal="true" aria-labelledby="delete-history-entry-title">
            <h2 className={styles.deleteDialogTitle} id="delete-history-entry-title">
              {t('pages.characterEdit.history.removeDialog.title')}
            </h2>
            <p className={styles.deleteDialogText}>
              {t('pages.characterEdit.history.removeDialog.body', {
                name: pendingRemovalEntry.title || t('pages.characterEdit.history.title'),
              })}
            </p>

            <div className={styles.deleteDialogActions}>
              <button className={styles.deleteDialogSecondaryButton} type="button" onClick={() => setPendingRemovalIndex(null)}>
                {t('common.actions.cancel')}
              </button>
              <button className={styles.deleteDialogDangerButton} type="button" onClick={handleConfirmRemoveHistoryEntry}>
                {t('common.actions.delete')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
