import { useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { BubbleChatIcon, Coordinate02Icon, FloorPlanIcon, Tree03Icon } from '@hugeicons/core-free-icons'
import { Link, useParams } from 'react-router-dom'
import { AppIcon } from '@components/AppIcon'
import { UnsavedChangesDialog } from '@components/UnsavedChangesDialog'
import { useI18n } from '@i18n/index'
import { useEditReturnNavigation } from '@pages/useEditReturnNavigation'
import { VariantImagePicker } from './VariantImagePicker'
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
  const { mapId = '' } = useParams()
  const { applyReturnTabs, navigateBack, returnTo } = useEditReturnNavigation({
    mainTab: 'maps',
    returnTo: '/',
  })
  const { activeLayer, colorOptions, drawModeOptions, elementPickerCategories, elements, error, form, groundCells, groundTextureOptions, handleChange, handleClearLinePreview, handlePreviewGroundCell, handlePreviewLine, handlePreviewPoint, handleRemoveElement, handleRemoveGroundCell, handleRemoveLabel, handleRemoveLine, handleRemovePoint, handleRenameLabel, handleSelectColor, handleSelectDrawMode, handleSelectElementAsset, handleSelectGroundTexture, handleSelectLayer, handleSelectPoint, handleSubmit, handleToggleElement, handleToggleGroundCell, handleToggleLabel, handleToggleLine, hasChanges, labels, layerOptions, lineSegments, loading, pointSegments, previewEraseGroundCellIds, previewEraseLineIds, previewGroundCellIds, previewLineIds, previewRectangleGroundCellIds, previewRectangleLineIds, selectedColor, selectedDrawMode, selectedElementCategory, selectedElementVariant, selectedEraseGroundRangeStartId, selectedEraseRangeStartId, selectedGroundRangeStartId, selectedGroundRectangleStartId, selectedGroundTexture, selectedPointEraseStartId, selectedPointRangeStartId, selectedRectangleStartId, selectedRangeStartId, saving } = useMapEditPage()
  const [isUnsavedChangesDialogOpen, setUnsavedChangesDialogOpen] = useState(false)
  const [isMapFullscreen, setMapFullscreen] = useState(false)
  const [editingLabelId, setEditingLabelId] = useState('')
  const [labelDraftName, setLabelDraftName] = useState('')
  const getGroundTextureSrc = (texture: string) => {
    return groundTextureOptions.find((option) => option.key === texture)?.imageSrc ?? groundTextureOptions[0]?.imageSrc ?? ''
  }
  const groundTextureLabelKeys = {
    '1': 'pages.mapEdit.groundTextureVariants.grass',
    '2': 'pages.mapEdit.groundTextureVariants.water',
    '3': 'pages.mapEdit.groundTextureVariants.sand',
    '4': 'pages.mapEdit.groundTextureVariants.woodenFloor',
    '5': 'pages.mapEdit.groundTextureVariants.gravel',
    '6': 'pages.mapEdit.groundTextureVariants.cobblestone',
    '7': 'pages.mapEdit.groundTextureVariants.ice',
    '8': 'pages.mapEdit.groundTextureVariants.lava',
    '9': 'pages.mapEdit.groundTextureVariants.stoneFloor',
    '10': 'pages.mapEdit.groundTextureVariants.parquet',
    '11': 'pages.mapEdit.groundTextureVariants.stonyGround',
    '12': 'pages.mapEdit.groundTextureVariants.woodenTerrace',
    '13': 'pages.mapEdit.groundTextureVariants.swamp',
    '14': 'pages.mapEdit.groundTextureVariants.crackFissure',
    '15': 'pages.mapEdit.groundTextureVariants.unevenTerrain',
  } as const
  const getGroundTextureLabel = (texture: string) => {
    const labelKey = groundTextureLabelKeys[texture as keyof typeof groundTextureLabelKeys]

    return labelKey ? t(labelKey) : t('pages.mapEdit.groundTextureLabel', { number: texture })
  }
  const groundLayerIconSrc = getGroundTextureSrc('6')
  const elementLayerIconSrc = elementPickerCategories.find((category) => category.key === 'trees')?.options[0]?.imageSrc ?? ''

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

  const handleToggleMapFullscreen = () => {
    setMapFullscreen((current) => !current)
  }

  const handlePrintMap = () => {
    if (!mapId) {
      return
    }

    window.open(`/maps/${mapId}/print`, '_blank')
  }

  const handleOpenLabelEditor = (labelId: string, name: string) => {
    setEditingLabelId(labelId)
    setLabelDraftName(name)
  }

  const handleConfirmLabelName = () => {
    setEditingLabelId('')
    setLabelDraftName('')
  }

  const handleChangeLabelName = (labelId: string, value: string) => {
    setLabelDraftName(value)
    handleRenameLabel(labelId, value)
  }

  const handleLabelContextMenu = (labelId: string, event: ReactMouseEvent<HTMLElement>) => {
    handleRemoveLabel(labelId, event)
    if (editingLabelId === labelId) {
      setEditingLabelId('')
      setLabelDraftName('')
    }
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
            <button className={`${styles.ghostLink} ${styles.mapPrintAction}`} type="button" onClick={handlePrintMap}>
              <span className={styles.buttonContent}>
                <AppIcon name="print" />
                <span>{t('common.actions.print')}</span>
              </span>
            </button>
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
            <section className={`${styles.mapEditorSection} ${isMapFullscreen ? styles.mapEditorSectionFullscreen : ''}`} aria-label={t('pages.mapEdit.editorLabel')}>
              <div className={styles.mapWorkspace}>
                <div className={`${styles.mapGrid} ${activeLayer === 'lines' && selectedDrawMode === 'single' ? styles.mapGridSingleMode : ''}`} aria-label={t('pages.mapEdit.editorLabel')}>
                  {groundCells.map((cell) => {
                    const isGroundPreview = activeLayer === 'ground' && (previewGroundCellIds.includes(cell.id) || previewRectangleGroundCellIds.includes(cell.id))
                    const groundTextureSrc = cell.active ? getGroundTextureSrc(cell.texture) : ''
                    const previewGroundTextureSrc = isGroundPreview ? getGroundTextureSrc(selectedGroundTexture) : ''
                    const groundCellStyle: CSSProperties & { '--map-cell-preview-texture'?: string } = {
                      ...(groundTextureSrc ? { backgroundImage: `url(${groundTextureSrc})` } : {}),
                      ...(previewGroundTextureSrc ? { '--map-cell-preview-texture': `url(${previewGroundTextureSrc})` } : {}),
                    }

                    return (
                      <button
                        key={cell.id}
                        className={[
                          styles.mapCell,
                          activeLayer === 'ground' ? styles.mapCellEditable : '',
                          groundTextureSrc || previewGroundTextureSrc ? styles.mapCellTextured : '',
                          activeLayer === 'ground' && previewGroundCellIds.includes(cell.id) ? styles.mapCellPreview : '',
                          activeLayer === 'ground' && previewRectangleGroundCellIds.includes(cell.id) ? styles.mapCellPreview : '',
                          activeLayer === 'ground' && previewEraseGroundCellIds.includes(cell.id) ? styles.mapCellErasePreview : '',
                          activeLayer === 'ground' && selectedDrawMode === 'range' && selectedGroundRangeStartId === cell.id ? styles.mapCellRangeStart : '',
                          activeLayer === 'ground' && selectedDrawMode === 'range' && selectedEraseGroundRangeStartId === cell.id ? styles.mapCellEraseRangeStart : '',
                          activeLayer === 'ground' && selectedDrawMode === 'rectangle' && selectedGroundRectangleStartId === cell.id ? styles.mapCellRangeStart : '',
                        ].filter(Boolean).join(' ')}
                        type="button"
                        aria-label={t('pages.mapEdit.toggleGroundCellLabel')}
                        aria-pressed={cell.active}
                        disabled={activeLayer !== 'ground'}
                        style={groundTextureSrc || previewGroundTextureSrc ? groundCellStyle : undefined}
                        onFocus={() => handlePreviewGroundCell(cell.id)}
                        onBlur={handleClearLinePreview}
                        onMouseEnter={() => handlePreviewGroundCell(cell.id)}
                        onMouseLeave={handleClearLinePreview}
                        onContextMenu={(event) => handleRemoveGroundCell(cell.id, event)}
                        onClick={() => handleToggleGroundCell(cell.id)}
                      />
                    )
                  })}
                  {lineSegments.map((line) => (
                    <button
                      key={line.id}
                      className={[
                        styles.lineSegment,
                        activeLayer !== 'lines' ? styles.lineSegmentDisabled : '',
                        activeLayer === 'lines' && selectedDrawMode !== 'single' ? styles.lineSegmentPointMode : '',
                        line.orientation === 'horizontal' ? styles.lineSegmentHorizontal : styles.lineSegmentVertical,
                        line.orientation === 'horizontal' && line.y === 0 ? styles.lineSegmentTopEdge : '',
                        line.orientation === 'horizontal' && line.y === 22 ? styles.lineSegmentBottomEdge : '',
                        line.orientation === 'vertical' && line.x === 0 ? styles.lineSegmentLeftEdge : '',
                        line.orientation === 'vertical' && line.x === 34 ? styles.lineSegmentRightEdge : '',
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
                  {elements.map((element) => (
                    <button
                      key={element.id}
                      className={[
                        styles.mapElement,
                        activeLayer === 'elements' ? styles.mapElementEditable : '',
                        element.active ? styles.mapElementActive : '',
                        element.active ? styles.mapElementTextured : '',
                      ].filter(Boolean).join(' ')}
                      type="button"
                      aria-label={t('pages.mapEdit.toggleElementLabel')}
                      aria-pressed={element.active}
                      disabled={activeLayer !== 'elements'}
                      style={{
                        left: `${(element.x / 34) * 100}%`,
                        top: `${(element.y / 22) * 100}%`,
                        width: `${100 / 34}%`,
                        height: `${100 / 22}%`,
                        ...(element.active ? { backgroundImage: `url(${element.imageSrc})` } : {}),
                      }}
                      onContextMenu={(event) => handleRemoveElement(element.id, event)}
                      onClick={() => handleToggleElement(element.id)}
                    />
                  ))}
                  {labels.map((label) => (
                    <div
                      key={label.id}
                      className={[
                        styles.mapLabel,
                        activeLayer === 'labels' ? styles.mapLabelEditable : styles.mapLabelDimmed,
                        label.active ? styles.mapLabelActive : '',
                        label.name.trim() ? styles.mapLabelHasName : '',
                        editingLabelId === label.id ? styles.mapLabelEditing : '',
                        label.y <= 2 ? styles.mapLabelNearTop : '',
                        label.x >= 29 ? styles.mapLabelNearRight : '',
                      ].filter(Boolean).join(' ')}
                      style={{
                        left: `${(label.x / 34) * 100}%`,
                        top: `${(label.y / 22) * 100}%`,
                        width: `${100 / 34}%`,
                        height: `${100 / 22}%`,
                      }}
                    >
                      <button
                        className={styles.mapLabelButton}
                        type="button"
                        aria-label={t('pages.mapEdit.toggleLabelLabel')}
                        aria-pressed={label.active}
                        disabled={activeLayer !== 'labels'}
                        onContextMenu={(event) => handleLabelContextMenu(label.id, event)}
                        onClick={() => handleToggleLabel(label.id)}
                        onDoubleClick={() => handleOpenLabelEditor(label.id, label.name)}
                      >
                        <span className={styles.mapLabelDot} />
                      </button>
                      {activeLayer === 'labels' && editingLabelId === label.id ? (
                        <div className={styles.mapLabelTooltip}>
                          <input className={styles.mapLabelInput} type="text" value={labelDraftName} aria-label={t('pages.mapEdit.labelNameInputLabel')} onChange={(event) => handleChangeLabelName(label.id, event.target.value)} onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault()
                              handleConfirmLabelName()
                            }
                          }} autoFocus />
                          <button className={styles.mapLabelConfirmButton} type="button" aria-label={t('pages.mapEdit.confirmLabelNameLabel')} onClick={handleConfirmLabelName}>
                            <AppIcon name="check" />
                          </button>
                        </div>
                      ) : null}
                    </div>
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
                {isMapFullscreen ? (
                  <button className={`${styles.primaryButton} ${styles.fullscreenSaveButton}`} form="map-edit-form" type="submit" disabled={saving || !hasChanges}>
                    <span className={styles.buttonContent}>
                      <AppIcon name="save" />
                      <span>{saving ? t('common.states.saving') : t('common.actions.save')}</span>
                    </span>
                  </button>
                ) : null}
                <button className={styles.fullscreenButton} type="button" aria-pressed={isMapFullscreen} onClick={handleToggleMapFullscreen}>
                  {isMapFullscreen ? t('pages.mapEdit.exitFullscreen') : t('pages.mapEdit.enterFullscreen')}
                </button>
                <div className={styles.layerTabs} role="tablist" aria-label={t('pages.mapEdit.layersLabel')}>
                  {layerOptions.map((layer) => (
                    <button key={layer.key} className={`${styles.layerTab} ${activeLayer === layer.key ? styles.layerTabActive : ''}`} type="button" role="tab" aria-selected={activeLayer === layer.key} aria-label={t(layer.labelKey)} title={t(layer.labelKey)} onClick={() => handleSelectLayer(layer.key)}>
                      {layer.key === 'lines' ? (
                        <span className={styles.layerLineIcon} aria-hidden="true" />
                      ) : layer.key === 'ground' && groundLayerIconSrc ? (
                        <img className={styles.layerImageIcon} src={groundLayerIconSrc} alt="" aria-hidden="true" />
                      ) : layer.key === 'elements' && elementLayerIconSrc ? (
                        <img className={styles.layerImageIcon} src={elementLayerIconSrc} alt="" aria-hidden="true" />
                      ) : (
                        <HugeiconsIcon aria-hidden="true" className={styles.layerIcon} color="currentColor" icon={layerIconMap[layer.key]} strokeWidth={1.8} />
                      )}
                    </button>
                  ))}
                </div>
                {activeLayer === 'lines' || activeLayer === 'ground' || activeLayer === 'elements' ? <div className={styles.editorMenu}>
                  {activeLayer !== 'elements' ? <section className={styles.menuSection}>
                    <h2 className={styles.menuTitle}>{t('pages.mapEdit.drawModeLabel')}</h2>
                    <div className={styles.drawModeButtons} role="toolbar" aria-label={t('pages.mapEdit.drawModeLabel')}>
                      {drawModeOptions.map((mode) => (
                        <button key={mode.key} className={`${styles.drawModeButton} ${selectedDrawMode === mode.key ? styles.drawModeButtonActive : ''}`} type="button" aria-label={t(mode.labelKey)} title={t(mode.labelKey)} aria-pressed={selectedDrawMode === mode.key} onClick={() => handleSelectDrawMode(mode.key)}>
                          <span className={`${styles.drawModeIcon} ${styles[`drawModeIcon${mode.key[0].toUpperCase()}${mode.key.slice(1)}`]}`} aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                  </section> : null}
                  <section className={styles.menuSection}>
                    <h2 className={styles.menuTitle}>{t(activeLayer === 'ground' ? 'pages.mapEdit.groundPaletteLabel' : activeLayer === 'elements' ? 'pages.mapEdit.elementPaletteLabel' : 'pages.mapEdit.paletteLabel')}</h2>
                    {activeLayer === 'ground' ? (
                      <div className={styles.groundTexturePalette} role="toolbar" aria-label={t('pages.mapEdit.groundPaletteLabel')}>
                        {groundTextureOptions.map((texture) => {
                          const textureLabel = getGroundTextureLabel(texture.key)

                          return (
                            <button key={texture.key} className={`${styles.groundTextureButton} ${selectedGroundTexture === texture.key ? styles.groundTextureButtonActive : ''}`} type="button" aria-label={textureLabel} title={textureLabel} aria-pressed={selectedGroundTexture === texture.key} onClick={() => handleSelectGroundTexture(texture.key)}>
                              <img className={styles.groundTextureImage} src={texture.imageSrc} alt="" aria-hidden="true" />
                            </button>
                          )
                        })}
                      </div>
                    ) : activeLayer === 'elements' ? (
                      <VariantImagePicker activeCategory={selectedElementCategory} activeVariant={selectedElementVariant} ariaLabel={t('pages.mapEdit.elementPaletteLabel')} categories={elementPickerCategories} popoverPlacement={isMapFullscreen ? 'left' : 'right'} onSelect={handleSelectElementAsset} />
                    ) : (
                      <div className={styles.palette} role="toolbar" aria-label={t('pages.mapEdit.paletteLabel')}>
                        {colorOptions.map((color) => (
                          <button key={color.key} className={`${styles.paletteButton} ${styles[`paletteButton${color.key[0].toUpperCase()}${color.key.slice(1)}`]} ${selectedColor === color.key ? styles.paletteButtonActive : ''}`} type="button" aria-label={t(color.labelKey)} title={t(color.labelKey)} aria-pressed={selectedColor === color.key} onClick={() => handleSelectColor(color.key)}>
                            <span className={styles.paletteSwatch} />
                          </button>
                        ))}
                      </div>
                    )}
                  </section>
                  {activeLayer === 'elements' ? (
                    <section className={styles.menuSection}>
                      <p className={styles.elementHintText}>{t('pages.mapEdit.elementVariantHint')}</p>
                    </section>
                  ) : null}
                </div> : activeLayer === 'labels' ? null : (
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
