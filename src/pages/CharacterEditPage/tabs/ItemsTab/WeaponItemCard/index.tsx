import { useI18n } from '@i18n/index'
import type { WeaponItemCardProps } from './types'
import { AppIcon } from '@components/AppIcon'
import type { CharacterWeaponDamageType } from '../../../../../types/character'
import styles from '../../../style.module.scss'

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
        <span className={styles.weaponDamageTypeLabel}>{t('pages.characterEdit.items.weaponDamageTypeLabel')}</span>
        <select
          className={styles.abilityHeaderSelect}
          value={weapon.damageType}
          onChange={(event) => onDamageChange(index, 'damageType', event.target.value as CharacterWeaponDamageType)}
        >
          <option value="normal">{t('pages.characterEdit.items.weaponType.normal')}</option>
          <option value="poison">{t('pages.characterEdit.items.weaponType.poison')}</option>
          <option value="radiant">{t('pages.characterEdit.items.weaponType.radiant')}</option>
          <option value="necrotic">{t('pages.characterEdit.items.weaponType.necrotic')}</option>
          <option value="psychic">{t('pages.characterEdit.items.weaponType.psychic')}</option>
        </select>
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
