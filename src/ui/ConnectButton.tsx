import { FC } from "react"
import "./global.css"

interface ConnectButtonProps {
  connect: () => Promise<void>
}

const ConnectButton: FC<ConnectButtonProps> = ({ connect }) => {
  return (
    <button
      onClick={connect}
      className="font-barlow font-semibold text-base leading-4 h-10 px-4 rounded-lg shadow-list-item"
    >
      Connect wallet
    </button>
  )
}

export { ConnectButton }
