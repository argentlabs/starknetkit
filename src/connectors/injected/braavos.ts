import { InjectedConnector, type InjectedConnectorOptions } from "./index"

export class Braavos extends InjectedConnector {
  constructor(options?: Omit<InjectedConnectorOptions, "id">) {
    super({ options: { id: "braavos", ...options } })
  }
}
