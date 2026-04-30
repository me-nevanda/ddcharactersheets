import { useI18n } from '@i18n/index'
import { useCharacterEditPageContext } from '../../characterEditPageContext'
import type { DefenseCardViewModel } from './types'

export const useDefensesSection = () => {
  const { t } = useI18n()
  const { defenseValues, defenseTooltips } = useCharacterEditPageContext()

  const defenseCards: DefenseCardViewModel[] = [
    {
      key: 'kp',
      label: t('pages.characterEdit.fields.kp'),
      tooltip: defenseTooltips.kp,
      value: defenseValues.kp,
    },
    {
      key: 'fortitude',
      label: t('pages.characterEdit.fields.fortitude'),
      tooltip: defenseTooltips.fortitude,
      value: defenseValues.fortitude,
    },
    {
      key: 'reflex',
      label: t('pages.characterEdit.fields.reflex'),
      tooltip: defenseTooltips.reflex,
      value: defenseValues.reflex,
    },
    {
      key: 'will',
      label: t('pages.characterEdit.fields.will'),
      tooltip: defenseTooltips.will,
      value: defenseValues.will,
    },
  ]

  return {
    defenseCards,
    t,
  }
}
