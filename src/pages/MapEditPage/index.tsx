import { useState, type MouseEvent as ReactMouseEvent } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { BubbleChatIcon, Coordinate02Icon, FloorPlanIcon, Tree03Icon } from '@hugeicons/core-free-icons'
import { Link } from 'react-router-dom'
import { AppIcon } from '@components/AppIcon'
import { UnsavedChangesDialog } from '@components/UnsavedChangesDialog'
import { useI18n } from '@i18n/index'
import { useEditReturnNavigation } from '@pages/useEditReturnNavigation'
import { useMapEditPage } from './mapEditPageHooks'
import type { MapLayer } from './types'
import styles from './style.module.scss'

const layerIconMap = {
  lines: Coordinate02Icon,
  ground: FloorPlanIcon,
  elements: Tree03Icon,
  labels: BubbleChatIcon,
} satisfies Record<MapLayer, typeof Coordinate02Icon>

export const MapEditPage = () => {
  const { t } = useI18n()
  const { applyReturnTabs, navigateBack, returnTo } = useEditReturnNavigation({
    mainTab: 'maps',
    returnTo: '/',
  })
  const { activeLayer, colorOptions, drawModeOptions, error, form, groundCells, handleChange, handleClearLinePreview, handlePreviewGroundCell, handlePreviewLine, handlePreviewPoint, handleRemoveGroundCell, handleRemoveLine, handleRemovePoint, handleSelectColor, handleSelectDrawMode, handleSelectLayer, handleSelectPoint, handleSubmit, handleToggleGroundCell, handleToggleLine, hasChanges, layerOptions, lineSegments, loading, pointSegments, previewEraseGroundCellIds, previewEraseLineIds, previewGroundCellIds, previewLineIds, previewRectangleGroundCellIds, previewRectangleLineIds, selectedColor, selectedDrawMode, selectedEraseGroundRangeStartId, selectedEraseRangeStartId, selectedGroundRangeStartId, selectedGroundRectangleStartId, selectedPointEraseStartId, selectedPointRangeStartId, selectedRectangleStartId, selectedRangeStartId, saving } = useMapEditPage()
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
              <div className={styles.mapWorkspace}>
                <div className={`${styles.mapGrid} ${activeLayer === 'lines' && selectedDrawMode === 'single' ? styles.mapGridSingleMode : ''}`} aria-label={t('pages.mapEdit.editorLabel')}>
                  {groundCells.map((cell) => (
                    <button
                      key={cell.id}
                      className={[
                        styles.mapCell,
                        activeLayer === 'ground' ? styles.mapCellEditable : '',
                        cell.active ? styles.mapCellActive : '',
                        activeLayer === 'ground' && previewGroundCellIds.includes(cell.id) ? styles.mapCellPreview : '',
                        activeLayer === 'ground' && previewRectangleGroundCellIds.includes(cell.id) ? styles.mapCellPreview : '',
                        activeLayer === 'ground' && previewEraseGroundCellIds.includes(cell.id) ? styles.mapCellErasePreview : '',
                        activeLayer === 'ground' && selectedDrawMode === 'range' && selectedGroundRangeStartId === cell.id ? styles.mapCellRangeStart : '',
                        activeLayer === 'ground' && selectedDrawMode === 'range' && selectedEraseGroundRangeStartId === cell.id ? styles.mapCellEraseRangeStart : '',
                        activeLayer === 'ground' && selectedDrawMode === 'rectangle' && selectedGroundRectangleStartId === cell.id ? styles.mapCellRangeStart : '',
                        activeLayer === 'ground' && (previewGroundCellIds.includes(cell.id) || previewRectangleGroundCellIds.includes(cell.id)) ? styles[`mapCell${selectedColor[0].toUpperCase()}${selectedColor.slice(1)}`] : '',
                        cell.active ? styles[`mapCell${cell.color[0].toUpperCase()}${cell.color.slice(1)}`] : '',
                      ].filter(Boolean).join(' ')}
                      type="button"
                      aria-label={t('pages.mapEdit.toggleGroundCellLabel')}
                      aria-pressed={cell.active}
                      disabled={activeLayer !== 'ground'}
                      onFocus={() => handlePreviewGroundCell(cell.id)}
                      onBlur={handleClearLinePreview}
                      onMouseEnter={() => handlePreviewGroundCell(cell.id)}
                      onMouseLeave={handleClearLinePreview}
                      onContextMenu={(event) => handleRemoveGroundCell(cell.id, event)}
                      onClick={() => handleToggleGroundCell(cell.id)}
                    />
                  ))}
                  {lineSegments.map((line) => (
                    <button
                      key={line.id}
                      className={[
                        styles.lineSegment,
                        activeLayer !== 'lines' ? styles.lineSegmentDisabled : '',
                        line.orientation === 'horizontal' ? styles.lineSegmentHorizontal : styles.lineSegmentVertical,
                        line.active ? styles.lineSegmentActive : '',
                        activeLayer === 'lines' && previewLineIds.includes(line.id) ? styles.lineSegmentPreview : '',
                        activeLayer === 'lines' && selectedDrawMode === 'single' && previewEraseLineIds.includes(line.id) ? styles.lineSegmentErasePreview : '',
                        activeLayer === 'lines' && previewRectangleLineIds.includes(line.id) ? styles.lineSegmentPreview : '',
                        activeLayer === 'lines' && selectedDrawMode === 'single' && selectedRangeStartId === line.id ? styles.lineSegmentRangeStart : '',
                        activeLayer === 'lines' && selectedDrawMode === 'single' && selectedEraseRangeStartId === line.id ? styles.lineSegmentEraseRangeStart : '',
                        activeLayer === 'lines' && (previewLineIds.includes(line.id) || previewRectangleLineIds.includes(line.id)) ? styles[`lineSegment${selectedColor[0].toUpperCase()}${selectedColor.slice(1)}`] : '',
                        line.active ? styles[`lineSegment${line.color[0].toUpperCase()}${line.color.slice(1)}`] : '',
                      ].filter(Boolean).join(' ')}
                      type="button"
                      aria-label={t('pages.mapEdit.toggleLineLabel')}
                      aria-pressed={line.active}
                      disabled={activeLayer !== 'lines'}
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
                  {activeLayer === 'lines' && (selectedDrawMode === 'range' || selectedDrawMode === 'rectangle') ? pointSegments.map((point) => (
                    <button
                      key={point.id}
                      className={`${styles.mapPoint} ${selectedRectangleStartId === point.id || selectedPointRangeStartId === point.id || selectedPointEraseStartId === point.id ? styles.mapPointActive : ''}`}
                      type="button"
                      aria-label={t('pages.mapEdit.toggleLineLabel')}
                      style={{
                        left: `${(point.x / 34) * 100}%`,
                        top: `${(point.y / 22) * 100}%`,
                      }}
                      onFocus={() => handlePreviewPoint(point.id)}
                      onBlur={handleClearLinePreview}
                      onMouseEnter={() => handlePreviewPoint(point.id)}
                      onMouseLeave={handleClearLinePreview}
                      onContextMenu={(event) => handleRemovePoint(point.id, event)}
                      onClick={() => handleSelectPoint(point.id)}
                    />
                  )) : null}
                </div>
              </div>
              <div className={styles.editorSide}>
                <div className={styles.layerTabs} role="tablist" aria-label={t('pages.mapEdit.layersLabel')}>
                  {layerOptions.map((layer) => (
                    <button key={layer.key} className={`${styles.layerTab} ${activeLayer === layer.key ? styles.layerTabActive : ''}`} type="button" role="tab" aria-selected={activeLayer === layer.key} aria-label={t(layer.labelKey)} title={t(layer.labelKey)} onClick={() => handleSelectLayer(layer.key)}>
                      <HugeiconsIcon aria-hidden="true" className={styles.layerIcon} color="currentColor" icon={layerIconMap[layer.key]} strokeWidth={1.8} />
                    </button>
                  ))}
                </div>
                {activeLayer === 'lines' || activeLayer === 'ground' ? <div className={styles.editorMenu}>
                  <section className={styles.menuSection}>
                    <h2 className={styles.menuTitle}>{t('pages.mapEdit.drawModeLabel')}</h2>
                    <div className={styles.drawModeButtons} role="toolbar" aria-label={t('pages.mapEdit.drawModeLabel')}>
                      {drawModeOptions.map((mode) => (
                        <button key={mode.key} className={`${styles.drawModeButton} ${selectedDrawMode === mode.key ? styles.drawModeButtonActive : ''}`} type="button" aria-label={t(mode.labelKey)} title={t(mode.labelKey)} aria-pressed={selectedDrawMode === mode.key} onClick={() => handleSelectDrawMode(mode.key)}>
                          <span className={`${styles.drawModeIcon} ${styles[`drawModeIcon${mode.key[0].toUpperCase()}${mode.key.slice(1)}`]}`} aria-hidden="true" />
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
                </div> : (
                  <section className={styles.menuSection}>
                    <p className={styles.emptyLayerTools}>{t('pages.mapEdit.emptyLayer')}</p>
                  </section>
                )}
              </div>
            </section>
          </form>
        )}

        <UnsavedChangesDialog open={isUnsavedChangesDialogOpen} onCancel={() => setUnsavedChangesDialogOpen(false)} onConfirm={handleConfirmBackToList} />
      </section>
    </main>
  )
}
