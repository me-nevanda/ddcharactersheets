import type { AppIconProps } from './types'
import styles from './style.module.scss'

function getIconPath(name: AppIconProps['name']) {
  switch (name) {
    case 'check':
      return (
        <path
          d="m5 13 4 4L19 7"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.9"
        />
      )
    case 'circle':
      return (
        <circle
          cx="12"
          cy="12"
          r="7.25"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
        />
      )
    case 'shirt':
      return (
        <>
          <path
            d="M9.5 5.5 12 7l2.5-1.5L18 8l-2 3v8H8V11L6 8Z"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.9"
          />
          <path
            d="M12 7v4"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.9"
          />
        </>
      )
    case 'plus':
      return (
        <path
          d="M12 5v14M5 12h14"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.9"
        />
      )
    case 'edit':
      return (
        <>
          <path
            d="M12 20h9"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.9"
          />
          <path
            d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.9"
          />
        </>
      )
    case 'save':
      return (
        <>
          <path
            d="M5 4h11l3 3v13H5Z"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.9"
          />
          <path
            d="M9 4v6h6V4M9 20v-6h6v6"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.9"
          />
        </>
      )
    case 'trash':
    case 'delete':
      return (
        <>
          <path
            d="M4 7h16"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.9"
          />
          <path
            d="M9 7V5h6v2m-8 0 1 12h8l1-12"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.9"
          />
          <path
            d="M10 11v5M14 11v5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.9"
          />
        </>
      )
  }
}

export function AppIcon({ className, name }: AppIconProps) {
  const iconClassName = [styles.icon, className].filter(Boolean).join(' ')

  return (
    <svg
      aria-hidden="true"
      className={iconClassName}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {getIconPath(name)}
    </svg>
  )
}
