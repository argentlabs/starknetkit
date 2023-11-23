import { FC, ReactNode, useContext, useEffect, useState } from "react"
import { ProviderInterface } from "starknet"
import { ConnectButton } from "./ConnectButton"
import { ArgentMobileConnectorOptions, Connector } from "../connectors"
import { DEFAULT_WEBWALLET_URL } from "../connectors/webwallet/constants"
import { connect } from "../main"
import { ModalMode } from "../types/modal"
import { ConnectedButton } from "./ConnectedButton"
import { WalletContext } from "./components/WalletContext"
import "./global.css"

export interface DropdownElement {
  icon: string | ReactNode
  label: string
  onClick: () => void
}

interface StarknetkitButtonProps {
  provider: ProviderInterface
  connectors?: Connector[]
  argentMobileOptions: ArgentMobileConnectorOptions
  webWalletUrl: string
  enableReconnect?: boolean
  showBalance?: boolean
  dropdownElements?: DropdownElement[]
}

const StarknetkitButton: FC<StarknetkitButtonProps> = ({
  showBalance,
  dropdownElements,
  enableReconnect,
  connectors,
  argentMobileOptions,
  webWalletUrl = DEFAULT_WEBWALLET_URL,
  provider,
}) => {
  const walletContext = useContext(WalletContext)
  const [loading, setLoading] = useState(false)
  const { wallet } = walletContext

  const handleConnect = async (modalMode: ModalMode = "alwaysAsk") => {
    setLoading(true)
    try {
      walletContext.setWallet(
        await connect({
          modalMode,
          webWalletUrl,
          argentMobileOptions,
          connectors,
        }),
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (enableReconnect) {
      handleConnect("neverAsk")
    }
  }, [])

  if (loading) {
    // TODOs
    return <></>
  }

  return (
    <>
      {!wallet && <ConnectButton connect={handleConnect} />}
      {wallet?.isConnected && (
        <ConnectedButton
          address={wallet.selectedAddress}
          showBalance={showBalance}
          dropdownElements={dropdownElements}
          provider={provider}
        />
      )}
    </>
  )
}

export { StarknetkitButton }
