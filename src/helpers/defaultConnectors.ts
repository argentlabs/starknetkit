import {
  StarknetkitCompoundConnector,
  StarknetkitConnector,
} from "../connectors"
import {
  ArgentMobileConnector,
  type ArgentMobileConnectorOptions,
} from "../connectors/argent/argentMobile"
import { WebWalletConnector } from "../connectors/webwallet"
import { Braavos } from "../connectors/injected/braavos"
import { Argent } from "../connectors/argent"
import { ArgentX } from "../connectors/injected/argentX"

export const defaultConnectors = ({
  argentMobileOptions,
  webWalletUrl,
}: {
  argentMobileOptions: ArgentMobileConnectorOptions
  webWalletUrl?: string
}): (StarknetkitConnector | StarknetkitCompoundConnector)[] => {
  const isSafari =
    typeof window !== "undefined"
      ? /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
      : false

  const defaultConnectors: (
    | StarknetkitConnector
    | StarknetkitCompoundConnector
  )[] = []

  defaultConnectors.push(new Argent(argentMobileOptions))

  if (!isSafari) {
    defaultConnectors.push(new Braavos())
  }

  defaultConnectors.push(new WebWalletConnector({ url: webWalletUrl }))

  return defaultConnectors
}
