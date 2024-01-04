import BigDecimalNumber from "bignumber.js"
import { CSSProperties, FC, useEffect, useRef, useState } from "react"
import { ProviderInterface, constants, uint256 } from "starknet"
import { truncateAddress } from "../../helpers/address"
import { formatUnits } from "../../helpers/formatUnits"
import { prettifyTokenNumber } from "../../helpers/prettifyNumber"
import { useStarknetId } from "../../hooks/useStarknetId"
import { ChevronDown } from "../../icons/ChevronDown"
import { ProfileIcon } from "../../icons/ProfileIcon"
import { hexSchema } from "../../schemas/hexSchema"
import { DropdownElement } from "../../types/DropdownElement"
import { SkeletonLoading } from "../Loading/SkeletonLoading"
import { ConnectedMenu } from "./ConnectedMenu"
import { AccountInfo } from "./types"

const { uint256ToBN } = uint256

interface ConnectedButtonProps {
  address: string
  chainId: constants.StarknetChainId
  accountInfo?: AccountInfo
  dropdownElements?: DropdownElement[]
  provider: ProviderInterface
  symbol?: string
  webWalletUrl?: string
  style?: CSSProperties
}

const FEE_TOKEN_ADDRESS = // ETH on starknet
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"

const ConnectedButton: FC<ConnectedButtonProps> = ({
  address,
  chainId,
  accountInfo,
  dropdownElements,
  provider,
  symbol = "ETH",
  webWalletUrl,
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [balance, setBalance] = useState("")
  const [isFetchingBalance, setIsFetchingBalance] = useState(false)

  const { showBalance, displayStarknetId, displayStarknetIdAvatar } =
    accountInfo ?? {}

  const { data, isLoading } = useStarknetId({
    address,
    chainId,
    displayStarknetId,
    displayStarknetIdAvatar,
    provider,
  })

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
      setIsFetchingBalance(true)
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
        console.log(address, amountUint256)

        const formatted = formatUnits({
          value: uint256ToBN(amountUint256),
          decimals: 18,
        })

        const formattedBigDecimalValue = new BigDecimalNumber(formatted)
        setBalance(
          formattedBigDecimalValue.lt(0.001)
            ? "< 0.001"
            : prettifyTokenNumber(formatted, { maxDecimalPlaces: 3 }) ?? "-",
        )
      } catch (e) {
        console.error(e)
        setBalance("-")
      } finally {
        setIsFetchingBalance(false)
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
          className="flex items-center shadow-list-item font-barlow font-semibold text-base leading-4 h-10 px-4 gap-2.5 rounded-lg text-black bg-white w-"
          onClick={toggleMenu}
          style={{ ...style }}
        >
          {showBalance && (
            <>
              {isFetchingBalance ? (
                <div className="flex items-center justify-center w-8 h-2">
                  <SkeletonLoading />
                </div>
              ) : (
                <div className="flex items-center">
                  <span>
                    {balance} {symbol}
                  </span>
                </div>
              )}
              <div className="h-10 border border-solid border-neutrals.200" />
            </>
          )}
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-2 relative">
              {isLoading ? (
                <div className="flex items-center justify-center w-4 h-2">
                  <SkeletonLoading />
                </div>
              ) : (
                <>
                  {displayStarknetIdAvatar && data?.starknetIdAvatar ? (
                    <img className="w-6 h-6" src={data.starknetIdAvatar} />
                  ) : (
                    <div className="flex items-center justify-center bg-[#F0F0F0] rounded-full w-6 h-6">
                      <ProfileIcon className="w-4 h-4" />
                    </div>
                  )}
                </>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center w-4 h-2">
                  <SkeletonLoading />
                </div>
              ) : (
                <>
                  {displayStarknetId && data?.starknetId ? (
                    <div>{data.starknetId}</div>
                  ) : (
                    <div>{truncateAddress(address)}</div>
                  )}
                </>
              )}
            </div>
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
