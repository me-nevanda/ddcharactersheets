import { useI18n } from '@i18n/index'
import { useCharacterEditPageContext } from '../../characterEditPageContext'

export const useDescriptionSection = () => {
  const { t } = useI18n()
  const { form, handleGeneralChange } = useCharacterEditPageContext()

  return {
    form,
    handleGeneralChange,
    t,
  }
}
