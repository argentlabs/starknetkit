import { type Connector } from "../connectors"
import { connect } from "../main"
import { ConnectOptions } from "../types/modal"

type UseStarknetkitConnectors = {
  connectors: Connector[]
  starknetkitConnect: () => Promise<Connector | null>
}

const useStarknetkitConnectors = (
  options: Omit<ConnectOptions, "argentMobileOptions" | "webWalletUrl">,
): UseStarknetkitConnectors => {
  const starknetkitConnect = async () => {
    return await connect(options)
  }

  return {
    connectors: options.connectors,
    starknetkitConnect,
  }
}

export { useStarknetkitConnectors }
