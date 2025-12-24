import type { DisconnectOptions } from "@starknet-io/get-starknet"
import sn from "@starknet-io/get-starknet-core"
import type { StarknetWindowObject } from "@starknet-io/types-js"

import {
  type ConnectOptions,
  type ConnectOptionsWithConnectors,
  Layout,
  type ModalResult,
  type ModalWallet,
} from "./types/modal"
import type {
  Connector,
  StarknetkitConnector,
  ConnectorData,
} from "./connectors"

import { ArgentMobileBaseConnector } from "./connectors/argent/argentMobile"
import { defaultConnectors } from "./helpers/defaultConnectors"
import { getStoreVersionFromBrowser } from "./helpers/getStoreVersionFromBrowser"
import {
  removeStarknetLastConnectedWallet,
  setStarknetLastConnectedWallet,
} from "./helpers/lastConnected"
import { mapModalWallets } from "./helpers/mapModalWallets"
import {
  extractConnector,
  findConnectorById,
  isCompoundConnector,
} from "./helpers/connector"
import { getModalTarget } from "./helpers/modal"

import Modal from "./modal/Modal.svelte"
import type { ModalInstance } from "./modal/Modal"

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
 * @param [skipEmit] - Needed for internal handling of useStarknetkitConnectModal hook
 * @param [webWalletUrl="https://web.ready.co"] - Link to Ready's web wallet - Mainnet env by default, if as a dApp for integration and testing purposes, you need access to an internal testnet environment, please contact Ready
 * @param [argentMobileOptions] - Ready Mobile connector options - used only when `connectors` is not explicitly passed
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
  skipEmit = false,
  ...restOptions
}: ConnectOptionsWithConnectors | ConnectOptions): Promise<ModalResult> => {
  const { connectors } = restOptions as ConnectOptionsWithConnectors

  // force null in case it was disconnected from mobile app
  selectedConnector = null
  const availableConnectors =
    !connectors || connectors.length === 0 ? defaultConnectors() : connectors

  if (skipEmit) {
    // This is ugly but needed fix for useStarknetkitConnectModal
    availableConnectors?.map((connector) => {
      if (isCompoundConnector(connector)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        if ("connector" in connector && "_options" in connector.connector) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          connector.connector._options.shouldEmit = false
        }
      }
    })
  }

  const lastWalletId = localStorage.getItem("starknetLastConnectedWallet")
  if (modalMode === "neverAsk") {
    try {
      const connector = findConnectorById(availableConnectors, lastWalletId)

      let connectorData: ConnectorData | null = null

      if (connector && resultType === "wallet") {
        connectorData = await connector.connect({
          onlyQRCode: true,
        })
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
      const connector = findConnectorById(availableConnectors, lastWalletId)

      let connectorData: ConnectorData | null = null

      if (resultType === "wallet") {
        connectorData =
          (await connector?.connect({
            onlyQRCode: true,
          })) ?? null
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

  // TODO: remove this when get-starknet will be updated
  const discoveryWallets = (await sn.getDiscoveryWallets(restOptions)).map(
    (wallet) => {
      if (wallet.id.toLowerCase() === "argentx") {
        return {
          ...wallet,
          name: "Ready Wallet (formerly Argent)",
        }
      }
      return wallet
    },
  )

  const modalWallets: ModalWallet[] = mapModalWallets({
    availableConnectors,
    installedWallets,
    discoveryWallets,
    storeVersion,
    customOrder: connectors ? connectors?.length > 0 : false,
  })

  return new Promise((resolve, reject) => {
    const modal = new Modal({
      target: getModalTarget(),
      props: {
        dappName,
        callback: async (
          modalWallet: ModalWallet | null,
          useFallback: boolean = false,
        ) => {
          try {
            if (!modalWallet) {
              throw new Error("Connector error")
            }

            modal.$set({ selectedWallet: modalWallet })

            if (!modalWallet.installed) {
              modal.$set({ layout: Layout.download })
              return
            }

            selectedConnector = extractConnector(
              modalWallet.connector,
              useFallback,
            )

            if (resultType === "wallet") {
              if (selectedConnector instanceof ArgentMobileBaseConnector) {
                modal.$set({ layout: Layout.qrCode })
              } else {
                modal.$set({ layout: Layout.connecting })
              }

              const connectorData =
                (await selectedConnector?.connect({
                  onlyQRCode: true,
                })) ?? null
              if (selectedConnector !== null) {
                setStarknetLastConnectedWallet(selectedConnector.id)
              }

              resolve({
                connector: selectedConnector,
                connectorData,
                wallet: selectedConnector?.wallet ?? null,
              })

              modal.$set({ layout: Layout.success })
              setTimeout(() => modal.$destroy(), 500)
            } else {
              resolve({
                connector: selectedConnector,
                wallet: null,
                connectorData: null,
              })
              modal.$destroy()
            }
          } catch (error) {
            if (
              [Layout.connecting, Layout.qrCode].includes(modal.getLayout())
            ) {
              modal.$set({ layout: Layout.loginFailure })
            } else {
              reject(error)
            }
          }
        },
        theme: modalTheme === "system" ? null : (modalTheme ?? null),
        modalWallets,
        discoveryWallets,
        installedWallets,
      },
    }) as unknown as ModalInstance // Prevents vite build errors
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
  // StarknetkitCompoundConnector,
  defaultConnectors as starknetkitDefaultConnectors,
  ConnectOptions,
  ConnectOptionsWithConnectors,
}

export type * from "./types/modal"

export { useStarknetkitConnectModal } from "./hooks/useStarknetkitConnectModal"
