import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { AppIcon } from '@components/AppIcon'
import { useI18n } from '@i18n/index'
import { CharacterEditPageProvider, useCharacterEditPageContext } from '@pages/CharacterEditPage/characterEditPageContext'
import styles from './style.module.scss'
import type { CharacterEditTabKey } from '@pages/CharacterEditPage/types'
import { AbilitiesTab } from '@pages/CharacterEditPage/tabs/AbilitiesTab'
import { GeneralTab } from '@pages/CharacterEditPage/tabs/GeneralTab'
import { FeatsTab } from '@pages/CharacterEditPage/tabs/FeatsTab'
import { ItemsTab } from '@pages/CharacterEditPage/tabs/ItemsTab'

function CharacterEditPageContent() {
  const { t } = useI18n()
  const { characterId = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isPrintMenuOpen, setPrintMenuOpen] = useState(false)
  const printMenuRef = useRef<HTMLDivElement>(null)
  const { error, form, loading, saving, hasChanges, handleGeneralChange, handleSubmit } =
    useCharacterEditPageContext()
  const activeTab = resolveActiveTab(searchParams.get('tab'))

  useEffect(() => {
    function handleDocumentPointerDown(event: MouseEvent) {
      if (printMenuRef.current?.contains(event.target as Node)) {
        return
      }

      setPrintMenuOpen(false)
    }

    function handleDocumentKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setPrintMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleDocumentPointerDown)
    document.addEventListener('keydown', handleDocumentKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleDocumentPointerDown)
      document.removeEventListener('keydown', handleDocumentKeyDown)
    }
  }, [])

  function handleTabChange(nextTab: CharacterEditTabKey) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('tab', nextTab)
    setSearchParams(nextParams)
  }

  function handlePrintSheet() {
    setPrintMenuOpen(false)

    if (!characterId) {
      return
    }

    window.open(`/characters/${characterId}/print`, '_blank')
  }

  function handlePrintAbilities() {
    setPrintMenuOpen(false)

    if (!characterId) {
      return
    }

    window.open(`/characters/${characterId}/print/abilities`, '_blank')
  }

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
            <div className={styles.printMenu} ref={printMenuRef}>
              <button
                aria-expanded={isPrintMenuOpen}
                aria-haspopup="menu"
                className={styles.primaryButton}
                type="button"
                onClick={() => setPrintMenuOpen((current) => !current)}
              >
                <span className={styles.buttonContent}>
                  <AppIcon name="print" />
                  <span>{t('common.actions.print')}</span>
                </span>
              </button>
              {isPrintMenuOpen ? (
                <div className={styles.printMenuList} role="menu" aria-label={t('common.actions.print')}>
                  <button
                    className={styles.printMenuItem}
                    type="button"
                    onClick={handlePrintSheet}
                  >
                    {t('pages.characterEdit.printMenu.characterSheet')}
                  </button>
                  <button
                    className={styles.printMenuItem}
                    type="button"
                    onClick={handlePrintAbilities}
                  >
                    {t('pages.characterEdit.printMenu.abilitiesAndFeats')}
                  </button>
                  <button className={styles.printMenuItem} type="button" onClick={handlePrintSheet}>
                    {t('pages.characterEdit.printMenu.items')}
                  </button>
                </div>
              ) : null}
            </div>
            <button className={styles.primaryButton} form="character-edit-form" type="submit" disabled={saving || !hasChanges}>
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
                  onClick={() => handleTabChange('general')}
                >
                  {t('pages.characterEdit.tabs.general')}
                </button>
                <button
                  className={`${styles.tabButton} ${activeTab === 'abilities' ? styles.tabButtonActive : ''}`}
                  type="button"
                  onClick={() => handleTabChange('abilities')}
                >
                  {t('pages.characterEdit.tabs.abilities')}
                </button>
                <button
                  className={`${styles.tabButton} ${activeTab === 'feats' ? styles.tabButtonActive : ''}`}
                  type="button"
                  onClick={() => handleTabChange('feats')}
                >
                  {t('pages.characterEdit.tabs.feats')}
                </button>
                <button
                  className={`${styles.tabButton} ${activeTab === 'items' ? styles.tabButtonActive : ''}`}
                  type="button"
                  onClick={() => handleTabChange('items')}
                >
                  {t('pages.characterEdit.tabs.items')}
                </button>
              </aside>

              <div className={styles.tabPanel}>
                {activeTab === 'general' ? <GeneralTab /> : null}
                {activeTab === 'abilities' ? <AbilitiesTab /> : null}
                {activeTab === 'feats' ? <FeatsTab /> : null}
                {activeTab === 'items' ? <ItemsTab /> : null}
              </div>
            </div>
          </form>
        )}
      </section>
    </main>
  )
}

function resolveActiveTab(tab: string | null): CharacterEditTabKey {
  if (tab === 'abilities' || tab === 'feats' || tab === 'items') {
    return tab
  }

  return 'general'
}

export function CharacterEditPage() {
  return (
    <CharacterEditPageProvider>
      <CharacterEditPageContent />
    </CharacterEditPageProvider>
  )
}
