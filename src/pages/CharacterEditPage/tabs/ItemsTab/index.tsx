import { useState } from 'react'
import { AppIcon } from '@components/AppIcon'
import { useI18n } from '@i18n/index'
import { useCharacterEditPageContext } from '@pages/CharacterEditPage/characterEditPageContext'
import { WeaponItemCard } from './WeaponItemCard'
import type { CharacterWeapon } from '../../../../types/character'
import styles from '../../style.module.scss'

const itemGroups = ['weapons', 'armors', 'others'] as const

export function ItemsTab() {
  const { t } = useI18n()
  const { form, handleItemCreateEmpty, handleItemChange, handleWeaponDamageChange, handleItemRemove } =
    useCharacterEditPageContext()
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

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t('pages.characterEdit.items.title')}</h2>
      </div>

      <div className={styles.itemsGroupsLayout}>
        {itemGroups.map((group) => {
          const items = form.items[group]

          return (
            <section key={group} className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>{t(`pages.characterEdit.items.groups.${group}`)}</h3>
                <button className={styles.primaryButton} type="button" onClick={() => handleItemCreateEmpty(group)}>
                  {t('pages.characterEdit.items.addButton')}
                </button>
              </div>

              {items.length === 0 ? <p className={styles.loadingText}>{t('pages.characterEdit.items.emptyState')}</p> : null}

              {items.length > 0 ? (
                <div className={styles.abilityGrid}>
                  {items.map((item, index) => (
                    <div key={`${group}-${index}`}>
                      {group === 'weapons' ? (
                        <WeaponItemCard
                          index={index}
                          weapon={item as CharacterWeapon}
                          onNameChange={(weaponIndex, value) => handleItemChange(group, weaponIndex, 'name', value)}
                          onDescriptionChange={(weaponIndex, value) =>
                            handleItemChange(group, weaponIndex, 'description', value)
                          }
                          onRemove={(weaponIndex, name) => handleRemoveItem(group, weaponIndex, name)}
                          onDamageChange={handleWeaponDamageChange}
                        />
                      ) : null}

                      {group !== 'weapons' ? (
                        <article className={styles.abilityCard}>
                          <div className={styles.abilityCardHeader}>
                            <input
                              className={styles.abilityCardTitleInput}
                              id={`item-${group}-name-${index}`}
                              value={item.name}
                              placeholder={t('pages.characterEdit.items.namePlaceholder')}
                              onChange={(event) => handleItemChange(group, index, 'name', event.target.value)}
                            />
                            <button
                              className={styles.abilityRemoveButton}
                              type="button"
                              aria-label={t('pages.characterEdit.items.removeButton')}
                              title={t('pages.characterEdit.items.removeButton')}
                              onClick={() => handleRemoveItem(group, index, item.name)}
                            >
                              <AppIcon name="delete" />
                            </button>
                          </div>

                        <label className={styles.abilityField} htmlFor={`item-${group}-description-${index}`}>
                          <span className={styles.attributeLabel}>{t('pages.characterEdit.items.descriptionLabel')}</span>
                          <textarea
                            className={`${styles.input} ${styles.abilityTextarea}`}
                            id={`item-${group}-description-${index}`}
                            value={item.description}
                            placeholder={t('pages.characterEdit.items.descriptionPlaceholder')}
                            onChange={(event) => handleItemChange(group, index, 'description', event.target.value)}
                          />
                        </label>
                        </article>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          )
        })}
      </div>

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
