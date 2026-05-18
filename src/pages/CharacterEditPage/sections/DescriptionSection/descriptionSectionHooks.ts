import { useI18n } from '@i18n/index'
import { useCharacterEditPageContext } from '../../characterEditPageContext'

export const useDescriptionSection = () => {
  const { t } = useI18n()
  const { form, handleGeneralFieldChange } = useCharacterEditPageContext()

  const handleDescriptionChange = (value: string) => {
    handleGeneralFieldChange('description', value)
  }

  return {
    form,
    handleDescriptionChange,
    t,
  }
}
