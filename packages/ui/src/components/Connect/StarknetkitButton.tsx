import { FC, useContext, useEffect, useState, CSSProperties } from "react"
import { ProviderInterface, constants } from "starknet"
import type { ModalMode, Connector } from "starknetkit"
import { connect, DEFAULT_WEBWALLET_URL } from "starknetkit"
import type { ArgentMobileConnectorOptions } from "starknetkit/argentMobile"
import { ConnectButton } from "./ConnectButton"
import { ConnectedButton } from "./ConnectedButton"
import { WalletContext } from "../WalletContext"
import { DropdownElement } from "../../types/DropdownElement"
import { AccountInfo } from "./types"

interface StarknetkitButtonProps {
  accountInfo?: AccountInfo
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
  webWalletUrl = DEFAULT_WEBWALLET_URL,
  style,
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
        provider,
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
          chainId={wallet.chainId as constants.StarknetChainId} // TODO: update with getChainId after merging develop
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
