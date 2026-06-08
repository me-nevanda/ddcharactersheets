import type { ClipboardEvent } from 'react'
import { BtnBold, BtnBulletList, BtnClearFormatting, BtnItalic, BtnNumberedList, BtnUnderline, Editor, EditorProvider, Separator, Toolbar } from 'react-simple-wysiwyg'
import { useI18n } from '@i18n/index'
import type { SimpleWysiwygEditorProps } from './types'
import styles from './style.module.scss'

const sanitizeEditorHtml = (html: string): string => {
  if (typeof document === 'undefined') {
    return html
  }

  const template = document.createElement('template')
  template.innerHTML = html

  const commentsWalker = document.createTreeWalker(template.content, NodeFilter.SHOW_COMMENT)
  const comments: Comment[] = []
  let currentComment = commentsWalker.nextNode()

  while (currentComment) {
    comments.push(currentComment as Comment)
    currentComment = commentsWalker.nextNode()
  }

  comments.forEach((comment) => comment.remove())

  template.content.querySelectorAll('*').forEach((element) => {
    element.removeAttribute('class')
    element.removeAttribute('face')
    element.removeAttribute('lang')
    element.removeAttribute('size')
    element.removeAttribute('style')

    Array.from(element.attributes)
      .filter((attribute) => attribute.name.startsWith('mso-'))
      .forEach((attribute) => element.removeAttribute(attribute.name))

    const tagName = element.tagName.toLowerCase()
    if (tagName === 'font' || tagName === 'span') {
      element.replaceWith(...Array.from(element.childNodes))
    }
  })

  return template.innerHTML
}

const insertPlainTextAtSelection = (text: string): void => {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) {
    return
  }

  selection.deleteFromDocument()

  const range = selection.getRangeAt(0)
  const lines = text.replace(/\r\n?/g, '\n').split('\n')
  const fragment = document.createDocumentFragment()

  lines.forEach((line, index) => {
    if (index > 0) {
      fragment.appendChild(document.createElement('br'))
    }
    fragment.appendChild(document.createTextNode(line))
  })

  const lastNode = fragment.lastChild
  range.insertNode(fragment)

  if (lastNode) {
    range.setStartAfter(lastNode)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
  }
}

export const SimpleWysiwygEditor = ({ ariaLabel, minHeightClassName, name, onChange, pasteAsPlainText = false, placeholder, toolbar = true, value }: SimpleWysiwygEditorProps) => {
  const { t } = useI18n()

  const containerClassName = [styles.editor, minHeightClassName].filter(Boolean).join(' ')
  const handlePaste = (event: ClipboardEvent<HTMLElement>) => {
    const plainText = event.clipboardData.getData('text/plain')
    if (!plainText) {
      return
    }

    event.preventDefault()
    insertPlainTextAtSelection(plainText)
    onChange(sanitizeEditorHtml(event.currentTarget.innerHTML))
  }

  return (
    <EditorProvider>
      <Editor aria-label={ariaLabel} containerProps={{ className: containerClassName }} name={name} placeholder={placeholder} value={sanitizeEditorHtml(value)} onChange={(event) => onChange(sanitizeEditorHtml(event.target.value))} onPaste={pasteAsPlainText ? handlePaste : undefined}>
        {toolbar ? (
        <Toolbar>
          <BtnBold title={t('common.editor.bold')} />
          <BtnItalic title={t('common.editor.italic')} />
          <BtnUnderline title={t('common.editor.underline')} />
          <Separator />
          <BtnBulletList title={t('common.editor.bulletList')} />
          <BtnNumberedList title={t('common.editor.numberedList')} />
          <Separator />
          <BtnClearFormatting title={t('common.editor.clearFormatting')} />
        </Toolbar>
        ) : null}
      </Editor>
    </EditorProvider>
  )
}
