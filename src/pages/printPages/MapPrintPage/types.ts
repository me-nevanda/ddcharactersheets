import type { Map, MapLineColor } from '@appTypes/map'

export type PrintMapLineOrientation = 'horizontal' | 'vertical'

export interface PrintMapGroundCell {
  id: string
  textureSrc: string
}

export interface PrintMapLine {
  color: MapLineColor
  id: string
  orientation: PrintMapLineOrientation
  x: number
  y: number
  width: number
  height: number
}

export interface PrintMapElement {
  id: string
  imageSrc: string
  x: number
  y: number
}

export interface PrintMapLabel {
  id: string
  name: string
  number: number
  x: number
  y: number
}

export interface MapPrintPageState {
  description: string
  elements: PrintMapElement[]
  error: string
  groundCells: PrintMapGroundCell[]
  labels: PrintMapLabel[]
  lines: PrintMapLine[]
  loading: boolean
  map: Map | null
  mapName: string
  title: string
}
