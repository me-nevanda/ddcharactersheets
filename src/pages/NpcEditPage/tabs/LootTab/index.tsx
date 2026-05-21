import { AppIcon } from '@components/AppIcon'
import { useI18n } from '@i18n/index'
import { ArmorItemCard } from '@pages/CharacterEditPage/tabs/ItemsTab/ArmorItemCard'
import { OtherItemCard } from '@pages/CharacterEditPage/tabs/ItemsTab/OtherItemCard'
import { WeaponItemCard } from '@pages/CharacterEditPage/tabs/ItemsTab/WeaponItemCard'
import type { CharacterArmor, CharacterOtherItem, CharacterWeapon } from '@appTypes/character'
import { itemGroups, useLootTab } from './lootTabHooks'
import type { LootTabProps } from './types'
import styles from '../../style.module.scss'

export const LootTab = ({
  items,
  onArmorBonusChange,
  onItemBonusFieldChange,
  onItemChange,
  onItemCreateEmpty,
  onItemRemove,
  onWeaponDamageChange,
}: LootTabProps) => {
  const { t } = useI18n()
  const {
    activeGroup,
    activeItems,
    handleCancelRemoveItem,
    handleConfirmRemoveItem,
    handleRemoveItem,
    pendingRemoval,
    setActiveGroup,
  } = useLootTab({ items, onItemRemove })

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t('pages.npcEdit.loot.title')}</h2>
      </div>

      <div className={styles.itemsGroupTabsRow}>
        <div className={styles.itemsGroupTabs} role="tablist" aria-label={t('pages.npcEdit.loot.title')}>
          {itemGroups.map((group) => (
            <button key={group} id={`npc-loot-tab-${group}`} className={`${styles.itemsGroupTabButton} ${activeGroup === group ? styles.itemsGroupTabButtonActive : ''}`} type="button" role="tab" aria-selected={activeGroup === group} aria-controls={`npc-loot-panel-${group}`} onClick={() => setActiveGroup(group)}>
              {t(`pages.npcEdit.loot.groups.${group}`)}
            </button>
          ))}
        </div>

        <button className={styles.primaryButton} type="button" onClick={() => onItemCreateEmpty(activeGroup)}>
          <span className={styles.buttonContent}>
            <AppIcon name="plus" />
            <span>{t('pages.npcEdit.loot.addButton')}</span>
          </span>
        </button>
      </div>

      <section className={styles.section} id={`npc-loot-panel-${activeGroup}`} role="tabpanel" aria-labelledby={`npc-loot-tab-${activeGroup}`}>
        {activeItems.length === 0 ? <p className={styles.loadingText}>{t('pages.npcEdit.loot.emptyState')}</p> : null}
        {activeItems.length > 0 ? (
          <div className={styles.abilityGrid}>
            {activeItems.map((item, index) => (
              <div key={item.id || `${activeGroup}-${index}`}>
                {activeGroup === 'weapons' ? (
                  <WeaponItemCard
                    index={index}
                    weapon={item as CharacterWeapon}
                    onNameChange={(weaponIndex, value) => onItemChange(activeGroup, weaponIndex, 'name', value)}
                    onDescriptionChange={(weaponIndex, value) => onItemChange(activeGroup, weaponIndex, 'description', value)}
                    onRemove={(weaponIndex, name) => handleRemoveItem(activeGroup, weaponIndex, name)}
                    showEquipButton={false}
                    onDamageChange={onWeaponDamageChange}
                    onBonusFieldChange={(weaponIndex, previousFieldName, nextFieldName) => onItemBonusFieldChange(activeGroup, weaponIndex, previousFieldName, nextFieldName)}
                  />
                ) : null}

                {activeGroup === 'armors' ? (
                  <ArmorItemCard
                    index={index}
                    armor={item as CharacterArmor}
                    onNameChange={(armorIndex, value) => onItemChange(activeGroup, armorIndex, 'name', value)}
                    onDescriptionChange={(armorIndex, value) => onItemChange(activeGroup, armorIndex, 'description', value)}
                    onRemove={(armorIndex, name) => handleRemoveItem(activeGroup, armorIndex, name)}
                    onEquipChange={(armorIndex, value) => onItemChange(activeGroup, armorIndex, 'equipped', value)}
                    showEquipButton={false}
                    onBonusChange={onArmorBonusChange}
                    onBonusFieldChange={(armorIndex, previousFieldName, nextFieldName) => onItemBonusFieldChange(activeGroup, armorIndex, previousFieldName, nextFieldName)}
                  />
                ) : null}

                {activeGroup === 'others' ? (
                  <OtherItemCard
                    index={index}
                    item={item as CharacterOtherItem}
                    onNameChange={(itemIndex, value) => onItemChange(activeGroup, itemIndex, 'name', value)}
                    onDescriptionChange={(itemIndex, value) => onItemChange(activeGroup, itemIndex, 'description', value)}
                    onRemove={(itemIndex, name) => handleRemoveItem(activeGroup, itemIndex, name)}
                    onEquipChange={(itemIndex, value) => onItemChange(activeGroup, itemIndex, 'equipped', value)}
                    showEquipButton={false}
                    onBonusChange={(itemIndex, fieldName, value) => onItemChange(activeGroup, itemIndex, fieldName, value)}
                    onBonusFieldChange={(itemIndex, previousFieldName, nextFieldName) => onItemBonusFieldChange(activeGroup, itemIndex, previousFieldName, nextFieldName)}
                  />
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {pendingRemoval ? (
        <div className={styles.deleteBackdrop} role="presentation">
          <div className={styles.deleteDialog} role="dialog" aria-modal="true" aria-labelledby="delete-loot-title">
            <h2 className={styles.deleteDialogTitle} id="delete-loot-title">
              {t('pages.npcEdit.loot.removeDialog.title')}
            </h2>
            <p className={styles.deleteDialogText}>
              {t('pages.npcEdit.loot.removeDialog.body', {
                name: pendingRemoval.name,
              })}
            </p>

            <div className={styles.deleteDialogActions}>
              <button className={styles.deleteDialogSecondaryButton} type="button" onClick={handleCancelRemoveItem}>
                {t('common.actions.cancel')}
              </button>
              <button className={styles.deleteDialogDangerButton} type="button" onClick={handleConfirmRemoveItem}>
                {t('common.actions.delete')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
