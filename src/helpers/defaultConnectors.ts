import { StarknetkitConnector } from "../connectors"
import {
  ArgentMobileBaseConnector,
  type ArgentMobileConnectorOptions,
} from "../connectors/argentMobile"
import { BraavosMobileBaseConnector } from "../connectors/braavosMobile"
import { InjectedConnector } from "../connectors/injected"
import {
  WebWalletConnector,
  WebwalletGoogleAuthConnector,
} from "../connectors/webwallet"

const isMobileDevice = () => {
  // Primary method: User Agent + Touch support check
  const userAgent = navigator.userAgent.toLowerCase()
  const isMobileUA =
    /android|webos|iphone|ipad|ipod|blackberry|windows phone/.test(userAgent)
  const hasTouchSupport =
    "ontouchstart" in window || navigator.maxTouchPoints > 0

  // Backup method: Screen size
  const isSmallScreen = window.innerWidth <= 768

  // Combine checks: Must match user agent AND (touch support OR small screen)
  return isMobileUA && (hasTouchSupport || isSmallScreen)
}

export const defaultConnectors = ({
  argentMobileOptions,
  webWalletUrl,
  googleAuthOptions,
}: {
  argentMobileOptions: ArgentMobileConnectorOptions
  webWalletUrl?: string
  googleAuthOptions?: {
    clientId: string
    authorizedPartyId: string
  }
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

    if (InjectedConnector.isWalletInjected("metamask")) {
      defaultConnectors.push(
        new InjectedConnector({ options: { id: "metamask" } }),
      )
    }
    if (InjectedConnector.isWalletInjected("fordefi")) {
      defaultConnectors.push(
        new InjectedConnector({ options: { id: "fordefi" } }),
      )
    }
    if (InjectedConnector.isWalletInjected("keplr")) {
      defaultConnectors.push(
        new InjectedConnector({ options: { id: "keplr" } }),
      )
    }
  }

  defaultConnectors.push(new ArgentMobileBaseConnector(argentMobileOptions))
  if (isMobileDevice()) {
    defaultConnectors.push(new BraavosMobileBaseConnector())
  }
  defaultConnectors.push(new WebWalletConnector({ url: webWalletUrl }))

  if (googleAuthOptions) {
    defaultConnectors.push(
      new WebwalletGoogleAuthConnector({
        url: webWalletUrl,
        clientId: googleAuthOptions.clientId,
        authorizedPartyId: googleAuthOptions.authorizedPartyId,
      }),
    )
  }

  return defaultConnectors
}
