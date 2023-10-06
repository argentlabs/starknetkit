import type { StarknetWindowObject, WalletProvider } from "get-starknet-core"
import { Connector } from "../connectors/connector"
import { ARGENT_X_ICON } from "../constants"
import type { ModalWallet, StoreVersion } from "../types/modal"

interface SetConnectorsExpandedParams {
  availableConnectors: Connector[]
  installedWallets: StarknetWindowObject[]
  discoveryWallets: WalletProvider[]
  storeVersion: StoreVersion | null
}

export const mapModalWallets = ({
  availableConnectors,
  installedWallets,
  discoveryWallets,
  storeVersion,
}: SetConnectorsExpandedParams): ModalWallet[] => {
  const starknetMobile = window?.starknet_argentX as StarknetWindowObject & {
    isInAppBrowser: boolean
  }
  const isInAppBrowser = starknetMobile?.isInAppBrowser
  if (isInAppBrowser) {
    return []
  }

  return availableConnectors
    .map((c) => {
      const installed = installedWallets.find((w) => w.id === c.id)
      if (installed) {
        return {
          name: installed.name,
          id: installed.id,
          icon: installed.id === "argentX" ? ARGENT_X_ICON : installed.icon,
          connector: c,
        }
      }

      const discovery = discoveryWallets
        .filter((w) =>
          Boolean(w.downloads[storeVersion as keyof typeof w.downloads]),
        )
        .find((d) => d.id === c.id)

      if (discovery) {
        const { downloads } = discovery
        return {
          name: discovery.name,
          id: discovery.id,
          icon: discovery.id === "argentX" ? ARGENT_X_ICON : discovery.icon,
          connector: c,
          download: downloads[storeVersion as keyof typeof downloads],
        }
      }

      if (!c || !c.id || !c.name) {
        return null
      }

      return {
        name: c.name,
        id: c.id,
        icon: c.icon,
        connector: c,
        title: "title" in c ? c.title : undefined,
        subtitle: "subtitle" in c ? c.subtitle : undefined,
      }
    })
    .filter((c) => c !== null) as ModalWallet[]
}
