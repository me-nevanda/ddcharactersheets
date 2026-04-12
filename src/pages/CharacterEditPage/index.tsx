import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AppIcon } from '../../components/AppIcon'
import { useI18n } from '../../i18n'
import { CharacterEditPageProvider, useCharacterEditPageContext } from './characterEditPageContext'
import styles from './style.module.scss'
import type { CharacterEditTabKey } from './types'
import { AbilitiesTab } from './tabs/AbilitiesTab'
import { GeneralTab } from './tabs/GeneralTab'

function CharacterEditPageContent() {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<CharacterEditTabKey>('general')
  const { error, form, loading, saving, handleGeneralChange, handleSubmit } = useCharacterEditPageContext()

  return (
    <main className={styles.editorLayout}>
      <section className={styles.editorCard}>
        <div className={styles.editorHeader}>
          <div className={styles.headerCopy}>
            <p className={styles.eyebrow}>{t('pages.characterEdit.eyebrow')}</p>
            <label className={styles.titleField} htmlFor="name">
              <span className={styles.srOnly}>{t('pages.characterEdit.fields.name')}</span>
              <input
                className={styles.titleInput}
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleGeneralChange}
                placeholder={t('pages.characterEdit.placeholders.titleName')}
                autoComplete="off"
              />
            </label>
          </div>
          <div className={styles.headerActions}>
            <Link className={styles.ghostLink} to="/">
              {t('common.actions.backToList')}
            </Link>
            <Link className={styles.secondaryButton} to="/">
              {t('common.actions.cancel')}
            </Link>
            <button className={styles.primaryButton} form="character-edit-form" type="submit" disabled={saving}>
              <span className={styles.buttonContent}>
                <AppIcon name="save" />
                <span>{saving ? t('common.states.saving') : t('common.actions.save')}</span>
              </span>
            </button>
          </div>
        </div>

        {error ? <p className={styles.status}>{error}</p> : null}

        {loading ? (
          <p className={styles.loadingText}>{t('common.states.loadingCharacter')}</p>
        ) : (
          <form id="character-edit-form" className={styles.editorForm} onSubmit={(event) => void handleSubmit(event)}>
            <div className={styles.editorBody}>
              <aside className={styles.tabRail} aria-label={t('pages.characterEdit.title')}>
                <button
                  className={`${styles.tabButton} ${activeTab === 'general' ? styles.tabButtonActive : ''}`}
                  type="button"
                  onClick={() => setActiveTab('general')}
                >
                  {t('pages.characterEdit.tabs.general')}
                </button>
                <button
                  className={`${styles.tabButton} ${activeTab === 'abilities' ? styles.tabButtonActive : ''}`}
                  type="button"
                  onClick={() => setActiveTab('abilities')}
                >
                  {t('pages.characterEdit.tabs.abilities')}
                </button>
              </aside>

              <div className={styles.tabPanel}>
                {activeTab === 'general' ? <GeneralTab /> : null}
                {activeTab === 'abilities' ? <AbilitiesTab /> : null}
              </div>
            </div>
          </form>
        )}
      </section>
    </main>
  )
}

export function CharacterEditPage() {
  return (
    <CharacterEditPageProvider>
      <CharacterEditPageContent />
    </CharacterEditPageProvider>
  )
}
