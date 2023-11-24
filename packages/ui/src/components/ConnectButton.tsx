import { FC } from "react"

interface ConnectButtonProps {
  connect: () => Promise<void>
  connecting: boolean
}

const ConnectButton: FC<ConnectButtonProps> = ({ connect, connecting }) => {
  return (
    <div className="inline-block">
      <button
        onClick={connect}
        className={`flex items-center shadow-list-item font-barlow font-semibold text-base leading-4 h-10 px-4 gap-2.5 rounded-lg 
        text-black bg-white
        ${connecting ? "cursor-not-allowed text-neutral-400" : ""}`}
        disabled={connecting}
      >
        <span>Connect wallet</span>
      </button>
    </div>
  )
}

export { ConnectButton }
