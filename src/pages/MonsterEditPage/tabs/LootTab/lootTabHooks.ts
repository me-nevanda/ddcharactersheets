import { useState } from 'react'
import { useI18n } from '@i18n/index'
import type { CharacterItemGroupKey } from '@pages/CharacterEditPage/types'
import type { LootTabProps, PendingLootRemoval } from './types'

export const itemGroups = ['weapons', 'armors', 'others'] as const satisfies readonly CharacterItemGroupKey[]

export const useLootTab = ({ items, onItemRemove }: Pick<LootTabProps, 'items' | 'onItemRemove'>) => {
  const { t } = useI18n()
  const [activeGroup, setActiveGroup] = useState<CharacterItemGroupKey>('weapons')
  const [pendingRemoval, setPendingRemoval] = useState<PendingLootRemoval | null>(null)

  const handleRemoveItem = (group: CharacterItemGroupKey, index: number, itemName: string) => {
    setPendingRemoval({
      group,
      index,
      name: itemName || t('pages.monsterEdit.loot.title'),
    })
  }

  const handleConfirmRemoveItem = () => {
    if (!pendingRemoval) {
      return
    }

    onItemRemove(pendingRemoval.group, pendingRemoval.index)
    setPendingRemoval(null)
  }

  const handleCancelRemoveItem = () => {
    setPendingRemoval(null)
  }

  return {
    activeGroup,
    activeItems: items[activeGroup],
    handleCancelRemoveItem,
    handleConfirmRemoveItem,
    handleRemoveItem,
    pendingRemoval,
    setActiveGroup,
  }
}
