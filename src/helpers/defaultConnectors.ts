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
  const isSafari =
    typeof window !== "undefined"
      ? /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
      : false

  const defaultConnectors: Connector[] = []

  if (!isSafari) {
    defaultConnectors.push(
      new InjectedConnector({ options: { id: "argentX" } }),
    )
    defaultConnectors.push(
      new InjectedConnector({ options: { id: "braavos" } }),
    )
  }

  defaultConnectors.push(new ArgentMobileConnector(argentMobileOptions))
  defaultConnectors.push(new WebWalletConnector({ url: webWalletUrl }))

  return defaultConnectors
}
