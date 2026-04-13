import { useI18n } from '@i18n/index'
import type { WeaponItemCardProps } from './types'
import { AppIcon } from '@components/AppIcon'
import type { CharacterWeaponBonusFieldName } from '../../../../../types/character'
import styles from '../../../style.module.scss'

const weaponBonusFields: Array<{
  fieldName: CharacterWeaponBonusFieldName
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

const weaponBonusOptions = Array.from({ length: 16 }, (_, bonus) => bonus - 5)

export function WeaponItemCard({
  weapon,
  index,
  onNameChange,
  onDescriptionChange,
  onRemove,
  onDamageChange,
}: WeaponItemCardProps) {
  const { t } = useI18n()

  return (
    <article className={styles.abilityCard}>
      <div className={`${styles.abilityCardHeader} ${styles.itemCardHeader}`}>
        <input
          className={styles.abilityCardTitleInput}
          id={`item-weapons-name-${index}`}
          value={weapon.name}
          placeholder={t('pages.characterEdit.items.namePlaceholder')}
          onChange={(event) => onNameChange(index, event.target.value)}
        />
        <div className={styles.itemCardActions}>
          <button
            className={`${styles.weaponEquipButton} ${weapon.equipped ? styles.weaponEquipButtonActive : styles.weaponEquipButtonInactive}`}
            type="button"
            aria-pressed={weapon.equipped}
            aria-label={weapon.equipped ? t('pages.characterEdit.items.equippedLabel') : t('pages.characterEdit.items.unequippedLabel')}
            title={weapon.equipped ? t('pages.characterEdit.items.equippedLabel') : t('pages.characterEdit.items.unequippedLabel')}
            onClick={() => onDamageChange(index, 'equipped', !weapon.equipped)}
          >
            <AppIcon name="shirt" />
          </button>
          <button
            className={styles.abilityRemoveButton}
            type="button"
            aria-label={t('pages.characterEdit.items.removeButton')}
            title={t('pages.characterEdit.items.removeButton')}
            onClick={() => onRemove(index, weapon.name)}
          >
            <AppIcon name="delete" />
          </button>
        </div>
      </div>

      <div className={styles.weaponDamageSection}>
        <span className={styles.weaponBonusSectionTitle}>{t('pages.characterEdit.items.damageLabel')}</span>
        <div className={styles.weaponDamageRow}>
        <select
          className={styles.abilityHeaderSelect}
          value={weapon.damageDiceType}
          onChange={(event) =>
            onDamageChange(
              index,
              'damageDiceType',
              event.target.value as 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20',
            )
          }
        >
          {['d4', 'd6', 'd8', 'd10', 'd12', 'd20'].map((die) => (
            <option key={die} value={die}>
              K{die.slice(1)}
            </option>
            ))}
        </select>
        <span className={styles.weaponDamageSeparator}>+</span>
        <select
          className={styles.abilityHeaderSelect}
          value={weapon.damageBonusNumber}
          onChange={(event) => onDamageChange(index, 'damageBonusNumber', Number.parseInt(event.target.value, 10))}
        >
          {Array.from({ length: 11 }, (_, bonus) => (
            <option key={bonus} value={bonus}>
              {bonus}
            </option>
          ))}
        </select>
        <span className={styles.weaponDamageTypeLabel}>{t('pages.characterEdit.items.rangeLabel')}</span>
        <select
          className={styles.abilityHeaderSelect}
          value={weapon.range}
          aria-label={t('pages.characterEdit.items.rangeLabel')}
          onChange={(event) => onDamageChange(index, 'range', Number.parseInt(event.target.value, 10))}
        >
          {Array.from({ length: 20 }, (_, range) => range + 1).map((range) => (
            <option key={range} value={range}>
              {range}
            </option>
          ))}
        </select>
        <span className={styles.weaponDamageTypeLabel}>{t('pages.characterEdit.items.proficiencyLabel')}</span>
        <select
          className={styles.abilityHeaderSelect}
          value={weapon.weaponProficiencyBonusNumber}
          aria-label={t('pages.characterEdit.items.proficiencyLabel')}
          onChange={(event) =>
            onDamageChange(index, 'weaponProficiencyBonusNumber', Number.parseInt(event.target.value, 10))
          }
        >
          {Array.from({ length: 6 }, (_, bonus) => bonus).map((bonus) => (
            <option key={bonus} value={bonus}>
              {bonus}
            </option>
          ))}
        </select>
      </div>
      </div>

      <div className={styles.weaponBonusSection}>
        <span className={styles.weaponBonusSectionTitle}>{t('pages.characterEdit.items.bonusesLabel')}</span>
        <div className={styles.weaponBonusGrid}>
        {weaponBonusFields.map((field) => (
          <label key={field.fieldName} className={styles.weaponBonusField} htmlFor={`item-weapons-${field.fieldName}-${index}`}>
            <span className={styles.weaponBonusLabel}>{t(field.labelKey)}</span>
            <select
              className={`${styles.abilityHeaderSelect} ${styles.weaponBonusSelect}`}
              id={`item-weapons-${field.fieldName}-${index}`}
              value={weapon[field.fieldName]}
              onChange={(event) => onDamageChange(index, field.fieldName, Number.parseInt(event.target.value, 10))}
            >
              {weaponBonusOptions.map((bonus) => (
                <option key={bonus} value={bonus}>
                  {bonus}
                </option>
              ))}
            </select>
          </label>
        ))}
        </div>
      </div>

      <label className={styles.abilityField} htmlFor={`item-weapons-description-${index}`}>
        <span className={styles.attributeLabel}>{t('pages.characterEdit.items.descriptionLabel')}</span>
        <textarea
          className={`${styles.input} ${styles.abilityTextarea}`}
          id={`item-weapons-description-${index}`}
          value={weapon.description}
          placeholder={t('pages.characterEdit.items.descriptionPlaceholder')}
          onChange={(event) => onDescriptionChange(index, event.target.value)}
        />
      </label>
    </article>
  )
}
