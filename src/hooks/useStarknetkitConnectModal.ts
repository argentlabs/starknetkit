import { connect } from "../main"
import { ConnectOptionsWithConnectors, ModalResult } from "../types/modal"

type UseStarknetkitConnectors = {
  starknetkitConnectModal: () => Promise<ModalResult>
}

/**
 * @description React hook that abstracts {@link connect} function
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
 *
 * @returns starknetkitConnectModal - connect function ready for invoking
 */
const useStarknetkitConnectModal = (
  options?: ConnectOptionsWithConnectors,
): UseStarknetkitConnectors => {
  const starknetkitConnectModal = async (): Promise<ModalResult> => {
    return await connect({
      ...options,
      resultType: options?.resultType ?? "connector",
    })
  }

  return {
    starknetkitConnectModal,
  }
}

export { useStarknetkitConnectModal }
