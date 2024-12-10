import {
  StarknetkitCompoundConnector,
  StarknetkitConnector,
} from "../connectors"
import { type ArgentMobileConnectorOptions } from "../connectors/argent/argentMobile"
import { BraavosMobileBaseConnector } from "../connectors/braavosMobile"
import { WebWalletConnector } from "../connectors/webwallet"
import { Braavos } from "../connectors/injected/braavos"
import { Argent } from "../connectors/argent"
import { isMobileDevice, isSafari } from "./navigator"

export const defaultConnectors = ({
  argentMobileOptions,
  webWalletUrl,
}: {
  argentMobileOptions: ArgentMobileConnectorOptions
  webWalletUrl?: string
}): (StarknetkitConnector | StarknetkitCompoundConnector)[] => {
  const defaultConnectors: (
    | StarknetkitConnector
    | StarknetkitCompoundConnector
  )[] = []

  defaultConnectors.push(new Argent({ mobile: argentMobileOptions }))

  if (!isSafari()) {
    defaultConnectors.push(new Braavos())
  }

  if (isMobileDevice()) {
    defaultConnectors.push(new BraavosMobileBaseConnector())
  }
  defaultConnectors.push(new WebWalletConnector({ url: webWalletUrl }))

  return defaultConnectors
}
