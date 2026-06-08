import type { CharacterHistoryEntryFieldName } from '../../types'

export interface HistoryTabState {
  handleAddHistoryEntry: () => void
  handleHistoryEntryChange: (index: number, fieldName: CharacterHistoryEntryFieldName, value: string) => void
  handleHistoryEntryRemove: (index: number) => void
}
