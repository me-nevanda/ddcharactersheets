import { useMainPageContext } from './mainPageContext'
import type { MainPageState } from './types'

export const useMainPage = (): MainPageState => {
  return useMainPageContext()
}
