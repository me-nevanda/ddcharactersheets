export type MapLineColor = 'black' | 'red' | 'green' | 'blue' | 'white' | 'gray' | 'yellow' | 'orange' | 'purple'

export type MapGroundTexture = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '13' | '14' | '15'

export interface MapGridLine {
  id: string
  fromX: number
  fromY: number
  toX: number
  toY: number
  color: MapLineColor
}

export interface MapGridGroundCell {
  id: string
  x: number
  y: number
  texture: MapGroundTexture
}

export interface MapGridElement {
  id: string
  x: number
  y: number
  color: MapLineColor
}

export interface MapGridLabel {
  id: string
  x: number
  y: number
  name: string
}

export interface MapGridData {
  width: number
  height: number
  lines: MapGridLine[]
  ground: MapGridGroundCell[]
  elements: MapGridElement[]
  labels: MapGridLabel[]
}

export interface MapData {
  name: string
  description: string
  grid: MapGridData
}

export interface Map extends MapData {
  id: string
  updatedAt: string
}
