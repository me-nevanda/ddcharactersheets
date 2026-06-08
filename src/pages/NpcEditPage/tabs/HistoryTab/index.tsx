import { useState } from 'react'
import { AppIcon } from '@components/AppIcon'
import { SimpleWysiwygEditor } from '@components/SimpleWysiwygEditor'
import styles from '../../style.module.scss'
import localStyles from './style.module.scss'
import { useHistoryTab } from './historyTabHooks'
import type { HistoryTabProps } from './types'

export const HistoryTab = ({
  historyEntries,
  onHistoryEntryAdd,
  onHistoryEntryChange,
  onHistoryEntryRemove,
}: HistoryTabProps) => {
  const { t } = useHistoryTab()
  const [pendingRemovalIndex, setPendingRemovalIndex] = useState<number | null>(null)
  const visibleHistoryEntries = historyEntries
    .map((entry, index) => ({ entry, index }))
    .reverse()
  const pendingRemovalEntry = pendingRemovalIndex === null ? null : historyEntries[pendingRemovalIndex] ?? null
  const handleConfirmRemoveHistoryEntry = () => {
    if (pendingRemovalIndex === null) {
      return
    }

    onHistoryEntryRemove(pendingRemovalIndex)
    setPendingRemovalIndex(null)
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t('pages.npcEdit.history.title')}</h2>
        <button className={styles.primaryButton} type="button" onClick={onHistoryEntryAdd}>
          <span className={styles.buttonContent}>
            <AppIcon name="plus" />
            <span>{t('pages.npcEdit.history.addButton')}</span>
          </span>
        </button>
      </div>

      {historyEntries.length === 0 ? <p className={styles.loadingText}>{t('pages.npcEdit.history.emptyState')}</p> : null}

      {historyEntries.length > 0 ? (
        <div className={localStyles.historyGrid}>
          {visibleHistoryEntries.map(({ entry, index }) => (
            <article key={entry.id} className={styles.attackCard}>
              <div className={styles.attackCardHeader}>
                <input
                  className={styles.attackCardTitleInput}
                  id={`npc-history-title-${index}`}
                  value={entry.title}
                  placeholder={t('pages.npcEdit.history.titlePlaceholder')}
                  onChange={(event) => onHistoryEntryChange(index, 'title', event.target.value)}
                />
                <button
                  className={styles.attackRemoveButton}
                  type="button"
                  aria-label={t('pages.npcEdit.history.removeButton')}
                  title={t('pages.npcEdit.history.removeButton')}
                  onClick={() => setPendingRemovalIndex(index)}
                >
                  <AppIcon name="delete" />
                </button>
              </div>

              <div className={localStyles.historyCardBody}>
                <div className={styles.divider} data-label={t('pages.npcEdit.history.contentLabel')} />
                <SimpleWysiwygEditor
                  ariaLabel={t('pages.npcEdit.history.contentLabel')}
                  minHeightClassName={localStyles.historyEditor}
                  name={`npc-history-content-${entry.id}`}
                  pasteAsPlainText
                  placeholder={t('pages.npcEdit.history.contentPlaceholder')}
                  toolbar={false}
                  value={entry.content}
                  onChange={(value) => onHistoryEntryChange(index, 'content', value)}
                />
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {pendingRemovalEntry ? (
        <div className={styles.deleteBackdrop} role="presentation">
          <div className={styles.deleteDialog} role="dialog" aria-modal="true" aria-labelledby="delete-npc-history-entry-title">
            <h2 className={styles.deleteDialogTitle} id="delete-npc-history-entry-title">
              {t('pages.npcEdit.history.removeDialog.title')}
            </h2>
            <p className={styles.deleteDialogText}>
              {t('pages.npcEdit.history.removeDialog.body', {
                name: pendingRemovalEntry.title || t('pages.npcEdit.history.title'),
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
