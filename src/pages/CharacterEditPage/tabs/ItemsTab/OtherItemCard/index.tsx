import { useI18n } from '@i18n/index'
import { AppIcon } from '@components/AppIcon'
import type { OtherItemCardProps } from './types'
import { ItemBonusEditor } from '../ItemBonusEditor'
import { otherBonusFields } from '../itemBonusFields'
import styles from '../../../style.module.scss'

export function OtherItemCard({
  item,
  index,
  onNameChange,
  onDescriptionChange,
  onRemove,
  onEquipChange,
  onBonusChange,
  onBonusFieldChange,
}: OtherItemCardProps) {
  const { t } = useI18n()

  return (
    <article className={styles.abilityCard}>
      <div className={`${styles.abilityCardHeader} ${styles.itemCardHeader}`}>
        <input
          className={styles.abilityCardTitleInput}
          id={`item-others-name-${index}`}
          value={item.name}
          placeholder={t('pages.characterEdit.items.namePlaceholder')}
          onChange={(event) => onNameChange(index, event.target.value)}
        />
        <div className={styles.itemCardActions}>
          <button
            className={`${styles.weaponEquipButton} ${item.equipped ? styles.weaponEquipButtonActive : styles.weaponEquipButtonInactive}`}
            type="button"
            aria-pressed={item.equipped}
            aria-label={item.equipped ? t('pages.characterEdit.items.equippedLabel') : t('pages.characterEdit.items.unequippedLabel')}
            title={item.equipped ? t('pages.characterEdit.items.equippedLabel') : t('pages.characterEdit.items.unequippedLabel')}
            onClick={() => onEquipChange(index, !item.equipped)}
          >
            <AppIcon name="clothes" />
          </button>
          <button
            className={styles.abilityRemoveButton}
            type="button"
            aria-label={t('pages.characterEdit.items.removeButton')}
            title={t('pages.characterEdit.items.removeButton')}
            onClick={() => onRemove(index, item.name)}
          >
            <AppIcon name="delete" />
          </button>
        </div>
      </div>

      <ItemBonusEditor
        bonusFields={otherBonusFields}
        getBonusValue={(fieldName) => item[fieldName]}
        idPrefix={`item-others-${index}`}
        onBonusFieldChange={(previousFieldName, nextFieldName) =>
          onBonusFieldChange(index, previousFieldName, nextFieldName)
        }
        onBonusValueChange={(fieldName, value) => onBonusChange(index, fieldName, value)}
      />

      <label className={styles.abilityField} htmlFor={`item-others-description-${index}`}>
        <span className={styles.attributeLabel}>{t('pages.characterEdit.items.descriptionLabel')}</span>
        <textarea
          className={`${styles.input} ${styles.abilityTextarea}`}
          id={`item-others-description-${index}`}
          value={item.description}
          placeholder={t('pages.characterEdit.items.descriptionPlaceholder')}
          onChange={(event) => onDescriptionChange(index, event.target.value)}
        />
      </label>
    </article>
  )
}
