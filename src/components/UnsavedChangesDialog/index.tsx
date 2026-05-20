import { useI18n } from '@i18n/index'
import type { UnsavedChangesDialogProps } from './types'
import styles from './style.module.scss'

export const UnsavedChangesDialog = ({ open, onCancel, onConfirm }: UnsavedChangesDialogProps) => {
  const { t } = useI18n()

  if (!open) {
    return null
  }

  return (
    <div className={styles.backdrop} role="presentation">
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="unsaved-changes-title">
        <h2 className={styles.title} id="unsaved-changes-title">
          {t('common.confirmations.unsavedChangesTitle')}
        </h2>
        <p className={styles.text}>{t('common.confirmations.unsavedChangesBody')}</p>

        <div className={styles.actions}>
          <button className={styles.secondaryButton} type="button" onClick={onCancel}>
            {t('common.actions.cancel')}
          </button>
          <button className={styles.dangerButton} type="button" onClick={onConfirm}>
            {t('common.actions.backToList')}
          </button>
        </div>
      </div>
    </div>
  )
}
