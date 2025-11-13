import type { StarknetkitConnector } from "../connectors"
import type { ArgentMobileConnectorOptions } from "../connectors/argent/argentMobile"
import { BraavosMobileBaseConnector } from "../connectors/braavosMobile"
import { ControllerConnector } from "../connectors/controller"
import { Braavos } from "../connectors/injected/braavos"
import { Fordefi } from "../connectors/injected/fordefi"
import { Keplr } from "../connectors/injected/keplr"
import { Xverse } from "../connectors/injected/xverse"
import { MetaMask } from "../connectors/injected/metamask"

import { isMobileDevice, isSafari } from "./navigator"
import { ArgentX } from "../connectors/injected/argentX"

export const defaultConnectors = (
  _options?: {
    argentMobileOptions?: ArgentMobileConnectorOptions
    webWalletUrl?: string
  },
): StarknetkitConnector[] => {
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
    if (Xverse.isWalletInjected()) {
      defaultConnectors.push(new Xverse())
    }
  }

  defaultConnectors.push(new ControllerConnector())

  if (isMobileDevice()) {
    defaultConnectors.push(new BraavosMobileBaseConnector())
  }

  return defaultConnectors
}
