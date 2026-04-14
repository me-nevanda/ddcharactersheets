export type AppIconName =
  | 'check'
  | 'circle'
  | 'delete'
  | 'document'
  | 'edit'
  | 'plus'
  | 'print'
  | 'save'
  | 'shirt'
  | 'trash'

export interface AppIconProps {
  className?: string
  name: AppIconName
}
