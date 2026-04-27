import type { SyntheticEvent } from 'react'
import type { CharacterListCardViewModel } from '../types'

export interface CharacterListCardProps {
  card: CharacterListCardViewModel
  onImageError: (event: SyntheticEvent<HTMLImageElement>) => void
}
