import { FC, ReactNode, useContext, useEffect, useState } from "react"
import { ProviderInterface } from "starknet"
import { ConnectButton } from "./ConnectButton"
import type { Connector } from "starknetkit"
import type { ArgentMobileConnectorOptions } from "starknetkit/argentMobile"
import { connect, DEFAULT_WEBWALLET_URL, type ModalMode } from "starknetkit"
import { ConnectedButton } from "./ConnectedButton"
import { WalletContext } from "./components/WalletContext"
import "./theme.css"

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
    debugger
    try {
      debugger
      const wallet =  await connect({
        modalMode,
        webWalletUrl,
        argentMobileOptions,
        connectors,
      })
      debugger
      walletContext.setWallet(
       wallet
      )
    } catch(e) {console.log(e)} finally {
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
