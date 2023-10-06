import { type Connector } from "../connectors"
import {
  ArgentMobileConnector,
  type ArgentMobileConnectorOptions,
} from "../connectors/argentMobile"
import { InjectedConnector } from "../connectors/injected"
import { WebWalletConnector } from "../connectors/webwallet"

export const defaultConnectors = ({
  argentMobileOptions,
  webWalletUrl,
}: {
  argentMobileOptions?: ArgentMobileConnectorOptions
  webWalletUrl?: string
}): Connector[] => {
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

  const defaultConnectors: Connector[] = [
    new WebWalletConnector({ url: webWalletUrl }),
    new ArgentMobileConnector(argentMobileOptions),
  ]

  if (!isSafari) {
    defaultConnectors.push(
      new InjectedConnector({ options: { id: "argentX" } }),
    )
    defaultConnectors.push(
      new InjectedConnector({ options: { id: "braavos" } }),
    )
  }

  return defaultConnectors
}
