import { FC, ReactNode, useContext } from "react"
import { CopyIcon } from "../icons/CopyIcon"
import { DisconnectIcon } from "../icons/DisconnectIcon"
import { WalletIcon } from "../icons/WalletIcon"
import { WalletContext } from "./WalletContext"
import { disconnect } from "starknetkit"
import { DropdownElement } from "../types/DropdownElement"

interface ConnectedMenuProps {
  address: string
  open: boolean
  dropdownElements?: DropdownElement[]
  webWalletUrl?: string
}

interface MenuButtonProps {
  onClick: () => void
  label: string
  icon: string | ReactNode
}

const MenuButton: FC<MenuButtonProps> = ({
  onClick,
  label,
  icon,
  webWalletUrl,
}) => (
  <button
    onClick={onClick}
    className="flex items-center w-full text-left px-2 py-2 text-base font-semibold rounded-lg hover:bg-[#F0F0F0]"
  >
    {typeof icon === "string" ? (
      <img src={icon} className="flex items-center w-5 h-5 mr-2"></img>
    ) : (
      <div className="flex items-center w-5 h-5 mr-2">{icon}</div>
    )}

    {label}
  </button>
)

const ConnectedMenu: FC<ConnectedMenuProps> = ({
  address,
  open,
  dropdownElements,
  webWalletUrl,
}) => {
  const walletContext = useContext(WalletContext)
  const { wallet } = walletContext

  const handleDisconnect = async () => {
    await disconnect()
    walletContext.setWallet(null)
  }
  return (
    <div
      className={`absolute left-0 mt-0.5 w-50 rounded-lg shadow-lg z-10 text-black bg-white ${
        !open ? "hidden" : ""
      }`}
    >
      <div className="p-2">
        {wallet?.id === "argentWebWallet" && (
          <MenuButton
            onClick={() => window.open(webWalletUrl, "_blank")}
            label="View wallet"
            icon={<WalletIcon />}
          />
        )}

        <MenuButton
          onClick={() => navigator.clipboard.writeText(address)}
          label="Copy address"
          icon={<CopyIcon />}
        />

        {dropdownElements?.map((element, index) => (
          <MenuButton
            key={index}
            onClick={element.onClick}
            label={element.label}
            icon={element.icon}
          />
        ))}

        <MenuButton
          onClick={handleDisconnect}
          label="Disconnect"
          icon={<DisconnectIcon />}
        />
      </div>
    </div>
  )
}

export { ConnectedMenu }
