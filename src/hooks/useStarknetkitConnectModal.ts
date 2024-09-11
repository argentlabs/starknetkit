import { connect } from "../main"
import { ConnectOptionsWithConnectors, ModalResult } from "../types/modal"

type UseStarknetkitConnectors = {
  starknetkitConnectModal: () => Promise<ModalResult>
}

const useStarknetkitConnectModal = (
  options: ConnectOptionsWithConnectors,
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
