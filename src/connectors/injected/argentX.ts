import { InjectedConnector, type InjectedConnectorOptions } from "./index"

export class ArgentX extends InjectedConnector {
  constructor(options?: Omit<InjectedConnectorOptions, "id">) {
    super({ options: { id: "argentX", ...options } })
  }
}
