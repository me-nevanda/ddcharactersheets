import { useI18n } from '@i18n/index'
import { useCharacterEditPageContext } from '../../characterEditPageContext'

export const useDescriptionSection = () => {
  const { t } = useI18n()
  const { form, handleGeneralFieldChange } = useCharacterEditPageContext()

  const handleShortDescriptionChange = (value: string) => {
    handleGeneralFieldChange('shortDescription', value)
  }

  const handleDescriptionChange = (value: string) => {
    handleGeneralFieldChange('description', value)
  }

  return {
    form,
    handleDescriptionChange,
    handleShortDescriptionChange,
    t,
  }
}
