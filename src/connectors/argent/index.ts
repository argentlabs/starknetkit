import { type InjectedConnectorOptions, injectedWalletIcons } from "../injected"
import { ArgentX } from "../injected/argentX"
import { getInjectedArgentX } from "./helpers/getInjectedArgentX"
import {
  ArgentMobileBaseConnector,
  type ArgentMobileConnectorOptions,
  isInArgentMobileAppBrowser,
} from "./argentMobile"
import { StarknetkitCompoundConnector } from "../connector"

/**
 * Checks if window object has injected ArgentX
 */
function hasInjectedArgentX(): boolean {
  return Boolean(getInjectedArgentX())
}

interface ArgentSettings {
  extension?: Omit<InjectedConnectorOptions, "id">
  mobile: ArgentMobileConnectorOptions
}

const ArgentIcon =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgaWQ9IkhpdG8gaW4gY29udGFpbmVyIj4KPHBhdGggaWQ9IlZlY3RvciIgZD0iTTE4Ljc5OTkgNS45MkgxMy4yMDAzQzEzLjAxMzIgNS45MiAxMi44NjMyIDYuMDc0MDIgMTIuODU5MiA2LjI2NTQ3QzEyLjc0NiAxMS42NDcgOS45OTQ3NyAxNi43NTQ2IDUuMjU5MyAyMC4zNzI0QzUuMTA4OTUgMjAuNDg3MiA1LjA3NDcgMjAuNzAzIDUuMTg0NjIgMjAuODU4NEw4LjQ2MDg3IDI1LjQ5NDNDOC41NzIzMyAyNS42NTIgOC43ODk1IDI1LjY4NzcgOC45NDIzNyAyNS41NzE4QzExLjkwMzMgMjMuMzI0NCAxNC4yODUgMjAuNjEzNCAxNi4wMDAxIDE3LjYwODVDMTcuNzE1MiAyMC42MTM0IDIwLjA5NyAyMy4zMjQ0IDIzLjA1OCAyNS41NzE4QzIzLjIxMDcgMjUuNjg3NyAyMy40Mjc5IDI1LjY1MiAyMy41Mzk1IDI1LjQ5NDNMMjYuODE1NyAyMC44NTg0QzI2LjkyNTUgMjAuNzAzIDI2Ljg5MTIgMjAuNDg3MiAyNi43NDEgMjAuMzcyNEMyMi4wMDU0IDE2Ljc1NDYgMTkuMjU0MiAxMS42NDcgMTkuMTQxMiA2LjI2NTQ3QzE5LjEzNzEgNi4wNzQwMiAxOC45ODcgNS45MiAxOC43OTk5IDUuOTJaIiBmaWxsPSIjRkY4NzVCIi8+CjwvZz4KPC9zdmc+Cg=="

class Argent
  extends StarknetkitCompoundConnector
  implements StarknetkitCompoundConnector
{
  readonly argentX?: ArgentX
  readonly argentMobile?: ArgentMobileBaseConnector

  readonly connector: ArgentX | ArgentMobileBaseConnector
  readonly fallbackConnector: ArgentMobileBaseConnector | null

  get name() {
    return "Ready Wallet (formerly Argent)"
  }
  get icon() {
    return ArgentIcon
  }

  constructor(settings: ArgentSettings) {
    super()

    this.argentX = new ArgentX({
      icon: injectedWalletIcons.argentX,
      ...settings?.extension,
      shouldEmit: true,
    })
    this.argentMobile = new ArgentMobileBaseConnector({
      ...settings.mobile,
    })

    if (hasInjectedArgentX() || isInArgentMobileAppBrowser()) {
      this.connector = this.argentX
      this.fallbackConnector = this.argentMobile
    } else {
      this.connector = this.argentMobile
      this.fallbackConnector = null
    }
  }
}
