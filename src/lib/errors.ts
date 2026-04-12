import type { ApiError } from './api'

type TranslateFunction = (key: string) => string

export function getErrorMessage(t: TranslateFunction, error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as ApiError).code === 'string'
  ) {
    return t((error as ApiError).code)
  }

  return t('errors.api.generic')
}
