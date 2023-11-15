import { FC, useState } from "react"
import { ProfileIcon } from "./icons/ProfileIcon"
import "./global.css"
import { truncateAddress } from "../helpers/address"
import { ConnectedMenu } from "./ConnectedMenu"

interface ConnectButtonProps {
  isConnected?: boolean
  address?: string
  balance?: string
  walletHref?: string
  connect: () => void
}

const ConnectButton: FC<ConnectButtonProps> = ({
  address,
  balance,
  isConnected,
  walletHref,
  connect,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen((prev) => !prev)
  }

  return (
    <>
      {!isConnected && (
        <div>
          <button
            onClick={connect}
            className="font-barlow font-semibold text-base leading-4 h-10 /* py-2.5 */ px-4 rounded-lg shadow-list-item"
          >
            Connect wallet
          </button>
        </div>
      )}
      {isConnected && (
        <div className="relative">
          <button
            className="flex items-center shadow-list-item font-barlow font-semibold text-base leading-4 h-10 px-4 gap-2.5 rounded-lg"
            onClick={toggleMenu}
          >
            <div className="flex items-center">
              <span>{balance}</span>
            </div>
            <div className="h-10 border border-solid border-neutrals.200" />
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center bg-[#F0F0F0] rounded-full w-6 h-6">
                <ProfileIcon className="w-4 h-4" />
              </div>
              <div>{truncateAddress(address)}</div>
            </div>
          </button>
          <ConnectedMenu
            disconnect={() => console.log("disconnect")}
            address={address}
            walletHref={walletHref}
            open={isOpen}
          />
        </div>
      )}
    </>
  )
}

export { ConnectButton }
