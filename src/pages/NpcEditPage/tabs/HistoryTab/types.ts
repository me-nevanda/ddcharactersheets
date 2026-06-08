import type { NpcHistoryEntry } from '@appTypes/npc'

export interface HistoryTabProps {
  historyEntries: NpcHistoryEntry[]
  onHistoryEntryAdd: () => void
  onHistoryEntryChange: (index: number, fieldName: keyof NpcHistoryEntry, value: string) => void
  onHistoryEntryRemove: (index: number) => void
}
