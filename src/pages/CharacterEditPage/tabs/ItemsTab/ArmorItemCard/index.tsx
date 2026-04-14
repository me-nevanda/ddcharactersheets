import { useI18n } from '@i18n/index'
import { AppIcon } from '@components/AppIcon'
import type { ArmorItemCardProps } from './types'
import type { CharacterArmorBonusFieldName } from '../../../../../types/character'
import styles from '../../../style.module.scss'

const armorBonusFields: Array<{
  fieldName: CharacterArmorBonusFieldName
  labelKey: string
}> = [
  { fieldName: 'strengthBonusNumber', labelKey: 'pages.characterEdit.fields.strength' },
  { fieldName: 'conditionBonusNumber', labelKey: 'pages.characterEdit.fields.condition' },
  { fieldName: 'dexterityBonusNumber', labelKey: 'pages.characterEdit.fields.dexterity' },
  { fieldName: 'intelligenceBonusNumber', labelKey: 'pages.characterEdit.fields.intelligence' },
  { fieldName: 'wisdomBonusNumber', labelKey: 'pages.characterEdit.fields.wisdom' },
  { fieldName: 'charismaBonusNumber', labelKey: 'pages.characterEdit.fields.charisma' },
  { fieldName: 'speedBonusNumber', labelKey: 'pages.characterEdit.fields.speed' },
  { fieldName: 'armorPenaltyNumber', labelKey: 'pages.characterEdit.fields.armorPenalty' },
  { fieldName: 'kpBonusNumber', labelKey: 'pages.characterEdit.fields.kp' },
  { fieldName: 'fortitudeBonusNumber', labelKey: 'pages.characterEdit.fields.fortitude' },
  { fieldName: 'reflexBonusNumber', labelKey: 'pages.characterEdit.fields.reflex' },
  { fieldName: 'willBonusNumber', labelKey: 'pages.characterEdit.fields.will' },
]

const armorBonusOptions = Array.from({ length: 16 }, (_, bonus) => bonus - 5)

export function ArmorItemCard({
  armor,
  index,
  onNameChange,
  onDescriptionChange,
  onRemove,
  onEquipChange,
  onBonusChange,
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

      <div className={styles.weaponBonusSection}>
        <span className={styles.weaponBonusSectionTitle}>{t('pages.characterEdit.items.bonusesLabel')}</span>
        <div className={styles.weaponBonusGrid}>
          {armorBonusFields.map((field) => (
            <label key={field.fieldName} className={styles.weaponBonusField} htmlFor={`item-armors-${field.fieldName}-${index}`}>
              <span className={styles.weaponBonusLabel}>{t(field.labelKey)}</span>
              <select
                className={`${styles.abilityHeaderSelect} ${styles.weaponBonusSelect}`}
                id={`item-armors-${field.fieldName}-${index}`}
                value={armor[field.fieldName]}
                onChange={(event) => onBonusChange(index, field.fieldName, Number.parseInt(event.target.value, 10))}
              >
                {armorBonusOptions.map((bonus) => (
                  <option key={bonus} value={bonus}>
                    {bonus}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </div>

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
