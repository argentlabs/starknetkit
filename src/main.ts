import type { DisconnectOptions, StarknetWindowObject } from "get-starknet-core"
import sn from "get-starknet-core"

import { getStoreVersionFromBrowser } from "./helpers/getStoreVersionFromBrowser"

import { DEFAULT_WEBWALLET_URL } from "./connectors/webwallet/constants"
import { defaultConnectors } from "./helpers/defaultConnectors"
import { mapModalWallets } from "./helpers/mapModalWallets"
import { resetWalletConnect } from "./helpers/resetWalletConnect"
import Modal from "./modal/Modal.svelte"
import type { ConnectOptions, ModalWallet } from "./types/modal"
import {
  removeStarknetLastConnectedWallet,
  setStarknetLastConnectedWallet,
} from "./helpers/lastConnected"

export const connect = async ({
  modalMode = "canAsk",
  storeVersion = getStoreVersionFromBrowser(),
  modalTheme,
  dappName,
  webWalletUrl = DEFAULT_WEBWALLET_URL,
  argentMobileOptions,
  connectors = [],
  ...restOptions
}: ConnectOptions = {}): Promise<StarknetWindowObject | null> => {
  const availableConnectors =
    !connectors || connectors.length === 0
      ? defaultConnectors({
          argentMobileOptions,
          webWalletUrl,
        })
      : connectors

  const lastWalletId = localStorage.getItem("starknetLastConnectedWallet")
  if (modalMode === "neverAsk") {
    const connector = availableConnectors.find((c) => c.id === lastWalletId)
    await connector?.connect()
    return connector?.wallet || null
  }

  const installedWallets = await sn.getAvailableWallets(restOptions)

  // we return/display wallet options once per first-dapp (ever) connect
  if (modalMode === "canAsk" && lastWalletId) {
    const preAuthorizedWallets = await sn.getPreAuthorizedWallets({
      ...restOptions,
    })

    const wallet =
      preAuthorizedWallets.find((w) => w.id === lastWalletId) ??
      installedWallets.length === 1
        ? installedWallets[0]
        : undefined

    if (wallet) {
      const connector = availableConnectors.find((c) => c.id === lastWalletId)
      await connector?.connect()
      return wallet
    } // otherwise fallback to modal
  }

  const modalWallets: ModalWallet[] = mapModalWallets({
    availableConnectors,
    installedWallets,
    discoveryWallets: await sn.getDiscoveryWallets(restOptions),
    storeVersion,
  })

  return new Promise((resolve) => {
    const modal = new Modal({
      target: document.body,
      props: {
        dappName,
        callback: async (value: StarknetWindowObject | null) => {
          try {
            if (value.id !== "argentWebWallet") {
              setStarknetLastConnectedWallet(value.id)
            }
            resolve(value)
          } finally {
            setTimeout(() => modal.$destroy())
          }
        },
        theme: modalTheme === "system" ? null : modalTheme ?? null,
        modalWallets,
      },
    })
  })
}

export function disconnect(options: DisconnectOptions = {}): Promise<void> {
  resetWalletConnect()
  removeStarknetLastConnectedWallet()
  return sn.disconnect(options)
}
