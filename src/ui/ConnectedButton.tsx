import { FC, ReactNode, useEffect, useRef, useState } from "react"
import { truncateAddress } from "../helpers/address"
import { ConnectedMenu } from "./ConnectedMenu"
import "./global.css"
import { ChevronDown } from "./icons/ChevronDown"
import { ProfileIcon } from "./icons/ProfileIcon"

export interface DropdownElement {
  icon: string | ReactNode
  label: string
  onClick: () => void
}

interface ConnectedButtonProps {
  address?: string
  showBalance?: boolean
  dropdownElements?: DropdownElement[]
}

const ConnectedButton: FC<ConnectedButtonProps> = ({
  address,
  showBalance,
  dropdownElements,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen((prev) => !prev)
  }

  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          className="flex items-center shadow-list-item font-barlow font-semibold text-base leading-4 h-10 px-4 gap-2.5 rounded-lg"
          onClick={toggleMenu}
        >
          {showBalance && (
            <>
              <div className="flex items-center">
                <span>0 ETH{/* TODO: balance */}</span>
              </div>
              <div className="h-10 border border-solid border-neutrals.200" />
            </>
          )}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center bg-[#F0F0F0] rounded-full w-6 h-6">
              <ProfileIcon className="w-4 h-4" />
            </div>
            <div>{truncateAddress(address)}</div>
          </div>
          <ChevronDown />
        </button>
        <ConnectedMenu
          address={address}
          open={isOpen}
          setIsOpen={setIsOpen}
          dropdownElements={dropdownElements}
        />
      </div>
    </>
  )
}

export { ConnectedButton }
