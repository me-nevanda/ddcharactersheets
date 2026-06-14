import type { ChangeEvent, MouseEvent, SubmitEvent } from 'react'
import type { MapData, MapElementCategory, MapElementVariant, MapGroundTexture, MapLineColor } from '@appTypes/map'
import type { VariantImagePickerCategory } from './VariantImagePicker/types'

export type MapPaletteColor = MapLineColor

export interface MapPaletteColorOption {
  key: MapPaletteColor
  labelKey: 'pages.mapEdit.colors.black' | 'pages.mapEdit.colors.red' | 'pages.mapEdit.colors.green' | 'pages.mapEdit.colors.blue' | 'pages.mapEdit.colors.white' | 'pages.mapEdit.colors.gray' | 'pages.mapEdit.colors.yellow' | 'pages.mapEdit.colors.orange' | 'pages.mapEdit.colors.purple' | 'pages.mapEdit.colors.brown' | 'pages.mapEdit.colors.tortoise' | 'pages.mapEdit.colors.pink'
}

export interface MapGroundTextureOption {
  key: MapGroundTexture
  imageSrc: string
}

export interface MapElementAssetOption {
  category: MapElementCategory
  variant: MapElementVariant
  imageSrc: string
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
  texture: MapGroundTexture
  x: number
  y: number
}

export interface MapElementViewModel {
  id: string
  active: boolean
  category: MapElementCategory
  imageSrc: string
  variant: MapElementVariant
  x: number
  y: number
}

export interface MapLabelViewModel {
  id: string
  active: boolean
  name: string
  x: number
  y: number
}

export interface MapEditPageState {
  colorOptions: MapPaletteColorOption[]
  groundTextureOptions: MapGroundTextureOption[]
  elementPickerCategories: VariantImagePickerCategory<MapElementCategory, MapElementVariant>[]
  drawModeOptions: MapDrawModeOption[]
  activeLayer: MapLayer
  error: string
  form: MapData
  handleChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleSelectDrawMode: (mode: MapDrawMode) => void
  handleSelectLayer: (layer: MapLayer) => void
  handleSelectColor: (color: MapPaletteColor) => void
  handleSelectGroundTexture: (texture: MapGroundTexture) => void
  handleSelectElementAsset: (category: MapElementCategory, variant: MapElementVariant) => void
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
  handleToggleElement: (elementId: string) => void
  handleRemoveElement: (elementId: string, event?: MouseEvent<HTMLElement>) => void
  handleToggleLabel: (labelId: string) => void
  handleRemoveLabel: (labelId: string, event?: MouseEvent<HTMLElement>) => void
  handleRenameLabel: (labelId: string, name: string) => void
  hasChanges: boolean
  elements: MapElementViewModel[]
  groundCells: MapGroundCellViewModel[]
  labels: MapLabelViewModel[]
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
  selectedGroundTexture: MapGroundTexture
  selectedElementCategory: MapElementCategory
  selectedElementVariant: MapElementVariant
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
