export interface SimpleWysiwygEditorProps {
  ariaLabel: string
  minHeightClassName?: string
  name: string
  onChange: (value: string) => void
  pasteAsPlainText?: boolean
  placeholder: string
  toolbar?: boolean
  value: string
}
