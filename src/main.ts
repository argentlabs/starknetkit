import type { DisconnectOptions, StarknetWindowObject } from "get-starknet-core"
import sn from "get-starknet-core"
import snV3 from "get-starknet-coreV3"

import { getStoreVersionFromBrowser } from "./helpers/getStoreVersionFromBrowser"

import { DEFAULT_WEBWALLET_URL } from "./connectors/webwallet/constants"
import { defaultConnectors } from "./helpers/defaultConnectors"
import {
  removeStarknetLastConnectedWallet,
  setStarknetLastConnectedWallet,
} from "./helpers/lastConnected"
import { mapModalWallets } from "./helpers/mapModalWallets"
import Modal from "./modal/Modal.svelte"
import type { ConnectOptions, ModalResult, ModalWallet } from "./types/modal"

import { ConnectorData, type Connector } from "./connectors"
import css from "./theme.css?inline"

let selectedConnector: Connector | null = null

export const connect = async ({
  modalMode = "canAsk",
  storeVersion = getStoreVersionFromBrowser(),
  modalTheme,
  dappName,
  webWalletUrl = DEFAULT_WEBWALLET_URL,
  argentMobileOptions,
  connectors = [],
  resultType = "wallet",
  provider,
  ...restOptions
}: ConnectOptions = {}): Promise<ModalResult> => {
  // force null in case it was disconnected from mobile app
  selectedConnector = null
  const availableConnectors =
    !connectors || connectors.length === 0
      ? defaultConnectors({
          argentMobileOptions,
          webWalletUrl,
          provider,
        })
      : connectors

  const lastWalletId = localStorage.getItem("starknetLastConnectedWallet")
  if (modalMode === "neverAsk") {
    const connector =
      availableConnectors.find((c) => c.id === lastWalletId) ?? null
    let connectorData: ConnectorData | null = null

    if (connector && resultType === "wallet") {
      connectorData = await connector.connect()
    }

    return {
      connector,
      wallet: connector?.wallet ?? null,
      connectorData,
    }
  }

  const installedWallets = await sn.getAvailableWallets(restOptions)

  // we return/display wallet options once per first-dapp (ever) connect
  if (modalMode === "canAsk" && lastWalletId) {
    const authorizedWallets = await sn.getAuthorizedWallets(restOptions)

    const wallet =
      authorizedWallets.find((w) => w.id === lastWalletId) ??
      installedWallets.length === 1
        ? installedWallets[0]
        : undefined

    if (wallet) {
      const connector = availableConnectors.find((c) => c.id === lastWalletId)

      let connectorData: ConnectorData | null = null

      if (resultType === "wallet") {
        connectorData = (await connector?.connect()) ?? null
      }

      if (connector) {
        selectedConnector = connector
      }

      return {
        connector: selectedConnector,
        connectorData,
        wallet: connector?.wallet ?? null,
      }
    } // otherwise fallback to modal
  }

  const modalWallets: ModalWallet[] = mapModalWallets({
    availableConnectors,
    installedWallets,
    discoveryWallets: await snV3.getDiscoveryWallets(restOptions),
    storeVersion,
  })

  const getTarget = (): ShadowRoot => {
    const modalId = "starknetkit-modal-container"
    const existingElement = document.getElementById(modalId)

    if (existingElement) {
      if (existingElement.shadowRoot) {
        // element already exists, use the existing as target
        return existingElement.shadowRoot
      }
      // element exists but shadowRoot cannot be accessed
      // delete the element and create new
      existingElement.remove()
    }

    const element = document.createElement("div")
    // set id for future retrieval
    element.id = modalId
    document.body.appendChild(element)
    const target = element.attachShadow({ mode: "open" })
    target.innerHTML = `<style>${css}</style>`

    return target
  }

  return new Promise((resolve, reject) => {
    const modal = new Modal({
      target: getTarget(),
      props: {
        dappName,
        callback: async (connector: Connector | null) => {
          try {
            selectedConnector = connector
            const connectorData = (await connector?.connect()) ?? null

            if (resultType === "wallet") {
              if (connector !== null && connector.id !== "argentWebWallet") {
                setStarknetLastConnectedWallet(connector.id)
              }

              resolve({
                connector,
                connectorData,
                wallet: connector?.wallet ?? null,
              })
            } else {
              resolve({
                connector,
                wallet: null,
                connectorData,
              })
            }
          } catch (error) {
            reject(error)
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

// Should be used after a sucessful connect
export const getSelectedConnectorWallet = () =>
  selectedConnector ? selectedConnector.wallet : null

export const disconnect = async (options: DisconnectOptions = {}) => {
  removeStarknetLastConnectedWallet()
  if (selectedConnector) {
    await selectedConnector.disconnect()
  }
  selectedConnector = null

  return snV3.disconnect(options)
}

export type {
  Connector,
  DisconnectOptions,
  StarknetWindowObject,
  defaultConnectors as starknetkitDefaultConnectors,
  ModalResult,
}

export { useStarknetkitConnectModal } from "./hooks/useStarknetkitConnectModal"
