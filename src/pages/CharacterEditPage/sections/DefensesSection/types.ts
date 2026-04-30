export interface DefenseValues {
  kp: number
  fortitude: number
  reflex: number
  will: number
}

export interface DefenseTooltipValues {
  kp: string
  fortitude: string
  reflex: string
  will: string
}

export interface DefenseCardViewModel {
  key: keyof DefenseValues
  label: string
  tooltip: string
  value: number
}
