import type { StarknetWindowObject, WalletProvider } from "get-starknet-core"
import { Connector } from "../connectors/connector"
import { ARGENT_X_ICON } from "../connectors/injected/constants"
import type { ModalWallet, StoreVersion } from "../types/modal"
import { isString } from "lodash-es"

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

  const allInstalledWallets = installedWallets.map((w) =>
    availableConnectors.find((c) => c.id === w.id),
  )

  const orderedByInstall = [
    ...availableConnectors.filter((c) => allInstalledWallets.includes(c)),
    ...availableConnectors.filter((c) => !allInstalledWallets.includes(c)),
  ]

  const connectors = orderedByInstall
    .map<ModalWallet | null>((c) => {
      const installed = installedWallets.find((w) => w.id === c.id)
      if (installed) {
        const installedIcon =
          installed.id === "argentX" ? ARGENT_X_ICON : installed.icon
        return {
          name: installed.name,
          id: installed.id,
          icon: { light: installedIcon, dark: installedIcon },
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

        const discoveryIcon =
          discovery.id === "argentX" ? ARGENT_X_ICON : discovery.icon
        return {
          name: discovery.name,
          id: discovery.id,
          icon: { light: discoveryIcon, dark: discoveryIcon },
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
        title: "title" in c && isString(c.title) ? c.title : undefined,
        subtitle:
          "subtitle" in c && isString(c.subtitle) ? c.subtitle : undefined,
      }
    })
    .filter((c): c is ModalWallet => c !== null)

  return connectors
}
