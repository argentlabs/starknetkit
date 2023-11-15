import { FC, ReactNode } from "react"
import "./global.css"
import { CopyIcon } from "./icons/CopyIcon"
import { DisconnectIcon } from "./icons/DisconnectIcon"
import { WalletIcon } from "./icons/WalletIcon"

interface ConnectedMenuProps {
  address: string
  disconnect: () => void
  walletHref: string
  open: boolean
}

interface MenuButtonProps {
  onClick: () => void
  label: string
  icon: ReactNode
}

const MenuButton: FC<MenuButtonProps> = ({ onClick, label, icon }) => (
  <button
    onClick={onClick}
    className="flex items-center w-full text-left px-2 py-2 text-base font-semibold hover:bg-[#F0F0F0] rounded-lg"
  >
    <div className="flex items-center w-5 h-5 mr-2">{icon}</div>
    {label}
  </button>
)

const ConnectedMenu: FC<ConnectedMenuProps> = ({
  address,
  walletHref,
  disconnect,
  open,
}) => (
  <div
    className={`absolute left-0 mt-1 w-50 bg-white rounded-lg shadow-lg z-10 ${
      !open ? "hidden" : ""
    }`}
  >
    <div className="p-2">
      <MenuButton
        onClick={() => window.open(walletHref, "_blank")}
        label="View wallet"
        icon={<WalletIcon />}
      />
      <MenuButton
        onClick={() => navigator.clipboard.writeText(address)}
        label="Copy address"
        icon={<CopyIcon />}
      />
      <MenuButton
        onClick={disconnect}
        label="Disconnect"
        icon={<DisconnectIcon />}
      />
    </div>
  </div>
)

export { ConnectedMenu }
