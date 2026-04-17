import styles from '../../style.module.scss'
import type { AbilityActionFieldsProps } from './types'

export function AbilityActionFields({
                                      ability,
                                      index,
                                      weaponAreaOptions,
                                      onAbilityChange,
                                      t,
                                    }: AbilityActionFieldsProps) {
  return (
    <div className={styles.abilityField}>
      <div className={styles.divider} data-label={t('pages.characterEdit.abilities.actionLabel')} />
      <div className={styles.abilityActionRow}>
        <select
          className={`${styles.input} ${styles.selectChevronInset} ${styles.abilitySelect}`}
          id={`ability-action-${index}`}
          value={ability.action}
          onChange={(event) =>
            onAbilityChange(index, 'action', event.target.value === 'noAction' ? 'noAction' : 'action')
          }
        >
          <option value="action">{t('pages.characterEdit.abilities.actionOptions.action')}</option>
          <option value="noAction">{t('pages.characterEdit.abilities.actionOptions.noAction')}</option>
        </select>

        <label className={styles.abilityActionKindGroup} htmlFor={`ability-kind-${index}`}>
          <span className={styles.attributeLabel}>{t('pages.characterEdit.abilities.kindLabel')}</span>
          <select
            className={`${styles.input} ${styles.selectChevronInset} ${styles.abilityActionKindSelect}`}
            id={`ability-kind-${index}`}
            value={ability.kind}
            onChange={(event) =>
              onAbilityChange(index, 'kind', event.target.value === 'utility' ? 'utility' : 'offensive')
            }
          >
            <option value="offensive">{t('pages.characterEdit.abilities.kindOptions.offensive')}</option>
            <option value="utility">{t('pages.characterEdit.abilities.kindOptions.utility')}</option>
          </select>
        </label>
      </div>
      <div className={styles.divider} data-label={t('pages.characterEdit.abilities.areaLabel')} />
      <div className={styles.abilityActionRow}>
        <label className={styles.abilityActionDistanceGroup} htmlFor={`ability-weapon-range-${index}`}>
          <span className={styles.attributeLabel}>{t('pages.characterEdit.abilities.weaponRangeLabel')}</span>
          <select
            className={`${styles.input} ${styles.selectChevronInset} ${styles.abilityWeaponRangeSelect}`}
            id={`ability-weapon-range-${index}`}
            value={ability.weaponRange}
            onChange={(event) =>
              onAbilityChange(index, 'weaponRange', Number.parseInt(event.target.value, 10) || 0)
            }
          >
            {Array.from({ length: 31 }, (_, count) => count).map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.abilityActionAreaGroup} htmlFor={`ability-weapon-area-${index}`}>
          <span className={styles.attributeLabel}>{t('pages.characterEdit.abilities.weaponAreaLabel')}</span>
          <select
            className={`${styles.input} ${styles.selectChevronInset} ${styles.abilityWeaponAreaSelect}`}
            id={`ability-weapon-area-${index}`}
            value={ability.weaponArea}
            onChange={(event) => onAbilityChange(index, 'weaponArea', event.target.value)}
          >
            {weaponAreaOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
