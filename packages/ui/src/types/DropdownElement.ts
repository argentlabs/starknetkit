import { ReactNode } from "react"

export interface DropdownElement {
  icon: string | ReactNode
  label: string
  onClick: () => void
}
