import {
  StarknetkitCompoundConnector,
  StarknetkitConnector,
} from "../connectors"
import {
  type ArgentMobileConnectorOptions,
} from "../connectors/argent/argentMobile"
import { BraavosMobileBaseConnector } from "../connectors/braavosMobile"
import { WebWalletConnector } from "../connectors/webwallet"
import { Braavos } from "../connectors/injected/braavos"
import { Argent } from "../connectors/argent"

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

  defaultConnectors.push(new Argent({ mobile: argentMobileOptions }))

  if (!isSafari) {
    defaultConnectors.push(new Braavos())
  }

  if (isMobileDevice()) {
    defaultConnectors.push(new BraavosMobileBaseConnector())
  }
  defaultConnectors.push(new WebWalletConnector({ url: webWalletUrl }))

  return defaultConnectors
}
