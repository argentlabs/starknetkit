import { StarknetkitConnector } from "../connectors"
import {
  ArgentMobileBaseConnector,
  type ArgentMobileConnectorOptions,
} from "../connectors/argentMobile"
import { InjectedConnector } from "../connectors/injected"
import { WebWalletConnector } from "../connectors/webwallet"

export const defaultConnectors = ({
  argentMobileOptions,
  webWalletUrl,
}: {
  argentMobileOptions: ArgentMobileConnectorOptions
  webWalletUrl?: string
}): StarknetkitConnector[] => {
  const isSafari =
    typeof window !== "undefined"
      ? /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
      : false

  const defaultConnectors: StarknetkitConnector[] = []

  if (!isSafari) {
    defaultConnectors.push(
      new InjectedConnector({ options: { id: "argentX" } }),
    )
    defaultConnectors.push(
      new InjectedConnector({ options: { id: "braavos" } }),
    )
    defaultConnectors.push(
      new InjectedConnector({ options: { id: "keplr" } }),
    )
  }

  defaultConnectors.push(new ArgentMobileBaseConnector(argentMobileOptions))
  defaultConnectors.push(new WebWalletConnector({ url: webWalletUrl }))

  return defaultConnectors
}
