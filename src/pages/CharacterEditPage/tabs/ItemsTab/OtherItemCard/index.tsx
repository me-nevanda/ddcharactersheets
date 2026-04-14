import { useI18n } from '@i18n/index'
import { AppIcon } from '@components/AppIcon'
import type { OtherItemCardProps } from './types'
import type { CharacterItemBonusFieldName } from '../../../../../types/character'
import styles from '../../../style.module.scss'

const otherBonusFields: Array<{
  fieldName: CharacterItemBonusFieldName
  labelKey: string
}> = [
  { fieldName: 'strengthBonusNumber', labelKey: 'pages.characterEdit.fields.strength' },
  { fieldName: 'conditionBonusNumber', labelKey: 'pages.characterEdit.fields.condition' },
  { fieldName: 'dexterityBonusNumber', labelKey: 'pages.characterEdit.fields.dexterity' },
  { fieldName: 'intelligenceBonusNumber', labelKey: 'pages.characterEdit.fields.intelligence' },
  { fieldName: 'wisdomBonusNumber', labelKey: 'pages.characterEdit.fields.wisdom' },
  { fieldName: 'charismaBonusNumber', labelKey: 'pages.characterEdit.fields.charisma' },
  { fieldName: 'speedBonusNumber', labelKey: 'pages.characterEdit.fields.speed' },
  { fieldName: 'kpBonusNumber', labelKey: 'pages.characterEdit.fields.kp' },
  { fieldName: 'fortitudeBonusNumber', labelKey: 'pages.characterEdit.fields.fortitude' },
  { fieldName: 'reflexBonusNumber', labelKey: 'pages.characterEdit.fields.reflex' },
  { fieldName: 'willBonusNumber', labelKey: 'pages.characterEdit.fields.will' },
]

const otherBonusOptions = Array.from({ length: 16 }, (_, bonus) => bonus - 5)

export function OtherItemCard({
  item,
  index,
  onNameChange,
  onDescriptionChange,
  onRemove,
  onEquipChange,
  onStoryItemChange,
  onBonusChange,
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
            <AppIcon name="shirt" />
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

      <label className={styles.checkboxField} htmlFor={`item-others-story-item-${index}`}>
        <input
          className={styles.checkboxInput}
          id={`item-others-story-item-${index}`}
          type="checkbox"
          checked={item.storyItem}
          onChange={(event) => onStoryItemChange(index, event.target.checked)}
        />
        <span className={styles.checkboxLabel}>{t('pages.characterEdit.items.storyItemLabel')}</span>
      </label>

      {item.storyItem ? null : (
        <div className={styles.weaponBonusSection}>
          <span className={styles.weaponBonusSectionTitle}>{t('pages.characterEdit.items.bonusesLabel')}</span>
          <div className={styles.weaponBonusGrid}>
            {otherBonusFields.map((field) => (
              <label
                key={field.fieldName}
                className={styles.weaponBonusField}
                htmlFor={`item-others-${field.fieldName}-${index}`}
              >
                <span className={styles.weaponBonusLabel}>{t(field.labelKey)}</span>
                <select
                  className={`${styles.abilityHeaderSelect} ${styles.weaponBonusSelect}`}
                  id={`item-others-${field.fieldName}-${index}`}
                  value={item[field.fieldName]}
                  onChange={(event) => onBonusChange(index, field.fieldName, Number.parseInt(event.target.value, 10))}
                >
                  {otherBonusOptions.map((bonus) => (
                    <option key={bonus} value={bonus}>
                      {bonus}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </div>
      )}

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
