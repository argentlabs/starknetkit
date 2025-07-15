import type { StarknetkitConnector } from "../connectors"
import { type ArgentMobileConnectorOptions } from "../connectors/argent/argentMobile"
import { BraavosMobileBaseConnector } from "../connectors/braavosMobile"
import { ControllerConnector } from "../connectors/controller"
import { WebWalletConnector } from "../connectors/webwallet"
import { Braavos } from "../connectors/injected/braavos"
import { Fordefi } from "../connectors/injected/fordefi"
import { Keplr } from "../connectors/injected/keplr"
import { MetaMask } from "../connectors/injected/metamask"

import { isMobileDevice, isSafari } from "./navigator"
import { ArgentX } from "../connectors/injected/argentX"

export const defaultConnectors = ({
  argentMobileOptions,
  webWalletUrl,
}: {
  argentMobileOptions: ArgentMobileConnectorOptions
  webWalletUrl?: string
}): StarknetkitConnector[] => {
  // | StarknetkitCompoundConnector
  const defaultConnectors: StarknetkitConnector[] =
    // | StarknetkitCompoundConnector
    []

  defaultConnectors.push(new ArgentX())

  if (!isSafari()) {
    defaultConnectors.push(new Braavos())

    if (MetaMask.isWalletInjected()) {
      defaultConnectors.push(new MetaMask())
    }
    if (Fordefi.isWalletInjected()) {
      defaultConnectors.push(new Fordefi())
    }
    if (Keplr.isWalletInjected()) {
      defaultConnectors.push(new Keplr())
    }
  }

  defaultConnectors.push(new ControllerConnector())

  if (isMobileDevice()) {
    defaultConnectors.push(new BraavosMobileBaseConnector())
  }

  return defaultConnectors
}
