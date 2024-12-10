import { InjectedConnector, InjectedConnectorOptions } from "./index"

export class MetaMask extends InjectedConnector {
  constructor(options?: Omit<InjectedConnectorOptions, "id">) {
    super({ options: { id: "metamask", ...options } })
  }
}
