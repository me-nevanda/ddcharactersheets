export interface PlaceItem {
  id: string
  name: string
  description: string
}

export interface AreaData {
  uniqueId: string
  name: string
  description: string
  places: PlaceItem[]
}

export interface Area extends AreaData {
  id: string
  updatedAt: string
}
