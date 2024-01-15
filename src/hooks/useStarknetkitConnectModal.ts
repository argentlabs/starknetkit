import { connect } from "../main"
import { ConnectOptions, ModalResult } from "../types/modal"

type UseStarknetkitConnectors = {
  starknetkitConnectModal: () => Promise<ModalResult>
}

const useStarknetkitConnectModal = (
  options: Omit<ConnectOptions, "argentMobileOptions" | "webWalletUrl">,
): UseStarknetkitConnectors => {
  const starknetkitConnectModal = async (): Promise<ModalResult> => {
    return await connect({
      ...options,
      resultType: options.resultType ?? "connector",
    })
  }

  return {
    starknetkitConnectModal,
  }
}

export { useStarknetkitConnectModal }
