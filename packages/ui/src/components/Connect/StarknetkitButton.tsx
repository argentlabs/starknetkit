import { FC, useContext, useEffect, useState } from "react"
import { ProviderInterface } from "starknet"
import type { Connector } from "starknetkit"
import { DEFAULT_WEBWALLET_URL, connect, type ModalMode } from "starknetkit"
import type { ArgentMobileConnectorOptions } from "starknetkit/argentMobile"
import { ConnectButton } from "./ConnectButton"
import { ConnectedButton } from "./ConnectedButton"
import { WalletContext } from "../WalletContext"
import { DropdownElement } from "../../types/DropdownElement"

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
  const [connecting, setConnecting] = useState(false)
  const { wallet } = walletContext

  const handleConnect = async (modalMode: ModalMode = "alwaysAsk") => {
    setConnecting(true)
    try {
      const wallet = await connect({
        modalMode,
        webWalletUrl,
        argentMobileOptions,
        connectors,
      })

      walletContext.setWallet(wallet)
    } catch (e) {
      console.log(e)
    } finally {
      setConnecting(false)
    }
  }

  useEffect(() => {
    if (enableReconnect) {
      handleConnect("neverAsk")
    }
  }, [])

  return (
    <>
      {!wallet && (
        <ConnectButton connect={handleConnect} connecting={connecting} />
      )}
      {wallet?.isConnected && (
        <ConnectedButton
          address={wallet.selectedAddress}
          showBalance={showBalance}
          dropdownElements={dropdownElements}
          provider={provider}
          webWalletUrl={webWalletUrl}
        />
      )}
    </>
  )
}

export { StarknetkitButton }
