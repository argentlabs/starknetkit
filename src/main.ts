import type { DisconnectOptions } from "@starknet-io/get-starknet"
import sn from "@starknet-io/get-starknet-core"
import type { StarknetWindowObject } from "@starknet-io/types-js"
import { Connector, ConnectorData, StarknetkitConnector } from "./connectors"
import { DEFAULT_WEBWALLET_URL } from "./connectors/webwallet/constants"
import { defaultConnectors } from "./helpers/defaultConnectors"
import { getStoreVersionFromBrowser } from "./helpers/getStoreVersionFromBrowser"
import {
  removeStarknetLastConnectedWallet,
  setStarknetLastConnectedWallet,
} from "./helpers/lastConnected"
import { mapModalWallets } from "./helpers/mapModalWallets"
import Modal from "./modal/Modal.svelte"
import css from "./theme.css?inline"
import type {
  ConnectOptions,
  ConnectOptionsWithConnectors,
  ModalResult,
  ModalWallet,
} from "./types/modal"

let selectedConnector: StarknetkitConnector | null = null

/**
 *
 * @param [modalMode="canAsk"] - Choose connection behavior:
 *                               - "canAsk" - Connect silently if possible, if not prompt a user with the modal
 *                               - "alwaysAsk" - Always prompt a user with the modal
 *                               - "neverAsk" - Connect silently if possible, if not fail gracefully
 * @param [storeVersion=Current browser] - Name of the targeted store extension (chrome, firefox, or edge); It will select current browser by default
 * @param [modalTheme] - Theme color
 * @param [dappName] - Name of your dapp, displayed in the modal
 * @param [resultType="wallet"] - It will by default return selected wallet's connector by default, otherwise null
 * @param [connectors] - Array of wallet connectors to show in the modal
 * @param [webWalletUrl="https://web.argent.xyz"] - Link to Argent's web wallet - Mainnet env by default, if as a dApp for integration and testing purposes, you need access to an internal testnet environment, please contact Argent
 * @param [argentMobileOptions] - Argent Mobile connector options - used only when `connectors` is not explicitly passed
 * @param [argentMobileOptions.dappName] - Name of the dapp
 * @param [argentMobileOptions.projectId] - WalletConnect project id
 * @param [argentMobileOptions.chainId] - Starknet chain ID (SN_MAIN or SN_SEPOLIA)
 * @param [argentMobileOptions.description] - Dapp description
 * @param [argentMobileOptions.url] - Dapp url
 * @param [argentMobileOptions.icons] - Icon to show in the modal
 * @param [argentMobileOptions.rpcUrl] - Custom RPC url
 *
 * @returns {
 *    wallet: Selected wallet or null,
 *    connectorData: Selected account and chain ID, or null
 *    connector: Selected connector
 *  }
 */
export const connect = async ({
  modalMode = "canAsk",
  storeVersion = getStoreVersionFromBrowser(),
  modalTheme,
  dappName,
  resultType = "wallet",
  ...restOptions
}: ConnectOptionsWithConnectors | ConnectOptions): Promise<ModalResult> => {
  const { webWalletUrl = DEFAULT_WEBWALLET_URL, argentMobileOptions } =
    restOptions as ConnectOptions

  const { connectors } = restOptions as ConnectOptionsWithConnectors

  // force null in case it was disconnected from mobile app
  selectedConnector = null
  const availableConnectors =
    !connectors || connectors.length === 0
      ? defaultConnectors({
          argentMobileOptions,
          webWalletUrl,
        })
      : connectors

  const lastWalletId = localStorage.getItem("starknetLastConnectedWallet")
  if (modalMode === "neverAsk") {
    try {
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
    } catch (error) {
      removeStarknetLastConnectedWallet()
      throw new Error(error as any)
    }
  }

  const installedWallets = await sn.getAvailableWallets(restOptions)

  // we return/display wallet options once per first-dapp (ever) connect
  if (modalMode === "canAsk" && lastWalletId) {
    const authorizedWallets = await sn.getAuthorizedWallets(restOptions)

    const wallet =
      (authorizedWallets.find((w) => w.id === lastWalletId) ??
      installedWallets.length === 1)
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
    discoveryWallets: await sn.getDiscoveryWallets(restOptions),
    storeVersion,
    customOrder: connectors ? connectors?.length > 0 : false,
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
        callback: async (connector: StarknetkitConnector | null) => {
          try {
            selectedConnector = connector
            if (resultType === "wallet") {
              const connectorData = (await connector?.connect()) ?? null
              if (connector !== null) {
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
                connectorData: null,
              })
            }
          } catch (error) {
            reject(error)
          } finally {
            setTimeout(() => modal.$destroy())
          }
        },
        theme: modalTheme === "system" ? null : (modalTheme ?? null),
        modalWallets,
      },
    })
  })
}

/**
 * @returns Selected wallet if user was previously successfully connected, otherwise null
 */
export const getSelectedConnectorWallet = () =>
  selectedConnector ? selectedConnector.wallet : null

/**
 *
 * @param [options] - Options
 * @param [options.clearLastWallet] - Clear last connected wallet
 */
export const disconnect = async (options: DisconnectOptions = {}) => {
  removeStarknetLastConnectedWallet()
  if (selectedConnector) {
    await selectedConnector.disconnect()
  }
  selectedConnector = null

  return sn.disconnect(options)
}

export type {
  Connector,
  ConnectorData,
  DisconnectOptions,
  StarknetWindowObject,
  StarknetkitConnector,
  defaultConnectors as starknetkitDefaultConnectors,
  ConnectOptions,
  ConnectOptionsWithConnectors,
}

export type * from "./types/modal"

export { useStarknetkitConnectModal } from "./hooks/useStarknetkitConnectModal"
