import { FC, useContext, useEffect, useState, CSSProperties } from "react"
import { ProviderInterface } from "starknet"
import type { Connector } from "starknetkit"
import { DEFAULT_WEBWALLET_URL, connect, type ModalMode } from "starknetkit"
import type { ArgentMobileConnectorOptions } from "starknetkit/argentMobile"
import { ConnectButton } from "./ConnectButton"
import { ConnectedButton } from "./ConnectedButton"
import { WalletContext } from "../WalletContext"
import { DropdownElement } from "../../types/DropdownElement"

interface StarknetkitButtonProps {
  accountInfo?: {
    showBalance?: boolean
    starknetId?: string
    starknetIdAvatar?: string
  }
  argentMobileOptions?: ArgentMobileConnectorOptions
  connectors?: Connector[]
  dropdownElements?: DropdownElement[]
  enableReconnect?: boolean
  provider: ProviderInterface
  style: CSSProperties
  webWalletUrl: string
}

const StarknetkitButton: FC<StarknetkitButtonProps> = ({
  accountInfo,
  argentMobileOptions,
  connectors,
  dropdownElements,
  enableReconnect,
  provider,
  style,
  webWalletUrl = DEFAULT_WEBWALLET_URL,
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
        // provider
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
        <ConnectButton
          connect={handleConnect}
          connecting={connecting}
          style={{ ...style }}
        />
      )}
      {wallet?.isConnected && (
        <ConnectedButton
          address={wallet.selectedAddress}
          accountInfo={accountInfo}
          dropdownElements={dropdownElements}
          provider={provider}
          webWalletUrl={webWalletUrl}
          style={{ ...style }}
        />
      )}
    </>
  )
}

export { StarknetkitButton }
