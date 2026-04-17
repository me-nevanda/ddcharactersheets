import { useI18n } from '@i18n/index'
import { AppIcon } from '@components/AppIcon'
import type { ArmorItemCardProps } from './types'
import { ItemBonusEditor } from '../ItemBonusEditor'
import { armorBonusFields } from '../itemBonusFields'
import styles from '../../../style.module.scss'

export function ArmorItemCard({
  armor,
  index,
  onNameChange,
  onDescriptionChange,
  onRemove,
  onEquipChange,
  onBonusChange,
  onBonusFieldChange,
}: ArmorItemCardProps) {
  const { t } = useI18n()

  return (
    <article className={styles.abilityCard}>
      <div className={`${styles.abilityCardHeader} ${styles.itemCardHeader}`}>
        <input
          className={styles.abilityCardTitleInput}
          id={`item-armors-name-${index}`}
          value={armor.name}
          placeholder={t('pages.characterEdit.items.namePlaceholder')}
          onChange={(event) => onNameChange(index, event.target.value)}
        />
        <div className={styles.itemCardActions}>
          <button
            className={`${styles.weaponEquipButton} ${armor.equipped ? styles.weaponEquipButtonActive : styles.weaponEquipButtonInactive}`}
            type="button"
            aria-pressed={armor.equipped}
            aria-label={armor.equipped ? t('pages.characterEdit.items.equippedLabel') : t('pages.characterEdit.items.unequippedLabel')}
            title={armor.equipped ? t('pages.characterEdit.items.equippedLabel') : t('pages.characterEdit.items.unequippedLabel')}
            onClick={() => onEquipChange(index, !armor.equipped)}
          >
            <AppIcon name="shirt" />
          </button>
          <button
            className={styles.abilityRemoveButton}
            type="button"
            aria-label={t('pages.characterEdit.items.removeButton')}
            title={t('pages.characterEdit.items.removeButton')}
            onClick={() => onRemove(index, armor.name)}
          >
            <AppIcon name="delete" />
          </button>
        </div>
      </div>

      <ItemBonusEditor
        bonusFields={armorBonusFields}
        getBonusValue={(fieldName) => armor[fieldName]}
        idPrefix={`item-armors-${index}`}
        onBonusFieldChange={(previousFieldName, nextFieldName) =>
          onBonusFieldChange(index, previousFieldName, nextFieldName)
        }
        onBonusValueChange={(fieldName, value) => onBonusChange(index, fieldName, value)}
      />

      <label className={styles.abilityField} htmlFor={`item-armors-description-${index}`}>
        <span className={styles.attributeLabel}>{t('pages.characterEdit.items.descriptionLabel')}</span>
        <textarea
          className={`${styles.input} ${styles.abilityTextarea}`}
          id={`item-armors-description-${index}`}
          value={armor.description}
          placeholder={t('pages.characterEdit.items.descriptionPlaceholder')}
          onChange={(event) => onDescriptionChange(index, event.target.value)}
        />
      </label>
    </article>
  )
}
