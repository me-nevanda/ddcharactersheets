export type AppIconName =
  | 'coins'
  | 'check'
  | 'clothes'
  | 'circle'
  | 'context'
  | 'crown'
  | 'delete'
  | 'document'
  | 'edit'
  | 'event'
  | 'magic'
  | 'minion'
  | 'monster'
  | 'area'
  | 'plus'
  | 'print'
  | 'save'
  | 'shield'
  | 'solo'
  | 'shirt'
  | 'sword'
  | 'trash'

export interface AppIconProps {
  className?: string
  name: AppIconName
}
