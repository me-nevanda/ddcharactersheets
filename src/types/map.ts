export type MapLineColor = 'black' | 'red' | 'green' | 'blue' | 'white' | 'gray' | 'yellow' | 'orange' | 'purple'

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
  color: MapLineColor
}

export interface MapGridData {
  width: number
  height: number
  lines: MapGridLine[]
  ground: MapGridGroundCell[]
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
