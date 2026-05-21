export interface PlaceItem {
  id: string
  name: string
  description: string
}

export interface PlaceData {
  uniqueId: string
  name: string
  description: string
  places: PlaceItem[]
}

export interface Place extends PlaceData {
  id: string
  updatedAt: string
}
