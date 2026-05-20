import { AppIcon } from '@components/AppIcon'
import { useI18n } from '@i18n/index'
import { useAdventureEditPage } from './adventureEditPageHooks'
import styles from './style.module.scss'

export const AdventureEditPage = () => {
  const { t } = useI18n()
  const { error, form, handleBackToListClick, handleFieldChange, handleSendClick, handleSubmit, hasChanges, lastUsageLabel, loading, promptTokenLabel, quotaResetLabel, saving, todayRequestsLabel } = useAdventureEditPage()

  return (
    <main className={styles.editorLayout}>
      <section className={styles.editorCard}>
        <div className={styles.editorHeader}>
          <div className={styles.headerBrand}>
            <div className={styles.headerIconFrame}>
              <AppIcon className={styles.headerIcon} name="document" />
            </div>
            <div className={styles.headerCopy}>
              <p className={styles.eyebrow}>{t('pages.adventureEdit.eyebrow')}</p>
              <label className={styles.titleField} htmlFor="adventure-name">
                <span className={styles.srOnly}>{t('pages.adventureEdit.fields.name')}</span>
                <input className={styles.titleInput} id="adventure-name" name="name" type="text" value={form.name} onChange={handleFieldChange} placeholder={t('pages.adventureEdit.placeholders.titleName')} autoComplete="off" />
              </label>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.ghostButton} type="button" onClick={handleBackToListClick}>
              {t('common.actions.backToList')}
            </button>
            <button className={styles.primaryButton} form="adventure-edit-form" type="submit" disabled={saving || !hasChanges}>
              <span className={styles.buttonContent}>
                <AppIcon name="save" />
                <span>{saving ? t('common.states.saving') : t('common.actions.save')}</span>
              </span>
            </button>
          </div>
        </div>

        {error ? <p className={styles.status}>{error}</p> : null}

        {loading ? (
          <p className={styles.loadingText}>{t('pages.adventureEdit.loading')}</p>
        ) : (
          <form id="adventure-edit-form" className={styles.editorForm} onSubmit={handleSubmit}>
            <section className={styles.section}>
              <label className={styles.field} htmlFor="adventure-prompt">
                <span className={styles.fieldHeader}>
                  <span className={styles.fieldLabel}>{t('pages.adventureEdit.fields.prompt')}</span>
                  <span className={styles.tokenBadge}>{promptTokenLabel}</span>
                </span>
                <textarea className={styles.promptTextarea} id="adventure-prompt" name="prompt" rows={3} value={form.prompt} onChange={handleFieldChange} placeholder={t('pages.adventureEdit.placeholders.prompt')} />
              </label>
              <div className={styles.tokenInfoBar} aria-label={t('pages.adventureEdit.tokens.summaryLabel')}>
                <span>{lastUsageLabel}</span>
                <span>{todayRequestsLabel}</span>
                <span>{quotaResetLabel}</span>
              </div>
              <div className={styles.formActions}>
                <button className={styles.secondaryButton} type="button" onClick={handleSendClick} disabled={saving || !form.prompt.trim()}>
                  <span className={styles.buttonContent}>
                    <AppIcon name="magic" />
                    <span>{saving ? t('pages.adventureEdit.actions.sending') : t('pages.adventureEdit.actions.send')}</span>
                  </span>
                </button>
              </div>
              <label className={styles.field} htmlFor="adventure-output">
                <span className={styles.fieldLabel}>{t('pages.adventureEdit.fields.output')}</span>
                <textarea className={styles.outputTextarea} id="adventure-output" name="output" value={form.output} onChange={handleFieldChange} placeholder={t('pages.adventureEdit.placeholders.output')} />
              </label>
            </section>
          </form>
        )}
      </section>
    </main>
  )
}
