import { useI18n } from '@i18n/index'
import { attributeDefinitions } from '@dictionaries/characterEditDefinitions'
import { useCharacterEditPageContext } from '../../characterEditPageContext'
import type { AttributeCardViewModel } from './types'

const formatSignedValue = (value: number): string => {
  return value > 0 ? `+${value}` : String(value)
}

export const useAttributesSection = () => {
  const { t } = useI18n()
  const { attributeRows, attributeBonuses, attributeBonusTooltips, handleAttributeChange } = useCharacterEditPageContext()

  const attributeCards: AttributeCardViewModel[] = attributeDefinitions.map((definition, index) => {
    const row = attributeRows[index]

    return {
      bonusLabel: formatSignedValue(attributeBonuses[definition.key]),
      bonusTooltip: attributeBonusTooltips[definition.key],
      inputId: definition.key,
      label: t(definition.translationKey),
      modifierLabel: row.modifierLabel,
      value: row.value,
    }
  })

  return {
    attributeCards,
    handleAttributeChange,
    t,
  }
}
