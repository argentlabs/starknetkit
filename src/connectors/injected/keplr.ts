import { InjectedConnector, type InjectedConnectorOptions } from "./index"

export class Keplr extends InjectedConnector {
  constructor(options?: Omit<InjectedConnectorOptions, "id">) {
    super({ options: { id: "keplr", ...options } })
  }
}
