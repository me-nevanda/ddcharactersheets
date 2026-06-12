import { useState, type MouseEvent as ReactMouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { AppIcon } from '@components/AppIcon'
import { UnsavedChangesDialog } from '@components/UnsavedChangesDialog'
import { useI18n } from '@i18n/index'
import { useEditReturnNavigation } from '@pages/useEditReturnNavigation'
import { useMapEditPage } from './mapEditPageHooks'
import styles from './style.module.scss'

export const MapEditPage = () => {
  const { t } = useI18n()
  const { applyReturnTabs, navigateBack, returnTo } = useEditReturnNavigation({
    mainTab: 'maps',
    returnTo: '/',
  })
  const { colorOptions, drawModeOptions, error, form, gridCells, handleChange, handleClearLinePreview, handlePreviewLine, handleRemoveLine, handleSelectColor, handleSelectDrawMode, handleSubmit, handleToggleLine, hasChanges, lineSegments, loading, previewEraseLineIds, previewLineIds, selectedColor, selectedDrawMode, selectedEraseRangeStartId, selectedRangeStartId, saving } = useMapEditPage()
  const [isUnsavedChangesDialogOpen, setUnsavedChangesDialogOpen] = useState(false)

  const handleBackToListClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (hasChanges) {
      event.preventDefault()
      setUnsavedChangesDialogOpen(true)
      return
    }
    applyReturnTabs()
  }

  const handleConfirmBackToList = () => {
    setUnsavedChangesDialogOpen(false)
    navigateBack()
  }

  return (
    <main className={styles.editorLayout}>
      <section className={styles.editorCard}>
        <div className={styles.editorHeader}>
          <div className={styles.headerBrand}>
            <div className={styles.headerIconFrame}>
              <AppIcon className={styles.headerIcon} name="map" />
            </div>
            <div className={styles.headerCopy}>
              <p className={styles.eyebrow}>{t('pages.mapEdit.eyebrow')}</p>
              <label className={styles.titleField} htmlFor="map-name">
                <span className={styles.srOnly}>{t('pages.mapEdit.fields.name')}</span>
                <input className={styles.titleInput} id="map-name" name="name" type="text" value={form.name} onChange={handleChange} placeholder={t('pages.mapEdit.placeholders.titleName')} autoComplete="off" />
              </label>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Link className={`${styles.floatingBackAction} ${styles.ghostLink}`} to={returnTo} onClick={handleBackToListClick}>
              {t('common.actions.backToList')}
            </Link>
            <div className={styles.floatingSaveAction}>
              <button className={styles.primaryButton} form="map-edit-form" type="submit" disabled={saving || !hasChanges}>
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
          <p className={styles.loadingText}>{t('pages.mapEdit.loading')}</p>
        ) : (
          <form id="map-edit-form" className={styles.editorForm} onSubmit={(event) => void handleSubmit(event)}>
            <section className={styles.section}>
              <label className={styles.field} htmlFor="map-description">
                <span className={styles.fieldLabel}>{t('pages.mapEdit.fields.description')}</span>
                <textarea className={styles.descriptionTextarea} id="map-description" name="description" rows={2} value={form.description} onChange={handleChange} placeholder={t('pages.mapEdit.placeholders.description')} />
              </label>
            </section>
            <section className={styles.mapEditorSection} aria-label={t('pages.mapEdit.editorLabel')}>
              <div className={styles.mapGrid} aria-label={t('pages.mapEdit.editorLabel')}>
                {gridCells.map((cell) => (
                  <div key={cell} className={styles.mapCell} aria-hidden="true" />
                ))}
                {lineSegments.map((line) => (
                  <button
                    key={line.id}
                    className={[
                      styles.lineSegment,
                      line.orientation === 'horizontal' ? styles.lineSegmentHorizontal : styles.lineSegmentVertical,
                      line.active ? styles.lineSegmentActive : '',
                      previewLineIds.includes(line.id) ? styles.lineSegmentPreview : '',
                      previewEraseLineIds.includes(line.id) ? styles.lineSegmentErasePreview : '',
                      selectedRangeStartId === line.id ? styles.lineSegmentRangeStart : '',
                      selectedEraseRangeStartId === line.id ? styles.lineSegmentEraseRangeStart : '',
                      previewLineIds.includes(line.id) ? styles[`lineSegment${selectedColor[0].toUpperCase()}${selectedColor.slice(1)}`] : '',
                      line.active ? styles[`lineSegment${line.color[0].toUpperCase()}${line.color.slice(1)}`] : '',
                    ].filter(Boolean).join(' ')}
                    type="button"
                    aria-label={t('pages.mapEdit.toggleLineLabel')}
                    aria-pressed={line.active}
                    style={{
                      left: `${(line.x / 34) * 100}%`,
                      top: `${(line.y / 22) * 100}%`,
                      ...(line.orientation === 'horizontal'
                        ? { width: `${100 / 34}%` }
                        : { height: `${100 / 22}%` }),
                    }}
                    onFocus={() => handlePreviewLine(line.id)}
                    onBlur={handleClearLinePreview}
                    onMouseEnter={() => handlePreviewLine(line.id)}
                    onMouseLeave={handleClearLinePreview}
                    onContextMenu={(event) => handleRemoveLine(line.id, event)}
                    onClick={() => handleToggleLine(line.id)}
                  >
                    <span className={styles.lineSegmentStroke} />
                  </button>
                ))}
              </div>
              <div className={styles.editorMenu}>
                <section className={styles.menuSection}>
                  <h2 className={styles.menuTitle}>{t('pages.mapEdit.drawModeLabel')}</h2>
                  <div className={styles.drawModeButtons} role="toolbar" aria-label={t('pages.mapEdit.drawModeLabel')}>
                    {drawModeOptions.map((mode) => (
                      <button key={mode.key} className={`${styles.drawModeButton} ${selectedDrawMode === mode.key ? styles.drawModeButtonActive : ''}`} type="button" aria-pressed={selectedDrawMode === mode.key} onClick={() => handleSelectDrawMode(mode.key)}>
                        {t(mode.labelKey)}
                      </button>
                    ))}
                  </div>
                </section>
                <section className={styles.menuSection}>
                  <h2 className={styles.menuTitle}>{t('pages.mapEdit.paletteLabel')}</h2>
                  <div className={styles.palette} role="toolbar" aria-label={t('pages.mapEdit.paletteLabel')}>
                    {colorOptions.map((color) => (
                      <button key={color.key} className={`${styles.paletteButton} ${styles[`paletteButton${color.key[0].toUpperCase()}${color.key.slice(1)}`]} ${selectedColor === color.key ? styles.paletteButtonActive : ''}`} type="button" aria-label={t(color.labelKey)} title={t(color.labelKey)} aria-pressed={selectedColor === color.key} onClick={() => handleSelectColor(color.key)}>
                        <span className={styles.paletteSwatch} />
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </section>
          </form>
        )}

        <UnsavedChangesDialog open={isUnsavedChangesDialogOpen} onCancel={() => setUnsavedChangesDialogOpen(false)} onConfirm={handleConfirmBackToList} />
      </section>
    </main>
  )
}
