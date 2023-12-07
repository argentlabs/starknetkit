import { type Connector } from "../connectors"
import { defaultConnectors } from "../helpers/defaultConnectors"
import { connect } from "../main"
import { ConnectOptions } from "../types/modal"

type UseStarknetkitConnectors = {
  connectors?: Connector[]
  starknetkitConnect: () => Promise<Connector | null>
}

const useStarknetkitConnectors = (
  options: ConnectOptions,
): UseStarknetkitConnectors => {
  const starknetkitConnect = async () => {
    return await connect(options)
  }

  const connectors =
    options?.connectors ||
    defaultConnectors({
      argentMobileOptions: options?.argentMobileOptions,
      webWalletUrl: options?.webWalletUrl,
    })

  return {
    connectors,
    starknetkitConnect,
  }
}

export { useStarknetkitConnectors }
