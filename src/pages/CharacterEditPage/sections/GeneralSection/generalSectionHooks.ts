import { useI18n } from '@i18n/index'
import { alignmentOptions, classOptions, genderOptions, raceOptions } from '@dictionaries/characterEditDefinitions'
import { useCharacterEditPageContext } from '../../characterEditPageContext'
import type { GeneralSelectOption } from './types'

const buildOptions = (optionKeys: string[], translationPrefix: string, t: (key: string) => string): GeneralSelectOption[] => {
  return optionKeys.map((optionKey) => ({
    label: t(`${translationPrefix}.${optionKey}`),
    value: optionKey,
  }))
}

export const useGeneralSection = () => {
  const { t } = useI18n()
  const {
    form,
    levelBonusLabel,
    handleGeneralChange,
    hpValue,
    hpTooltip,
    surgeValue,
    speedValue,
    speedTooltip,
  } = useCharacterEditPageContext()

  return {
    alignmentOptions: buildOptions(alignmentOptions, 'pages.characterEdit.options.alignment', t),
    classOptions: buildOptions(classOptions, 'pages.characterEdit.options.class', t),
    form,
    genderOptions: buildOptions(genderOptions, 'pages.characterEdit.options.gender', t),
    handleGeneralChange,
    hpTooltip,
    hpValue,
    levelBonusLabel,
    raceOptions: buildOptions(raceOptions, 'pages.characterEdit.options.race', t),
    speedTooltip,
    speedValue,
    surgeHealingValue: Math.ceil(Math.max(0, hpValue) / 4),
    surgeValue,
    t,
  }
}
