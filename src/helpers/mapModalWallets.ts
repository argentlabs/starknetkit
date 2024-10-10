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
import { DEFAULT_ARGENT_MOBILE_ICON } from "../connectors/argent/argentMobile/constants"
import { findConnectorById, getConnector } from "../main"

interface SetConnectorsExpandedParams {
  availableConnectors: (StarknetkitConnector | StarknetkitCompoundConnector)[]
  installedWallets: StarknetWindowObject[]
  discoveryWallets: WalletProvider[]
  storeVersion: StoreVersion | null
  customOrder: boolean
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

  const allInstalledWallets = installedWallets.map(
    (
      w, // TODO this logic
    ) => findConnectorById(availableConnectors, w.id),
  )

  // console.log("customOrder", customOrder)

  const orderedByInstall = customOrder
    ? availableConnectors
    : [
        ...availableConnectors.filter((c) =>
          allInstalledWallets.includes(getConnector(c)),
        ),
        ...availableConnectors.filter(
          (c) => !allInstalledWallets.includes(getConnector(c)),
        ),
      ]

  // console.log(
  //   "availableConnectors, orderedByInstall",
  //   availableConnectors,
  //   orderedByInstall,
  // )

  const connectors = orderedByInstall
    .map<ModalWallet | null>((_c) => {
      const c = getConnector(_c)

      const installed = installedWallets.find((w) => w.id === c.id)
      if (installed) {
        let icon
        let name

        if (_c.isCompoundConnector) {
          icon = DEFAULT_ARGENT_MOBILE_ICON // TODO
          name = "Argent" // TODO
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
          connector: c,
          isCompoundConnector: Boolean(_c?.isCompoundConnector),
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
        name: c.name, // TODO
        id: c.id,
        icon: c.icon,
        connector: c,
        title: "title" in c && isString(c.title) ? c.title : undefined,
        subtitle:
          "subtitle" in c && isString(c.subtitle) ? c.subtitle : undefined,
        isCompoundConnector: Boolean(_c?.isCompoundConnector),
      }
    })
    .filter((c): c is ModalWallet => c !== null)

  // console.log("connectors", connectors)

  return connectors
}
