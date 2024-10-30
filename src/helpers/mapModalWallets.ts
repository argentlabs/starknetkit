import { WalletProvider } from "@starknet-io/get-starknet-core"
import { isString } from "lodash-es"
import type { StarknetWindowObject } from "@starknet-io/types-js"
import {
  StarknetkitCompoundConnector,
  StarknetkitConnector,
} from "../connectors/connector"
import { ARGENT_X_ICON } from "../connectors/injected/constants"
import type { ModalWallet, StoreVersion } from "../types/modal"
import { isInArgentMobileAppBrowser } from "../connectors/argent/helpers"
import { extractConnector, findConnectorById } from "./connector"

interface SetConnectorsExpandedParams {
  availableConnectors: (StarknetkitConnector | StarknetkitCompoundConnector)[]
  installedWallets: StarknetWindowObject[]
  discoveryWallets: WalletProvider[]
  storeVersion: StoreVersion | null
  customOrder: boolean
}

export function getModalWallet(
  connectorOrCompoundConnector:
    | StarknetkitConnector
    | StarknetkitCompoundConnector,
  discoveryWallets?: WalletProvider[],
): ModalWallet {
  const connector = extractConnector(
    connectorOrCompoundConnector,
  ) as StarknetkitConnector
  return {
    name: connector.name,
    id: connector.id,
    icon: connector.icon,
    connector: connectorOrCompoundConnector,
    title:
      "title" in connector && isString(connector.title)
        ? connector.title
        : undefined,
    subtitle:
      "subtitle" in connector && isString(connector.subtitle)
        ? connector.subtitle
        : undefined,
    downloads: discoveryWallets?.find((d) => d.id === connector.id)?.downloads,
  }
}

export const mapModalWallets = ({
  availableConnectors,
  installedWallets,
  discoveryWallets,
  storeVersion,
  customOrder,
}: SetConnectorsExpandedParams): ModalWallet[] => {
  const isInAppBrowser = isInArgentMobileAppBrowser()

  if (isInAppBrowser) {
    return []
  }

  const allInstalledWallets = installedWallets.map((w) =>
    findConnectorById(availableConnectors, w.id),
  )

  const orderedByInstall = customOrder
    ? availableConnectors
    : [
        ...availableConnectors.filter((c) =>
          allInstalledWallets.includes(extractConnector(c)),
        ),
        ...availableConnectors.filter(
          (c) => !allInstalledWallets.includes(extractConnector(c)),
        ),
      ]

  const connectors = orderedByInstall
    .map<ModalWallet | null>((_c) => {
      const c = extractConnector(_c)

      const installed = installedWallets.find((w) => w.id === c?.id)
      if (installed) {
        let icon
        let name

        if (_c.isCompoundConnector) {
          icon = _c.icon
          name = _c.name
        } else {
          icon =
            installed.id === "argentX"
              ? { light: ARGENT_X_ICON, dark: ARGENT_X_ICON }
              : isString(installed.icon)
                ? { light: installed.icon, dark: installed.icon }
                : installed.icon

          name = installed.name
        }

        return {
          name,
          id: installed.id,
          icon,
          connector: _c,
          downloads: discoveryWallets.find((d) => d.id === c?.id)?.downloads,
        }
      }

      const discovery = discoveryWallets
        .filter((w) =>
          Boolean(w.downloads[storeVersion as keyof typeof w.downloads]),
        )
        .find((d) => d.id === c?.id)

      if (discovery) {
        const { downloads } = discovery

        const discoveryIcon =
          discovery.id === "argentX" ? ARGENT_X_ICON : discovery.icon
        return {
          name: discovery.name,
          id: discovery.id,
          icon: { light: discoveryIcon, dark: discoveryIcon },
          connector: _c,
          download: downloads[storeVersion as keyof typeof downloads],
          downloads: downloads,
        }
      }

      if (!c || !c.id || !c.name) {
        return null
      }

      return getModalWallet(_c, discoveryWallets)
    })
    .filter((c): c is ModalWallet => c !== null)

  return connectors
}
