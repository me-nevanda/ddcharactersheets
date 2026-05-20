export interface CharacterListHeaderProps {
  actionLabel: string
  secondaryActionLabel?: string
  creating: boolean
  secondaryCreating?: boolean
  onAction: () => void
  onSecondaryAction?: () => void
  subtitle: string
  title: string
}
