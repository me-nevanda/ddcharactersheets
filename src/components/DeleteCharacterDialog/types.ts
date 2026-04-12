export interface DeleteCharacterDialogProps {
  characterName: string
  deleting: boolean
  open: boolean
  onCancel: () => void
  onConfirm: () => void
}
