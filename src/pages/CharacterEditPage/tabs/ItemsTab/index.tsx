import { useState } from 'react'
import { useI18n } from '@i18n/index'
import { useCharacterEditPageContext } from '@pages/CharacterEditPage/characterEditPageContext'
import { ArmorItemCard } from './ArmorItemCard'
import { OtherItemCard } from './OtherItemCard'
import { WeaponItemCard } from './WeaponItemCard'
import type { CharacterArmor, CharacterOtherItem, CharacterWeapon } from '../../../../types/character'
import styles from '../../style.module.scss'

const itemGroups = ['weapons', 'armors', 'others'] as const

export function ItemsTab() {
  const { t } = useI18n()
  const {
    form,
    handleItemCreateEmpty,
    handleItemChange,
    handleItemBonusFieldChange,
    handleWeaponDamageChange,
    handleItemRemove,
    handleArmorBonusChange,
  } =
    useCharacterEditPageContext()
  const [activeGroup, setActiveGroup] = useState<(typeof itemGroups)[number]>('weapons')
  const [pendingRemoval, setPendingRemoval] = useState<{
    group: (typeof itemGroups)[number]
    index: number
    name: string
  } | null>(null)

  function handleRemoveItem(group: (typeof itemGroups)[number], index: number, itemName: string) {
    setPendingRemoval({
      group,
      index,
      name: itemName || t('pages.characterEdit.items.title'),
    })
  }

  function handleConfirmRemoveItem() {
    if (!pendingRemoval) {
      return
    }

    handleItemRemove(pendingRemoval.group, pendingRemoval.index)
    setPendingRemoval(null)
  }

  function handleCancelRemoveItem() {
    setPendingRemoval(null)
  }

  const activeItems = form.items[activeGroup]

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t('pages.characterEdit.items.title')}</h2>
      </div>

      <div className={styles.itemsGroupTabs} role="tablist" aria-label={t('pages.characterEdit.items.title')}>
        {itemGroups.map((group) => (
          <button
            key={group}
            id={`items-tab-${group}`}
            className={`${styles.itemsGroupTabButton} ${activeGroup === group ? styles.itemsGroupTabButtonActive : ''}`}
            type="button"
            role="tab"
            aria-selected={activeGroup === group}
            aria-controls={`items-panel-${group}`}
            onClick={() => setActiveGroup(group)}
          >
            {t(`pages.characterEdit.items.groups.${group}`)}
          </button>
        ))}
      </div>

      <section
        className={styles.section}
        id={`items-panel-${activeGroup}`}
        role="tabpanel"
        aria-labelledby={`items-tab-${activeGroup}`}
      >
        <div className={styles.sectionItemsHeader}>
          <button className={styles.primaryButton} type="button" onClick={() => handleItemCreateEmpty(activeGroup)}>
            {t('pages.characterEdit.items.addButton')}
          </button>
        </div>

        {activeItems.length === 0 ? <p className={styles.loadingText}>{t('pages.characterEdit.items.emptyState')}</p> : null}
        {activeItems.length > 0 ? (
          <div className={styles.abilityGrid}>
            {activeItems.map((item, index) => (
              <div key={`${activeGroup}-${index}`}>
                {activeGroup === 'weapons' ? (
                  <WeaponItemCard
                    index={index}
                    weapon={item as CharacterWeapon}
                    onNameChange={(weaponIndex, value) => handleItemChange(activeGroup, weaponIndex, 'name', value)}
                    onDescriptionChange={(weaponIndex, value) =>
                      handleItemChange(activeGroup, weaponIndex, 'description', value)
                    }
                    onRemove={(weaponIndex, name) => handleRemoveItem(activeGroup, weaponIndex, name)}
                    onDamageChange={handleWeaponDamageChange}
                    onBonusFieldChange={(weaponIndex, previousFieldName, nextFieldName) =>
                      handleItemBonusFieldChange(activeGroup, weaponIndex, previousFieldName, nextFieldName)
                    }
                  />
                ) : null}

                {activeGroup === 'armors' ? (
                  <ArmorItemCard
                    index={index}
                    armor={item as CharacterArmor}
                    onNameChange={(armorIndex, value) => handleItemChange(activeGroup, armorIndex, 'name', value)}
                    onDescriptionChange={(armorIndex, value) =>
                      handleItemChange(activeGroup, armorIndex, 'description', value)
                    }
                    onRemove={(armorIndex, name) => handleRemoveItem(activeGroup, armorIndex, name)}
                    onEquipChange={(armorIndex, value) => handleItemChange(activeGroup, armorIndex, 'equipped', value)}
                    onBonusChange={handleArmorBonusChange}
                    onBonusFieldChange={(armorIndex, previousFieldName, nextFieldName) =>
                      handleItemBonusFieldChange(activeGroup, armorIndex, previousFieldName, nextFieldName)
                    }
                  />
                ) : null}

                {activeGroup === 'others' ? (
                  <OtherItemCard
                    index={index}
                    item={item as CharacterOtherItem}
                    onNameChange={(itemIndex, value) => handleItemChange(activeGroup, itemIndex, 'name', value)}
                    onDescriptionChange={(itemIndex, value) =>
                      handleItemChange(activeGroup, itemIndex, 'description', value)
                    }
                    onRemove={(itemIndex, name) => handleRemoveItem(activeGroup, itemIndex, name)}
                    onEquipChange={(itemIndex, value) => handleItemChange(activeGroup, itemIndex, 'equipped', value)}
                    onBonusChange={(itemIndex, fieldName, value) =>
                      handleItemChange(activeGroup, itemIndex, fieldName, value)
                    }
                    onBonusFieldChange={(itemIndex, previousFieldName, nextFieldName) =>
                      handleItemBonusFieldChange(activeGroup, itemIndex, previousFieldName, nextFieldName)
                    }
                  />
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {pendingRemoval ? (
        <div className={styles.deleteBackdrop} role="presentation">
          <div
            className={styles.deleteDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-item-title"
          >
            <h2 className={styles.deleteDialogTitle} id="delete-item-title">
              {t('pages.characterEdit.items.removeDialog.title')}
            </h2>
            <p className={styles.deleteDialogText}>
              {t('pages.characterEdit.items.removeDialog.body', {
                name: pendingRemoval.name,
              })}
            </p>

            <div className={styles.deleteDialogActions}>
              <button
                className={styles.deleteDialogSecondaryButton}
                type="button"
                onClick={handleCancelRemoveItem}
              >
                {t('common.actions.cancel')}
              </button>
              <button
                className={styles.deleteDialogDangerButton}
                type="button"
                onClick={handleConfirmRemoveItem}
              >
                {t('common.actions.delete')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
