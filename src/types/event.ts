export interface EventData {
  uniqueId: string
  name: string
  description: string
}

export interface Event extends EventData {
  id: string
  updatedAt: string
}
