import { HugeiconsIcon } from '@hugeicons/react'
import {
  AddCircleIcon,
  CheckCircle,
  Circle,
  ClothesIcon,
  Delete,
  FileText,
  LongSleeveShirtIcon,
  MoneyBagIcon,
  NecklaceIcon,
  PencilEdit01Icon,
  Plus,
  Printer,
  Save,
  Shield,
  Sword,
  VestIcon,
} from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react'
import type { AppIconProps } from './types'
import styles from './style.module.scss'

const iconMap: Record<AppIconProps['name'], IconSvgElement> = {
  coins: MoneyBagIcon,
  check: CheckCircle,
  clothes: LongSleeveShirtIcon,
  circle: Circle,
  delete: Delete,
  document: FileText,
  edit: PencilEdit01Icon,
  plus: AddCircleIcon,
  print: Printer,
  save: Save,
  shield: Shield,
  shirt: NecklaceIcon,
  sword: Sword,
  trash: Delete,
}

export function AppIcon({ className, name }: AppIconProps) {
  const iconClassName = [styles.icon, className].filter(Boolean).join(' ')

  return (
    <HugeiconsIcon
      aria-hidden="true"
      className={iconClassName}
      color="currentColor"
      icon={iconMap[name]}
      strokeWidth={1.9}
    />
  )
}
