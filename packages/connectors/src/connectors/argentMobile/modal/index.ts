import type {
  StarknetWindowObject,
  ConnectedStarknetWindowObject,
} from "get-starknet-core"

import { login } from "./login"
import type { IArgentLoginOptions } from "./login"
import { StarknetAdapter } from "./starknet/adapter"

export type { StarknetWindowObject, IArgentLoginOptions }

export const getStarknetWindowObject = async (
  options: IArgentLoginOptions,
): Promise<ConnectedStarknetWindowObject | null> =>
  login(options, StarknetAdapter)
