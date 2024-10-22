import { ArgentX } from "../injected/argentX"
import {
  ArgentMobileBaseConnector,
  ArgentMobileConnectorOptions,
  isInArgentMobileAppBrowser,
} from "./argentMobile"

import { getInjectedArgentX } from "./helpers/getInjectedArgentX"
import { DEFAULT_ARGENT_MOBILE_ICON } from "./argentMobile/constants"
import { StarknetkitCompoundConnector } from "../connector"

/**
 * Checks if window object has injected ArgentX
 */
function hasInjectedArgentX(): boolean {
  return Boolean(getInjectedArgentX())
}

type ArgentCompoundSettings = ArgentMobileConnectorOptions

// TODO think about naming
//  - ArgentUnified
//  - ArgentOneButton
//  - ArgentCompound
//  - Argent

// TODO
//  - get qr code
//  - get full modal for both ux flows?

export class ArgentCompound
  extends StarknetkitCompoundConnector
  implements StarknetkitCompoundConnector
{
  readonly argentX?: ArgentX
  readonly argentMobile?: ArgentMobileBaseConnector

  readonly connector: ArgentX | ArgentMobileBaseConnector
  readonly fallbackConnector: ArgentX | ArgentMobileBaseConnector

  constructor(settings: ArgentCompoundSettings) {
    super()

    this.argentX = new ArgentX({
      name: "Argent",
      icon: DEFAULT_ARGENT_MOBILE_ICON,
      isCompoundConnector: true,
    })
    this.argentMobile = new ArgentMobileBaseConnector({
      isCompoundConnector: true,
      ...settings,
    })

    if (hasInjectedArgentX() || isInArgentMobileAppBrowser()) {
      this.connector = this.argentX
      this.fallbackConnector = this.argentMobile
    } else {
      this.connector = this.argentMobile
      this.fallbackConnector = this.argentX
    }
  }

  getArgentXConnector() {
    return this.argentX
  }

  getArgentMobileConnector() {
    return this.argentMobile
  }
}

//
// // Second way
// const compoundConnector = new ArgentCompound({
//   url: typeof window !== "undefined" ? window.location.href : "",
//   dappName: "Example dapp",
// })
//
// compoundConnector.getConector()
//
// compoundConnector.getArgentX()
// compoundConnector.getArgentMobile()
// compoundConnector.getFallback()
