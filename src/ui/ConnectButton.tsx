import { FC } from "react"
import { ProfileIcon } from "./icons/ProfileIcon"
import "./global.css"
import { truncateAddress } from "../helpers/address"

interface ConnectButtonProps {
  isConnected?: boolean
  address?: string
  balance?: string
  connect: () => void
  disconnect: () => void
}

const ConnectButton: FC<ConnectButtonProps> = ({
  address,
  balance,
  isConnected,
  connect,
  disconnect,
}) => {
  return (
    <>
      {!isConnected && (
        <button
          onClick={connect}
          className="font-barlow font-semibold text-base leading-4 h-10 /* py-2.5 */ px-4 rounded-lg shadow-list-item"
        >
          Connect wallet
        </button>
      )}
      {isConnected && (
        <button
          onClick={disconnect}
          className="flex items-center shadow-list-item font-barlow font-semibold text-base leading-4 h-10 px-4 gap-2.5 rounded-lg"
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
      )}
    </>
  )
}

export { ConnectButton }
