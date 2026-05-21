export type AppIconName =
  | 'coins'
  | 'check'
  | 'clothes'
  | 'circle'
  | 'crown'
  | 'delete'
  | 'document'
  | 'edit'
  | 'magic'
  | 'minion'
  | 'monster'
  | 'place'
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
