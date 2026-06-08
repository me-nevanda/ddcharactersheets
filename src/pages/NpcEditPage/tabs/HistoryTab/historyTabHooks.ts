import { useI18n } from '@i18n/index'

export const useHistoryTab = () => {
  const { t } = useI18n()

  return {
    t,
  }
}
