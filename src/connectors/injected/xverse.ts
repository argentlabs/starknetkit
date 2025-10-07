import { InjectedConnector, type InjectedConnectorOptions } from "./index"

const id = "xverse"

export class Xverse extends InjectedConnector {
  constructor(options?: Omit<InjectedConnectorOptions, "id">) {
    super({ options: { id, ...options } })
  }

  static getInjectedWallet() {
    return super.getInjectedWallet(id)
  }

  static isWalletInjected() {
    return super.isWalletInjected(id)
  }
}
