import { useState } from 'react'
import { useI18n } from '@i18n/index'
import { useCharacterEditPageContext } from '@pages/CharacterEditPage/characterEditPageContext'
import type { PendingFeatRemoval } from './types'

export function useFeatsTab() {
  const { t } = useI18n()
  const { form, handleFeatChange, handleFeatBonusFieldChange, handleFeatCreateEmpty, handleFeatRemove } =
    useCharacterEditPageContext()
  const [pendingRemoval, setPendingRemoval] = useState<PendingFeatRemoval | null>(null)

  function handleAddFeat() {
    handleFeatCreateEmpty()
  }

  function handleRemoveFeat(index: number) {
    setPendingRemoval({ index })
  }

  function handleConfirmRemoveFeat() {
    if (!pendingRemoval) {
      return
    }

    handleFeatRemove(pendingRemoval.index)
    setPendingRemoval(null)
  }

  function handleCancelRemoveFeat() {
    setPendingRemoval(null)
  }

  return {
    t,
    form,
    handleFeatChange,
    handleFeatBonusFieldChange,
    pendingRemoval,
    handleAddFeat,
    handleRemoveFeat,
    handleConfirmRemoveFeat,
    handleCancelRemoveFeat,
  }
}
