export interface PlaceItem {
  id: string
  name: string
  description: string
}

export interface AreaData {
  name: string
  description: string
  places: PlaceItem[]
}

export interface Area extends AreaData {
  id: string
  imageUrl: string
  updatedAt: string
}
