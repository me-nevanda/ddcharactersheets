export interface ContextData {
  uniqueId: string
  name: string
  description: string
}

export interface Context extends ContextData {
  id: string
  updatedAt: string
}
