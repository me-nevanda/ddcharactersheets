export type AppIconName =
  | 'coins'
  | 'check'
  | 'clothes'
  | 'circle'
  | 'delete'
  | 'document'
  | 'edit'
  | 'plus'
  | 'print'
  | 'save'
  | 'shield'
  | 'shirt'
  | 'sword'
  | 'trash'

export interface AppIconProps {
  className?: string
  name: AppIconName
}
