import { useState } from 'react'
import { useI18n } from '@i18n/index'
import { AppIcon } from '@components/AppIcon'
import type { ItemBonusEditorProps } from './types'
import { itemBonusValueOptions } from '../itemBonusFields'
import styles from '../../../style.module.scss'

export function ItemBonusEditor<TFieldName extends string>({
  bonusFields,
  idPrefix,
  getBonusValue,
  onBonusFieldChange,
  onBonusValueChange,
}: ItemBonusEditorProps<TFieldName>) {
  const { t } = useI18n()
  const [visibleFields, setVisibleFields] = useState<TFieldName[]>(() =>
    bonusFields
      .filter((field) => getBonusValue(field.fieldName) !== 0)
      .map((field) => field.fieldName),
  )

  const availableFields = bonusFields.filter((field) => !visibleFields.includes(field.fieldName))

  function handleAddBonus() {
    const nextField = availableFields[0]

    if (!nextField) {
      return
    }

    setVisibleFields((currentFields) => [...currentFields, nextField.fieldName])
    onBonusValueChange(nextField.fieldName, 0)
  }

  function handleBonusFieldChange(previousFieldName: TFieldName, nextFieldName: TFieldName) {
    if (previousFieldName === nextFieldName) {
      return
    }

    setVisibleFields((currentFields) =>
      currentFields.map((fieldName) => (fieldName === previousFieldName ? nextFieldName : fieldName)),
    )
    onBonusFieldChange(previousFieldName, nextFieldName)
  }

  function handleBonusValueChange(fieldName: TFieldName, value: number) {
    onBonusValueChange(fieldName, value)

    if (value !== 0) {
      return
    }

    setVisibleFields((currentFields) => currentFields.filter((currentFieldName) => currentFieldName !== fieldName))
  }

  function handleBonusRemove(fieldName: TFieldName) {
    onBonusValueChange(fieldName, 0)
    setVisibleFields((currentFields) => currentFields.filter((currentFieldName) => currentFieldName !== fieldName))
  }

  return (
    <div className={styles.weaponBonusSection}>
      <div className={styles.bonusSectionHeader}>
        <div className={styles.divider} data-label={t('pages.characterEdit.items.bonusesLabel')} />

        {availableFields.length > 0 ? (
          <button
            className={styles.bonusAddButton}
            type="button"
            aria-label={t('pages.characterEdit.items.addBonusButton')}
            title={t('pages.characterEdit.items.addBonusButton')}
            onClick={handleAddBonus}
          >
            <AppIcon name="plus" />
          </button>
        ) : null}
      </div>

      {visibleFields.length > 0 ? (
        <div className={styles.weaponBonusGrid}>
          {visibleFields.map((fieldName) => (
            <div key={`${idPrefix}-${fieldName}`} className={styles.bonusRow}>
              <select
                className={`${styles.input} ${styles.selectChevronInset} ${styles.bonusTypeSelect}`}
                aria-label={t('pages.characterEdit.items.bonusTypeLabel')}
                id={`${idPrefix}-${fieldName}-type`}
                value={fieldName}
                onChange={(event) => handleBonusFieldChange(fieldName, event.target.value as TFieldName)}
              >
                {bonusFields
                  .filter((field) => field.fieldName === fieldName || !visibleFields.includes(field.fieldName))
                  .map((field) => (
                    <option key={field.fieldName} value={field.fieldName}>
                      {t(field.labelKey)}
                    </option>
                  ))}
              </select>

              <select
                className={`${styles.input} ${styles.selectChevronInset} ${styles.bonusValueSelect}`}
                aria-label={t('pages.characterEdit.items.bonusValueLabel')}
                id={`${idPrefix}-${fieldName}-value`}
                value={getBonusValue(fieldName)}
                onChange={(event) => handleBonusValueChange(fieldName, Number.parseInt(event.target.value, 10))}
              >
                {itemBonusValueOptions.map((bonus) => (
                  <option key={bonus} value={bonus}>
                    {bonus}
                  </option>
                ))}
              </select>

              <button
                className={styles.abilityRemoveButton}
                type="button"
                aria-label={t('pages.characterEdit.items.removeButton')}
                title={t('pages.characterEdit.items.removeButton')}
                onClick={() => handleBonusRemove(fieldName)}
              >
                <AppIcon name="delete" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
