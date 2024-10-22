import {
  StarknetkitCompoundConnector,
  StarknetkitConnector,
} from "../connectors"
import { type ArgentMobileConnectorOptions } from "../connectors/argent/argentMobile"
import { WebWalletConnector } from "../connectors/webwallet"
import { Braavos } from "../connectors/injected/braavos"
import { ArgentCompound } from "../connectors/argent"

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

  defaultConnectors.push(new ArgentCompound(argentMobileOptions))

  if (!isSafari) {
    defaultConnectors.push(new Braavos())
  }

  defaultConnectors.push(new WebWalletConnector({ url: webWalletUrl }))

  return defaultConnectors
}
