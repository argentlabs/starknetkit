import { FC, ReactNode, useContext } from "react"
import "./theme.css"
import { CopyIcon } from "./icons/CopyIcon"
import { DisconnectIcon } from "./icons/DisconnectIcon"
import { WalletIcon } from "./icons/WalletIcon"
import { DropdownElement } from "./ConnectedButton"
import { WalletContext } from "./components/WalletContext"
import { disconnect } from "starknetkit"

interface ConnectedMenuProps {
  address: string
  open: boolean
  dropdownElements?: DropdownElement[]
}

interface MenuButtonProps {
  onClick: () => void
  label: string
  icon: string | ReactNode
}

const MenuButton: FC<MenuButtonProps> = ({ onClick, label, icon }) => (
  <button
    onClick={onClick}
    className="flex items-center w-full text-left px-2 py-2 text-base font-semibold hover:bg-[#F0F0F0] rounded-lg"
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
}) => {
  const walletContext = useContext(WalletContext)
  const { wallet } = walletContext

  const handleDisconnect = async () => {
    await disconnect()
    walletContext.setWallet(null)
  }
  return (
    <div
      className={`absolute left-0 mt-1 w-50 rounded-lg shadow-lg z-10 ${
        !open ? "hidden" : ""
      }`}
    >
      <div className="p-2">
        {wallet?.id === "argentWebWallet" && (
          <MenuButton
            onClick={() => window.open("TODO", "_blank")}
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
