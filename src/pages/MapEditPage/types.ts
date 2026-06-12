import type { ChangeEvent, MouseEvent, SubmitEvent } from 'react'
import type { MapData, MapLineColor } from '@appTypes/map'

export type MapPaletteColor = MapLineColor

export interface MapPaletteColorOption {
  key: MapPaletteColor
  labelKey: 'pages.mapEdit.colors.black' | 'pages.mapEdit.colors.red' | 'pages.mapEdit.colors.green' | 'pages.mapEdit.colors.blue' | 'pages.mapEdit.colors.white' | 'pages.mapEdit.colors.gray' | 'pages.mapEdit.colors.yellow'
}

export type MapDrawMode = 'single' | 'range' | 'rectangle'

export interface MapDrawModeOption {
  key: MapDrawMode
  labelKey: 'pages.mapEdit.drawModes.single' | 'pages.mapEdit.drawModes.range' | 'pages.mapEdit.drawModes.rectangle'
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

export interface MapEditPageState {
  colorOptions: MapPaletteColorOption[]
  drawModeOptions: MapDrawModeOption[]
  error: string
  form: MapData
  gridCells: number[]
  handleChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleSelectDrawMode: (mode: MapDrawMode) => void
  handleSelectColor: (color: MapPaletteColor) => void
  handleSubmit: (event: SubmitEvent<HTMLFormElement>) => Promise<void>
  handlePreviewLine: (lineId: string) => void
  handleClearLinePreview: () => void
  handleRemoveLine: (lineId: string, event?: MouseEvent<HTMLElement>) => void
  handleToggleLine: (lineId: string) => void
  hasChanges: boolean
  lineSegments: MapLineViewModel[]
  loading: boolean
  previewLineIds: string[]
  previewEraseLineIds: string[]
  selectedColor: MapPaletteColor
  selectedDrawMode: MapDrawMode
  selectedEraseRangeStartId: string
  selectedRangeStartId: string
  saving: boolean
}
