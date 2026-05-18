export interface DeleteCharacterDialogProps {
  characterName: string
  deleting: boolean
  bodyKey?: string
  open: boolean
  titleKey?: string
  onCancel: () => void
  onConfirm: () => void
}
