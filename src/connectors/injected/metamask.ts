import { InjectedConnector, type InjectedConnectorOptions } from "./index"

const id = "metamask"

export class MetaMask extends InjectedConnector {
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
