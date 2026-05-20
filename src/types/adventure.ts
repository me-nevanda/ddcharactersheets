export interface AdventureData {
  uniqueId: string
  name: string
  prompt: string
  output: string
}

export interface Adventure extends AdventureData {
  id: string
  updatedAt: string
}
