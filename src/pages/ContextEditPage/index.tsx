import { useState, type MouseEvent as ReactMouseEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppIcon } from '@components/AppIcon'
import { UnsavedChangesDialog } from '@components/UnsavedChangesDialog'
import { useI18n } from '@i18n/index'
import { useMainPageContext } from '@pages/main/mainPageContext'
import { useContextEditPage } from './contextEditPageHooks'
import styles from './style.module.scss'

export const ContextEditPage = () => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { handleTabChange } = useMainPageContext()
  const { error, form, handleChange, handleSubmit, hasChanges, loading, saving } = useContextEditPage()
  const [isUnsavedChangesDialogOpen, setUnsavedChangesDialogOpen] = useState(false)

  const handleBackToListClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (hasChanges) {
      event.preventDefault()
      setUnsavedChangesDialogOpen(true)
      return
    }
    handleTabChange('contexts')
  }

  const handleConfirmBackToList = () => {
    setUnsavedChangesDialogOpen(false)
    handleTabChange('contexts')
    navigate('/')
  }

  return (
    <main className={styles.editorLayout}>
      <section className={styles.editorCard}>
        <div className={styles.editorHeader}>
          <div className={styles.headerBrand}>
            <div className={styles.headerIconFrame}>
              <AppIcon className={styles.headerIcon} name="document" />
            </div>
            <div className={styles.headerCopy}>
              <p className={styles.eyebrow}>{t('pages.contextEdit.eyebrow')}</p>
              <label className={styles.titleField} htmlFor="context-name">
                <span className={styles.srOnly}>{t('pages.contextEdit.fields.name')}</span>
                <input className={styles.titleInput} id="context-name" name="name" type="text" value={form.name} onChange={handleChange} placeholder={t('pages.contextEdit.placeholders.titleName')} autoComplete="off" />
              </label>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Link className={`${styles.floatingBackAction} ${styles.ghostLink}`} to="/" onClick={handleBackToListClick}>
              {t('common.actions.backToList')}
            </Link>
            <div className={styles.floatingSaveAction}>
              <button className={styles.primaryButton} form="context-edit-form" type="submit" disabled={saving || !hasChanges}>
                <span className={styles.buttonContent}>
                  <AppIcon name="save" />
                  <span>{saving ? t('common.states.saving') : t('common.actions.save')}</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {error ? <p className={styles.status}>{error}</p> : null}

        {loading ? (
          <p className={styles.loadingText}>{t('pages.contextEdit.loading')}</p>
        ) : (
          <form id="context-edit-form" className={styles.editorForm} onSubmit={(event) => void handleSubmit(event)}>
            <section className={styles.section}>
              <label className={styles.field} htmlFor="context-description">
                <span className={styles.fieldLabel}>{t('pages.contextEdit.fields.description')}</span>
                <textarea className={styles.descriptionTextarea} id="context-description" name="description" value={form.description} onChange={handleChange} placeholder={t('pages.contextEdit.placeholders.description')} />
              </label>
            </section>
          </form>
        )}

        <UnsavedChangesDialog open={isUnsavedChangesDialogOpen} onCancel={() => setUnsavedChangesDialogOpen(false)} onConfirm={handleConfirmBackToList} />
      </section>
    </main>
  )
}
