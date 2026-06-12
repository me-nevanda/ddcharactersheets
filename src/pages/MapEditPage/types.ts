import type { ChangeEvent, MouseEvent, SubmitEvent } from 'react'
import type { MapData, MapLineColor } from '@appTypes/map'

export type MapPaletteColor = MapLineColor

export interface MapPaletteColorOption {
  key: MapPaletteColor
  labelKey: 'pages.mapEdit.colors.black' | 'pages.mapEdit.colors.red' | 'pages.mapEdit.colors.green' | 'pages.mapEdit.colors.blue' | 'pages.mapEdit.colors.white' | 'pages.mapEdit.colors.gray' | 'pages.mapEdit.colors.yellow' | 'pages.mapEdit.colors.orange' | 'pages.mapEdit.colors.purple'
}

export type MapDrawMode = 'single' | 'range' | 'rectangle'

export interface MapDrawModeOption {
  key: MapDrawMode
  labelKey: 'pages.mapEdit.drawModes.single' | 'pages.mapEdit.drawModes.range' | 'pages.mapEdit.drawModes.rectangle'
}

export type MapLayer = 'lines' | 'ground' | 'elements' | 'labels'

export interface MapLayerOption {
  key: MapLayer
  labelKey: 'pages.mapEdit.layers.lines' | 'pages.mapEdit.layers.ground' | 'pages.mapEdit.layers.elements' | 'pages.mapEdit.layers.labels'
}

export type MapLineOrientation = 'horizontal' | 'vertical'

export interface MapLineViewModel {
  id: string
  active: boolean
  color: MapPaletteColor
  orientation: MapLineOrientation
  x: number
  y: number
}

export interface MapPointViewModel {
  id: string
  x: number
  y: number
}

export interface MapGroundCellViewModel {
  id: string
  active: boolean
  color: MapPaletteColor
  x: number
  y: number
}

export interface MapEditPageState {
  colorOptions: MapPaletteColorOption[]
  drawModeOptions: MapDrawModeOption[]
  activeLayer: MapLayer
  error: string
  form: MapData
  handleChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleSelectDrawMode: (mode: MapDrawMode) => void
  handleSelectLayer: (layer: MapLayer) => void
  handleSelectColor: (color: MapPaletteColor) => void
  handleSubmit: (event: SubmitEvent<HTMLFormElement>) => Promise<void>
  handlePreviewLine: (lineId: string) => void
  handleClearLinePreview: () => void
  handleRemoveLine: (lineId: string, event?: MouseEvent<HTMLElement>) => void
  handleRemovePoint: (pointId: string, event?: MouseEvent<HTMLElement>) => void
  handleSelectPoint: (pointId: string) => void
  handlePreviewPoint: (pointId: string) => void
  handleToggleLine: (lineId: string) => void
  handlePreviewGroundCell: (cellId: string) => void
  handleToggleGroundCell: (cellId: string) => void
  handleRemoveGroundCell: (cellId: string, event?: MouseEvent<HTMLElement>) => void
  hasChanges: boolean
  groundCells: MapGroundCellViewModel[]
  layerOptions: MapLayerOption[]
  lineSegments: MapLineViewModel[]
  loading: boolean
  pointSegments: MapPointViewModel[]
  previewLineIds: string[]
  previewEraseLineIds: string[]
  previewEraseGroundCellIds: string[]
  previewGroundCellIds: string[]
  previewRectangleLineIds: string[]
  previewRectangleGroundCellIds: string[]
  selectedColor: MapPaletteColor
  selectedDrawMode: MapDrawMode
  selectedEraseGroundRangeStartId: string
  selectedGroundRangeStartId: string
  selectedGroundRectangleStartId: string
  selectedEraseRangeStartId: string
  selectedPointEraseStartId: string
  selectedRectangleStartId: string
  selectedPointRangeStartId: string
  selectedRangeStartId: string
  saving: boolean
}
