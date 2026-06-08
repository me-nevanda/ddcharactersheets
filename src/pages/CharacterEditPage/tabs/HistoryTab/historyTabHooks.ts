import { useI18n } from '@i18n/index'
import { useCharacterEditPageContext } from '../../characterEditPageContext'

export const useHistoryTab = () => {
  const { t } = useI18n()
  const {
    handleHistoryEntryChange,
    handleHistoryEntryCreateEmpty,
    handleHistoryEntryRemove,
    historyEntries,
  } = useCharacterEditPageContext()

  return {
    handleAddHistoryEntry: handleHistoryEntryCreateEmpty,
    handleHistoryEntryChange,
    handleHistoryEntryRemove,
    historyEntries,
    t,
  }
}
