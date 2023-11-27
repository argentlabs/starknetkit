import { FC, ReactNode, useEffect, useRef, useState } from "react"
import { truncateAddress } from "../helpers/address"
import { ConnectedMenu } from "./ConnectedMenu"
import { ChevronDown } from "../icons/ChevronDown"
import { ProfileIcon } from "../icons/ProfileIcon"
import { ProviderInterface } from "starknet"
import { Hex, hexSchema } from "../schemas/hexSchema"

export interface DropdownElement {
  icon: string | ReactNode
  label: string
  onClick: () => void
}

interface ConnectedButtonProps {
  address: string
  showBalance?: boolean
  dropdownElements?: DropdownElement[]
  provider: ProviderInterface
}

const FEE_TOKEN_ADDRESS = // ETH on starknet
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"

export const uint256ToBigInt = (low: Hex, high: Hex): bigint => {
  return BigInt(low) + (BigInt(high) << BigInt(128))
}

const ConnectedButton: FC<ConnectedButtonProps> = ({
  address,
  showBalance,
  dropdownElements,
  provider,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [balance, setBalance] = useState(0n)

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

    const balanceOf = async (address: string) => {
      const values = await provider.callContract({
        contractAddress: FEE_TOKEN_ADDRESS,
        entrypoint: "balanceOf",
        calldata: [address],
      })

      const [uint256Low, uint256High] = values.result.map((value) =>
        hexSchema.parse(value),
      )
      setBalance(uint256ToBigInt(uint256Low, uint256High))
    }

    document.addEventListener("mousedown", handleClickOutside)

    if (showBalance) {
      balanceOf(address)
    }

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
                <span>{balance.toString()} ETH</span>
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
          dropdownElements={dropdownElements}
        />
      </div>
    </>
  )
}

export { ConnectedButton }
