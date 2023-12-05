import { FC, useEffect, useRef, useState } from "react"
import { ProviderInterface, uint256 } from "starknet"
import { truncateAddress } from "../helpers/address"
import { ChevronDown } from "../icons/ChevronDown"
import { ProfileIcon } from "../icons/ProfileIcon"
import { hexSchema } from "../schemas/hexSchema"
import { DropdownElement } from "../types/DropdownElement"
import { ConnectedMenu } from "./ConnectedMenu"
import { formatBalance } from "../helpers/formatBalance"

const { uint256ToBN } = uint256

interface ConnectedButtonProps {
  address: string
  showBalance?: boolean
  dropdownElements?: DropdownElement[]
  provider: ProviderInterface
  webWalletUrl?: string
}

const FEE_TOKEN_ADDRESS = // ETH on starknet
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"

const ConnectedButton: FC<ConnectedButtonProps> = ({
  address,
  showBalance,
  dropdownElements,
  provider,
  webWalletUrl,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [balance, setBalance] = useState("")

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
      try {
        const values = await provider.callContract({
          contractAddress: FEE_TOKEN_ADDRESS,
          entrypoint: "balanceOf",
          calldata: [address],
        })

        const [uint256Low, uint256High] = values.result.map((value) =>
          hexSchema.parse(value),
        )

        const amountUint256: uint256.Uint256 = {
          low: uint256Low,
          high: uint256High,
        }

        setBalance(
          formatBalance(
            {
              amount: uint256ToBN(amountUint256),
              decimals: 18,
              symbol: "ETH",
            },
            4,
          ),
        )
      } catch (e) {
        console.error(e)
        setBalance("-")
      }
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
      <div className="relative inline-block" ref={ref}>
        <button
          className="flex items-center shadow-list-item font-barlow font-semibold text-base leading-4 h-10 px-4 gap-2.5 rounded-lg text-black bg-white"
          onClick={toggleMenu}
        >
          {showBalance && (
            <>
              <div className="flex items-center">
                <span>{balance}</span>
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
          webWalletUrl={webWalletUrl}
        />
      </div>
    </>
  )
}

export { ConnectedButton }
