import { ProviderInterface } from "starknet"
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
  provider,
}: {
  argentMobileOptions?: ArgentMobileConnectorOptions
  webWalletUrl?: string
  provider?: ProviderInterface
}): Connector[] => {
  const isSafari =
    typeof window !== "undefined"
      ? /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
      : false

  const defaultConnectors: Connector[] = []

  if (!isSafari) {
    defaultConnectors.push(
      new InjectedConnector({ options: { id: "argentX", provider } }),
    )
    defaultConnectors.push(
      new InjectedConnector({ options: { id: "braavos", provider } }),
    )
  }

  defaultConnectors.push(
    new ArgentMobileConnector({ ...argentMobileOptions, provider }),
  )
  defaultConnectors.push(
    new WebWalletConnector({ url: webWalletUrl, provider }),
  )

  return defaultConnectors
}
